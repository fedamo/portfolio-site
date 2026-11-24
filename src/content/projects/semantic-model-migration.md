---
title: "Moving BI models to a new warehouse without anyone noticing"
summary: "I moved production Power BI models from Synapse to Snowflake's gold layer. Because the models lived as code in Git, a fix found in one could be rolled out to all of them."
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
several were approved for deployment. Along the way the checks found problems that were already in production
and got them fixed upstream. The scripts, checks and docs can be reused for the models still to move.

## What we were trying to do

We had a set of production Power BI models reading from a legacy Synapse warehouse. They needed to move to
Snowflake and read from its gold layer instead. The one rule was that users shouldn't notice.

While we were in there, I also wanted the models to stop hard-coding their connections, so the same model
could be promoted from dev to test to prod through CI/CD.

## How I worked through each model

Every model went through the same nine steps, in three stages.

### Prepare

1. Map the sources. List every query in the model, find its gold-layer equivalent, and flag anything
   with no match.
2. Work on a branch. Each model got its own Git branch. An automatic check in a colleague's pipeline
   flagged any change to prod during the work, so it was merged back in and nothing got lost.
3. Rewrite the queries. Swap the old sources for native Snowflake queries, with server, warehouse and
   database as parameters. That's what lets one model run in every environment.

### Build and check

4. Match the data types. Every column comes in as the same type as prod, with an agreed standard for ID
   columns.
5. Fill the gaps. Where the gold layer was missing something, write the new or extended view with a
   rollback script, test it against the old source, and document it.
6. Check the data first. Compare old and new queries in SQL before looking at any report.
7. Publish and compare. Publish to a dev workspace through the REST APIs, with no manual desktop step,
   refresh, then compare the whole model against prod.

### Explain and sign off

8. Explain every difference. Each one gets a label: by design, data timing, already in prod, or still
   open. Recurring ones go in a shared tracker with the root cause.
9. Get sign-off. A short summary for the business owner covering what's done, what's different and why,
   and any decisions they need to make.

## The checks

Every model ran through the same checks, in the same order. A model only moved to the next check once the
previous one passed or every difference was explained.

| Check | What it compares | What it catches |
|---|---|---|
| Row counts | Old query against new query, table by table | Missing or extra rows from a changed join or filter |
| Distinct keys | Unique key values in each table | Duplicates that break relationships and refreshes |
| Totals and checksums | Sums and hashes of the main columns | Values that changed even though the row count didn't |
| Data types | Each column's type against prod | Type mismatches that change sorting, joins or DAX results |
| Model comparison | Every table, column, measure and value profile in the published model against prod | Differences a user would see in a report |
| Row-level security | Who can see what, for each role | Users seeing more or less than before |

## Tracking it: a status app with its own agent

A colleague's automated pipeline wrote every check result to tables in Snowflake. I built a Streamlit in Snowflake app on top of them,
with a card per model, a stage bar and filters, so anyone could see where each model stood. A semantic view over the
pipeline results defines the stages and checks once, and both the app and a Cortex agent read from it. The agent sits
in the app as a chat panel for plain-English questions.

The full story is in [its own write-up](/projects/migration-status-dashboard/), and there's a
[mock-up of the dashboard](/dashboards/migration-tracker/) with made-up data.

## Fixing once and rolling out to every model

Every model was saved in Power BI's text-based project format (PBIP/TMDL), so every model was a set of text
files in Git.

When something broke in one model, like a type mismatch, a query that didn't follow the parameter pattern, or
something the database rename broke, I fixed it once and proved it with the checks. Then I applied the same
fix to every other model, reviewed it as a diff, and re-ran the same checks.

The documentation kept up by itself. Every edit on a branch and every new or updated tool updated Markdown
notes in a knowledge base automatically, so each model's notes, the issue tracker and the status board were
always current.

The shared tracker did the same for the "why". Once a root cause was written down, the next model didn't have
to rediscover it. Each model made the next one quicker.

## Finding problems that were already in prod

Because every table, column and value was compared with production, the checks also turned up issues that
were already in production:

- Duplicate values in keys that should have been unique, which were breaking refreshes without an obvious error.
- Differences in DDL and database logic between the old warehouse and the new one. Table definitions and
  view logic didn't line up, so the same query could return different results.

For each one I raised it with the engineering team, with the evidence and a proposed fix, kept it separate from
the migration differences, and re-tested once it was fixed upstream. The business ended up with cleaner
production data as well as migrated models.

## What made it tricky

- Some models stayed mixed-source on purpose, with a few tables still on other SQL databases. I documented
  those so they'd be handled properly when promoted.
- The databases were renamed mid-project. Every model's parameters and branches had to be updated, and the
  rename caused a misleading gateway error that took some digging to trace.
- Row-level security needed its own check. Matching row counts doesn't prove that each person sees the same
  rows, so I tested each role separately.

## How I used AI

Claude Code helped with analysis, scripting, validation and first drafts of the documentation. The checks
decided whether a model was ready.
