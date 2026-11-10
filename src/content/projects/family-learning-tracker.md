---
title: "Family Learning Tracker"
summary: "A private web app that turns a child's school curriculum into daily, tutor-style practice questions, and tracks reading and progress against each curriculum benchmark."
pubDate: 2026-07-24
status: in-progress   # change to "live" if it's in daily use
stack: [Next.js, TypeScript, PostgreSQL, Prisma, Claude API, Vercel]
featured: true
draft: false
---


## The problem

School curriculum documents describe exactly what a child should be able to do by the end of the
year, but turning that into useful practice at home takes time. Generic worksheets don't follow what
the class is actually covering, and it's hard to see which skills are secure and which still need work.

## What I built

A small, password-protected web app for one family:

- **Curriculum in, benchmarks out.** Upload a curriculum document (PDF, Word, or pasted text). Claude
  extracts every benchmark statement, such as "can infer a character's feelings from their actions",
  grouped by subject. It is instructed to extract, not summarise, and not to invent statements.
- **Progress per benchmark.** Each benchmark is tracked as not started, in progress or achieved.
- **Daily practice set.** Every morning a scheduled job generates four questions per subject that still
  has unmet benchmarks, each one tied to a specific benchmark.
- **Tutor-style questions, not worksheets.** Maths questions vary the angle: real-world stories,
  solving the same problem two ways, spotting the error in another student's work, estimating before
  calculating, and missing-number problems. Reading questions come with a short original passage and
  target one skill, such as inference, vocabulary in context or finding text evidence.
- **More than the answer.** Each question includes the expected answer with reasoning, a follow-up a
  tutor would ask next, and the one-sentence takeaway it is really teaching.
- **Answers marked in the app (in testing).** The child types an answer and Claude marks it, gives a
  hint and one retry, and names the likely misconception for the parent. Numeric answers are
  cross-checked in code, parents can override any marking, and unresolved misconceptions shape the
  next day's questions. [How it works](/blog/a-tutor-that-notices-why/).
- **Learning journal and reading log.** Answers and sticking points build a journal of concepts covered, and a
  weekly reading grid tracks minutes read against a daily goal.

## How it works

- **App:** Next.js and TypeScript, with PostgreSQL through Prisma.
- **AI:** the Claude API with structured outputs. Every response is validated against a Zod schema
  before it's saved, so the app stores clean benchmarks and questions, not free text to parse.
- **Scheduling:** a Vercel cron job generates each day's set, and the long tutoring prompt is cached
  to keep repeat calls cheap.
- **Context, not copying:** uploaded homework sheets and newsletters are passed in as reference for
  topic and level only. The prompt tells the model to write original questions rather than reuse them.

## Why it connects to the rest of my work

It's the same idea as a governed semantic layer, at kitchen-table scale. The curriculum benchmarks are
defined once, every generated question points back to the benchmark it serves, and progress is
measured against those definitions rather than against whatever the last worksheet happened to cover.
