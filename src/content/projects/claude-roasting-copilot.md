---
title: "Claude roasting copilot"
summary: "A home coffee roaster wired to my Mac, with Claude tools that plan each roast, coach it live, enforce safety checks and review the result against a logged history."
pubDate: 2026-09-28
status: in-progress
stack: [Python, Claude API, Bluetooth, WebSocket, Artisan]
featured: true
sketch: pipeline
skills: ["Hardware integration", "LLM tooling", "Safety checks", "Python"]
---

## The problem

A Sandbox Smart R1 is a 150 g electric drum roaster that talks over Bluetooth. Out of the box it's a
black box with an app: nothing is logged in a form I can analyse, and one roast can't easily be compared
with the next. I wanted every roast recorded, every change measured, and help in the moment from an AI
that knows the bean, the target profile and my past roasts.

## What I built

- **A bridge to the roaster.** An open-source Bluetooth bridge exposes the roaster as a local WebSocket.
  I rebuilt it with automatic reconnects, a link-health check, stop commands that are held until the link
  returns, and an automatic resume for the roaster's built-in 10-minute cutoff.
- **Claude tools, built with Claude Code:**
  - `roast-plan` writes a pre-roast plan from the target profile, reference notes and past roasts.
  - `roast-copilot-live` gives advice during the roast and records everything.
  - `roast-cmd` sends heat, fan and drum commands through safety checks.
  - `watch` gives spoken alerts.
  - `roast-cup` records tasting scores.
  - `roast-review` critiques a finished roast and proposes changes to the profile.
- **Plain files as the source of truth:** a YAML target profile, reference notes on the roaster and the
  bean, and one JSON record per roast: bean temperature every 5 seconds, crack and drop times, every heat
  change, the advice given and my notes.
- **Artisan** stays as an optional live graph of temperature and rate of rise.

## How it works

Roaster → Bluetooth → bridge on the Mac → local WebSocket → Artisan and the Claude tools. Commands go
the other way through the same bridge, and every command passes safety checks before it reaches the
roaster. 57 automated tests cover the new code.

## Design choices

- **The AI advises; code and data decide.** Advice is logged next to the measurements, and commands to a
  hot roaster go through deterministic checks, never straight from the model.
- **Defined once.** Development time, crack times and drop are recorded the same way every roast, so
  comparisons mean something.
- **Speed where it matters.** Planning uses deeper model reasoning; live advice runs with thinking off,
  so answers arrive while they're still useful.

## Results so far

Three logged roasts of an espresso blend. The best had first crack at 9:15 and 3:08 of development
(25%). The next experiment targets first crack around 8:30 with 3:30–4:00 of development.

## What's next

Fix the copilot's save and clock bugs, add a switch to turn auto-resume off, and build a live dashboard
comparing the current roast with the best previous curve.
