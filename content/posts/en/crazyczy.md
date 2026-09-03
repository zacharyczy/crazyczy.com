---
title: crazyczy.com: Building a Personal Site for the Long Term
description: The design and engineering choices behind a bilingual site with pixel visuals, small games, and terminal navigation.
publishDate: 2026-09-04
updatedDate: 2026-09-04
lang: en
translationKey: crazyczy
tags: [Web, React, Project]
draft: false
coverImage: /og.png
---

## More than a homepage

crazyczy.com is my bilingual personal website and an evolving digital space. It holds technical writing, project notes, and an introduction, while leaving room for playful entries: Snake, Starflight, and a Terminal that lets visitors navigate with commands.

Home and index pages use a pixel font for a distinct visual identity. Article bodies switch to a serif stack designed for sustained reading. The light theme uses a warm cream background; the dark theme uses a pure-black, high-contrast interface. A first visit follows the system preference, while a manual choice stays on the visitor's device.

## Content and routes

Chinese and English posts can be published independently and are paired through a shared translationKey. Markdown source files generate the writing index, tags, RSS feed, sitemap, and the canonical, hreflang, and structured metadata used by search engines.

A post does not need to wait for its translation. When both versions exist, however, the language control leads directly to the corresponding article. The two languages remain connected without becoming two separately maintained websites.

## Static-first engineering

The site is built with React and Vinext and deployed on Cloudflare. A push to the main branch on GitHub automatically checks, builds, and publishes the project. It needs no database, account system, tracking script, or separately purchased certificate. Game high scores and theme preferences stay only on each visitor's device.

Static-first does not mean featureless; it means keeping long-term maintenance affordable. The difficult part of a personal site is often not the first launch, but still wanting to update it years later. The repository now documents local development, content structure, and deployment in its README so that a future maintainer—including my future self—can return to it quickly.
