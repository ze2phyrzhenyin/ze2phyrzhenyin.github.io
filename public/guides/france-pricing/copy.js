const tr=(zh,en,fr)=>({zh,en,fr});
const strings={
 initialCost:tr('一次性费用','One-off cost','Coût initial'),externalYear:tr('第三方预算 / 年','Third-party budget / year','Budget tiers / an'),development:tr('本次开发','Development request','Développement demandé'),
 plan:tr('方案','Plan','Formule'),yearUnit:tr('年','years','ans'),userUnit:tr('位计费用户','paid users','utilisateurs payants'),
 options:tr('实施与追加费用','Setup & extras','Mise en service et options'),viewBudget:tr('查看预算','View budget','Voir le budget'),noScript:tr('启用 JavaScript 可调整预算。','Enable JavaScript to adjust the budget.','Activer JavaScript pour ajuster le budget.'),
 title:tr('法国市场报价参考','French market pricing','Prix du marché français'),
 nav:tr(['市场概览','产品价格','功能成本','预算对比','来源'],['Overview','Products','Module costs','Compare','Sources'],['Aperçu','Produits','Coût des modules','Comparaison','Sources']),
 titles:tr(['法国市场报价参考','产品价格','功能与成本','预算对比','来源与算法'],['French market pricing','Product pricing','Features & costs','Budget comparison','Sources & calculations'],['Prix du marché français','Tarifs des produits','Fonctions et coûts','Comparaison des budgets','Sources et calculs']),
 back:tr('Guides','Guides','Guides'),quote:tr('工单平台报价单','Work-order quote','Devis de gestion SAV'),
 theme:tr('切换主题','Switch theme','Changer de thème'),language:tr('语言','Language','Langue'),skip:tr('跳到内容','Skip to content','Aller au contenu'),
 checked:tr('核查','Checked','Vérifié'),reference:tr('价格参考','Pricing reference','Repères tarifaires'),
 official:tr('公开标价','Published prices','Prix publics'),rex:tr('REX 参考价','REX reference prices','Tarifs de référence REX'),estimate:tr('开发估算','Development estimate','Estimation de développement'),
 perMonth:tr('/ 月','/ month','/ mois'),perSeat:tr('/ 人 / 月','/ user / month','/ utilisateur / mois'),perDay:tr('/ 人日','/ day','/ jour'),
 annual:tr('年付','Billed annually','Facturation annuelle'),monthly:tr('月付','Billed monthly','Facturation mensuelle'),
 package:tr('按套餐','Per package','Par forfait'),seat:tr('按计费用户','Per paid user','Par utilisateur payant'),
 taxHT:tr('未税','Excl. VAT','HT'),taxUnknown:tr('税口径待确认','VAT status unconfirmed','TVA à confirmer'),
 source:tr('官网','Official site','Site officiel'),details:tr('范围','Scope','Périmètre'),
 overviewNote:tr('法国可用产品 · 欧元 · 2026-10-16','Available in France · EUR · 2026-10-16','Produits disponibles en France · EUR · 16/10/2026'),
 marketTitle:tr('收费方式','Pricing models','Modes de facturation'),
 modelCards:tr([
 ['按套餐','€45–99 / 月','GoSuivi · 未税','products/#gosuivi'],
 ['按用户','€14–149 / 人 / 月','本页所列套餐；税与周期见明细','products/'],
 ['按工作量','€557 / 人日','Malt · 活跃资深全栈样本','sources/#E08']
 ],[
 ['Per package','€45–99 / month','GoSuivi · excl. VAT','products/#gosuivi'],
 ['Per user','€14–149 / user / month','Listed plans; see billing terms and VAT','products/'],
 ['By workload','€557 / day','Malt · active, experienced fullstack sample','sources/#E08']
 ],[
 ['Par forfait','45–99 € / mois','GoSuivi · HT','products/#gosuivi'],
 ['Par utilisateur','14–149 € / personne / mois','Forfaits listés ; cycles et TVA dans le détail','products/'],
 ['Au temps passé','557 € / jour','Malt · profils fullstack expérimentés et actifs','sources/#E08']
 ]),
 rexTitle:tr('REX 两种收费方式','Two REX options','Deux formules REX'),
 once:tr('一次性 + 年度运维','One-off + annual maintenance','Achat + maintenance annuelle'),
 rental:tr('月度订阅','Monthly subscription','Abonnement mensuel'),
 setup:tr('启动费用','Setup fee','Mise en service'),care:tr('运维','Maintenance','Maintenance'),hosting:tr('第三方预算 / 月','Third-party budget / month','Budget tiers / mois'),
 onceNote:tr('基础版，含实施；运维另计。','Base plan with setup; maintenance extra.','Socle avec mise en service ; maintenance en sus.'),
 rentalNote:tr('含软件与运维；开发按需付费。','Software and maintenance; development billed as needed.','Logiciel et maintenance ; développement à la demande.'),
 rexNote:tr('第三方默认 €60 / 月，未计入上方价格。','Default third-party budget: €60/month, excluded above.','Budget tiers par défaut : 60 €/mois, hors prix ci-dessus.'),
 compareNote:tr('功能范围不同；未填的实施与加购费用不计入。','Scopes differ. Unspecified setup and add-ons are excluded.','Périmètres différents. Mise en service et options non renseignées exclues.'),
 productsNote:tr('月价按官网周期折算。','Monthly equivalents under the stated billing cycle.','Équivalents mensuels selon le cycle indiqué.'),
 minUsers:tr('最低计费人数','Minimum paid users','Minimum d’utilisateurs payants'),
 fixed:tr('固定月费','Fixed monthly fee','Forfait mensuel fixe'),
 vendorNotes:tr({
 gosuivi:['维修门店','多门店另询价；人数上限须确认。'],glpi:['工单与 IT 资产','Private Cloud 最低计费 25 人；报修用户不计席位。'],freshdesk:['客服工单','客服席位计费；此处为年付价。'],zendesk:['多渠道客服','AI、电话等加购另计。'],dolicloud:['ERP 与库存','只计启用的内部用户。'],synchroteam:['现场服务','首个管理员免费；人数填写付费用户数。']
 },{
 gosuivi:['Repair shops','Multi-site pricing and user limits: contact vendor.'],glpi:['Helpdesk & IT assets','Private Cloud: 25-user minimum. End users are not paid agents.'],freshdesk:['Customer support','Paid agent seats; annual billing shown.'],zendesk:['Omnichannel support','AI, telephony and other add-ons cost extra.'],dolicloud:['ERP & stock','Active internal users only.'],synchroteam:['Field service','First administrator free; enter paid users only.']
 },{
 gosuivi:['Ateliers de réparation','Multi-boutiques et limites d’utilisateurs : sur demande.'],glpi:['Helpdesk et actifs IT','Private Cloud : 25 utilisateurs minimum. Demandeurs non facturés.'],freshdesk:['Support client','Agents payants ; tarifs annuels affichés.'],zendesk:['Support omnicanal','IA, téléphonie et autres options en sus.'],dolicloud:['ERP et stocks','Utilisateurs internes actifs uniquement.'],synchroteam:['Interventions terrain','Premier administrateur gratuit ; saisir les utilisateurs payants.']
 }),
 implementation:tr('实施服务参考','Implementation services','Services de mise en œuvre'),
 implNote:tr('Falinwa 法国套餐；服务范围以套餐为准。','Falinwa France packages; scope varies by package.','Packs Falinwa France ; périmètre propre à chaque pack.'),
 hours:tr('小时','hours','heures'),derivedHour:tr('折合时薪','Implied hourly rate','Taux horaire calculé'),
 moduleNote:tr('REX 模块标价；人日为从零开发估算。','REX list prices; person-days estimate a new build.','Tarifs REX ; jours estimés pour un développement neuf.'),
 modulePrice:tr('REX 原价','REX list price','Tarif REX'),days:tr('人日','person-days','jours-personnes'),
 search:tr('搜索名称或编号','Search name or code','Chercher un nom ou code'),allGroups:tr('全部功能','All features','Toutes les fonctions'),noResults:tr('无匹配功能','No matching features','Aucune fonction trouvée'),
 required:tr('基础项','Core','Socle'),dependencies:tr('依赖','Requires','Dépendances'),moduleTotal:tr('全部 30 项','All 30 modules','Les 30 modules'),
 rebuild:tr('从零开发 · 估算','New build · estimate','Développement neuf · estimation'),
 shared:tr('公共工程','Shared engineering','Travaux communs'),
 dayRate:tr('日费率','Day rate','Tarif journalier'),
 effortNote:tr('120–200 人日含公共工程；按 €500–700 / 人日。','120–200 person-days including shared work, at €500–700/day.','120–200 jours-personnes, travaux communs inclus, à 500–700 €/jour.'),
 notEquivalent:tr('现成软件与从零开发的范围、权利不同。','Existing software and a new build have different scope and rights.','Un logiciel existant et un développement neuf diffèrent en périmètre et en droits.'),
 people:tr('计费人数','Paid users','Utilisateurs payants'),years:tr('使用年数','Years','Années'),
 annualExtra:tr('额外费用 / 年','Additional cost / year','Coûts additionnels / an'),initialExtra:tr('实施费用','Setup cost','Mise en service'),
 selection:tr('选择方案','Select plan','Choisir une formule'),compareProducts:tr('产品预算','Product budgets','Budgets des produits'),
 monthlyTotal:tr('月费','Monthly fee','Coût mensuel'),total:tr('总预算','Total budget','Budget total'),
 annualCare:tr('年度运维','Annual maintenance','Maintenance annuelle'),
 rexBudget:tr('REX 预算','REX budget','Budget REX'),
 rexBudgetNote:tr('含实施、运维和第三方预算；未税。','Includes setup, maintenance and third-party budget; excl. VAT.','Mise en service, maintenance et tiers inclus ; HT.'),
 unchanged:tr('按价格不变计算。','Assumes unchanged prices.','Prix supposés constants.'),
 loadQuote:tr('读取当前报价','Load current quote','Charger le devis actuel'),
 loaded:tr('已读取当前报价','Current quote loaded','Devis actuel chargé'),
 noQuote:tr('暂无已保存报价','No saved quote found','Aucun devis enregistré'),
 preset:tr('预设方案','Preset plan','Formule prédéfinie'),currentQuote:tr('当前报价','Current quote','Devis actuel'),
 editQuote:tr('修改报价','Edit quote','Modifier le devis'),reset:tr('重置','Reset','Réinitialiser'),
 export:tr('导出比较','Export comparison','Exporter la comparaison'),print:tr('打印','Print','Imprimer'),
 invalid:tr('请填写范围内的数字。','Enter a number within the allowed range.','Saisir un nombre dans la plage autorisée.'),
 invalidResults:tr('请修正输入后查看结果。','Correct the inputs to view results.','Corriger les valeurs pour afficher les résultats.'),
 sourceNotes:tr([
 '€45 / 59 / 99，按套餐；未税。',
 'Public €19 / 人；Private €21 / 人，最低 25 人；未税。',
 'Growth €17、Pro €52、Enterprise €84；年付。',
 '年付 €19 / 55 / 115；月付 €25 / 69 / 149。',
 'Basic €14 / 人；Premium €30 + €15 / 人；未税。',
 'Standard 年付 €39、月付 €49；Premium 年付 €64、月付 €79。',
 '法国区 25 / 50 / 100 / 200 小时套餐。',
 '€557 / 日；Malt 活跃资深全栈开发者样本。',
 '法国本土标准 TVA：20%。'
 ],[
 '€45 / 59 / 99 per package; excl. VAT.',
 'Public €19/user; Private €21/user, minimum 25; excl. VAT.',
 'Growth €17, Pro €52, Enterprise €84; annual billing.',
 'Annual: €19 / 55 / 115; monthly: €25 / 69 / 149.',
 'Basic €14/user; Premium €30 + €15/user; excl. VAT.',
 'Standard: €39 annually or €49 monthly; Premium: €64 or €79.',
 'France packages of 25 / 50 / 100 / 200 hours.',
 '€557/day; active, experienced fullstack developers on Malt.',
 'Standard VAT rate in mainland France: 20%.'
 ],[
 '45 / 59 / 99 € par forfait ; HT.',
 'Public 19 €/utilisateur ; Private 21 €, minimum 25 ; HT.',
 'Growth 17 €, Pro 52 €, Enterprise 84 € ; facturation annuelle.',
 'Annuel : 19 / 55 / 115 € ; mensuel : 25 / 69 / 149 €.',
 'Basic 14 €/utilisateur ; Premium 30 € + 15 €/utilisateur ; HT.',
 'Standard : 39 € en annuel, 49 € en mensuel ; Premium : 64 € ou 79 €.',
 'Packs France de 25 / 50 / 100 / 200 heures.',
 '557 €/jour ; profils fullstack expérimentés et actifs sur Malt.',
 'TVA normale en France métropolitaine : 20 %.'
 ]),
 methods:tr([
 ['SaaS','(月固定费 + 单价 × 计费人数) × 12 × 年数 + 实施 + 额外年费 × 年数。套餐价不乘人数。'],
 ['REX','直接使用报价单算法；预设含每年 €1,800 运维、每月 €60 第三方预算。'],
 ['人日','30 项合计 102–170 人日，加公共工程 18–30 人日。估算来自参考文件。'],
 ['换算','Falinwa：套餐金额 ÷ 小时数。Malt：€557 ÷ 7 小时 ≈ €80 / 小时；7 小时为换算假设。'],
 ['税与范围','标明 HT 的按未税处理，其余保留官网标价。未填的加购费用不计；产品功能不等同。']
 ],[
 ['SaaS','(Fixed monthly fee + rate × paid users) × 12 × years + setup + annual extras × years. Package prices do not multiply by users.'],
 ['REX','Uses the quote calculator. Presets include €1,800/year maintenance and €60/month third-party costs.'],
 ['Person-days','30 modules: 102–170 days, plus 18–30 days of shared work. Estimates come from the reference file.'],
 ['Conversions','Falinwa: package price ÷ hours. Malt: €557 ÷ 7 hours ≈ €80/hour; the 7-hour day is an assumption.'],
 ['Tax & scope','HT prices exclude VAT; other prices retain the source’s stated basis. Unspecified extras are excluded; features are not equivalent.']
 ],[
 ['SaaS','(Forfait mensuel + tarif × utilisateurs payants) × 12 × années + mise en service + suppléments annuels × années. Les forfaits ne se multiplient pas par utilisateur.'],
 ['REX','Calculateur du devis réutilisé. Formules avec 1 800 €/an de maintenance et 60 €/mois de frais tiers.'],
 ['Jours-personnes','30 modules : 102–170 jours, plus 18–30 jours de travaux communs. Estimations issues du fichier de référence.'],
 ['Conversions','Falinwa : prix du pack ÷ heures. Malt : 557 € ÷ 7 heures ≈ 80 €/heure ; la journée de 7 heures est une hypothèse.'],
 ['TVA et périmètre','Les prix HT sont hors TVA ; les autres conservent la base affichée par la source. Options non chiffrées exclues ; fonctions non équivalentes.']
 ]),
 sample:tr('平台样本，非全国均价。','Platform sample, not a national average.','Échantillon de plateforme, pas une moyenne nationale.'),
 referenceOnly:tr('市场参考 · 非正式报价','Market reference · not a binding quote','Repères de marché · hors devis contractuel'),
 budgetDisclaimer:tr('各行税口径不同；不含未列出的服务。','VAT basis varies by row; unlisted services excluded.','TVA selon chaque ligne ; services non listés exclus.'),
 careIncluded:tr('软件 + 运维','Software + maintenance','Logiciel + maintenance'),
 recurring:tr('后续年费','Ongoing annual cost','Coût annuel récurrent'),
 months:tr('个月','months','mois'),
};
export const COPY=Object.fromEntries(['zh','en','fr'].map(l=>[l,Object.fromEntries(Object.entries(strings).map(([k,v])=>[k,v[l]]))]));
