---
title: ppt-to-chinese：把英文幻灯片变成可阅读的中文笔记
description: 一个将英文 PowerPoint 整理成中文 Markdown 的 Agent Skill，保留原始页序与演讲者备注。
publishDate: 2026-09-14
updatedDate: 2026-09-14
lang: zh
translationKey: ppt-to-chinese
tags: [Python, AI, Project]
draft: false
coverImage: /og.png
---

## 让幻灯片适合重新阅读

把幻灯片文字、演讲者备注和图示解释放进同一份文档，复习英文材料会更方便。我为这个流程构建了 ppt-to-chinese：从本地 PowerPoint 开始，按原始页序生成简体中文 Markdown。

## 先提取，再翻译

Python 辅助脚本调用 Microsoft MarkItDown 提取文本，并用 python-pptx 检查幻灯片和图片。中间工作目录包含逐页摘录、图片及清单，供 Agent 阅读后撰写译文。只运行准备脚本不会自动产生中文翻译。

默认处理全部页面和演讲者备注，把有信息量的图片转为中文描述，数学表达式使用 LaTeX。也可以明确要求只处理部分页面、提供摘要或调整格式。

## 保留核对的依据

输出文件名翻译原始文件名，同时保留课程编号和版本信息。结构检查会根据本次要求核对结果，但不评价翻译准确性。扫描文字与复杂图示仍可能需要人工或 Agent 查看原图；无法确定的内容会标记为待核对。

## 本地使用

仓库提供技能说明、准备脚本和依赖列表，可用于 Codex 与 Claude Code，需要 Python 3.10 或更新版本及本地 .pptx 文件。MarkItDown 是转换依赖，这个技能是独立项目。

[在 GitHub 查看源码与安装说明](https://github.com/zacharyczy/ppt-to-chinese)
