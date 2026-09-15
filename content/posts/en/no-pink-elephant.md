---
title: no-pink-elephant: Quietly Respecting Constraints
description: An agent skill for keeping negative requirements in the result, without unnecessary repetition in the reply.
publishDate: 2026-09-15
updatedDate: 2026-09-15
lang: en
translationKey: no-pink-elephant
tags: [AI, Writing, Project]
draft: false
coverImage: /og.png
---

## The output is where a constraint belongs

no-pink-elephant is a small agent skill for writing and editing tasks. It asks the model to treat a user's negative requirements as constraints on the work itself. The goal is a natural, complete result, with less unnecessary repetition of the things the user wanted to leave out.

## Across the whole delivery

The scope includes generated code, prose, comments, documentation, progress updates, and final replies. For example, a product introduction that leaves out pricing can simply focus on its functions and use cases. A revised article can flow naturally after a section is removed.

Explicit requests for a change summary, necessary clarification, and honest explanations of limitations remain part of the task. The skill is intended to interpret requirements in context, rather than silence useful communication.

## A memorable name

The name draws on the pink-elephant image and the white-bear phenomenon as a metaphor for repeatedly bringing excluded content back into attention. That inspiration is not evidence about language-model mechanisms or a measured guarantee of the skill's effectiveness.

## Using the project

The repository's SKILL.md is the entry point. Load the complete folder into a compatible agent's skills directory and invoke it through that tool. How skills are discovered and applied depends on the host.

[Read the project and examples on GitHub](https://github.com/zacharyczy/no-pink-elephant)
