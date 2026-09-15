---
title: no-pink-elephant：自然遵守约束，把注意力留给结果
description: 一个用于生成和编辑任务的 Agent Skill，减少对负向要求的不必要确认和复述。
publishDate: 2026-09-15
updatedDate: 2026-09-15
lang: zh
translationKey: no-pink-elephant
tags: [AI, Writing, Project]
draft: false
coverImage: /og.png
---

## 让要求体现在交付中

no-pink-elephant 是一个用于写作和编辑任务的 Agent Skill。它引导模型将用户的负向要求转化为对作品本身的约束，让最终结果自然完整，减少对用户希望省略的内容反复确认和复述。

## 覆盖整个交付过程

适用范围包括代码、文章、注释、文档、进度说明和最终回复。例如，一篇不涉及价格的产品介绍，可以直接围绕功能和使用场景展开；删除某一节后的文章，可以用自然衔接的正文交付。

用户明确要求的修改说明、必要澄清和无法完成时的如实解释仍应提供。规则需要结合任务和用户意图理解。

## 名字背后的意象

名字借用了粉红象的表达和白熊现象，提醒我们反复提及希望省略的内容，也会重新吸引注意力。这是一种命名隐喻，并不是对大模型机制或技能效果的实验验证。

## 使用方式

仓库中的 SKILL.md 是入口。把整个文件夹放入兼容工具的技能目录，并按宿主工具的方式加载或调用。技能的发现与实际应用方式取决于所使用的工具。

[在 GitHub 阅读项目与示例](https://github.com/zacharyczy/no-pink-elephant)
