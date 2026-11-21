---
title: "Moving BI models to a new warehouse without anyone noticing"
summary: "I moved production Power BI models from Synapse to Snowflake's gold layer. Same numbers, same security, same reports. Because the models lived as code in Git, a fix found in one could be rolled out to all of them."
pubDate: 2026-11-21
status: live
stack: [Power BI (PBIP/TMDL), Snowflake, Azure Synapse, Git, Azure DevOps, Python, REST APIs, Claude Code]
featured: true
sketch: layers
skills: ["Data migration", "Metrics-as-code", "Fix once, apply at scale", "CI/CD", "Automated parity testing"]
draft: false
---

## What we were trying to do

We had a set of production Power BI models reading from a legacy Synapse warehouse. They needed to move to
Snowflake and read from its gold layer instead. The rule was simple: users shouldn't notice. Same numbers,
same row-level security, same report behaviour.

While we were in there, I also wanted the models to stop hard-coding their connections, so the same model
could be promoted from dev to test to prod through CI/CD.

## How I worked through each model

Every model went through the same steps:

1. **Map the sources.** List every query in the model, find its gold-layer equivalent, and flag anything
   with no match.
2. **Work on a branch.** Each model got its own Git branch. If prod changed during the work, I merged that
   back in so nothing got lost.
3. **Rewrite the queries.** Swap the old sources for native Snowflake queries, with server, warehouse and
   database as parameters instead of hard-coded names. That's what makes one model work in every environment.
4. **Match the data types.** Make sure every column comes in as the same type as prod, with an agreed
   standard for ID columns.
5. **Fill the gaps.** Where the gold layer was missing something, write the new or extended view, with a
   rollback script, test it against the old source, and document it.
6. **Check the data first.** Compare old and new queries in SQL: row counts, distinct keys, totals and
   checksums. If the data doesn't match here, there's no point looking at reports.
7. **Publish and compare.** Publish to a dev workspace through the REST APIs (no manual desktop step), refresh,
   then compare every table, column, measure and value profile against prod.
8. **Explain every difference.** Each one gets a label: by design, data timing, already in prod, or still
   open. Recurring ones go in a shared tracker with the root cause.
9. **Get sign-off.** A short summary for the business owner covering what's done, what's different and why,
   and any decisions they need to make.

## The best part: fix it once, roll it out everywhere

Every model was saved in Power BI's text-based project format (PBIP/TMDL), so it was just files in Git, not
a binary blob. That changed everything.

When something broke in one model, like a type mismatch, a query that didn't follow the parameter pattern, or
something the database rename broke, I fixed it once and proved it with the parity checks. Then I could apply
the same fix to every other model, review it as a diff, and re-run the same checks.

The shared tracker did the same for the "why". Once a root cause was written down, the next model didn't have
to rediscover it. Each model made the next one quicker.

## A bonus: it found problems in prod

Comparing every table, column and value against production doesn't just check the new model. It shines a light on
the old one too. Along the way the checks turned up issues that were already sitting in production, like duplicate
values in keys that should have been unique, which were quietly breaking refreshes. I flagged each one to the owners
with the evidence, kept them separate from migration differences, and re-tested once they were fixed upstream. So the
business ended up with cleaner production models, not just migrated ones.

## What made it tricky

- **Some models stayed mixed-source** on purpose, with a few tables still on other SQL databases. I documented
  those so they'd be handled properly when promoted.
- **The databases were renamed mid-project.** Every model's parameters and branches had to be updated, and the
  rename caused a misleading gateway error that took some digging to trace.
- **Row-level security was checked properly:** who can see what, not just whether the row counts matched.

## Where it landed

Most models reached full or near-full parity, with every remaining difference explained, and several were
approved for deployment. The scripts and docs can be reused for the rest.

## Tools

Power BI (Desktop and Service, PBIP/TMDL, Power Query, DAX), Snowflake (bronze, silver and gold layers),
Azure Synapse, SQL Server, Git, Azure DevOps, the Power BI and Fabric REST APIs, the on-premises data gateway,
Python, the Azure CLI and Claude Code. Claude Code helped with analysis, scripting, validation and
first drafts of the documentation.
