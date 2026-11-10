---
title: "Why I'm building governed analytics in public"
description: "Stage 0: the problem with five definitions of revenue, and the plan for an end-to-end Snowflake build."
pubDate: 2026-11-16
stage: 0
tags: [semantic-layer, snowflake, cortex]
draft: true
---

<!--
  DRAFT - edit freely. Set `draft: false` (and check pubDate) when you're ready to publish.
  Keep claims honest: say "building" for anything not yet shipped.
-->

## The problem

Business users ask the same metric question and get different answers, because a term like
"revenue" is defined five ways across five dashboards. Pointing a large language model at the raw
schema makes it worse: the agent guesses at joins and definitions it can't see.

## What I'm building

An end-to-end, open-source build on Snowflake, using public insurance claims data:

1. Ingest the raw data with dlt.
2. Model it into a star schema with dbt Core, with tests on grain and uniqueness.
3. Define every metric once, as versioned YAML that generates Snowflake Semantic Views.
4. Let Cortex Agents answer questions from those definitions, not from the raw tables.
5. Put it in front of users with a Streamlit app that shows the answer, the SQL and the rule.
6. Make it checkable: verified queries, contract tests and an evaluation report.

## How I work

I work AI-native: I write the spec, hand agents end-to-end tasks, and review their output to the
same bar as human code. When an agent gets something wrong, I fix the governed layer, not the prompt.

## What's next

Stage 1: setting up the repo, a Snowflake trial and the dataset.
