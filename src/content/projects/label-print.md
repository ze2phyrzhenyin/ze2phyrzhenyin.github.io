---
title: "Label Print"
description: "A browser tool that turns a spreadsheet of device identifiers and SKUs into ready-to-print barcode labels. Everything runs locally in the page; nothing is uploaded."
date: 2026-10-05
status: active
tags: ["React", "TypeScript", "Vite"]
demo: "https://rex31.com/label-print/"
cover: "/images/projects/label-print.png"
i18n:
  en:
    title: "Label Print"
    description: "A browser tool that turns a spreadsheet of device identifiers and SKUs into ready-to-print barcode labels. Everything runs locally in the page; nothing is uploaded."
    sections:
      - heading: "From a spreadsheet to a roll of labels"
        paragraphs:
          - "Type a record, paste rows copied from Excel, or drop an XLSX or CSV file anywhere on the page. Each product gets one label carrying two CODE128 barcodes — the IMEI or serial number and the SKU — with the text spread to the exact width of its barcode. Side-by-side tables in one sheet are read as separate groups, and identifiers stay strings: leading zeros, case, hyphens and underscores are never altered."
      - heading: "It refuses rather than guesses"
        paragraphs:
          - "Bars are drawn in whole printer dots at the chosen resolution, with full quiet zones, and stay inside the area the printer can actually print. A barcode that does not fit is reported instead of being squeezed or cropped. Empty fields, characters that cannot be encoded, numbers whose digits Excel may have lost, and one identifier paired with two different SKUs are flagged and left out of the print queue until someone has looked at them."
      - heading: "Made for daily use"
        paragraphs:
          - "The label size is adjustable and defaults to 62 × 38.7 mm on continuous tape. The interface is available in Chinese, English and French, in light and dark themes, with keyboard shortcuts for search, import, paste and print. The print button always shows the real number of labels, and the page never claims that something was printed: only the printer knows that."
  zh:
    title: "标签打印 Label Print"
    description: "把一张设备编号和 SKU 的表格变成可直接打印的条码标签的网页工具。所有处理都在浏览器本地完成，不上传任何数据。"
    sections:
      - heading: "从表格到一卷标签"
        paragraphs:
          - "可以手动录入、粘贴从 Excel 复制的多行，或把 XLSX、CSV 文件拖到页面任意位置。每件产品一张标签，包含两条 CODE128 条码：IMEI 或序列号，以及 SKU；编号文字拉开到与条码同宽、两端对齐。同一张表里并排的多组数据会分别读取；编号始终按字符串处理，前导零、大小写、连字符和下划线都不会被改动。"
      - heading: "放不下就明确拒绝"
        paragraphs:
          - "条码的每一条都按所选分辨率取整数个打印点，保留完整静区，并落在打印机实际能打印的范围内。装不下的条码会给出提示，而不是被压窄或裁切。空值、无法编码的字符、可能被 Excel 丢失精度的数字、同一编号对应两个不同 SKU 等情况都会被标出，在人工确认之前不会进入打印队列。"
      - heading: "为日常使用而做"
        paragraphs:
          - "标签尺寸可以调整，默认是连续纸上的 62 × 38.7 mm。界面支持中文、英文和法文，有浅色和深色主题，并提供搜索、导入、粘贴和打印的键盘快捷键。打印按钮始终显示真实的标签张数；页面不会声称“已打印成功”，因为只有打印机知道。"
  fr:
    title: "Label Print"
    description: "Un outil web qui transforme un tableau d’identifiants d’appareils et de SKU en étiquettes à codes-barres prêtes à imprimer. Tout est traité localement dans la page ; rien n’est envoyé."
    sections:
      - heading: "Du tableau au rouleau d’étiquettes"
        paragraphs:
          - "Saisissez un enregistrement, collez des lignes copiées depuis Excel ou déposez un fichier XLSX ou CSV n’importe où sur la page. Chaque produit reçoit une étiquette portant deux codes-barres CODE128 — l’IMEI ou le numéro de série, et le SKU — avec un texte étiré à la largeur exacte de son code. Les tableaux placés côte à côte dans une même feuille sont lus comme des groupes distincts, et les identifiants restent des chaînes : zéros initiaux, casse, tirets et tirets bas ne sont jamais modifiés."
      - heading: "Refuser plutôt que deviner"
        paragraphs:
          - "Les barres sont tracées en points entiers de l’imprimante à la résolution choisie, avec des zones de silence complètes, et restent dans la zone réellement imprimable. Un code-barres qui ne tient pas est signalé au lieu d’être comprimé ou rogné. Champs vides, caractères non encodables, nombres dont Excel a pu perdre des chiffres, ou un même identifiant associé à deux SKU différents : tout est signalé et écarté de la file d’impression tant que personne ne l’a vérifié."
      - heading: "Pensé pour l’usage quotidien"
        paragraphs:
          - "La taille de l’étiquette est réglable ; par défaut, 62 × 38,7 mm sur ruban continu. L’interface existe en chinois, anglais et français, en thèmes clair et sombre, avec des raccourcis clavier pour rechercher, importer, coller et imprimer. Le bouton d’impression affiche toujours le nombre réel d’étiquettes, et la page n’affirme jamais qu’une impression a réussi : seule l’imprimante le sait."
---
