---
title: "REX Monitor (demo)"
description: "Monitor for servers, websites, backups and film production; a real data snapshot with private details removed"
date: 2026-11-26
status: active
tags: ["Python", "systemd", "JavaScript", "nginx"]
demo: "https://demos.rex31.com/monitor/"
cover: "/images/projects/rex-monitor-en.jpg"
i18n:
  en:
    cover: "/images/projects/rex-monitor-en.jpg"
    demo: "https://demos.rex31.com/monitor/?lang=en"
    title: "REX Monitor (demo)"
    description: "Monitor for servers, websites, backups and film production; a real data snapshot with private details removed"
    sections:
      - paragraphs:
          - "REX Monitor is the internal monitor of REX Digital & AI. An engine on the public server (rex-ovh) runs every 60 s, and small read-only pushers on three other servers and on the studio Mac send it their readings. The page shows four servers (load, memory, IO, disk, 24-hour curves), the software on each (containers, services, backups, timers), about 30 websites (days left on the certificate, response time, visits, recent requests), releases, alerts that can be acknowledged, and an event log. Each film has its own board: one row per shot, one column per step (render, review, encode, publish), the review pictures of every round and the review notes. Every view is available in Chinese, English and French, with a light and a dark theme."
          - "The demo is the monitor's own page running on a real snapshot taken on 26 November 2026 at 15:00, Paris time. Visitor addresses, names in the access logs, the owner's decisions, private links, and the location and battery of the Mac were removed. The films shown are REX Digital & AI productions: two in progress (The Water Journey, L'Orage) and two finished (1200°, Jade). The clock keeps running and the timestamps move with it, so the page reads as it did at the time of the snapshot."
          - "The engine is written in Python and run by systemd timers. The pushers connect over ssh with forced commands. The page is static JavaScript without a framework, served by nginx."
  zh:
    cover: "/images/projects/rex-monitor-zh.jpg"
    demo: "https://demos.rex31.com/monitor/?lang=zh"
    title: "REX 监控（演示版）"
    description: "服务器、网站、备份和影片制作进度的监控页；真实数据快照，私人信息已去掉"
    sections:
      - paragraphs:
          - "REX 监控是 REX Digital & AI 内部用的监控。公网服务器（rex-ovh）上的引擎每 60 秒运行一次，另外三台服务器和工作室的 Mac 上各有一个只读的小推送程序，把读数发过来。页面上有四台服务器（负载、内存、IO、磁盘和 24 小时曲线），每台上的软件（容器、服务、备份、定时任务），约 30 个网站（证书剩余天数、响应时间、访问量、最近的请求），发布记录，可以确认的告警，以及事件日志。影片制作每部片子一张看板：每个镜头一行，每个步骤一列（渲染、审片、编码、发布），每一轮的审片截图和审片意见都在上面。所有页面都有中文、英文、法文三种语言，以及浅色和深色两种主题。"
          - "演示版就是监控本身的页面，数据是 2026 年 11 月 26 日 15:00（巴黎时间）的真实快照。访客地址、访问日志里的人名、负责人的决定、私人链接，以及 Mac 的位置和电量都已去掉。页面上的影片都是 REX Digital & AI 的作品，其中《水之旅》和《L'Orage》在制作中，《1200°》和《Jade》已完成。时钟照常走，时间戳跟着变，所以页面读起来和快照那一刻一样。"
          - "引擎用 Python 编写，由 systemd 定时器运行；推送程序通过 ssh 强制命令连接。页面是不用框架的静态 JavaScript，由 nginx 提供。"
  fr:
    cover: "/images/projects/rex-monitor-fr.jpg"
    demo: "https://demos.rex31.com/monitor/?lang=fr"
    title: "Supervision REX (démo)"
    description: "Supervision des serveurs, sites, sauvegardes et films en production ; relevé de données réelles, informations privées retirées"
    sections:
      - paragraphs:
          - "Supervision REX est l’outil de supervision interne de REX Digital & AI. Un moteur tourne toutes les 60 s sur le serveur public (rex-ovh) ; de petits envoyeurs en lecture seule, sur trois autres serveurs et sur le Mac du studio, lui transmettent leurs relevés. La page présente quatre serveurs (charge, mémoire, E/S, disque, courbes sur 24 heures), les logiciels de chacun (conteneurs, services, sauvegardes, minuteurs), une trentaine de sites (jours restants du certificat, temps de réponse, visites, dernières requêtes), les mises en production, des alertes que l’on peut acquitter et un journal des événements. Chaque film a son tableau : une ligne par plan, une colonne par étape (rendu, validation, encodage, publication), les images de validation de chaque tour et les remarques. Toutes les vues existent en chinois, en anglais et en français, en thème clair et en thème sombre."
          - "La démo est la page même de la supervision, alimentée par un relevé réel pris le 26 novembre 2026 à 15 h (heure de Paris). Les adresses des visiteurs, les noms figurant dans les journaux d’accès, les décisions du responsable, les liens privés ainsi que la position et la batterie du Mac ont été retirés. Les films affichés sont des productions de REX Digital & AI : deux en cours (« Le voyage de l’eau », « L’Orage ») et deux terminés (« 1200° », « Jade »). L’horloge tourne et les horodatages avancent avec elle : la page se lit comme au moment du relevé."
          - "Le moteur est écrit en Python et lancé par des minuteurs systemd. Les envoyeurs se connectent en ssh avec des commandes forcées. La page est en JavaScript statique, sans framework, servie par nginx."
---
