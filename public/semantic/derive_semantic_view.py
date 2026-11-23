"""Derive a Snowflake semantic view from the insurance ontology.

Usage:
    pip install rdflib
    python derive_semantic_view.py insurance.ttl > portfolio_pulse_semantic_view.sql

The ontology (insurance.ttl) is the single place where business terms are defined.
This script reads it and writes the CREATE SEMANTIC VIEW statement, so the view is
always generated from the definitions and never edited by hand.

Mapping rules:
    owl:Class with sv:table        -> TABLES        (alias, table, primary key)
    owl:ObjectProperty             -> RELATIONSHIPS (domain table's foreign key -> range table)
    owl:DatatypeProperty, Fact     -> FACTS
    owl:DatatypeProperty, Dimension-> DIMENSIONS
    sv:Metric with an aggregation  -> METRICS on the class's table
    sv:Metric with num/denominator -> derived METRIC (ratio of the two metrics)
    rdfs:comment                   -> COMMENT
    skos:altLabel                  -> WITH SYNONYMS (helps natural-language tools match questions)

Sample project on synthetic data. Check the generated SQL against the current
Snowflake documentation for CREATE SEMANTIC VIEW before running it.
"""
import re
import sys
from rdflib import Graph, Namespace, RDF, RDFS, OWL
from rdflib.namespace import SKOS

SV = Namespace("https://definedonce.dev/ontology/semantic-view#")


def text(g, s, p):
    v = g.value(s, p)
    return str(v) if v is not None else None


def quote(s):
    return "'" + s.replace("'", "''") + "'"


def extras(g, s):
    """WITH SYNONYMS and COMMENT clauses from skos:altLabel and rdfs:comment."""
    out = ""
    syns = sorted(str(a) for a in g.objects(s, SKOS.altLabel))
    if syns:
        out += " WITH SYNONYMS = (" + ", ".join(quote(x) for x in syns) + ")"
    c = text(g, s, RDFS.comment)
    if c:
        out += " COMMENT = " + quote(c)
    return out


def derive(path):
    g = Graph().parse(path, format="turtle")
    errors = []

    onto = next(g.subjects(RDF.type, OWL.Ontology))
    view, schema = text(g, onto, SV.viewName), text(g, onto, SV.schema)

    # Classes -> tables
    tables = {}
    for c in sorted(g.subjects(RDF.type, OWL.Class)):
        if g.value(c, SV.table) is None:
            continue
        tables[c] = {"alias": text(g, c, SV.alias), "table": text(g, c, SV.table), "pk": text(g, c, SV.primaryKey)}
    table_lines = [
        f"    {t['alias']} AS {schema}.{t['table']} PRIMARY KEY ({t['pk']}){extras(g, c)}"
        for c, t in tables.items()
    ]

    # Object properties -> relationships
    rel_lines = []
    for p in sorted(g.subjects(RDF.type, OWL.ObjectProperty)):
        d, r, fk = g.value(p, RDFS.domain), g.value(p, RDFS.range), text(g, p, SV.foreignKey)
        if d not in tables or r not in tables or not fk:
            errors.append(f"relationship {p} needs a mapped domain, range and sv:foreignKey")
            continue
        name = f"{tables[d]['alias']}_" + re.sub(r"(?<!^)(?=[A-Z])", "_", p.split("#")[-1]).lower()
        rel_lines.append(f"    {name} AS {tables[d]['alias']} ({fk}) REFERENCES {tables[r]['alias']}")

    # Datatype properties -> facts and dimensions
    facts, dims, column_of = [], [], {}
    for p in sorted(g.subjects(RDF.type, OWL.DatatypeProperty)):
        d, col, role = g.value(p, RDFS.domain), text(g, p, SV.column), g.value(p, SV.role)
        if d not in tables or not col:
            errors.append(f"attribute {p} needs a mapped domain and sv:column")
            continue
        ref = f"{tables[d]['alias']}.{col}"
        column_of[p] = ref
        line = f"    {ref} AS {col}{extras(g, p)}"
        (facts if role == SV.Fact else dims).append(line)

    # Metrics: simple aggregations first, then derived ratios
    metric_ref, metric_lines = {}, []
    for m in sorted(g.subjects(RDF.type, SV.Metric)):
        agg = text(g, m, SV.aggregation)
        if not agg:
            continue
        cls = g.value(m, SV.onClass)
        alias = tables[cls]["alias"]
        target = column_of.get(g.value(m, SV.measures)) or f"{alias}.{text(g, m, SV.measuresColumn)}"
        flt = text(g, m, SV.filter)
        if flt:
            target = f"CASE WHEN {alias}.{flt} THEN {target} END"
        expr = f"COUNT(DISTINCT {target})" if agg == "COUNT_DISTINCT" else f"{agg}({target})"
        name = m.split("#")[-1]
        metric_ref[m] = f"{alias}.{name}"
        metric_lines.append(f"    {alias}.{name} AS {expr}{extras(g, m)}")

    for m in sorted(g.subjects(RDF.type, SV.Metric)):
        num, den = g.value(m, SV.numerator), g.value(m, SV.denominator)
        if num is None:
            continue
        if num not in metric_ref or den not in metric_ref:
            errors.append(f"derived metric {m} refers to an undefined metric")
            continue
        name = m.split("#")[-1]
        metric_lines.append(
            f"    {name} AS {metric_ref[num]} / NULLIF({metric_ref[den]}, 0){extras(g, m)}"
        )

    if errors:
        sys.exit("Ontology is incomplete:\n  " + "\n  ".join(errors))

    block = lambda name, lines: f"  {name} (\n" + ",\n".join(lines) + "\n  )"
    return (
        f"-- Generated from {path.split('/')[-1]} by derive_semantic_view.py. Do not edit by hand.\n"
        f"CREATE OR REPLACE SEMANTIC VIEW {schema}.{view}\n"
        + "\n".join([
            block("TABLES", table_lines),
            block("RELATIONSHIPS", rel_lines),
            block("FACTS", facts),
            block("DIMENSIONS", dims),
            block("METRICS", metric_lines),
        ])
        + f"\n  COMMENT = {quote(text(g, onto, RDFS.comment))};\n"
    )


if __name__ == "__main__":
    print(derive(sys.argv[1] if len(sys.argv) > 1 else "insurance.ttl"), end="")
