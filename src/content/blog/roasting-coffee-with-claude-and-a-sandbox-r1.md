---
title: "Logging every roast: Claude, Artisan and a Sandbox Smart R1"
description: "I wired a 150 g home coffee roaster to my Mac, logged every roast, and built Claude tools that plan, coach and review each batch. Here's what four roasts taught me."
pubDate: 2026-11-21
tags: [coffee, claude, side-project, data]
sketch: chart
draft: true
---

<!--
  DRAFT - written from your summary of the Artisan / Sandbox R1 session. Check the numbers and the tone,
  add how the espresso tasted, then set draft: false.
-->

I roast coffee at home on a **Sandbox Smart R1**: a small electric drum roaster that takes 150 g of
green beans and talks over Bluetooth. Out of the box it's a black box with an app. I wanted what I'd
want from any process at work: every run logged, every change measured, and the definitions fixed so
one roast can be compared with the next.

## How a roast works, briefly

Green coffee goes in at a set temperature (**charge**). It dries, browns, and then cracks audibly
(**first crack**) as moisture escapes. The time between first crack and the end of the roast (**drop**) is
**development**: too short and the centre is under-roasted, too long and it turns dark, oily and bitter.
A second, quieter crack signals the edge of dark roast.

My goal was an espresso roast of Sweet Maria's Espresso Monkey Blend, 100 g at a time: **Full City+ to
light Vienna**, dropping at the first snaps of second crack and never letting it roll on, because the
Brazil component goes ashy if pushed darker.

## The setup

- **A bridge:** a small open-source program links the roaster to my Mac over Bluetooth and exposes it as
  a local WebSocket. Anything on the Mac can then read temperatures and send commands.
- **Artisan:** the open-source roast-logging app, pointed at that WebSocket for a live graph of bean
  temperature and rate of rise (how fast the temperature is climbing).
- **Claude tools I built with Claude Code:**
  - `roast-plan` writes a pre-roast plan from the target profile, roasting notes and past roasts.
  - `roast-copilot-live` gives advice during the roast and records everything.
  - `roast-cmd` sends heat, fan and drum commands, with safety checks.
  - `watch` gives spoken alerts.
  - `roast-cup` records tasting scores.
  - `roast-review` critiques a finished roast and proposes profile changes.
- **Plain files as the source of truth:** a YAML target profile, reference notes on the roaster and the
  bean, and one JSON record per roast with bean temperature every 5 seconds, crack and drop times, every
  heat change, the advice given and my notes on appearance.

57 automated tests cover the new code.

## What the data showed

| Roast | Heat steps | First crack | Drop | Development |
|---|---|---|---|---|
| 2 | cut to 65% at 3:00, back to 72% | 9:42 at 199 °C | 16:13 at 218 °C | far too long: dark and oily |
| 3 | 80% → 72% → 62% at 188 °C → 55% at first crack | 9:15 at 204 °C | 12:23 at 219 °C | 3:08 (25%): good colour |
| 4 | 78% → 68% → 60% → 50% at first crack | 9:01 at 206 °C | 11:54 at 218 °C | 2:53 (24%): slightly uneven |

- **Rate of rise is the lever.** Cutting heat too hard early (roast 2) crashed it, and the roast never
  recovered its shape.
- **Too little heat late stalls development.** In roast 4 the rate of rise faded to about 4 °C/min after
  first crack and the beans came out uneven.
- **Next roast plan:** first crack around 8:30; cut heat at about 203 °C, just before it; then hold 5–6 °C/min
  for 3:30–4:00 of development.

[Add: how the espresso from roasts 3 and 4 tasted after resting 36+ hours.]

## What went wrong, and the fixes

- **The roaster stops itself at 10 minutes.** It ends the roast at about 600 seconds and stops the drum,
  which is what ruined roast 2. I rebuilt the bridge to resume automatically within 2–7 seconds, and
  confirmed it live twice. The trade-off: a deliberate stop near 10:00 would also be resumed, so the power
  switch is the emergency stop.
- **Bluetooth drops.** The bridge now reconnects with backoff, checks link health, and holds stop commands
  until the link is back.
- **Artisan didn't quite fit.** Its event buttons send commands this roaster ignores, and the second
  temperature (ET) goes stale mid-roast. Artisan stays as an optional live graph; the Claude tools keep
  the real record.
- **AI plans cut off mid-sentence.** The model's thinking used up the output limit. I raised the limit for
  plans and turned thinking off for live advice, where speed matters more.
- **A missing roast.** The copilot only saved data when it gave advice, so roast 4 had to be rebuilt from
  the alert log. That fix, and making its clock start at charge, are next on the list.

## What it has in common with my day job

This is the same work as governed analytics, at kitchen-counter scale. "Development time" only means
something if it's measured the same way every roast, from first crack to drop, so it's defined once in the
roast record and every comparison uses it. The AI advises; the data and the safety checks decide. And when
advice was wrong, the fix went into the data and the tools.

## What's next

- A longer-development roast, following the plan above.
- Fixing the copilot's save and clock bugs, and adding a switch to turn auto-resume off.
- A live dashboard comparing the current roast with the best previous curve.
- Working out why the 28 September beans ground flat and dense after two days.

[Optional: a chart of the roast curves for roasts 2–4.]
