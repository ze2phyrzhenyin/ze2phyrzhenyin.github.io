---
title: "ResumeTeX"
description: "A CV builder that turns structured self-editing and LaTeX generation into a PDF resume workflow."
date: 2026-06-25
status: active
demo: "http://120.24.108.234/cv"
github: "https://github.com/ze2phyrzhenyin/cv"
cover: "/images/projects/resume-tex.png"
i18n:
  en:
    title: "ResumeTeX"
    description: "A CV builder that turns structured self-editing and LaTeX generation into a PDF resume workflow."
    sections:
      - paragraphs:
          - "ResumeTeX is a LaTeX-based CV builder prototype. Users edit resume content through structured web forms, then the system generates LaTeX source and compiles it into a PDF CV."
          - "The goal is to connect resume editing and LaTeX template maintenance in one workflow. Users do not need to start from raw .tex files, while still keeping the layout stability and PDF quality of LaTeX."
      - heading: "Current features"
        items:
          - "Structured editing for basic information, education, work experience, academic experience, projects, and skills."
          - "LaTeX source generation from a unified CV template."
          - "Browser-based A4 draft preview."
          - "Export of .tex files."
          - "Real PDF compilation through a LaTeX worker, with preview and download."
          - "Chinese, English, and French resume content versions."
          - "Custom theme color, section names, section order, and basic-information fields."
      - paragraphs:
          - "The deployed version runs on an Aliyun server under the /cv path, using a Next.js base path to isolate application and API routes."
  zh:
    title: "ResumeTeX"
    description: "可通过自助编辑与 LaTeX 代码生成 PDF 版 CV 的简历制作工具，支持结构化填写、A4 预览、.tex 导出和 PDF 编译预览。"
    sections:
      - paragraphs:
          - "ResumeTeX 是一个面向简历制作的 LaTeX 工具原型。用户可以通过网页表单自助编辑简历内容，系统根据结构化数据生成 LaTeX 源码，并进一步编译为 PDF 版 CV。"
          - "项目的目标是把填写简历和维护 LaTeX 简历模板放在同一个工作流里：用户不需要直接从零编辑 .tex 文件，也可以获得 LaTeX 排版带来的稳定版式和 PDF 输出质量。"
      - heading: "当前功能"
        items:
          - "结构化填写基本信息、教育经历、工作经历、学术经历、项目经历和技能等模块。"
          - "根据统一 CV 模板生成 LaTeX 源码。"
          - "支持浏览器内 A4 草稿预览。"
          - "支持导出 .tex 文件。"
          - "通过 LaTeX 编译 Worker 生成真实 PDF，并提供预览和下载入口。"
          - "支持中文、English、Français 三种简历内容版本。"
          - "支持自定义主题色、章节名称、章节顺序和基本信息字段。"
      - paragraphs:
          - "该项目部署在阿里云服务器的 /cv 路径下，使用 Next.js base path 隔离应用路由与 API 路由。"
  fr:
    title: "ResumeTeX"
    description: "Un générateur de CV qui combine édition structurée, génération de code LaTeX et compilation en PDF."
    sections:
      - paragraphs:
          - "ResumeTeX est un prototype de générateur de CV fondé sur LaTeX. L'utilisateur modifie son CV dans des formulaires structurés, puis le système génère le code LaTeX et le compile en PDF."
          - "L'objectif est de relier l'édition du CV et la maintenance d'un modèle LaTeX dans un même flux de travail. L'utilisateur n'a pas besoin de repartir d'un fichier .tex brut, tout en conservant la stabilité de mise en page et la qualité PDF de LaTeX."
      - heading: "Fonctions actuelles"
        items:
          - "Édition structurée des informations personnelles, formations, expériences, travaux académiques, projets et compétences."
          - "Génération de code LaTeX à partir d'un modèle CV unifié."
          - "Aperçu brouillon A4 dans le navigateur."
          - "Export de fichiers .tex."
          - "Compilation PDF réelle via un worker LaTeX, avec aperçu et téléchargement."
          - "Versions de contenu en chinois, anglais et français."
          - "Personnalisation de la couleur de thème, des noms de sections, de l'ordre des sections et des champs d'information."
      - paragraphs:
          - "La version déployée fonctionne sur un serveur Aliyun sous le chemin /cv, avec un base path Next.js pour isoler les routes de l'application et les routes API."
---
