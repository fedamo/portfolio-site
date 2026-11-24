---
title: "Family Learning Tracker"
summary: "A small private app that turns my kids' school curriculum into daily practice. They answer in the app, it works out why a wrong answer was wrong, and the next day's questions go after exactly that."
pubDate: 2026-07-24
status: in-progress   # change to "live" if it's in daily use
stack: [Next.js, TypeScript, PostgreSQL, Prisma, Claude API, Vercel]
featured: true
draft: false
sketch: book
skills: ["AI product design", "Structured LLM outputs", "Human-in-the-loop", "Claude API"]
---

## Why I built it

School curriculum documents spell out what a child should be able to do by the end of the year. Turning that
into useful practice at home takes time, though. Generic worksheets don't follow what the class is
covering, and it's hard to tell which skills are solid and which still need work.

## What it does

- Reads the curriculum. Upload the school's document (PDF, Word or pasted text) and Claude pulls out every
  benchmark, like "can add two-digit numbers with regrouping". It's told to copy each statement as
  written and invent nothing.
- Tracks each benchmark as not started, in progress or achieved.
- Writes daily practice. Every morning a scheduled job writes four questions for each subject that still
  has gaps, each tied to a specific benchmark.
- Asks questions the way a tutor would. Maths questions come at the skill from different angles: word problems,
  "solve it two ways", "spot the mistake", estimate first. Reading questions come with a short original
  passage aimed at one skill.
- Marks the answers. My kids type their answers in. Claude marks each one, gives a hint and a second try, and
  tells me the likely misconception ("added the tens without carrying"). Number answers are double-checked in
  code, and I can override any mark.
- Closes the loop. Misconceptions that haven't been fixed feed into the next day's questions, so practice goes
  straight at where they're stuck.
- Keeps a learning journal and a reading log, so I can see what's been covered and how much reading got done.

## How it's built

- App: Next.js and TypeScript, with PostgreSQL through Prisma, hosted on Vercel.
- AI: the Claude API with structured outputs. Every response is checked against a schema before it's saved,
  so the app only ever stores clean, structured data.
- Scheduling: a Vercel cron job writes each day's questions, and the long tutoring prompt is cached to keep
  repeat calls cheap.
- Built with Claude Code, working from specs.

## The bit I like most

It's the same idea I use at work, just at the kitchen table. The curriculum benchmarks are defined once. Every
question points back to one, every mistake is logged against one, and progress is measured against them instead
of against whatever the last worksheet happened to cover.

The AI handles the judgement calls: reading an answer, naming the misconception, writing a good hint. Code handles
the things that have to be exactly right. And I always get the final say.

More on the marking: [Teaching a homework app to notice why, not just whether](/blog/a-tutor-that-notices-why/).
