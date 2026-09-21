---
title: "Maysak Relief Map"
description: "An evidence-aware geospatial workspace for reviewing Typhoon Maysak relief coverage, village-level records and volunteer field data in Guangxi."
date: 2026-08-03
status: active
tags: ["Geospatial", "Disaster response", "GeoJSON", "Canvas", "i18n"]
demo: "http://120.24.108.234/mapcol/"
github: "https://github.com/ze2phyrzhenyin/villagemap"
cover: "/images/projects/maysak-relief-map.webp"
i18n:
  en:
    title: "Maysak Relief Map"
    description: "An evidence-aware geospatial workspace for reviewing Typhoon Maysak relief coverage, village-level records and volunteer field data in Guangxi."
    sections:
      - heading: "From volunteer records to a shared map"
        paragraphs:
          - "Maysak Relief Map brings village boundary candidates and volunteer workbook records into a geographic view of relief work in Guangxi. A volunteer can find a village, mark it with their group’s colour, and review their recorded activity alongside the wider map. The interface includes personal records, a volunteer overview and a disaster reference image."
      - heading: "Coverage and the limits of the data"
        paragraphs:
          - "The public demo checked on 7 September 2026 contains 374 geographic features: 372 candidate village boundaries and two supplementary points. Its coverage follows a list of 20 townships or subdistricts, with three additional townships from volunteer records. The supplementary points represent an organisation and a command centre; they are not counted as village boundaries."
          - "The boundary layer comes from a third-party compilation, not an officially confirmed government dataset. The data panel exposes its source, date, geometry status and known uncertainty. These distinctions let a reader separate a volunteer’s map record from independently verified relief coverage."
      - heading: "Finding and marking a village"
        items:
          - "Enter a display name, optionally add an avatar, and choose the responsible volunteer group."
          - "Search by village, township or administrative code, or narrow the map with a district filter."
          - "Select a village and mark it on the map; group colours help distinguish the recorded activity."
      - heading: "Rosters and images to share"
        paragraphs:
          - "The volunteer overview supports CSV roster import, a downloadable CSV template, avatar import and filtering by group. Export controls provide a map panorama, a collective commemorative image and individual images, including a batch export option. The personal image combines an avatar, marked-village count and the recorded area."
      - heading: "Mapping and language switching"
        paragraphs:
          - "The application uses Leaflet for the interactive map, GeoJSON for geographic features and canvas-generated images for exports. English and Chinese switch in place across controls, dialogs and generated labels, while retaining the map extent, layers, filters and selected feature. Source information stays visible alongside the map so users can review the evidence behind what they see."
  zh:
    title: "美莎克救灾地图"
    description: "一套重视证据来源的地理信息工作台，用于核查台风“美莎克”广西救灾覆盖、村级记录与志愿者现场数据。"
    sections:
      - heading: "把志愿者记录放回地图上"
        paragraphs:
          - "美莎克救灾地图把广西村级候选边界与志愿者工作表记录放在同一张地图中。志愿者可以查找村落，用所属组别的颜色进行点亮标记，并结合地图查看自己的行动记录。界面提供“我的点亮”“志愿者总览”和灾区参考图，方便从个人记录切换到整体分布。"
      - heading: "覆盖范围与数据边界"
        paragraphs:
          - "2026 年 9 月 7 日核查的公开演示包含 374 个地理要素，其中 372 个是候选村界，2 个是补充点位。覆盖口径为清单内的 20 个乡镇或街道，以及志愿者名册补充的 3 个乡镇。补充点位对应机构与指挥中心，不计入行政村界数量。"
          - "村界图层来自第三方整理的数据，并非政府正式确认的行政边界。数据面板展示来源、日期、几何状态和已知不确定性，帮助使用者区分地图上的志愿记录与经过独立核实的救灾覆盖情况。"
      - heading: "查找与点亮村落的流程"
        items:
          - "填写用于记录的姓名，按需添加头像，并选择负责组别。"
          - "按村名、乡镇或行政代码搜索，也可以先按地区缩小范围。"
          - "选择村落并进行点亮标记，通过组别颜色查看记录分布。"
      - heading: "志愿者名册与图片导出"
        paragraphs:
          - "志愿者总览支持导入 CSV 名册、下载 CSV 模板、导入头像和按组别筛选。导出功能包括点亮全景图、全体纪念图与个人纪念图，也支持批量导出个人图片。个人纪念图结合头像、点亮数量和记录区域，让参与者能够保存和分享自己的行动记录。"
      - heading: "地图实现与双语切换"
        paragraphs:
          - "交互地图使用 Leaflet，地理要素采用 GeoJSON，导出图片通过 Canvas 生成。中英文切换覆盖控件、对话框与动态生成的文字，并保留地图范围、图层、筛选和选中要素。来源说明与地图一同展示，便于使用者在查看记录时核对数据依据。"
  fr:
    title: "Carte d’aide Maysak"
    description: "Un espace géospatial attentif à la traçabilité pour examiner la couverture des secours liés au typhon Maysak, les données villageoises et les relevés de terrain bénévoles au Guangxi."
    sections:
      - heading: "Des relevés bénévoles à la carte"
        paragraphs:
          - "La carte d’aide Maysak réunit des limites villageoises candidates et des relevés bénévoles pour situer les actions de secours au Guangxi. Un bénévole peut retrouver un village, le marquer avec la couleur de son groupe et consulter ses actions dans leur contexte géographique. L’interface propose les relevés personnels, une vue d’ensemble des bénévoles et une image de référence de la zone sinistrée."
      - heading: "Couverture et limites des données"
        paragraphs:
          - "La démonstration publique vérifiée le 7 septembre 2026 contient 374 entités géographiques : 372 limites villageoises candidates et deux points complémentaires. La couverture suit une liste de 20 cantons ou sous-districts, auxquels s’ajoutent trois cantons issus des relevés bénévoles. Les points complémentaires représentent une organisation et un centre de commandement ; ils ne sont pas comptés comme des limites villageoises."
          - "La couche des limites provient d’une compilation tierce, et non d’un jeu de données officiellement confirmé par les autorités. Le panneau de données affiche la source, la date, le statut géométrique et les incertitudes connues. Ces indications permettent de distinguer un relevé bénévole d’une couverture des secours vérifiée de façon indépendante."
      - heading: "Retrouver et marquer un village"
        items:
          - "Saisir un nom pour le relevé, ajouter éventuellement un avatar et choisir le groupe responsable."
          - "Rechercher un village, un canton ou un code administratif, ou réduire la zone à l’aide du filtre géographique."
          - "Sélectionner un village et le marquer sur la carte ; les couleurs des groupes distinguent les actions enregistrées."
      - heading: "Listes de bénévoles et images à partager"
        paragraphs:
          - "La vue d’ensemble permet d’importer une liste CSV et des avatars, de télécharger un modèle CSV et de filtrer par groupe. Les exports comprennent un panorama de la carte, une image commémorative collective et des images individuelles, avec une option d’export par lot. L’image personnelle associe l’avatar, le nombre de villages marqués et la zone enregistrée."
      - heading: "Cartographie et changement de langue"
        paragraphs:
          - "L’application utilise Leaflet pour la carte interactive, GeoJSON pour les entités géographiques et Canvas pour générer les images exportées. Le chinois et l’anglais se commutent dans les commandes, les dialogues et les libellés générés, tout en conservant l’emprise, les couches, les filtres et l’entité sélectionnée. Les informations de provenance restent affichées à côté de la carte pour faciliter la lecture critique des données."
---

<!-- -->
