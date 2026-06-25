---
title: "ResumeTeX"
description: "可通过自助编辑与 LaTeX 代码生成 PDF 版 CV 的简历制作工具，支持结构化填写、A4 预览、.tex 导出和 PDF 编译预览。"
date: 2026-06-25
status: active
tags:
  - Resume Builder
  - LaTeX
  - PDF Generation
  - Next.js
demo: "http://120.24.108.234/cv"
---

ResumeTeX 是一个面向简历制作的 LaTeX 工具原型。用户可以通过网页表单自助编辑简历内容，系统根据结构化数据生成 LaTeX 源码，并进一步编译为 PDF 版 CV。

项目的目标是把“填写简历”和“维护 LaTeX 简历模板”放在同一个工作流里：用户不需要直接从零编辑 `.tex` 文件，也可以获得 LaTeX 排版带来的稳定版式和 PDF 输出质量。

当前功能包括：

- 结构化填写基本信息、教育经历、工作经历、学术经历、项目经历和技能等模块。
- 根据统一 CV 模板生成 LaTeX 源码。
- 支持浏览器内 A4 草稿预览。
- 支持导出 `.tex` 文件。
- 通过 LaTeX 编译 Worker 生成真实 PDF，并提供预览和下载入口。
- 支持中文、English、Français 三种简历内容版本。
- 支持自定义主题色、章节名称、章节顺序和基本信息字段。

该项目部署在阿里云服务器的 `/cv` 路径下，使用 Next.js base path 隔离应用路由与 API 路由。
