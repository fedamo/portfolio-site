---
title: "Moving BI models to a new warehouse without anyone noticing"
summary: "I worked on moving production Power BI models from Synapse to Snowflake's gold layer, alongside a colleague's automated pipeline. Because the models lived as code in Git, a fix found in one could be rolled out to all of them."
pubDate: 2026-11-21
status: live
stack: [Power BI (PBIP/TMDL), Snowflake, Azure Synapse, Git, Azure DevOps, Python, REST APIs, Streamlit, Snowflake semantic views, Cortex agents, Claude Code]
featured: true
sketch: layers
skills: ["Data migration", "Metrics-as-code", "Fix once, apply at scale", "CI/CD", "Automated parity testing"]
draft: false
---

## Where it landed

Most models reached full or near-full parity with production, every remaining difference was explained, and
several were approved for deployment. The checks also found problems already in production, which were fixed
upstream.

## The job

Production Power BI models had to move from a legacy Synapse warehouse to Snowflake's gold layer without users
noticing. A colleague built the automated pipeline that converts, publishes and tests the models. I worked on the
models themselves: running scripts and checks locally, fixing what didn't match, and taking each one to sign-off.
I also moved the connections into parameters, so one model could be promoted from dev to test to prod.

## How each model moved

1. Map every query to its gold-layer source, on the model's own Git branch.
2. Rewrite the queries for Snowflake, with server, warehouse and database as parameters.
3. Match data types to prod, and write any missing views with a rollback script.
4. Compare old and new data in SQL, then publish to dev and compare the whole model with prod.
5. Label every difference (by design, timing, already in prod, or open) and get sign-off from the business owner.

## The checks

| Check | What it catches |
|---|---|
| Row counts | Missing or extra rows from a changed join or filter |
| Distinct keys | Duplicates that break relationships and refreshes |
| Totals and checksums | Values that changed even though the row count didn't |
| Data types | Mismatches that change sorting, joins or DAX results |
| Model comparison | Differences a user would see in a report |
| Row-level security | Users seeing more or less than before |

## Fix once, apply to every model

The models were saved as text (PBIP/TMDL) in Git. When something broke in one, I fixed it, proved it with the
checks, then applied the same fix to every other model as a reviewed diff. A shared tracker kept each root cause,
so the next model didn't have to rediscover it, and project notes updated themselves in a knowledge base as the
work changed.

## Problems already in prod

The checks turned up duplicate keys that were breaking refreshes, and differences in DDL and database logic
between the two warehouses. I raised each with the engineering team, with evidence and a proposed fix, and
re-tested once it was fixed upstream.

## What made it tricky

A mid-project database rename meant updating every model's parameters and branches, and caused a misleading
gateway error. Some models stayed partly on other databases by design. Row-level security needed testing role by
role, because matching row counts don't show who sees which rows.

## Tracking it

I built a Streamlit in Snowflake app over the pipeline's results, with a Cortex agent for questions. It has
[its own write-up](/projects/migration-status-dashboard/) and a [mock-up](/dashboards/migration-tracker/).

Claude Code helped with analysis, scripting and first drafts of the documentation. The checks decided whether a
model was ready.
