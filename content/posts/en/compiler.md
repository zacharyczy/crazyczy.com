---
title: Compiler: Understanding a Compilation Pipeline in Five Stages
description: A C, Flex, and Bison project spanning parsing, semantic analysis, IR, MIPS32 code generation, and optimization.
publishDate: 2026-09-04
updatedDate: 2026-09-04
lang: en
translationKey: compiler
tags: [C, Compiler, Project]
draft: false
coverImage: /og.png
---

## A compiler assembled one stage at a time

The Compiler repository contains my implementation of the compiler principles labs at Nanjing University. It processes a C--/CMM-style input language and uses C, Flex, and Bison. The work is divided into five independently buildable stages.

That staged structure matters. Each lab builds on the representations and constraints introduced earlier, turning a compiler from a black box into a pipeline whose behavior can be inspected at every boundary.

## Five stages

Lab 1 implements lexical and syntax analysis plus an abstract syntax tree. Lab 2 adds symbol tables, a type system, and semantic checking. Lab 3 emits an intermediate representation. Lab 4 translates that IR into MIPS32 assembly. Lab 5 performs control-flow-based data-flow analysis and IR optimization.

Each directory preserves a complete version of its stage and builds with its own Makefile. Depending on the stage, a CMM source file or IR file becomes an AST, diagnostics, intermediate code, assembly, or optimized IR.

## From recognition to generation

The separation between frontend and backend becomes increasingly concrete throughout the project. Lexing and parsing recover program structure; symbols and types decide whether it is meaningful; the IR provides a stable interface; code generation and optimization address machine constraints and execution.

Some code is intentionally repeated between lab directories because the repository records a learning process rather than a production compiler optimized for minimum duplication. It builds on Linux or WSL with GCC, GNU Make, Flex, and Bison, and does not include course test data. Those boundaries are part of the project too: understanding what a system does includes stating clearly what it does not yet do.
