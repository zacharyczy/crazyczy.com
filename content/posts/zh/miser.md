---
title: miser：为 Codex 多模型任务分流
description: 一份帮助主代理判断何时值得委派独立子任务的 Codex Skill。
publishDate: 2026-09-23
updatedDate: 2026-09-23
lang: zh
translationKey: miser
tags: [AI, Agent Skill, Project]
draft: false
coverImage: /og.png
---

miser 是一份用于多模型协作任务的 Codex Skill。当用户要求多个模型协作时，它帮助主代理判断哪些独立工作适合委派，同时让主代理继续负责目标、边界、审查和最终交付。

## 何时委派

只有子任务边界清楚，并行处理能节省时间、减少中间信息干扰，或提供有价值的独立核查时，才建议创建子代理。简短任务和紧密关联的修改仍由主代理完成。

在模型可用时，它建议用 GPT-6 Sol 处理复杂的多步执行，用 GPT-6 Luna 处理范围窄、要求明确的工作。GPT-5.6 Sol 留给用户指定或有明确兼容需要的情况。这些是选择建议，不保证模型一定可用。

## 边界

miser 不能切换当前任务的主模型，也不会安装模型或授予额外权限。发生模型回退时，主代理应如实说明，并在交付前检查委派结果。

完整规则见 [miser GitHub 仓库](https://github.com/zacharyczy/miser)。
