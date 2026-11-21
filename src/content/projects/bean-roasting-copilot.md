---
title: "A bean roasting copilot"
summary: "As a relative beginner, I can't track every roasting metric in real time. This copilot watches the roast for me and guides each decision, based on the bean's profile and the goals I set before the roast."
pubDate: 2026-09-28
status: in-progress
stack: [Python, Claude API, Bluetooth, WebSocket, Artisan]
featured: true
sketch: pipeline
skills: ["Hardware integration", "LLM tooling", "Safety checks", "Python"]
---

## The problem

Roasting coffee happens fast. Over ten or so minutes the bean temperature climbs, its rate of rise
(how fast it's climbing) speeds up and slows down, first crack arrives, and the development time after it
decides whether the coffee tastes bright, balanced or burnt. An experienced roaster reads all of that at a
glance. As a relative beginner, I can't: by the time I've checked the temperature, worked out the rate of
rise and remembered what the profile said to do next, the moment has passed.

My roaster, a Sandbox Smart R1 (150 g, electric, Bluetooth), doesn't help much on its own. It shows a
temperature and an app, but nothing is logged in a form I can learn from, and one roast is hard to compare
with the next.

## The idea: a copilot, not an autopilot

Before each roast I set out the goals: the bean, its profile (for example Sweet Maria's notes on how it
behaves), the target roast level, and the timings to aim for. During the roast, the copilot keeps track of
every metric for me and acts as a guide: it tells me where the roast is against the plan, warns me when the
rate of rise is falling away or first crack is close, and suggests the next heat or fan change. I stay in
control of the roaster; the copilot does the tracking and the arithmetic, so I can focus on the decisions
and on learning what they do.

## What I built

- **A bridge to the roaster.** An open-source Bluetooth bridge exposes the roaster as a local WebSocket.
  I rebuilt it with automatic reconnects, a link-health check, stop commands that are held until the link
  returns, and an automatic resume for the roaster's built-in 10-minute cutoff.
- **Copilot tools, built with Claude Code on the Claude API:**
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
