---
title: "Veillée"
description: "A phone web app that hosts One Night Ultimate Werewolf and The Resistance: Avalon at the table: it reads the host lines, times the night and the discussion, and keeps Avalon's score. Cards stay physical; the app never knows who holds which role."
date: 2026-11-12
status: active
tags: ["TypeScript", "Preact", "Three.js", "Web Audio"]
demo: "https://veillee.zhaoyang.fr/"
cover: "/images/projects/veillee.jpg"
i18n:
  en:
    cover: "/images/projects/veillee.jpg"
    title: "Veillée"
    description: "A phone web app that hosts One Night Ultimate Werewolf and The Resistance: Avalon at the table: it reads the host lines, times the night and the discussion, and keeps Avalon's score. Cards stay physical; the app never knows who holds which role."
    sections:
      - heading: "At the table"
        paragraphs:
          - "One phone on loudspeaker hosts two physical games: One Night Ultimate Werewolf (base game, 3 to 10 players) and The Resistance: Avalon (classic, 5 to 10 players). Cards are dealt by hand. The app reads the host lines, times the night actions and the discussion, and for Avalon keeps the public score: teams, votes, quests, the assassination, corrections. It never knows anyone's identity."
          - "Playback works like a media player: pause and resume anywhere, tap a line to jump to it, and follow the full script as scrolling lyrics with the current role shown. Once the voice pack is downloaded, a game runs offline (service worker and verified Cache Storage)."
      - heading: "Rules engine"
        paragraphs:
          - "A deterministic rules engine compiles the host script for every legal role setup: 9,254 for One Night and 72 for Avalon, each covered by tests. No language model decides anything during a game."
          - "The script comes in a concise and a detailed style. Lines can be removed, pauses changed and custom lines added; a custom line is generated on the server in the same voice and stored only on the phone."
      - heading: "Voices"
        paragraphs:
          - "There are two complete voice packs, a male judge and a female storyteller, 187 lines each, synthesized with OpenAI gpt-audio-1.5. Every line was checked: a signal check, two transcription models and a listening pass by an audio model."
      - heading: "Rules guides and assistant"
        paragraphs:
          - "A rules guide is generated for each configuration, with its sources cited. A rule details page lists the 22 points where sources or tables disagree and gives the basis for each option. French card names can be shown beside the Chinese ones for cross-reference. The interface is in Chinese."
          - "An assistant answers rules and usage questions. It runs on Claude Sonnet 5.5 with the whole knowledge base in a cached prompt, and is gated by an evaluation set."
      - heading: "Build"
        paragraphs:
          - "TypeScript, Preact, Vite, three.js, Web Audio and a service worker; Python services for speech and chat behind nginx; 619 Vitest tests and Playwright scenarios. The characters are original illustrations, and each game opens with a cinematic intro of about 11 seconds, built from three.js relief meshes on depth maps."
          - "An independent project, not affiliated with Bézier Games or Indie Boards & Cards."
  zh:
    cover: "/images/projects/veillee.jpg"
    title: "Veillée 桌游主持"
    description: "用一部手机在桌边主持一夜狼和阿瓦隆：念主持词，给夜间行动和讨论计时，记录阿瓦隆的公开战况。发牌用实体卡，应用不知道任何人的身份。"
    sections:
      - heading: "主持"
        paragraphs:
          - "一部手机开外放，主持两款实体桌游：一夜狼（One Night Ultimate Werewolf 基础版，3 至 10 人）和阿瓦隆（The Resistance: Avalon 经典版，5 至 10 人）。牌由玩家自己发。应用念主持词，给夜间行动和讨论计时，阿瓦隆另记公开战况：队伍、投票、任务、刺杀和更正。它不知道任何人的身份。"
          - "播放方式和音乐播放器一样：随时暂停、继续，点某一句就跳到那一句，完整主持词像歌词一样滚动，并显示当前角色。语音包下载后可以离线主持（Service Worker 加经过校验的 Cache Storage）。"
      - heading: "规则引擎"
        paragraphs:
          - "主持词由确定性的规则引擎编译，覆盖每一种合法的角色配置：一夜狼 9,254 种，阿瓦隆 72 种，每一种都有测试。对局中没有任何决定交给语言模型。"
          - "主持词有简洁和详细两种风格，可以删句、改停顿、加自定义句子。自定义句子由服务器用同一个声音生成，只保存在手机上。"
      - heading: "语音"
        paragraphs:
          - "两套完整语音包，一套男声（法官），一套女声（讲述），各 187 句，用 OpenAI gpt-audio-1.5 合成。每一句都检查过：信号检查、两个转写模型核对、音频模型试听。"
      - heading: "玩法说明与问答"
        paragraphs:
          - "玩法说明按当前配置生成，并注明出处。规则细节页列出 22 处资料之间或各桌之间说法不一的地方，每个选项都写明依据。角色名旁可以对照显示法文卡牌名。界面为中文。"
          - "应用里的问答助手回答规则和使用问题，用的是 Claude Sonnet 5.5，整个知识库放在缓存的提示词里，上线前要通过评测集。"
      - heading: "制作"
        paragraphs:
          - "TypeScript、Preact、Vite、three.js、Web Audio、Service Worker；语音和问答是 nginx 后面的 Python 服务；Vitest 测试 619 个，另有 Playwright 场景。角色插画为这个项目原创，每款游戏有约 11 秒的片头，用 three.js 把深度图做成浮雕网格。"
          - "独立项目，与 Bézier Games、Indie Boards & Cards 没有关联。"
  fr:
    cover: "/images/projects/veillee.jpg"
    title: "Veillée"
    description: "Une application web mobile qui anime à table Loup-Garou pour une Nuit et The Resistance: Avalon : elle lit les phrases du meneur, chronomètre la nuit et la discussion, et tient le score d’Avalon. Les cartes restent physiques ; l’application ne connaît l’identité de personne."
    sections:
      - heading: "À table"
        paragraphs:
          - "Un téléphone en haut-parleur anime deux jeux physiques : Loup-Garou pour une Nuit (One Night Ultimate Werewolf, jeu de base, 3 à 10 joueurs) et The Resistance: Avalon (version classique, 5 à 10 joueurs). Les cartes sont distribuées à la main. L’application lit les phrases du meneur, chronomètre les actions de nuit et la discussion et, pour Avalon, tient le score public : équipes, votes, quêtes, assassinat, corrections. Elle ne connaît l’identité de personne."
          - "La lecture se pilote comme un lecteur audio : pause et reprise à tout moment, un appui sur une phrase pour y aller, le script complet qui défile comme des paroles avec le rôle en cours. Une fois le pack de voix téléchargé, la partie se joue hors ligne (service worker et Cache Storage vérifié)."
      - heading: "Moteur de règles"
        paragraphs:
          - "Un moteur de règles déterministe compile le script du meneur pour chaque composition de rôles légale : 9 254 pour Loup-Garou pour une Nuit et 72 pour Avalon, chacune couverte par des tests. Aucun modèle de langage ne décide quoi que ce soit pendant une partie."
          - "Le script existe en style concis et en style détaillé. On peut retirer des phrases, changer les pauses et ajouter des phrases personnalisées ; celles-ci sont générées côté serveur dans la même voix et ne sont stockées que sur le téléphone."
      - heading: "Voix"
        paragraphs:
          - "Deux packs de voix complets, un juge (voix d’homme) et une conteuse (voix de femme), 187 phrases chacun, synthétisés avec OpenAI gpt-audio-1.5. Chaque phrase a été vérifiée : contrôle du signal, deux modèles de transcription et une écoute par un modèle audio."
      - heading: "Guides de règles et assistant"
        paragraphs:
          - "Un guide de règles est généré pour chaque configuration, avec ses sources. Une page de détails de règles liste les 22 points où les sources ou les tables divergent, avec le fondement de chaque option. Les noms français des cartes peuvent s’afficher à côté des noms chinois. L’interface est en chinois."
          - "Un assistant répond aux questions de règles et d’utilisation. Il utilise Claude Sonnet 5.5, avec toute la base de connaissances dans un prompt mis en cache, et n’est mis en ligne qu’après une série d’évaluations."
      - heading: "Réalisation"
        paragraphs:
          - "TypeScript, Preact, Vite, three.js, Web Audio et un service worker ; des services Python pour la voix et l’assistant derrière nginx ; 619 tests Vitest et des scénarios Playwright. Les personnages sont des illustrations originales, et chaque jeu s’ouvre sur une introduction d’environ 11 secondes, en maillages en relief three.js construits à partir de cartes de profondeur."
          - "Projet indépendant, sans lien avec Bézier Games ni Indie Boards & Cards."
---
