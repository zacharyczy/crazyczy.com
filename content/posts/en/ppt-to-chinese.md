---
title: ppt-to-chinese: From Slides to Readable Chinese Notes
description: An agent skill that turns English PowerPoint decks into Chinese Markdown while keeping slide order and speaker notes.
publishDate: 2026-09-14
updatedDate: 2026-09-14
lang: en
translationKey: ppt-to-chinese
tags: [Python, AI, Project]
draft: false
coverImage: /og.png
---

## A reading workflow for slide decks

English slides are easier to revisit when the text, speaker notes, and visual explanations live in one readable document. I built ppt-to-chinese as an agent skill for that workflow: start with a local PowerPoint file and produce Simplified Chinese Markdown in the original slide order.

## Preparation and translation are separate steps

A Python helper uses Microsoft MarkItDown to extract text and python-pptx to inspect slides and images. It prepares an intermediate workspace with slide excerpts, images, and a manifest. The agent then reads that material and writes the translation. Running the helper alone does not translate the deck.

The default output covers every slide and speaker note. Informative images become Chinese descriptions; mathematical expressions use LaTeX. Requests for selected slides, summaries, or another format can change those defaults.

## Keeping the result checkable

The final document uses a translated filename while retaining course identifiers and versions. A structural check compares the result with the recorded preferences. It checks document structure, not linguistic accuracy. Scans and complex diagrams may still need visual inspection, and uncertain material is marked for review.

## Try it locally

The repository contains the skill instructions, a preparation script, and its dependencies. It works with Codex and Claude Code and requires Python 3.10 or newer and a local .pptx file. MarkItDown is a dependency, and the skill is an independent project.

[Source and setup instructions on GitHub](https://github.com/zacharyczy/ppt-to-chinese)
