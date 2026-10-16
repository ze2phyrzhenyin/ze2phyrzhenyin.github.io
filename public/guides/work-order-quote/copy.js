import { MODEL } from './model.js';
export const copy = {
zh: {
 restorePrice:'恢复原价', priceInvalid:'请输入不小于 0 的金额，最多两位小数。', checkInputs:'检查金额', careDetails:['自行负责巡检、更新与备份恢复。','季度巡检、安全更新；每年 12 小时支持。','季度巡检、安全更新；每年 30 小时支持及 1 次恢复演练。'],
 title:'工单平台报价单', intro:'', pageTitle:'工单平台报价单', back:'返回 Guides', theme:'切换明暗', skip:'跳到选配', language:'语言',
 eyebrow:'REX / 工单与售后', own:'独立部署', seats:'不按账号收许可费', warranty:'90 天缺陷保修',
 start:'选择方案', packHint:'含实施，折前未税价。单价可修改。', moduleCount:'{n} 个模块',
 features:'功能模块', delivery:'交付服务', running:'运维与年费',
 featureTitle:'选择功能', featureHint:'前置功能自动加入，不重复计费。以下为折前未税单价。', search:'搜索功能或编号，例如：库存、M12', all:'全部', selected:'已选', empty:'没有匹配的功能。试试其他关键词。', clearSearch:'清除筛选',
 base:'基础必选', auto:'自动加入', optional:'可选', scope:'范围与前置功能', requires:'需要', baseDep:'基础包', addedFor:'由 {codes} 带入；取消这些选项后自动移除。', requiredHint:'基础流程所需，不能取消。', selectedCount:'已选 {n} / 30',
 deliveryTitle:'实施与交付', deliveryHint:'标准实施必选。迁移、源码和追加工作按需购买。', setup:'标准实施', included:'已计入', migration:'历史数据迁移', migrationHint:'不含图片视频；不强制购买 M23 导入模块。', migrationNone:'无需代迁移', migrationSmall:'小型 · 最多 2 表 / 2,000 行', migrationStandard:'标准 · 最多 4 表 / 10,000 行',
 extraTitle:'追加工作', extraHint:'以下为追加开发，按数量收费；不是已包含的现成功能。', quantity:'数量', sessions:'次',
 runningTitle:'运维与年费', runningHint:'维护负责检查、更新和技术支持。服务器、备份及外部服务另计，不参与项目折扣。', maintenance:'年度维护', maintenanceNone:'不购买', maintenanceBase:'基础维护', maintenancePlus:'增强维护', perYear:'年', perMonth:'月',
 maintenanceNotes:[
 '保留交付版本使用权和 90 天范围内缺陷保修。之后自行维护；临时支持 €95/小时，事先确认，无持续响应承诺。',
 '季度备份与运行检查、安全更新；含全年 12 小时支持或小修改。工作时段目标为 2 个工作日内首次人工响应，不是修复时限。',
 '季度检查、安全更新；含全年 30 小时支持或小修改、1 次年度恢复演练。工作时段目标为 1 个工作日内首次人工响应，不是修复时限。'],
 hosting:'服务器、存储与备份', hostingHint:'每月整体预算，含域名摊销。€60 为估算，可自行修改。', thirdparty:'翻译、短信等外部调用', thirdpartyHint:'年度预算；填 0 表示未预算或不使用，不代表无限免费。', externalHint:'第三方费用直接付给供应商，不计入项目发票。其税额按各自票据另算。',
 yourQuote:'你的报价', oneOff:'一次性项目 · 未税', custom:'自选方案', original:'折前金额', software:'软件模块', additional:'追加交付', source:'源码授权', discount:'折扣', discountHelp:'填 80 = 八折，填 100 = 原价。', discountScope:'折扣仅用于一次性项目，含实施和所选追加交付。', discountResult:'按原价 {n}% 计费 · 优惠 {off}%', saving:'优惠金额', tax:'项目税率 %', taxHelp:'', vat:'项目税额', ttc:'含税合计',
 budget:'运行预算 · 未税', year1:'首年总预算', yearly:'以后每年', threeYears:'三年总预算', budgetHint:'一次性项目 + 维护 + 第三方估算；按价格不变计算。', external:'第三方年预算',
 customer:'客户 / 企业名称', customerPlaceholder:'选填，用于导出报价', download:'导出报价单', print:'打印 / 存为 PDF', saved:'方案仅保存在此浏览器', saveFailed:'浏览器无法保存，请导出报价留存。', quoteNote:'预算选配单，正式价格和交付以双方确认的报价为准。',
 viewQuote:'查看报价', continue:'继续选配', reset:'恢复默认', resetDone:'已恢复基础方案和默认费用。', packDone:'已切换方案，保留自定义价格。', updated:'已更新报价', downloaded:'已导出当前语言的报价单。', discountInvalid:'请输入 0–100 之间的数字；100 为原价。', numberInvalid:'请输入范围内的有效数字。',
 terms:'交付与使用说明', market:'公开价格参考', marketDate:'核查日期：2026-10-16', marketIntro:'订阅产品仅作价格参照，功能、部署方式与服务范围不同。', marketUnit:'€/人/月 · 年付', marketOdoo:'Custom：US$49/人/月（年付，首 12 个月优惠；标示常规价 US$61）。实施及 Odoo.sh 托管另计。', marketNote:'人数少、需求简单时，订阅通常更省启动成本；需要独立部署和完整售后流程时，应比较三年总支出与交付范围。', marketLink:'官方价格',
 quoteDoc:'REX 工单平台 · 预算选配单', date:'价格模型日期', generated:'导出时间', module:'功能', code:'编号', method:'选择方式', amount:'金额', unitPrice:'单价', scopeDoc:'所选功能与服务范围', totals:'报价明细', noCustomer:'未填写', footer:'REX / 价格模型 2026.10.15', noScript:'请开启 JavaScript 使用自动报价。',
 legal:[
 '本页为预算选配目录，不是已接受的合同。价格、所选组合、功能、交付日期及验收基线须经 REX 核定；本次页面重构不构成软件运行验收。',
 '许可限一个法人主体的一套生产实例及其验收、备份环境。付清一次性费用后，交付版本内部使用权不因停维终止；不收账号席位许可费，但资源与支持并非无限。可交付部署运行包；不得对外转售或运营公共 SaaS。源码授权不等于独家买断。',
 '标准实施含已购模块联调、权限菜单配置及首次恢复验证。现有模板首次填写名称、Logo 和已有参数不重复收费。默认每日数据库备份、保留 14 天；附件独立备份或版本方案，长期归档和异地高可用另议。',
 '验收后 90 天保修覆盖约定范围内缺陷，修复不扣维护工时；新需求、客户或第三方改码、外部服务变化除外。年维自验收起计 12 个月，保修不重复计费。停维后由客户负责巡检、安全更新与运行。',
 '维护时段：法国工作日 09:00–18:00（Europe/Paris，节假日除外）。人工响应为目标，不是保证修复时间；无 24×7、99.9% SLA、双活或零丢失承诺。临时支持 €95/小时、至少 30 分钟、事先批准。年度工时不结转，单项超过 4 小时或新模块、接口另行报价。',
 '客户可持有及接管数据和基础设施账号。个人数据的处理、托管地点、权限、保留及删除须另行约定；权限或备份功能不等于合规认证。',
 'M16 是 DHL 数据导出，不是在线购单；M24 是内部邮件；M17–M20 不是银行支付、法定会计、PA 电子发票或认证收银；M26 不含原生 App。媒体、翻译及外部服务无无限配额。',
 '付款建议：40% 启动、40% 验收环境交付、20% 书面验收。维护与第三方费用独立。税率、正式主体、税号、报价有效期、数据处理条款及交付日历需另行确认。功能范围来自 2026-10-15 用户提供的清单。'
 ]
},
en: {
 restorePrice:'Reset price', priceInvalid:'Enter a non-negative amount with up to two decimal places.', checkInputs:'Check amounts', careDetails:['You manage checks, updates and backup recovery.','Quarterly checks, security updates and 12 support hours/year.','Quarterly checks, security updates, 30 support hours/year and an annual restore drill.'],
 title:'Work-order platform quotation', intro:'', pageTitle:'Work-order platform quotation', back:'Back to Guides', theme:'Switch theme', skip:'Skip to configuration', language:'Language',
 eyebrow:'REX / WORK ORDERS & AFTER-SALES', own:'Independent deployment', seats:'No per-account licence fee', warranty:'90-day defect warranty',
 start:'Choose a plan', packHint:'Setup included. Before discount and tax. Prices are editable.', moduleCount:'{n} modules',
 features:'Features', delivery:'Delivery', running:'Operations & annual costs',
 featureTitle:'Select features', featureHint:'Dependencies are added once. Prices below are before discount and tax.', search:'Find a feature or code, e.g. stock, M12', all:'All', selected:'Selected', empty:'No matching features. Try another search.', clearSearch:'Clear filters',
 base:'Required', auto:'Auto-added', optional:'Optional', scope:'Scope & dependencies', requires:'Requires', baseDep:'Base package', addedFor:'Required by {codes}; removed when these options are deselected.', requiredHint:'Part of the core workflow; always included.', selectedCount:'{n} / 30 selected',
 deliveryTitle:'Setup & delivery', deliveryHint:'Standard setup is required. Migration, source code and extra work are optional.', setup:'Standard setup', included:'Included in total', migration:'Historical data migration', migrationHint:'Excludes photos and videos. Does not require the M23 import module.', migrationNone:'No managed migration', migrationSmall:'Small · up to 2 tables / 2,000 rows', migrationStandard:'Standard · up to 4 tables / 10,000 rows',
 extraTitle:'Additional work', extraHint:'New work billed by quantity, separate from the existing modules.', quantity:'Quantity', sessions:'sessions',
 runningTitle:'Operations & annual costs', runningHint:'Maintenance covers checks, updates and support. Hosting, backups and external services are separate. Project discounts do not apply.', maintenance:'Annual maintenance', maintenanceNone:'None', maintenanceBase:'Basic', maintenancePlus:'Extended', perYear:'year', perMonth:'month',
 maintenanceNotes:[
 'Keep the delivered version and the 90-day in-scope defect warranty. Maintain it yourself afterwards. Ad hoc support: €95/hour, agreed in advance, with no ongoing response commitment.',
 'Quarterly backup/operations checks and applicable security updates; 12 hours of annual support or small changes. Target first human response: 2 business days during service hours, not a guaranteed fix time.',
 'Quarterly checks and applicable security updates; 30 hours of annual support or small changes and one annual restore drill. Target first human response: 1 business day during service hours, not a guaranteed fix time.'],
 hosting:'Hosting, storage & backups', hostingHint:'Total monthly estimate, including the domain. €60 is a starting assumption; adjust it.', thirdparty:'Translation, SMS & external calls', thirdpartyHint:'Annual estimate. Zero means unbudgeted or unused, not unlimited free usage.', externalHint:'External costs are paid directly to suppliers, outside the project invoice. Check their taxes separately.',
 yourQuote:'Your quote', oneOff:'One-time project · excl. tax', custom:'Custom setup', original:'Before discount', software:'Software modules', additional:'Extra delivery', source:'Source-code licence', discount:'Price %', discountHelp:'80 = 20% off. 100 = full price.', discountScope:'Applies to the one-time project, including setup and selected extras.', discountResult:'Pay {n}% · save {off}%', saving:'Discount amount', tax:'Project tax rate %', taxHelp:'', vat:'Project tax', ttc:'Total incl. tax',
 budget:'Operating budget · excl. tax', year1:'First year total', yearly:'Each following year', threeYears:'Three-year total', budgetHint:'Project + maintenance + external estimates, assuming unchanged prices.', external:'External annual estimate',
 customer:'Customer / company', customerPlaceholder:'Optional, shown on the exported quote', download:'Export quote', print:'Print / Save PDF', saved:'Saved in this browser only', saveFailed:'Browser storage unavailable. Export a copy to keep it.', quoteNote:'Budget estimate. Final price and delivery require an agreed quotation.',
 viewQuote:'View quote', continue:'Back to options', reset:'Reset all', resetDone:'Base package and default costs restored.', packDone:'Plan changed. Custom prices retained.', updated:'Quote updated', downloaded:'Quote exported in the current language.', discountInvalid:'Enter a number from 0 to 100; 100 means full price.', numberInvalid:'Enter a valid number within the allowed range.',
 terms:'Delivery & usage details', market:'Public pricing references', marketDate:'Checked: 16 October 2026', marketIntro:'Subscription prices are reference points; features, hosting and delivery differ.', marketUnit:'€/agent/month · billed annually', marketOdoo:'Custom: US$49/user/month, billed annually, introductory first 12 months; displayed regular rate US$61. Implementation and Odoo.sh hosting are extra.', marketNote:'Small teams with simple needs usually face a lower upfront cost with subscriptions. For independent hosting and a full after-sales workflow, compare three-year costs and delivery scope.', marketLink:'Official pricing',
 quoteDoc:'REX work-order platform · Budget estimate', date:'Price model date', generated:'Exported', module:'Feature', code:'Code', method:'Selection', amount:'Amount', unitPrice:'Unit price', scopeDoc:'Selected features & service scope', totals:'Quote breakdown', noCustomer:'Not specified', footer:'REX / PRICE MODEL 2026.10.15', noScript:'Enable JavaScript to calculate your quote.',
 legal:[
 'This is a budget configurator, not an accepted contract. REX must confirm prices, module combinations, functionality, dates and acceptance criteria. This page redesign is not a runtime acceptance test.',
 'The licence covers one legal entity, one production instance and its acceptance/backup environments. Once the one-time fees are paid, internal use of the delivered version survives cancellation of maintenance. No per-account licence fees; resources and support are not unlimited. A deployable package is included. Resale and public SaaS operation are excluded. Source delivery is not an exclusive IP buyout.',
 'Setup includes integration of purchased modules, rights/menu configuration and an initial restore test. Initial company name, logo and existing template settings are not charged twice. Default database backups run daily with 14-day retention; attachments use separate backups/versioning. Long-term archiving and off-site high availability require separate agreement.',
 'The 90-day warranty after acceptance covers agreed in-scope defects without using maintenance hours. New requirements, customer/third-party changes and external-service changes are excluded. Annual maintenance runs 12 months from acceptance; warranty work is not charged again. Without maintenance, the customer handles checks, security updates and operations.',
 'Service hours: French business days, 09:00–18:00 Europe/Paris, excluding public holidays. Response targets are not guaranteed repair times. No 24/7, 99.9% SLA, active-active or zero-loss promise. Ad hoc support is €95/hour, minimum 30 minutes, approved in advance. Hours do not roll over; work over 4 hours, new modules or interfaces needs a change quote.',
 'The customer may own and take over data and infrastructure accounts. Personal-data processing, location, access, retention and deletion need separate terms. Permissions and backups are not compliance certification.',
 'M16 exports DHL data; it does not buy labels. M24 is internal messaging. M17–M20 are not bank payments, statutory accounts, PA e-invoicing or certified tills. M26 excludes native apps. Media, translation and external services have no unlimited allowance.',
 'Suggested payments: 40% at kickoff, 40% at acceptance-environment delivery and 20% at written acceptance. Maintenance and third parties are separate. Tax, legal entities, tax IDs, quote validity, data-processing terms and delivery dates must be confirmed. Feature scope comes from the customer-supplied list dated 2026-10-15.'
 ]
},
fr: {
 restorePrice:'Rétablir le prix', priceInvalid:'Saisissez un montant positif ou nul, avec deux décimales maximum.', checkInputs:'Vérifier les montants', careDetails:['Contrôles, mises à jour et restauration à votre charge.','Contrôles trimestriels, mises à jour de sécurité et 12 h d’assistance/an.','Contrôles trimestriels, mises à jour de sécurité, 30 h d’assistance/an et un exercice de restauration annuel.'],
 title:'Devis de plateforme SAV', intro:'', pageTitle:'Devis de plateforme SAV', back:'Retour aux Guides', theme:'Changer de thème', skip:'Aller à la configuration', language:'Langue',
 eyebrow:'REX / DOSSIERS & SERVICE APRÈS-VENTE', own:'Déploiement indépendant', seats:'Sans licence par compte', warranty:'Garantie défauts de 90 jours',
 start:'Choisir une formule', packHint:'Mise en service incluse. Prix HT, avant remise et modifiables.', moduleCount:'{n} modules',
 features:'Fonctions', delivery:'Livraison', running:'Maintenance et frais annuels',
 featureTitle:'Choisir les fonctions', featureHint:'Prérequis ajoutés sans doublon. Prix ci-dessous HT, avant remise.', search:'Rechercher une fonction ou un code : stock, M12…', all:'Tout', selected:'Sélection', empty:'Aucune fonction trouvée. Essayez un autre mot.', clearSearch:'Effacer les filtres',
 base:'Obligatoire', auto:'Ajout automatique', optional:'En option', scope:'Périmètre et prérequis', requires:'Nécessite', baseDep:'Socle', addedFor:'Nécessaire pour {codes} ; retiré si ces options sont décochées.', requiredHint:'Nécessaire au fonctionnement de base, toujours inclus.', selectedCount:'{n} / 30 sélectionnés',
 deliveryTitle:'Mise en service et livraison', deliveryHint:'La mise en service est obligatoire. Migration, code source et travaux supplémentaires sont en option.', setup:'Mise en service', included:'Inclus dans le total', migration:'Migration des données historiques', migrationHint:'Sans photos ni vidéos. Le module d’import M23 n’est pas imposé.', migrationNone:'Sans migration accompagnée', migrationSmall:'Petite · 2 tables / 2 000 lignes maximum', migrationStandard:'Standard · 4 tables / 10 000 lignes maximum',
 extraTitle:'Travaux supplémentaires', extraHint:'Nouveaux travaux facturés à la quantité, distincts des modules existants.', quantity:'Quantité', sessions:'séances',
 runningTitle:'Maintenance et frais annuels', runningHint:'La maintenance couvre contrôles, mises à jour et assistance. Hébergement, sauvegardes et services externes sont séparés, hors remise projet.', maintenance:'Maintenance annuelle', maintenanceNone:'Aucune', maintenanceBase:'Essentielle', maintenancePlus:'Renforcée', perYear:'an', perMonth:'mois',
 maintenanceNotes:[
 'Conservation de la version livrée et de la garantie défauts de 90 jours. Maintenance ensuite à votre charge. Assistance ponctuelle : 95 €/h, avec accord préalable, sans engagement de réponse continu.',
 'Contrôles trimestriels des sauvegardes et du fonctionnement, mises à jour de sécurité applicables ; 12 h d’assistance ou petites modifications par an. Objectif de première réponse humaine : 2 jours ouvrés, pas un délai garanti de résolution.',
 'Contrôles trimestriels et mises à jour de sécurité applicables ; 30 h d’assistance ou petites modifications et un exercice annuel de restauration. Objectif de première réponse humaine : 1 jour ouvré, pas un délai garanti de résolution.'],
 hosting:'Hébergement, stockage et sauvegardes', hostingHint:'Budget mensuel global, domaine compris. 60 € est une estimation modifiable.', thirdparty:'Traduction, SMS et appels externes', thirdpartyHint:'Budget annuel. Zéro signifie non budgété ou non utilisé, pas gratuit et illimité.', externalHint:'Frais externes payés directement aux fournisseurs, hors facture du projet. Leur TVA se vérifie séparément.',
 yourQuote:'Votre devis', oneOff:'Projet · paiement unique HT', custom:'À la carte', original:'Avant remise', software:'Modules logiciels', additional:'Prestations en option', source:'Licence du code source', discount:'Prix à payer (%)', discountHelp:'80 = remise de 20 %. 100 = plein tarif.', discountScope:'Sur le projet ponctuel, mise en service et options choisies comprises.', discountResult:'À payer : {n} % · remise : {off} %', saving:'Montant de la remise', tax:'Taux de TVA du projet %', taxHelp:'', vat:'TVA du projet', ttc:'Total TTC',
 budget:'Budget d’exploitation HT', year1:'Total première année', yearly:'Chaque année suivante', threeYears:'Total sur trois ans', budgetHint:'Projet + maintenance + estimations externes, à prix constants.', external:'Budget externe annuel',
 customer:'Client / entreprise', customerPlaceholder:'Facultatif, pour le devis exporté', download:'Exporter le devis', print:'Imprimer / PDF', saved:'Enregistré dans ce navigateur uniquement', saveFailed:'Stockage indisponible. Exportez une copie pour la conserver.', quoteNote:'Estimation budgétaire. Prix et livraison selon le devis convenu.',
 viewQuote:'Voir le devis', continue:'Retour aux options', reset:'Réinitialiser', resetDone:'Socle et frais par défaut rétablis.', packDone:'Formule modifiée. Prix personnalisés conservés.', updated:'Devis actualisé', downloaded:'Devis exporté dans la langue actuelle.', discountInvalid:'Saisissez un nombre de 0 à 100 ; 100 signifie plein tarif.', numberInvalid:'Saisissez un nombre valide dans la plage indiquée.',
 terms:'Livraison et conditions d’usage', market:'Repères de prix publics', marketDate:'Vérifié le 16 octobre 2026', marketIntro:'Les abonnements servent de repères : fonctions, hébergement et prestations diffèrent.', marketUnit:'€/agent/mois · facturation annuelle', marketOdoo:'Custom : 49 $US/utilisateur/mois, facturation annuelle, offre des 12 premiers mois ; tarif normal affiché : 61 $US. Mise en œuvre et hébergement Odoo.sh en supplément.', marketNote:'Pour une petite équipe aux besoins simples, un abonnement coûte généralement moins au démarrage. Pour un déploiement indépendant et un SAV complet, comparez le coût sur trois ans et le périmètre livré.', marketLink:'Tarifs officiels',
 quoteDoc:'Plateforme SAV REX · Estimation budgétaire', date:'Date du modèle tarifaire', generated:'Exporté le', module:'Fonction', code:'Code', method:'Sélection', amount:'Montant', unitPrice:'Prix unitaire', scopeDoc:'Périmètre des fonctions et prestations retenues', totals:'Détail du devis', noCustomer:'Non renseigné', footer:'REX / TARIFS 2026.10.15', noScript:'Activez JavaScript pour calculer votre devis.',
 legal:[
 'Ce configurateur fournit un budget, pas un contrat accepté. REX doit valider prix, combinaisons, fonctions, dates et critères de recette. La refonte de cette page ne vaut pas recette du logiciel en fonctionnement.',
 'Licence pour une entité juridique, une instance de production et ses environnements de recette/sauvegarde. Après paiement, le droit d’usage interne de la version livrée subsiste sans maintenance. Sans licence par compte ; ressources et support non illimités. Un paquet déployable est fourni. Revente et SaaS public exclus. La livraison du code source ne cède pas la propriété intellectuelle exclusive.',
 'La mise en service comprend l’intégration des modules achetés, droits/menus et premier test de restauration. Nom, logo et paramètres existants des modèles ne sont pas refacturés à l’initialisation. Sauvegarde quotidienne de la base, rétention de 14 jours ; pièces jointes sauvegardées/versionnées séparément. Archivage long et haute disponibilité distante sur accord distinct.',
 'Garantie de 90 jours après recette pour les défauts du périmètre convenu, sans consommation des heures de maintenance. Nouvelles demandes, changements client/tiers et évolutions de services externes exclus. Maintenance de 12 mois à partir de la recette ; garantie non refacturée. Sans maintenance, contrôles, sécurité et exploitation incombent au client.',
 'Horaires : jours ouvrés en France, 09 h–18 h Europe/Paris, hors jours fériés. Les objectifs de réponse ne garantissent pas un délai de résolution. Aucun engagement 24 h/24, SLA 99,9 %, actif-actif ou perte nulle. Assistance ponctuelle : 95 €/h, minimum 30 minutes, sur accord préalable. Heures non reportables ; tâche de plus de 4 h, nouveau module ou interface sur devis modificatif.',
 'Le client peut détenir et reprendre les données et comptes d’infrastructure. Traitement des données personnelles, localisation, accès, conservation et suppression font l’objet de clauses distinctes. Droits et sauvegardes ne valent pas certification de conformité.',
 'M16 exporte des données DHL, sans achat d’étiquettes. M24 est une messagerie interne. M17–M20 ne sont ni paiement bancaire, ni comptabilité légale, ni facturation électronique PA, ni caisse certifiée. M26 exclut les applications natives. Aucun quota illimité pour médias, traduction ou services externes.',
 'Échéancier proposé : 40 % au lancement, 40 % à la livraison de l’environnement de recette, 20 % à la recette écrite. Maintenance et tiers séparés. Taux de TVA, entités, numéros fiscaux, validité du devis, traitement des données et calendrier à confirmer. Périmètre issu de la liste fournie par le client le 15 octobre 2026.'
 ]
}
};
const rows = text => text.trim().split('\n').map(line=>{const [name,scope]=line.split('|');return {name,scope};});
export const serviceText = {
 zh:MODEL.services.map(s=>({name:s.name,scope:s.scope})),
 en:rows(`
Branding & initialization|One legal entity, one logo/colour scheme and one domain; initial entry of up to 20 accounts, 10 shops, 2 warehouses and 3 role types. Initialize existing pricing, report and label templates for purchased modules. No extra charge for ongoing customer-managed reference data.
Deployment & launch|One production and one acceptance environment: dedicated database, file storage, HTTPS, basic monitoring/alerts and daily backups. Purchased-module integration, rights/menus, integration tests and first restore verification. Hosting resources and ongoing operations are extra.
Training & handover|Two remote sessions of 2 hours, up to 10 people each; existing instructions, agreed workflow acceptance checklist and operating/deployment handover. Includes 90 calendar days of in-scope defect warranty after acceptance.
Small data migration|Up to 2 structured CSV/Excel tables, 2,000 rows total; one mapping, one trial import, one final import and count check. No media, deduplication, cleaning or manual completion. Alternative to S05.
Standard data migration|Up to 4 structured tables, 10,000 rows total; two trial imports, one final import and count check. No complex cleaning, legacy-system interfaces or media. Alternative to S04.
Media migration|One legally accessible source, up to 50 GB, with customer-supplied file/case mapping. One migration and sample checks. Extra volume or missing mappings require a quote. External traffic charges are extra.
Source code & internal modification rights|Source for purchased modules, shared dependencies, build instructions, database migration scripts and sample environment configuration. Internal maintenance by customer or third party permitted. Non-exclusive; no licence to unpurchased modules, resale or IP transfer.
Extra remote training|2 hours per session, up to 10 participants. The two sessions in standard setup are already included; enter only extra sessions. No travel or on-site work.
`),
 fr:rows(`
Identité et initialisation|Une entité, un logo/palette et un domaine ; saisie initiale de 20 comptes, 10 boutiques, 2 entrepôts et 3 types de rôles maximum. Initialisation des modèles tarifaires, rapports et étiquettes existants des modules achetés. Gestion courante des référentiels par le client sans supplément.
Déploiement et lancement|Un environnement de production et un de recette : base dédiée, stockage, HTTPS, surveillance/alertes de base et sauvegardes quotidiennes. Intégration des modules achetés, droits/menus, tests et premier contrôle de restauration. Infrastructure et supervision continue en supplément.
Formation et passation|Deux séances à distance de 2 heures, 10 personnes maximum chacune ; instructions existantes, liste de recette du circuit retenu et documents d’exploitation/déploiement. Garantie défauts du périmètre pendant 90 jours calendaires après recette.
Petite migration de données|Deux tables CSV/Excel structurées maximum, 2 000 lignes au total ; une correspondance de champs, un essai, un import final et contrôle des quantités. Sans médias, dédoublonnage, nettoyage ou compléments manuels. Alternative à S05.
Migration standard|Quatre tables structurées maximum, 10 000 lignes au total ; deux essais, un import final et contrôle des quantités. Sans nettoyage complexe, interface ancien système ni médias. Alternative à S04.
Migration des médias|Une source accessible légalement, 50 Go maximum, avec correspondance fichiers/dossiers fournie. Une migration et contrôles par sondage. Dépassement ou correspondance manquante sur devis. Trafic tiers en supplément.
Code source et droit de modification interne|Code des modules achetés, dépendances communes, instructions de compilation, migrations de base et exemple de configuration. Maintenance interne par le client ou un tiers autorisée. Droit non exclusif ; sans licence des modules non achetés, revente ni cession de propriété intellectuelle.
Formation à distance supplémentaire|2 heures par séance, 10 participants maximum. Les deux séances de mise en service sont déjà incluses ; saisir uniquement les séances supplémentaires. Sans déplacement ni présence sur site.
`)
};
export const extensionText = {
 zh:MODEL.extensions.map(x=>({name:x.name,scope:x.scope})),
 en:rows(`
Extra report layout|One layout, one language, up to 2 pages in the existing engine using existing fields. Requires M11. No new calculations or professional translation.
Extra label layout|One fixed size, up to 10 existing fields, standard browser printing. Requires M21 or M22. No custom print driver.
Extra business field|One text, number, date or enum field on an existing object, shown/edited on up to 3 existing pages. No new workflow, permission dimension or charging rule.
Extra product category|One category within the existing product/inspection framework, up to 10 ordinary fields and one set of inspection options. Requires M08. No hardware, special workflow or report redesign.
Limited workflow branch|Up to 3 new states and 5 transitions in an existing workflow. No new stock/pricing model, cross-company workflow or third-party interface.
Extra statistics report|Existing data only: up to 10 metrics, 3 filters and one CSV export. Financial reports require the relevant finance modules, to be confirmed in the quote. No BI platform or data warehouse.
`),
 fr:rows(`
Mise en page de rapport|Un modèle, une langue, 2 pages maximum dans le moteur existant avec les champs existants. Exige M11. Sans nouveau calcul ni traduction professionnelle.
Modèle d’étiquette|Un format fixe, 10 champs existants maximum, impression standard du navigateur. Exige M21 ou M22. Sans pilote sur mesure.
Champ métier supplémentaire|Un champ texte, nombre, date ou liste sur un objet existant, affiché/modifié dans 3 pages existantes maximum. Sans nouveau processus, droit ou règle tarifaire.
Catégorie de produit|Une catégorie dans le cadre produit/diagnostic existant, 10 champs ordinaires maximum et un jeu d’options de contrôle. Exige M08. Sans matériel, processus spécifique ni refonte de rapport.
Branche de processus limitée|Dans le circuit existant : 3 nouveaux états et 5 transitions maximum. Sans nouveau modèle de stock/prix, coopération interentreprises ni interface tierce.
Rapport statistique|Données existantes : 10 indicateurs, 3 filtres et un export CSV maximum. Les rapports financiers exigent les modules correspondants, à préciser au devis. Sans plateforme BI ni entrepôt de données.
`)
};
