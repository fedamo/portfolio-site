---
title: "Teaching a homework app to notice why, not just whether"
description: "How I turned a family practice-question generator into a tutor that marks answers, spots the misconception behind a mistake, and targets it the next day."
pubDate: 2026-11-10
tags: [ai, claude, side-project, learning]
draft: false
---


I built a small web app for my family that turns a school curriculum into daily practice questions.
It worked, but it had a blind spot that any human tutor would spot straight away: it could tell
whether an answer was right, but not *why* it was wrong. This post is about closing that gap.

## Version 1: curriculum in, questions out

The first version did three things:

- **Read the curriculum.** You upload the school's curriculum document and Claude pulls out every
  benchmark statement, such as "can add two-digit numbers with regrouping". Each one is tracked as not
  started, in progress or achieved.
- **Wrote daily practice.** Every morning it generates a short set of questions per subject, each tied
  to a benchmark the child hasn't mastered yet.
- **Wrote them like a tutor.** Not just "what is 27 + 14?", but word problems, "solve it two ways",
  "spot the mistake in this other student's working", and short original reading passages with a
  question that needs one specific skill.

A parent then read out the question and tapped *Correct* or *Incorrect*.

## What was missing

That last step was the weak point. "Incorrect" throws away the most useful information there is.
A child who writes 31 for 27 + 14 hasn't failed at addition. They've added the tens without carrying
the extra ten from the ones column. That's a specific, fixable misunderstanding, and tomorrow's
practice should go straight at it.

The app was open-loop: it generated practice, but nothing it learned from the answers flowed back
into what it generated next.

## Version 2: closing the loop

Now the child types the answer into the app, and four things happen.

1. **The answer is marked.** Claude compares it with the expected answer and the benchmark, and
   returns a verdict (correct, partly right or not yet) using a fixed, validated format rather than
   free text. It marks understanding, not spelling or wording.
2. **The child gets a hint, not the answer.** A short, encouraging message plus one hint that points
   at the misunderstanding without giving the answer away, then one more try. The full worked answer
   only appears after that.
3. **The parent sees the likely misconception.** For example: *"Added the tens without carrying the
   extra ten from the ones column."* It shows on the question and in a "what they're getting stuck
   on" list in the learning journal.
4. **Tomorrow adapts.** Unresolved misconceptions from the last two weeks are passed to the question
   generator, which writes at least one fresh question per subject that exercises the misunderstood
   idea from a new angle, without telling the child they got it wrong before.

## Making it trustworthy

A marking tool that's confidently wrong is worse than no marking tool, especially for a child.
A few deliberate choices:

- **Code checks the numbers.** For questions with a numeric answer, the model reads the expected
  number and the child's number, but the comparison is plain arithmetic in code. If they don't match,
  the answer can't be marked correct, whatever the model said.
- **Parents always win.** Any marking can be overridden with one tap, and the app records whether a
  result came from the AI or a parent. That gives me a running count of how often the AI misjudges.
- **The child's answer is data, not instructions.** It's wrapped and labelled in the prompt so that
  whatever a child types is only ever marked, never obeyed.
- **Family data stays private.** The app is password-protected and built for one family. Nothing on
  this page comes from real answers.

## Why this pattern interests me

It's the same idea I keep coming back to in analytics work: define things once and measure
against those definitions. Here the curriculum benchmarks are the definitions. Every question points
back to one, every mistake is recorded against one, and progress is measured against them rather
than against whatever the last worksheet happened to cover.

The AI does the parts that need judgement: reading a child's reasoning, naming the misconception,
writing a good hint. Code does the parts that need to be exactly right, and a parent has the final
say.

## What's next

The marking has only been tested with made-up answers so far. Next comes real use: I'll
write up how fair the marking feels, how often I override it, and whether the targeted questions
actually help, after a few weeks of homework.

More about the build on the [project page](/projects/family-learning-tracker/).
