---
title: "A bean roasting copilot"
summary: "I'm still new to roasting coffee, and there's too much to watch at once. So I built a copilot that tracks the roast for me and tells me what to do next, based on the bean and the plan I set beforehand."
pubDate: 2026-09-28
status: in-progress
stack: [Python, Claude API, Bluetooth, WebSocket, Artisan]
featured: true
sketch: pipeline
skills: ["Hardware integration", "LLM tooling", "Safety checks", "Python"]
---

## Why I built it

A roast takes about ten minutes, and a lot happens in that time. Bean temperature climbs, its rate of rise
speeds up and slows down, first crack arrives, and the time after first crack (development) decides whether
the coffee tastes great or burnt.

Experienced roasters read all of that at a glance. I can't yet. By the time I've checked the temperature,
worked out the rate of rise and remembered what the plan said, the moment's gone.

My roaster, a Sandbox Smart R1 (150 g, electric, Bluetooth), doesn't help much either. It shows a temperature
in an app, and I can't log, compare or learn from any of it.

## How the copilot helps

Before each roast I set the plan: the bean, its profile (Sweet Maria's notes on how it behaves), the roast
level I want and the timings to aim for.

During the roast, the copilot does the tracking and the maths. It tells me where I am against the plan, warns
me when the rate of rise is dropping or first crack is close, and suggests the next heat or fan change. I'm
still the one making the changes. It just means I can think about the decision instead of the numbers.

## What I built

- **A Bluetooth bridge.** An open-source bridge connects the roaster to my Mac and exposes it over a local
  WebSocket. I hardened it: it reconnects when Bluetooth drops, holds stop commands until the link is back,
  and works around the roaster's built-in 10-minute cutoff by resuming automatically.
- **A handful of command-line tools,** built with Claude Code on the Claude API:
  - `roast-plan` writes a pre-roast plan from the profile, my notes and past roasts.
  - `roast-copilot-live` gives advice during the roast and logs everything.
  - `roast-cmd` sends heat, fan and drum commands, with safety checks.
  - `watch` reads alerts out loud.
  - `roast-cup` records tasting scores.
  - `roast-review` looks at a finished roast and suggests what to change.
- **Plain files for the data.** A YAML profile, reference notes, and one JSON file per roast: temperature every
  5 seconds, crack and drop times, every heat change, the advice I got and my notes.
- **Artisan** (the open-source roasting app) is still there if I want a live graph.

## How it fits together

Roaster → Bluetooth → bridge on my Mac → WebSocket → Artisan and the copilot. Commands go back the same way,
and every one goes through a safety check first. There are 57 tests on the new code.

## A few decisions I'd make again

- **The AI suggests; code decides.** Advice is logged next to the real measurements, and nothing reaches a hot
  roaster without passing a plain, deterministic check.
- **Measure things the same way every time.** Development time always runs from first crack to drop, so one roast
  can be compared with the next.
- **Fast answers when it matters.** Planning uses more reasoning. Live advice skips it, so the answer arrives while
  it's still useful.

## So far

Three logged roasts of an espresso blend. The best had first crack at 9:15 and 3:08 of development (25%).
Next I'm aiming for first crack around 8:30 and 3:30 to 4:00 of development.

## Next up

Fix a couple of copilot bugs (it doesn't always save, and its clock starts at launch instead of charge), add a
switch to turn auto-resume off, and build a live dashboard that compares the current roast with my best one.
