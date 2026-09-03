---
title: Gentzen G′: From Sequent Rules to Automated Proof Search
description: A C++17 propositional sequent-calculus checker that produces proof trees or verified countermodels.
publishDate: 2026-09-04
updatedDate: 2026-09-04
lang: en
translationKey: gentzen
tags: [C++, Logic, Project]
draft: false
coverImage: /og.png
---

## Why I built it

Gentzen is my implementation for a mathematical logic lab at Nanjing University. Instead of returning only whether a formula is true, sequent calculus expresses a proof as a sequence of rule applications. That makes it a useful system for showing how a conclusion is derived.

The project targets classical propositional logic. Its goal is to keep proof search visible and inspectable rather than hiding the reasoning behind a Boolean answer.

## What it does

The program parses sequents containing numbered propositional variables, negation, conjunction, disjunction, and implication. It supports multiple or empty antecedents and succedents. The prover implements the axiom and left/right logical rules of the G′ system, recursively reducing formulas by structure.

For a provable sequent it prints the complete proof tree. For an unprovable one it constructs a countermodel and checks that the assignment really falsifies the original sequent. Proof depth is configurable; reaching the limit returns Unknown instead of confusing an incomplete search with a proof of unprovability.

## Implementation and scope

The project is written in C++17, reads a sequent from standard input, and includes a demonstration mode. It currently omits first-order quantifiers and represents variables as non-negative integers. Those constraints keep the implementation compact and focused on rule application, termination, and countermodel construction.

The most useful part of the project was translating rules from a textbook into executable data structures and recursive procedures. Formal logic becomes a system that can run, fail, and be independently checked.
