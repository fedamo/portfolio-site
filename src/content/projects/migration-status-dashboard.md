---
title: "A status dashboard with its own agent for a 100-model migration"
summary: "Migration status was spread across several places. This Streamlit in Snowflake app brings it into one: pipeline results and Azure DevOps progress for every model, with a Cortex agent that answers questions from the same semantic view."
pubDate: 2026-11-24
status: live
stack: [Streamlit in Snowflake, Snowflake semantic views, Cortex Agents, Cortex Analyst, Python, SQL, Azure DevOps]
featured: true
draft: false
sketch: chat
skills: ["Semantic views", "AI agents", "Streamlit", "Automated testing", "Spec-first design"]
---

## Why it exists

We're moving about 100 Power BI semantic models from Azure Synapse to Snowflake. A colleague built an automated
pipeline that takes each model in turn. It converts the queries to Snowflake, publishes a copy to a dev workspace,
binds the connections and refreshes it, then tests it against production: structure first, then whether the numbers
match. Every step writes the model's state into Snowflake tables.

The trouble was that the status of the migration lived in many places. The pipeline's tables said what had been
tested. Azure DevOps held the stories, who they were assigned to and how far along they were. Getting a full picture
of any one model meant checking several of them and piecing it together.

I built one Streamlit app that brings it all into a single place. Each model shows its pipeline status alongside its
Azure DevOps story and progress: where it stands, what's blocking it, and who acts next. It also has a chat agent for
plain-English questions about the migration.

Having it in one place made the work much easier to follow. The team lead uses it to monitor progress and to give
leadership updates. The team uses it for triage. I've walked colleagues through it, and it was part of a review with Snowflake's
professional services team.

[Try a mock-up of the dashboard](/dashboards/migration-tracker/). The models, people and numbers in it are made up.

## How it was planned

I started with a one-page spec: what the dashboard is for, who uses it, and which numbers matter most. Then I built an
HTML mock-up on dummy data so people could react to something real before any of it touched Snowflake. Once real data
was flowing, the mock-up was retired and the app was rebuilt as a Streamlit in Snowflake app that reads the pipeline's
views directly.

The app only reads. The pipeline owns and loads the data, so the dashboard can never change what it reports on.

## What's on the page

- A freshness stamp that turns amber when the data is more than two days old.
- A stage bar across the top showing how many models sit at each stage.
- A "What changed" panel covering the last load, 24 hours or 7 days.
- A grid of cards, one per model, tinted by stage, with a few tags showing where it is and what's in its way. Clicking a card opens its Snowflake
  and Power BI status, the issue, the owner, the next step and its linked Azure DevOps work items.
- Filters in a side pane that can be hidden, and that survive reruns.
- A "How to read the cards" guide built from the pipeline's own stage definitions, so it can't fall out of date.
- A reports menu with 17 SQL reports, including a stacked-bar progress chart.
- The chat agent in a collapsible side panel.

## One semantic view behind the page and the agent

The Snowflake objects are generated from code by a build script. Nothing is written by hand.

The centre of it is a semantic view over six pipeline views and tables: models, test failures, blocking objects,
daily progress, state-change events and the load log. It defines the two relationships (test failures to models,
events to models), computed flags such as "has passed" and "real failure or just a sample run", and the dimensions and metrics,
each with synonyms and a comment. The 17 report queries live in it too, each tagged with the question it answers, so
they double as verified queries for the agent.

The Cortex agent has one tool: Cortex Analyst, turning questions into SQL over that semantic view. Its instructions
carry the business rules:

- what "passed" means;
- count real failures and ignore sample runs;
- user counts are per model, so one person can count towards several models;
- if the data can't answer, say so instead of guessing.

Because the cards, the reports and the agent all read the same definitions, a number means the same thing wherever
you see it.

## Wiring the agent into the app

The app calls the agent's REST run endpoint through Snowflake's built-in request helper. The endpoint is stateless, so
the app sends the conversation history with every call, and shows the streamed reply exactly as it arrives.

That helper only exists in Streamlit's warehouse runtime. The newer container runtime doesn't have it, so the app
runs on the warehouse runtime.

## Built in code, so it keeps improving

Because the app is built entirely in code, improving it is routine. Each change is made in the Python files, tested,
and deployed by script, so the app kept getting better as people used it without anyone rebuilding anything by hand.
The list of changes [further down](#what-changed-as-people-used-it) all shipped that way.

The app is five Python files, deployed together: the page itself, data loading, display rules, the 17 reports, and the
agent call. Data loading runs one query per view, using the app's own session inside Snowflake and single sign-on when
I run it locally.

The deploy script compares the stage with my local files and uploads only what changed. A guard stops it doing anything
except listing the stage and uploading those five files. Afterwards it refreshes the stage directory and checks the file
sizes match. That last step came from a real problem. After one upload the app kept serving the old files, because the
stage directory doesn't refresh itself after a connector upload.

## How I tested it

- 244 automated tests, all passing, on canned data with no Snowflake connection: 33 for the data and display rules,
  43 for the agent and reports, and 168 that run the whole page through Streamlit's test runner. They cover filters
  surviving reruns, the grid layout, the chart spec, time zones across daylight-saving changes, fallbacks for older
  Streamlit versions, and the page still loading when a data source can't be read.
- Real-browser checks. The in-app preview reported the wrong widths, so I measured the layout in headless Edge at
  four screen widths: equal card heights, no overlapping popovers, aligned detail rows. With every card showing, the
  first paint takes about 2.4 seconds and a rerun about 0.3.
- Version checks. I worked out which Streamlit features exist on each version Snowflake supports, from the release
  notes and source code, and built fallbacks: a form when there's no chat input box, a checkbox when there's no toggle.
- Live-data checks. Read-only queries against the live views confirmed every number in the walkthrough deck. That
  pass corrected several.
- An independent review. A multi-agent review of the change-tracking logic found three bugs. All are fixed and
  covered by tests.

## What it caught in triage

The dashboard traced a stuck model to a target view holding only 2 of its roughly 100 source columns. It also showed
that the pipeline's status label treated missing columns as renamed ones, which I raised with the pipeline's owner.

## What changed as people used it

- A more compact layout, equal-height card rows, a tidier detail panel, and popovers that open away from the screen
  edges.
- Filters moved into a side pane. A crash on filter values that no longer existed was fixed.
- The headline tiles went from five to four, then disappeared, because the stage bar already said it.
- The progress chart changed from a line chart to a stacked bar.
- Times moved from UTC to US Eastern, with one clear freshness stamp.
- Work items and the "What changed" panel were added.

## Left out, and still open

Left out on purpose: a Cortex Search service (I assessed the source documents and deferred it), a re-run button, and
any dummy data in the live app.

Still open:

- Report tables and agent answers still show UTC, because they keep the SQL's own values.
- One report matches an older wording of an issue label, so it returns nothing for that issue.
- The side-panel button's styling may break on Streamlit 1.46 and later.
- Teams alerts (a digest and milestone alerts) are designed but need admin permissions before they can be created.

Alongside the app there's an 18-slide walkthrough deck, talking points, and a one-page process-flow reference.

The migration this tracks has its own write-up: [Moving BI models to a new warehouse without anyone
noticing](/projects/semantic-model-migration/).
