---
title: Lifeline: A Floating Codex Usage Window
description: A small Windows utility that shows remaining Codex usage in two floating progress bars.
publishDate: 2026-09-23
updatedDate: 2026-09-23
lang: en
translationKey: lifeline
tags: [Python, Tool, Project]
draft: false
coverImage: /og.png
---

Lifeline is a small always-on-top window for Windows. It shows the remaining percentages for the five-hour and seven-day Codex usage windows in two progress bars.

## A quick glance

The window refreshes every 90 seconds. You can drag it to another position, double-click to refresh immediately, or close it with a right-click or Escape. If a usage value is unavailable, it shows `--` rather than treating an unknown value as zero.

## Local data source

Lifeline reads usage through the locally signed-in Codex CLI App Server. It does not save or upload a token. It needs Python 3 with Tkinter and a working Codex CLI login. Run `start.cmd` from the project folder to open the floating window.

Source and setup notes are in the [Lifeline GitHub repository](https://github.com/zacharyczy/Lifeline).
