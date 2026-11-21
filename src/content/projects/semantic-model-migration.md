---
title: "Migrating BI semantic models to a cloud data platform, with zero visible change"
summary: "Moved production BI semantic models from a legacy warehouse to a cloud data platform's gold layer with zero visible change. Because the models lived as code in Git, a fix discovered in one model could be applied to all of them at scale."
pubDate: 2026-11-21
status: live
stack: [Power BI (PBIP/TMDL), Snowflake, Azure Synapse, Git, Azure DevOps, Python, REST APIs, Claude Code]
featured: true
sketch: layers
skills: ["Data migration", "Metrics-as-code", "Fix once, apply at scale", "CI/CD", "Automated parity testing"]
draft: false
---


## The goal

A set of production BI semantic models read from a legacy cloud warehouse. They needed to move to a modern
cloud data platform, reading from its curated **gold layer**, with one hard rule: **report users should see no
difference.** Same numbers, same row-level security, same report behaviour.

Along the way the models had to become **environment-agnostic**, so one definition can move from dev to test
to production through CI/CD instead of being edited by hand for each environment.

## A repeatable path, one model at a time

Every model followed the same nine steps, which turned a risky migration into a process:

1. **Inventory and mapping.** List every source query, map each legacy table or view to its gold-layer
   equivalent, and flag gaps where the gold layer had no match.
2. **Branch and stay current.** Do the work on a dedicated Git branch, check it against production
   regularly, and merge in any production changes made mid-project so nothing is lost.
3. **Convert the queries.** Rewrite the sources as native warehouse queries, driven by parameters for
   server, warehouse and database rather than hard-coded names. This is what makes one model definition
   run anywhere.
4. **Match production types.** Make every column load with the same data type as production, following an
   agreed standard for ID columns.
5. **Fill gold-layer gaps.** Where the gold layer was missing something, draft new or extended views with
   rollback scripts, test them against the legacy source first, and document each one.
6. **Prove parity at the source.** Compare old and new queries directly in SQL: row counts, distinct keys,
   totals and checksum-style fingerprints. The data has to match before any report is involved.
7. **Publish and test automatically.** Publish the converted model to a dev workspace through REST APIs, with no
   manual desktop step. Then bind its data sources, refresh it, and run a structural test plus a full comparison
   against production: every table, column, measure and value profile.
8. **Explain every difference.** Classify each one as by design, data timing, already present in
   production, or open. Recurring patterns go into a shared tracker with root causes, so later models reuse
   the explanation.
9. **Sign-off.** A short pass summary for the business owner: current state, known differences (impact,
   why, examples) and any decisions needed. Then track it through feedback to deployment.

## The best part: fix it once, apply it everywhere

Each model was saved in Power BI's text-based project format (PBIP, with TMDL model definitions), so every
model was plain text in Git rather than a binary file. That changed the economics of the whole project.

When a problem surfaced in one model (a column type that didn't match production, a query that didn't
follow the parameter standard, a pattern that broke on the renamed databases), the fix was worked out once,
in that model, and checked with the parity tests. Then, because every other model shared the same structure
as code, the same fix could be applied across all of them at scale, reviewed as a diff in Git, and re-tested
the same way.

The shared issue tracker did the same for knowledge: the root cause and the fix were written down once and
reused by every later model. Each model made the next one faster and safer, instead of every migration
starting from scratch.

## Harder moments

- **Mixed-source models.** Some models deliberately kept certain tables on other databases; documented so
  they're handled correctly at promotion.
- **The platform changed mid-project.** Databases were renamed to a new naming standard. Every model's
  parameters and branches were updated, and a misleading gateway error caused by the rename was diagnosed.
- **Problems that were already in production**, such as duplicate keys breaking production refreshes, were kept
  separate from migration issues and re-tested once fixed upstream.
- **Security checked properly.** Row-level security was verified at the level of who can see what, not just
  row counts.

## Outcome

Most models reached full or near-full parity with production, with **every remaining difference explained**,
and several were approved for deployment. The process, scripts and documentation are reusable for the rest.

## How it connects to Defined Once

Migration is where definitions quietly drift: a type changes, a join moves, a filter gets lost. Treating
the models as code (text-based model definitions in Git, parameterised queries, automated comparisons) means
the definition that users trust stays the same one, wherever it runs.

## Tools

- **BI:** Power BI Desktop and Service, PBIP/TMDL text-based model definitions, Power Query (M), DAX
- **Data platforms:** Snowflake (bronze, silver, gold layers), Azure Synapse (legacy), SQL Server
- **Source control and tracking:** Git, Azure DevOps (repos, branches, work items, boards)
- **APIs:** Power BI and Microsoft Fabric REST APIs (publish, parameters, refresh, DAX queries), on-premises data gateway
- **Automation:** Python scripts for publishing, drift checks, post-publish steps and parity comparisons
- **Documentation:** a knowledge base with per-model notes, an issue tracker and a status board
- **AI assistance:** Claude Code, for analysis, scripting, validation and drafting documentation
