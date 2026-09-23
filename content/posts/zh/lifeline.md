---
title: Lifeline：Codex 额度悬浮窗
description: 用两条置顶进度条查看 Codex 五小时和七天额度的剩余百分比。
publishDate: 2026-09-23
updatedDate: 2026-09-23
lang: zh
translationKey: lifeline
tags: [Python, Tool, Project]
draft: false
coverImage: /og.png
---

Lifeline 是一个适用于 Windows 的置顶小窗口。两条进度条分别显示 Codex 五小时和七天额度的剩余百分比。

## 随时查看

窗口每 90 秒刷新一次。可以拖动位置，双击立即刷新，也可以右键或按 Esc 关闭。读取不到额度时会显示 `--`，不会把未知数值当成零。

## 本机读取

Lifeline 通过本机已登录的 Codex CLI App Server 读取额度，不保存或上传令牌。运行需要 Python 3、Tkinter 和可用的 Codex CLI 登录。在项目目录中双击 `start.cmd` 即可打开窗口。

源码和使用说明见 [Lifeline GitHub 仓库](https://github.com/zacharyczy/Lifeline)。
