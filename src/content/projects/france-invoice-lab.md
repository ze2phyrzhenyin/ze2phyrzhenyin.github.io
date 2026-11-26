---
title: "France Invoice Lab (demo)"
description: "A French B2B invoicing workbench that drafts invoices, renders the PDF and submits them to the SUPER PDP sandbox."
date: 2026-10-01
status: active
tags: ["Next.js", "SQLite", "Factur-X"]
demo: "https://zhaoyang.fr/france-invoice-lab/"
cover: "/images/projects/france-invoice-lab.jpg"
i18n:
  en:
    title: "France Invoice Lab (demo)"
    description: "A French B2B invoicing workbench that drafts invoices, renders the PDF and submits them to the SUPER PDP sandbox."
    sections:
      - paragraphs:
          - "The invoice form is in French and covers seller, buyer, dates, units, quantities and discounts. HT, TVA and TTC are computed with decimal arithmetic and checked again on the server. Drafts stay editable; confirming an invoice assigns its number in the same database transaction that stores an immutable snapshot and its PDF."
          - "The preview shows the actual A4 PDF, and stored PDFs can be downloaded again from the history. The same invoice can be sent as Factur-X to the SUPER PDP sandbox, with validation, status and download of the original. Built with Next.js and Node’s built-in SQLite. Test companies are fictitious and every document is marked DEMO. The app requires a REX account."
  zh:
    title: "France Invoice Lab · 电子发票（演示版）"
    description: "法国 B2B 发票工作台：填写资料，生成 PDF，并发送到 SUPER PDP 测试环境。"
    sections:
      - paragraphs:
          - "发票表单为法语，包括卖方、买方、日期、单位、数量和折扣；HT、TVA 和 TTC 用十进制运算，并在服务器端再核算一遍。草稿可以保存和修改；确认发票时，编号、不可修改的快照和 PDF 在同一个数据库事务中写入。"
          - "预览显示的就是实际的 A4 PDF，已保存的 PDF 可在历史记录中重新下载。同一张发票可以 Factur-X 格式发送到 SUPER PDP 测试环境，查看校验结果和状态，并下载原件。使用 Next.js 和 Node 自带的 SQLite。测试公司均为虚构，所有文件都标有 DEMO。使用需要 REX 账号。"
  fr:
    title: "France Invoice Lab (démo)"
    description: "Atelier de facturation B2B française : saisie, PDF et envoi au bac à sable SUPER PDP."
    sections:
      - paragraphs:
          - "Le formulaire de facture, en français, couvre vendeur, acheteur, dates, unités, quantités et remises. HT, TVA et TTC sont calculés en arithmétique décimale puis vérifiés par le serveur. Les brouillons restent modifiables ; à la confirmation, le numéro est attribué dans la même transaction que l’instantané figé de la facture et son PDF."
          - "L’aperçu affiche le PDF A4 réel, et les PDF enregistrés se téléchargent depuis l’historique. La même facture peut être envoyée en Factur-X au bac à sable SUPER PDP, avec validation, suivi du statut et téléchargement de l’original. Réalisé avec Next.js et le SQLite intégré à Node. Les sociétés de test sont fictives et chaque document porte la mention DEMO. L’application nécessite un compte REX."
---
