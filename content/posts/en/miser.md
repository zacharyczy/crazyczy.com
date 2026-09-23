---
title: miser: Delegating Work Across Codex Models
description: A Codex skill for deciding when a bounded subtask benefits from another model.
publishDate: 2026-09-23
updatedDate: 2026-09-23
lang: en
translationKey: miser
tags: [AI, Agent Skill, Project]
draft: false
coverImage: /og.png
---

miser is a Codex skill for tasks where the user asks for multi-model collaboration. It gives the lead agent a way to decide which independent pieces of work are worth delegating, while keeping responsibility for the goal, boundaries, review, and final delivery.

## When to delegate

The skill favors a subagent only when the task has a clear boundary and parallel work would save time, reduce distracting intermediate context, or add value through an independent check. Short tasks and tightly connected edits stay with the lead agent.

For available models, it recommends GPT-6 Sol for complex multi-step execution and GPT-6 Luna for narrow, well-defined work. GPT-5.6 Sol is reserved for a user request or a specific compatibility reason. These are guidance, not a promise that a model is available.

## What the skill does not change

miser cannot switch the current task to Astra, install models, or grant extra permissions. It asks the lead agent to describe any model fallback honestly and review delegated results before delivering them.

The full skill is in the [miser GitHub repository](https://github.com/zacharyczy/miser).
