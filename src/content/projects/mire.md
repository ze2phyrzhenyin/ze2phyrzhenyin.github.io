---
title: "REX MIRE"
description: "A sport-shooting logbook with a ballistic solver: firearm and ammunition records, pre-shoot checks, results, malfunctions and 3D trajectories. Data stays on the device."
date: 2026-11-08
status: active
tags: ["React", "TypeScript", "Three.js", "IndexedDB"]
demo: "https://mire.rex31.com/"
cover: "/images/projects/mire-fr.jpg"
i18n:
  en:
    cover: "/images/projects/mire-fr.jpg"
    title: "REX MIRE"
    description: "A sport-shooting logbook with a ballistic solver: firearm and ammunition records, pre-shoot checks, results, malfunctions and 3D trajectories. Data stays on the device."
    sections:
      - heading: "Logbook"
        paragraphs:
          - "Firearms, ammunition, sessions, results, malfunctions, maintenance and ranges are recorded in one place. A pre-shoot check runs before each session. Everything is stored in the browser (IndexedDB); there is no account and no server copy. The interface is in Chinese and French."
      - heading: "Ballistics"
        paragraphs:
          - "The solver is a point-mass model with G1 and G7 drag, the Miller stability formula, Litz spin drift and aerodynamic jump, and Coriolis. Its output was checked against published manufacturer tables (Hornady, Lapua). Results are shown as corrections in MRAD or MOA, a range table, a scope view, hit probability and a printable dope card, with the trajectory in 3D."
      - heading: "What it does not do"
        paragraphs:
          - "It gives no powder or charge recommendations. Handloads can be logged and are flagged; published load data stays with its manufacturers and is linked, not copied."
  zh:
    cover: "/images/projects/mire-zh.jpg"
    title: "REX MIRE 射击记录与弹道"
    description: "射击运动记录与弹道计算：枪支弹药档案、射前检查、成绩、故障记录和 3D 弹道轨迹。数据只存在本机。"
    sections:
      - heading: "记录"
        paragraphs:
          - "枪支、弹药、射击记录、成绩、故障、维护和靶场集中在一处，每次射击前有射前检查。数据存在浏览器本地（IndexedDB），没有账号，也不上传服务器。界面为中文和法文。"
      - heading: "弹道"
        paragraphs:
          - "弹道按质点模型计算，支持 G1、G7 阻力模型，包含 Miller 稳定性公式、Litz 偏流与气动跳、科里奥利修正；结果与厂商公开弹道表（Hornady、Lapua）核对过。输出 MRAD 或 MOA 修正量、弹道表、瞄准镜视图、命中概率和可打印的射表卡，轨迹用 3D 显示。"
      - heading: "不做的事"
        paragraphs:
          - "不给任何发射药或装药量建议。自装弹可以记录，但会被标出；厂商公布的装药数据只给链接，不复制。"
  fr:
    cover: "/images/projects/mire-fr.jpg"
    title: "REX MIRE"
    description: "Un carnet de tir sportif avec solveur balistique : fiches armes et munitions, contrôle avant tir, résultats, incidents et trajectoires 3D. Les données restent sur l’appareil."
    sections:
      - heading: "Carnet"
        paragraphs:
          - "Armes, munitions, séances, résultats, incidents, entretien et stands sont réunis au même endroit, avec un contrôle avant chaque séance. Tout est stocké dans le navigateur (IndexedDB) : pas de compte, pas de copie sur un serveur. L’interface existe en chinois et en français."
      - heading: "Balistique"
        paragraphs:
          - "Le solveur est un modèle point-masse avec traînée G1 et G7, la formule de stabilité de Miller, la dérive gyroscopique et le saut aérodynamique de Litz, et la correction de Coriolis. Ses résultats ont été comparés aux tables publiées par les fabricants (Hornady, Lapua). Il affiche les corrections en MRAD ou MOA, une table, une vue lunette, la probabilité de toucher et une carte de tir imprimable, avec la trajectoire en 3D."
      - heading: "Ce qu’il ne fait pas"
        paragraphs:
          - "Aucune recommandation de poudre ou de charge. Les rechargements peuvent être notés et sont signalés ; les données de rechargement publiées restent chez leurs fabricants et sont liées, pas copiées."
---
