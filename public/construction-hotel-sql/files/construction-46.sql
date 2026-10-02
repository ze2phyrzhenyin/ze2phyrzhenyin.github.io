/* Construction — 完整中法题解 / Oracle SQL
只包含 SELECT/WITH；每道题独立执行，不要在错误的练习库批量运行。
主解与变式可能代表不同题意口径，并非同时执行的步骤。
N°Siret -> NSIRET；Tarif_Heure_Employé -> Tarif_Heure_Employe。
请核对实际 DDL、大小写、重音及文本值。未连接 Oracle 实例执行。
原题来源：TD BD M1 MIAGE Exo1 Construction_v1 (2).pdf
*/

/*
C1 — 有员工实际参与的报价内工地
FR : Code et adresse postale complète (rue et ville) des chantiers ayant fait intervenir des employés dans le cadre de devis
中文：列出在报价框架内确实有员工参与过的工地编号和完整邮寄地址（街道及城市）。
来源：[C] 第 4 页，原题 1。
思路：从工地出发，经 DEVIS 找到 TRAVAILLERDEVIS，确认存在实际工作；再连接 VILLE 取城市。存在性检查不会把同一工地重复输出。
口径与易错点：只有 DEVIS 记录不能证明员工已经工作。题目只说明地址需要街道及城市，不必强行把它们拼成一个字段。
自测（自行构造）：一个工地有报价却没有任何 TRAVAILLERDEVIS：应当不返回。
*/
SELECT CH.CodeCH, CH.RueCH, V.NomV
FROM CHANTIER CH
JOIN VILLE V ON V.CodeV = CH.CodeV
WHERE EXISTS (
    SELECT 1
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    WHERE D.CodeCH = CH.CodeCH
);

/*
C2 — 枚举条件：BTS 或 Ingénieur
FR : Nom et Prénom des employés ayant un niveau d’étude supérieur au Bac (BTS ou ingénieur)
中文：列出学历高于高中毕业水平（BTS 或工程师）的员工姓和名。
来源：[C] 第 4 页，原题 2。
思路：EMPLOYE 通过 CodeQ 连接 QUALIF，再用 IN 表达两个允许的学历值。
口径与易错点：学历层级不是字符串的字典序，不要用 NiveauQ > 'Bac'。文本值应与实际插入数据一致。
自测（自行构造）：一位 BTS 员工应通过；一位 Bac Pro 员工不通过。
*/
SELECT E.NomE, E.PrenomE
FROM EMPLOYE E
JOIN QUALIF Q ON Q.CodeQ = E.CodeQ
WHERE Q.NiveauQ IN ('BTS', 'Ingénieur');

/*
C3 — 同一城市既有公司又有工地
FR : Codes des départements et noms des villes accueillant des entreprises et des chantiers (classement par ordre « alphabétique » des départements et villes)
中文：列出同时拥有公司和工地的城市所在省份代码及城市名称，并按省份代码、城市名称升序排列。
来源：[C] 第 4 页，原题 3。
思路：两种存在条件都与同一个外层 V.CodeV 关联。无需把两条一对多关系的明细全部连接。
口径与易错点：同一省的 A 城有公司、B 城有工地，不代表这两座城市分别都满足条件。
自测（自行构造）：一个城市有 3 家公司和 4 个工地，仍只输出该城市一次。
*/
SELECT V.CodeDeptV, V.NomV
FROM VILLE V
WHERE EXISTS (
    SELECT 1 FROM ENTREPRISE E
    WHERE E.CodeV = V.CodeV
)
AND EXISTS (
    SELECT 1 FROM CHANTIER CH
    WHERE CH.CodeV = V.CodeV
)
ORDER BY V.CodeDeptV, V.NomV;

/*
C4 — 逐行比例比较
FR : Nom des types de travaux dont le coût horaire employé représente plus de 80% du cout horaire client.
中文：列出员工小时成本超过客户小时价格 80% 的工种名称。
来源：[C] 第 4 页，原题 4。
思路：每个工种的一行就有比较所需的两个费率；直接在 WHERE 中比较，不需要分组。
口径与易错点：“超过 80%”是严格 >，不是 >=；员工费率与客户费率的方向不要颠倒。
自测（自行构造）：员工 80、客户 100 时不通过；员工 81、客户 100 时通过。
*/
SELECT T.NomTY
FROM TYPETRAVAUX T
WHERE T.Tarif_Heure_Employe > 0.8 * T.Tarif_Heure_Clt;

/*
C5 — 今年发生过报价外工作的工种
FR : Nom des types de travaux ayant nécessité des réalisations hors devis cette année
中文：列出今年实际发生过报价外工作的工种名称。
来源：[C] 第 4 页，原题 5。
思路：年度条件放在报价外工作表的 DateT 上；从工种出发检查符合条件的实际工作是否存在。
口径与易错点：今年的工作日期是 DateT，不是报价的 DateDe。相同工种发生多次仍只代表一个工种。
自测（自行构造）：工种今年出现 20 条工作记录，答案不应重复出现 20 次。
*/
SELECT T.NomTY
FROM TYPETRAVAUX T
WHERE EXISTS (
    SELECT 1
    FROM TRAVAILLERHORSDEVIS TH
    WHERE TH.CodeTY = T.CodeTY
      AND EXTRACT(YEAR FROM TH.DateT)
          = EXTRACT(YEAR FROM SYSDATE)
);

/*
C6 — 比较外层公司和工地的所在地
FR : Raison Sociale des entreprises ayant proposé des devis cette année dans les villes où elles sont implantées
中文：列出今年在其自身所在城市提出过报价的公司名称。
来源：[C] 第 4 页，原题 6。
思路：E 是当前公司；子查询读取它今年的报价及相应工地，并直接比较 CH.CodeV 与外层 E.CodeV。
口径与易错点：这里只比较已知的城市代码，不必为了比较而重新引入 VILLE V2。
自测（自行构造）：公司在 A 城、今年只给 B 城工地报价：不能返回该公司。
*/
SELECT E.RaisonSoc
FROM ENTREPRISE E
WHERE EXISTS (
    SELECT 1
    FROM DEVIS D
    JOIN CHANTIER CH ON CH.CodeCH = D.CodeCH
    WHERE D.NSIRET = E.NSIRET
      AND CH.CodeV = E.CodeV
      AND EXTRACT(YEAR FROM D.DateDe)
          = EXTRACT(YEAR FROM SYSDATE)
);

/*
C7 — 外连接保留没有工种的类别
FR : Pour chaque gamme de travaux, donner son nom et le nom des types de travaux associés s’il en possède
中文：对每个工作类别，列出类别名称及其关联的工种名称；没有工种的类别也要显示。
来源：[C] 第 4 页，原题 7。
思路：以 GAMMETRAVAUX 为完整候选集合，LEFT JOIN 可选的工种。此题没有统计，不需要 GROUP BY。
口径与易错点：“pour chaque”不自动等于分组。一个类别有 3 个工种就输出 3 行；没有工种则保留一行空工种。
自测（自行构造）：完全没有工种的类别是否还在结果里？必须在。
*/
SELECT G.NomGA, T.NomTY
FROM GAMMETRAVAUX G
LEFT JOIN TYPETRAVAUX T ON T.idGA = G.idGA;

/*
C8 — 盈利条件、列标题与排序
FR : Nom des gammes et des types de travaux rentables (types de travaux dont le gain entre le tarif horaire payé par le client et le tarif horaire payé aux employés est supérieur à 80% du tarif horaire employé) avec en-têtes personnalisés et classement décroissant des rentabilités
中文：列出有盈利性的工作类别及工种名称：客户小时费率与员工小时费率之差超过员工小时费率的 80%；自定义列标题，并按盈利性降序排列。
来源：[C] 第 4 页，原题 8。
思路：先计算每小时差额，再应用原题的 80% 条件。主解把排序中的“盈利性”解释为相对于员工成本的利润率，并在输出中同时显示差额与利润率。
口径与易错点：题干明确了筛选公式，但没有严格定义排序指标。若课堂按每小时绝对差额排序，将最后一行改为 ORDER BY GainHoraire DESC；不要把这个解释差异隐藏起来。
自测（自行构造）：差额较大与利润率较大不一定是同一个工种；你必须先说清排序指标。
*/
SELECT G.NomGA AS "Gamme",
       T.NomTY AS "Type de travaux",
       T.Tarif_Heure_Clt - T.Tarif_Heure_Employe AS GainHoraire,
       (T.Tarif_Heure_Clt - T.Tarif_Heure_Employe)
           / T.Tarif_Heure_Employe AS Rentabilite
FROM GAMMETRAVAUX G
JOIN TYPETRAVAUX T ON T.idGA = G.idGA
WHERE T.Tarif_Heure_Clt - T.Tarif_Heure_Employe
      > 0.8 * T.Tarif_Heure_Employe
ORDER BY Rentabilite DESC;

/*
C9 — 盈利工种且本月出现在报价里
FR : Nom des types de travaux rentables proposés ce mois-ci dans des devis
中文：列出本月的报价中提出过的有盈利性工种名称。
来源：[C] 第 4 页，原题 9。
思路：沿用 C8 的盈利条件；通过 COMPRENDRE 连接 DEVIS，并用年月一起限定本月。
口径与易错点：只比较 MONTH 会混入往年同月；盈利定义来自 C8，不能另换一套阈值。
自测（自行构造）：去年同月的盈利工种，不算本月报价工种。
*/
SELECT T.NomTY
FROM TYPETRAVAUX T
WHERE T.Tarif_Heure_Clt - T.Tarif_Heure_Employe
      > 0.8 * T.Tarif_Heure_Employe
  AND EXISTS (
      SELECT 1
      FROM COMPRENDRE C
      JOIN DEVIS D ON D.CodeDE = C.CodeDE
      WHERE C.CodeTY = T.CodeTY
        AND TRUNC(D.DateDe, 'MM') = TRUNC(SYSDATE, 'MM')
  );

/*
C10 — 报价内和报价外工作都存在
FR : Code et ville des chantiers ayant été réalisés avec des travaux répondant à des devis et des travaux hors devis
中文：列出既发生过报价内工作、又发生过报价外工作的工地编号和城市。
来源：[C] 第 4 页，原题 10。
思路：同一个工地分别满足两个 EXISTS。报价内工作必须经 DEVIS 追溯至 CodeCH。
口径与易错点：这里是 A 且 B，不是 A 或 B。不要拿“存在报价”代替“实际发生报价内工作”。
自测（自行构造）：只做过报价内工作的工地必须排除。
*/
SELECT CH.CodeCH, V.NomV
FROM CHANTIER CH
JOIN VILLE V ON V.CodeV = CH.CodeV
WHERE EXISTS (
    SELECT 1
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    WHERE D.CodeCH = CH.CodeCH
)
AND EXISTS (
    SELECT 1 FROM TRAVAILLERHORSDEVIS TH
    WHERE TH.CodeCH = CH.CodeCH
);

/*
C10 — 变式 1：另一写法：INTERSECT
两边都输出工地代码后求交集，再取城市。
*/
WITH Codes AS (
    SELECT D.CodeCH
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    INTERSECT
    SELECT TH.CodeCH FROM TRAVAILLERHORSDEVIS TH
)
SELECT CH.CodeCH, V.NomV
FROM Codes X
JOIN CHANTIER CH ON CH.CodeCH = X.CodeCH
JOIN VILLE V ON V.CodeV = CH.CodeV;

/*
C11 — 完全没有报价的工地
FR : Code et ville des chantiers n’ayant pas fait l’objet d’un devis
中文：列出没有任何报价的工地编号及城市。
来源：[C] 第 4 页，原题 11。
思路：从全部工地出发，排除在 DEVIS 中能找到相同工地代码的对象。
口径与易错点：没有报价，与没有实际工作是不同概念；仍然可能存在报价外工作。
自测（自行构造）：没有报价但有报价外工作的工地，应当通过 C11，却不能通过 C13。
*/
SELECT CH.CodeCH, V.NomV
FROM CHANTIER CH
JOIN VILLE V ON V.CodeV = CH.CodeV
WHERE NOT EXISTS (
    SELECT 1 FROM DEVIS D
    WHERE D.CodeCH = CH.CodeCH
);

/*
C12 — 只有报价内工作
FR : Code et ville des chantiers n’ayant été réalisés qu’avec des travaux répondant à des devis
中文：列出只发生过报价内工作的工地编号及城市。
来源：[C] 第 4 页，原题 12。
思路：先要求确实发生过报价内工作，再排除任何报价外工作。
口径与易错点：只写没有报价外工作，会错误包含完全没有工作过的工地。主解按“已经施工，只使用报价内工作”理解。
自测（自行构造）：完全未施工的工地：不通过 C12，但应通过 C13。
*/
SELECT CH.CodeCH, V.NomV
FROM CHANTIER CH
JOIN VILLE V ON V.CodeV = CH.CodeV
WHERE EXISTS (
    SELECT 1
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    WHERE D.CodeCH = CH.CodeCH
)
AND NOT EXISTS (
    SELECT 1 FROM TRAVAILLERHORSDEVIS TH
    WHERE TH.CodeCH = CH.CodeCH
);

/*
C12 — 变式 1：另一写法：MINUS
从有报价内工作的工地集合中减去有报价外工作的工地集合。
*/
WITH Codes AS (
    SELECT D.CodeCH
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    MINUS
    SELECT TH.CodeCH FROM TRAVAILLERHORSDEVIS TH
)
SELECT CH.CodeCH, V.NomV
FROM Codes X
JOIN CHANTIER CH ON CH.CodeCH = X.CodeCH
JOIN VILLE V ON V.CodeV = CH.CodeV;

/*
C13 — 两种实际工作都没有
FR : Code des chantiers n’ayant pas fait l’objet de travaux
中文：列出没有发生过任何实际工作的工地编号。
来源：[C] 第 4 页，原题 13。
思路：报价内和报价外是两种实际工作的来源，两边都不能存在。有没有未执行的报价不影响本题。
口径与易错点：两个 NOT EXISTS 之间是 AND；用 OR 会把只缺少其中一种工作的工地也包括进来。
自测（自行构造）：有未执行报价但没有任何工作：应当通过。
*/
SELECT CH.CodeCH
FROM CHANTIER CH
WHERE NOT EXISTS (
    SELECT 1
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    WHERE D.CodeCH = CH.CodeCH
)
AND NOT EXISTS (
    SELECT 1 FROM TRAVAILLERHORSDEVIS TH
    WHERE TH.CodeCH = CH.CodeCH
);

/*
C14 — 资格同时覆盖两个工作类别
FR : Nom et prénom des employés ayant une qualification relative aux gammes Gros œuvre et second œuvre.
中文：列出其资格同时对应 Gros œuvre（主体工程）和 Second œuvre（配套工程）的员工姓与名。
来源：[C] 第 4 页，原题 14。
思路：先筛选两个目标类别，再按员工数不同的类别编号。因两种类别都需要出现，数量必须为 2。
口径与易错点：前提是这两个名称分别标识课程中的两个类别。IN 只保留候选类别；HAVING 才证明两类都存在。此题不禁止资格还对应其他类别。
自测（自行构造）：资格允许主体、配套、装修三类：仍应通过。
*/
SELECT E.NomE, E.PrenomE
FROM EMPLOYE E
JOIN AUTORISER A ON A.CodeQ = E.CodeQ
JOIN GAMMETRAVAUX G ON G.idGA = A.idGA
WHERE G.NomGA IN ('Gros œuvre', 'Second œuvre')
GROUP BY E.CodeE, E.NomE, E.PrenomE
HAVING COUNT(DISTINCT G.idGA) = 2;

/*
C15 — 只报价、没有实际施工的公司
FR : Raison sociale et groupe des sociétés n’ayant proposé que des devis (aucun travail effectué)
中文：列出只提出过报价、没有进行任何实际工作的公司名称及所属子集团。
来源：[C] 第 4 页，原题 15。
思路：主解把“公司没有进行工作”解释为：该公司所属员工没有报价内或报价外工作；同时要求公司至少提出过一份报价。
口径与易错点：模式有两条“公司—报价内工作”路径：通过员工雇主或通过报价发行公司。原题没有保证两者总相同；主解明确选员工归属口径，不能假装与另一口径天然等价。
自测（自行构造）：A 公司报价由 B 公司员工执行时，必须先确认题目把该工作归到哪家公司。
*/
SELECT E.RaisonSoc, E.GroupeSoc
FROM ENTREPRISE E
WHERE EXISTS (
    SELECT 1 FROM DEVIS D
    WHERE D.NSIRET = E.NSIRET
)
AND NOT EXISTS (
    SELECT 1
    FROM EMPLOYE EM
    JOIN TRAVAILLERDEVIS TD ON TD.CodeE = EM.CodeE
    WHERE EM.NSIRET = E.NSIRET
)
AND NOT EXISTS (
    SELECT 1
    FROM EMPLOYE EM
    JOIN TRAVAILLERHORSDEVIS TH ON TH.CodeE = EM.CodeE
    WHERE EM.NSIRET = E.NSIRET
);

/*
C15 — 变式 1：另一口径：报价内工作归发行报价的公司
仅替换报价内工作的归属路径；报价外仍按员工所属公司归属。跨公司施工时与主解可能不同。
*/
SELECT E.RaisonSoc, E.GroupeSoc
FROM ENTREPRISE E
WHERE EXISTS (
    SELECT 1 FROM DEVIS D WHERE D.NSIRET = E.NSIRET
)
AND NOT EXISTS (
    SELECT 1
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    WHERE D.NSIRET = E.NSIRET
)
AND NOT EXISTS (
    SELECT 1
    FROM EMPLOYE EM
    JOIN TRAVAILLERHORSDEVIS TH ON TH.CodeE = EM.CodeE
    WHERE EM.NSIRET = E.NSIRET
);

/*
C16 — 报价只包含一个允许类别
FR : Code et date des devis ne proposant que du gros œuvre
中文：列出只包含 Gros œuvre（主体工程）工作的报价编号与日期。
来源：[C] 第 4 页，原题 16。
思路：有报价明细，并且不存在任何不能被确认为 Gros œuvre 的明细。用反例检查整个报价，而不是先隐藏其他类别。
口径与易错点：主解沿用模式中每个工种属于一个类别的约束，且把未知类别名称视为无法证明允许。WHERE NomGA = 'Gros œuvre' 只能挑出好明细，不能证明没有坏明细。
自测（自行构造）：一份报价同时有主体和配套工程：必须排除。
*/
SELECT D.CodeDE, D.DateDe
FROM DEVIS D
WHERE EXISTS (
    SELECT 1 FROM COMPRENDRE C WHERE C.CodeDE = D.CodeDE
)
AND NOT EXISTS (
    SELECT 1
    FROM COMPRENDRE C
    JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
    JOIN GAMMETRAVAUX G ON G.idGA = T.idGA
    WHERE C.CodeDE = D.CodeDE
      AND (G.NomGA <> 'Gros œuvre' OR G.NomGA IS NULL)
);

/*
C17 — 报价同时包含两类，可含其他类
FR : Code et date des devis proposant du gros œuvre et du second œuvre
中文：列出同时包含 Gros œuvre 和 Second œuvre 的报价编号及日期。
来源：[C] 第 4 页，原题 17。
思路：先保留两种目标类别，再按报价统计不同类别数等于 2。
口径与易错点：与 C16、C42 不同，本题没有 uniquement。存在第三类不能成为排除理由。按课程名称分别唯一标识这两类的前提编写。
自测（自行构造）：只有两个主体工种，没有配套工种：COUNT 明细可能是 2，但必须不通过。
*/
SELECT D.CodeDE, D.DateDe
FROM DEVIS D
JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
JOIN GAMMETRAVAUX G ON G.idGA = T.idGA
WHERE G.NomGA IN ('Gros œuvre', 'Second œuvre')
GROUP BY D.CodeDE, D.DateDe
HAVING COUNT(DISTINCT G.idGA) = 2;

/*
C18 — 每日累计工时再取最大
FR : Tableau de bord contenant, le nom, le prénom et le nombre d’heures maximum réalisé dans une journée par un employé en réponse à un devis
中文：制作报表：显示员工姓、名，以及员工在报价内工作中某一天达到的最大小时数。
来源：[C] 第 4 页，原题 18。
思路：主解按“每个员工一天内全部报价内工作的累计工时”理解：先按员工和日期 SUM，再按员工 MAX。
口径与易错点：题干没有严格说明按每日总计、每日每报价，还是单条工作记录比较。主解只包含实际工作过的员工；没有工作记录的员工是否也显示，需要另加外连接口径。
自测（自行构造）：同一天两条记录为 3h 和 5h：每日累计是 8h，单条最大只是 5h。
*/
WITH ParJour AS (
    SELECT TD.CodeE, TRUNC(TD.DateT) AS Jour,
           SUM(TD.NbHeureTravDEVIS) AS HeuresJour
    FROM TRAVAILLERDEVIS TD
    GROUP BY TD.CodeE, TRUNC(TD.DateT)
)
SELECT E.NomE, E.PrenomE, MAX(P.HeuresJour) AS MaxHeuresJour
FROM EMPLOYE E
JOIN ParJour P ON P.CodeE = E.CodeE
GROUP BY E.CodeE, E.NomE, E.PrenomE;

/*
C18 — 变式 1：另一口径：单条工作记录的最大值
若老师把 NbHeureTravDEVIS 每一行直接作为要比较的日工时，使用这个版本。它不等于累计日工时。
*/
SELECT E.NomE, E.PrenomE,
       MAX(TD.NbHeureTravDEVIS) AS MaxHeuresLigne
FROM EMPLOYE E
JOIN TRAVAILLERDEVIS TD ON TD.CodeE = E.CodeE
GROUP BY E.CodeE, E.NomE, E.PrenomE;

/*
C18 — 变式 2：另一口径：一天内针对同一份报价的累计工时
若“en réponse à un devis”要求每次只比较同一报价，第一层还要按 CodeDE 分组。
*/
WITH ParJourDevis AS (
    SELECT TD.CodeE, TD.CodeDE, TRUNC(TD.DateT) AS Jour,
           SUM(TD.NbHeureTravDEVIS) AS Heures
    FROM TRAVAILLERDEVIS TD
    GROUP BY TD.CodeE, TD.CodeDE, TRUNC(TD.DateT)
)
SELECT E.NomE, E.PrenomE, MAX(P.Heures) AS MaxHeures
FROM EMPLOYE E
JOIN ParJourDevis P ON P.CodeE = E.CodeE
GROUP BY E.CodeE, E.NomE, E.PrenomE;

/*
C19 — 报价申报工时乘客户费率
FR : Tableau de bord contenant la raison sociale des sociétés et le Chiffre d’Affaire (CA) réalisé dans le cadre des devis (calculé en fonction des heures déclarées dans le devis), classement par ordre décroissant des CA
中文：制作报表：显示公司名称及报价框架内的营业额（原题注明按报价中申报的工时计算），并按营业额降序排列。
来源：[C] 第 4 页，原题 19。
思路：按原题括号中的口径，用 COMPRENDRE.NbHeuresPrev × 客户小时费率。主解把报表解释为列出全部公司，没有报价明细时显示 0。
口径与易错点：原题写 réalisé 但随后明确按报价中的工时算。此处遵守括号，不能擅自换成 TRAVAILLERDEVIS 的实际工时。只列有报价明细的公司时，可将这条路径改为内连接。
自测（自行构造）：预计工时 10h、实际只做 2h：本题的括号口径按 10h 算，C35 才按实际工时算。
*/
SELECT E.RaisonSoc,
       NVL(SUM(C.NbHeuresPrev * T.Tarif_Heure_Clt), 0) AS CA
FROM ENTREPRISE E
LEFT JOIN DEVIS D ON D.NSIRET = E.NSIRET
LEFT JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
LEFT JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
GROUP BY E.NSIRET, E.RaisonSoc
ORDER BY CA DESC;

/*
C20 — 总工时超过门槛
FR : Code et ville des chantiers totalisant plus de 1000 heures de travail effectué hors devis (classement par ordre décroissant du nombre d’heures)
中文：列出报价外实际工作总工时超过 1000 小时的工地编号和城市，并按总工时降序排列。
来源：[C] 第 5 页，原题 20。
思路：按工地累计报价外工时，HAVING 筛选总和。为方便检查，将总工时也显示出来。
口径与易错点：WHERE NbHeureTrav > 1000 检查单条记录，与累计工时完全不同。
自测（自行构造）：600h 与 500h 两条记录：应通过，即使没有任何单条超过 1000h。
*/
SELECT CH.CodeCH, V.NomV, SUM(TH.NbHeureTrav) AS TotalHeures
FROM CHANTIER CH
JOIN VILLE V ON V.CodeV = CH.CodeV
JOIN TRAVAILLERHORSDEVIS TH ON TH.CodeCH = CH.CodeCH
GROUP BY CH.CodeCH, V.NomV
HAVING SUM(TH.NbHeureTrav) > 1000
ORDER BY TotalHeures DESC;

/*
C21 — 按省份而非城市分组
FR : Tableau de bord permettant d’afficher le code des départements et le nombre de chantiers associés en se limitant aux départements possédant aux minimum 5 chantiers
中文：显示省份代码及其工地数量，只保留至少有 5 个工地的省份。
来源：[C] 第 5 页，原题 21。
思路：同省多个城市的工地需要合并，所以只按 CodeDeptV 分组。
口径与易错点：至少 5 是 >=5。按 V.CodeV 分组得到的是城市，不是省份。
自测（自行构造）：同省两个城市分别 2、3 个工地，该省应通过。
*/
SELECT V.CodeDeptV, COUNT(CH.CodeCH) AS NbChantiers
FROM VILLE V
JOIN CHANTIER CH ON CH.CodeV = V.CodeV
GROUP BY V.CodeDeptV
HAVING COUNT(CH.CodeCH) >= 5;

/*
C22 — 数量不超过 2，必须包含 0
FR : Nom des villes à prospecter : celles qui ne possède pas plus de 2 chantiers
中文：列出需要拓展业务的城市：工地数量不超过 2 个的城市。
来源：[C] 第 5 页，原题 22。
思路：从全部城市出发外连接工地，用关联侧非空键 COUNT，零工地城市得到 0。
口径与易错点：内连接会漏掉 0 个工地的城市；COUNT(*) 会把外连接占位行错算成 1。
自测（自行构造）：零工地城市必须返回。
*/
SELECT V.NomV
FROM VILLE V
LEFT JOIN CHANTIER CH ON CH.CodeV = V.CodeV
GROUP BY V.CodeV, V.NomV
HAVING COUNT(CH.CodeCH) <= 2;

/*
C23 — 员工资格覆盖全部工作类别
FR : Donner le nom et le prénom des employés pouvant effectuer des travaux de toutes les gammes.
中文：列出有资格执行所有工作类别的员工姓和名。
来源：[C] 第 5 页，原题 23。
思路：目标集合是 GAMMETRAVAUX 的全部类别。对每个员工，检查是否不存在一个未获其资格授权的类别。
口径与易错点：判断资格，不是判断实际干过哪些工作。若目标类别集合为空，主解按全称逻辑返回全部员工；这是明确的空集合口径。
自测（自行构造）：一个类别没有任何工种，它仍是 GAMMETRAVAUX 中的目标类别，不能悄悄忽略。
*/
SELECT E.NomE, E.PrenomE
FROM EMPLOYE E
WHERE NOT EXISTS (
    SELECT 1
    FROM GAMMETRAVAUX G
    WHERE NOT EXISTS (
        SELECT 1
        FROM AUTORISER A
        WHERE A.CodeQ = E.CodeQ
          AND A.idGA = G.idGA
    )
);

/*
C23 — 变式 1：计数写法
在目标集合非空的通常练习数据中，可数授权覆盖的不同类别。与主解的空目标行为不同。
*/
SELECT E.NomE, E.PrenomE
FROM EMPLOYE E
JOIN AUTORISER A ON A.CodeQ = E.CodeQ
GROUP BY E.CodeE, E.NomE, E.PrenomE
HAVING COUNT(DISTINCT A.idGA) = (
    SELECT COUNT(*) FROM GAMMETRAVAUX
);

/*
C24 — 31 省公司通过报价覆盖所有工种
FR : Donner la raison sociale des entreprises de la Haute Garonne (département 31) proposant tous les types de travaux au travers de ses devis
中文：列出位于 Haute-Garonne（31 省）、通过其报价提出过全部工种的公司名称。
来源：[C] 第 5 页，原题 24。
思路：先限制公司所在地为 31 省；目标集合仍是全库的全部 TYPETRAVAUX。公司多个报价可以共同覆盖目标。
口径与易错点：31 限制的是公司所在地，不是工地所在地。不能要求每一份报价各自包含所有工种；题目允许所有报价合起来覆盖。空目标集合按全称逻辑处理。
自测（自行构造）：一家公司两份报价分别覆盖半数工种，合并后齐全：应通过。
*/
SELECT E.RaisonSoc
FROM ENTREPRISE E
JOIN VILLE V ON V.CodeV = E.CodeV
WHERE V.CodeDeptV = '31'
  AND NOT EXISTS (
      SELECT 1
      FROM TYPETRAVAUX T
      WHERE NOT EXISTS (
          SELECT 1
          FROM DEVIS D
          JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
          WHERE D.NSIRET = E.NSIRET
            AND C.CodeTY = T.CodeTY
      )
  );

/*
C25 — 编号最大的报价及其预计营业额
FR : Code, date et CA prévisionnel du dernier devis (celui ayant le code le plus élevé)
中文：列出最后一份报价的编号、日期及预计营业额；原题明确将“最后”定义为编号最高。
来源：[C] 第 5 页，原题 25。
思路：先按最大 CodeDE 选中报价，再按报价编号汇总预计工时 × 客户费率。无明细报价的金额在主解中显示 0。
口径与易错点：本题不是 MAX(DateDe)。不要将“最大编号”和“最新日期”默认视为永远一致。
自测（自行构造）：编号 20 的日期早于编号 19，本题仍选编号 20。
*/
SELECT D.CodeDE, D.DateDe,
       NVL(SUM(C.NbHeuresPrev * T.Tarif_Heure_Clt), 0) AS CA_Prevu
FROM DEVIS D
LEFT JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
LEFT JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
WHERE D.CodeDE = (SELECT MAX(D2.CodeDE) FROM DEVIS D2)
GROUP BY D.CodeDE, D.DateDe;

/*
C26 — 与 Bati31 的公司预计营业额比较
FR : Raison sociale de l’entreprise ayant réalisé un CA prévisionnel supérieur à celui de Bati31
中文：列出预计营业额高于 Bati31 的公司名称。
来源：[C] 第 5 页，原题 26。
思路：先为每家公司算出同口径 CA，然后把每家公司的 CA 与 Bati31 的 CA 比较。主解把没有报价明细的公司 CA 记为 0。
口径与易错点：以 Bati31 名称唯一定位参考公司为前提。没有该公司时参考值为空，多个同名公司时标量子查询不成立；应改用已知 NSIRET，不能偷偷把同名公司合计。
自测（自行构造）：参考公司 CA 为 100，其他公司 CA 为 100 与 101：只返回 101 的公司。
*/
WITH Stats AS (
    SELECT E.NSIRET, E.RaisonSoc,
           NVL(SUM(C.NbHeuresPrev * T.Tarif_Heure_Clt), 0) AS CA
    FROM ENTREPRISE E
    LEFT JOIN DEVIS D ON D.NSIRET = E.NSIRET
    LEFT JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
    LEFT JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
    GROUP BY E.NSIRET, E.RaisonSoc
)
SELECT S.RaisonSoc
FROM Stats S
WHERE S.CA > (
    SELECT R.CA FROM Stats R WHERE R.RaisonSoc = 'Bati31'
);

/*
C27 — 工地数多于 Toulouse 的城市
FR : Noms des villes possédant plus de chantiers que Toulouse
中文：列出工地数量多于 Toulouse 的城市名称。
来源：[C] 第 5 页，原题 27。
思路：外层按当前城市统计工地数；内层重新读取参考城市的工地，所以引入 V2、CH2。
口径与易错点：前提是 Toulouse 能在数据中唯一标识题目的参考城市。否则这个内层会累计所有同名城市，需改为参考 CodeV。参考城市存在但零工地时，COUNT 返回 0。
自测（自行构造）：当前城市代码与 Toulouse 不同：不能在子查询误写 V2.CodeV = V.CodeV，否则比较的就不是 Toulouse。
*/
SELECT V.NomV
FROM VILLE V
JOIN CHANTIER CH ON CH.CodeV = V.CodeV
GROUP BY V.CodeV, V.NomV
HAVING COUNT(CH.CodeCH) > (
    SELECT COUNT(CH2.CodeCH)
    FROM VILLE V2
    JOIN CHANTIER CH2 ON CH2.CodeV = V2.CodeV
    WHERE V2.NomV = 'Toulouse'
);

/*
C28 — 限定 SARL 后再求最新报价
FR : Code et date du dernier devis émis par une SARL
中文：列出由 SARL 公司发行的最后一份报价的编号及日期。
来源：[C] 第 5 页，原题 28。
思路：主解沿用紧邻 C25 的约定：最后＝编号最大。必须在 SARL 的报价集合中取最大编号。
口径与易错点：C28 本身没有重新定义“最后”。如果教师按日期解释，使用下方版本。不能先取全库最后一份再看是不是 SARL。
自测（自行构造）：全库编号最大的一份来自 SA，仍需要返回 SARL 集合里最后的一份。
*/
SELECT D.CodeDE, D.DateDe
FROM DEVIS D
WHERE D.CodeDE = (
    SELECT MAX(D2.CodeDE)
    FROM DEVIS D2
    JOIN ENTREPRISE E2 ON E2.NSIRET = D2.NSIRET
    WHERE E2.TypeSoc = 'SARL'
);

/*
C28 — 变式 1：按最新日期解释
最新日期并列时全部返回；外层也必须限定 SARL，防止混入同日的其他类型公司。
*/
SELECT D.CodeDE, D.DateDe
FROM DEVIS D
JOIN ENTREPRISE E ON E.NSIRET = D.NSIRET
WHERE E.TypeSoc = 'SARL'
  AND D.DateDe = (
      SELECT MAX(D2.DateDe)
      FROM DEVIS D2
      JOIN ENTREPRISE E2 ON E2.NSIRET = D2.NSIRET
      WHERE E2.TypeSoc = 'SARL'
  );

/*
C29 — 每个公司的最后一份报价
FR : Pour chaque entreprise, donner sa raison sociale et son dernier devis (code et date et son Chiffre d’affaires prévisionnel)
中文：对每家公司，列出公司名称及其最后一份报价的编号、日期和预计营业额。
来源：[C] 第 5 页，原题 29。
思路：主解沿用最后＝最大编号。先按公司求最后编号，再单独汇总各报价金额，最后从全部公司外连接两个结果。
口径与易错点：每家公司各自取最新，不是所有公司共享全库最大。主解保留无报价公司：报价字段及 CA 为空；有报价但无明细时 CA 显示 0，以区分两者。
自测（自行构造）：A 公司最大编号 10，B 公司最大编号 30：应该各得到一份，不能只留下 B。
*/
WITH Dernier AS (
    SELECT D.NSIRET, MAX(D.CodeDE) AS CodeDE
    FROM DEVIS D
    GROUP BY D.NSIRET
), Montant AS (
    SELECT C.CodeDE,
           SUM(C.NbHeuresPrev * T.Tarif_Heure_Clt) AS CA
    FROM COMPRENDRE C
    JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
    GROUP BY C.CodeDE
)
SELECT E.RaisonSoc, D.CodeDE, D.DateDe,
       CASE WHEN D.CodeDE IS NULL THEN NULL
            ELSE NVL(M.CA, 0) END AS CA_Prevu
FROM ENTREPRISE E
LEFT JOIN Dernier X ON X.NSIRET = E.NSIRET
LEFT JOIN DEVIS D ON D.CodeDE = X.CodeDE
LEFT JOIN Montant M ON M.CodeDE = D.CodeDE;

/*
C29 — 变式 1：按每家公司最新日期解释
先按公司求最新日期；同一公司同日多份最新报价全部保留。
*/
WITH Dernier AS (
    SELECT D.NSIRET, MAX(D.DateDe) AS DerniereDate
    FROM DEVIS D
    GROUP BY D.NSIRET
), Montant AS (
    SELECT C.CodeDE,
           SUM(C.NbHeuresPrev * T.Tarif_Heure_Clt) AS CA
    FROM COMPRENDRE C
    JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
    GROUP BY C.CodeDE
)
SELECT E.RaisonSoc, D.CodeDE, D.DateDe,
       CASE WHEN D.CodeDE IS NULL THEN NULL
            ELSE NVL(M.CA, 0) END AS CA_Prevu
FROM ENTREPRISE E
LEFT JOIN Dernier X ON X.NSIRET = E.NSIRET
LEFT JOIN DEVIS D ON D.NSIRET = E.NSIRET
                 AND D.DateDe = X.DerniereDate
LEFT JOIN Montant M ON M.CodeDE = D.CodeDE;

/*
C30 — 先求每份报价金额，再求平均
FR : Donner le CA (Chiffre d'Affaire) prévisionnel moyen d'un devis
中文：求每份报价的预计营业额的平均值。
来源：[C] 第 5 页，原题 30。
思路：第一层按报价把明细金额加总，第二层对每份报价的总额求 AVG。主解让无明细报价按 0 参与平均。
口径与易错点：直接 AVG(明细工时 × 费率) 得到的是平均明细金额，不是平均报价金额。若课程只考虑有明细的报价，改为内连接；空表没有任何报价时 AVG 为 NULL。
自测（自行构造）：报价 A 两行各 50，报价 B 一行 300：平均报价应为 (100+300)/2=200，不是 400/3。
*/
WITH ParDevis AS (
    SELECT D.CodeDE,
           NVL(SUM(C.NbHeuresPrev * T.Tarif_Heure_Clt), 0) AS CA
    FROM DEVIS D
    LEFT JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
    LEFT JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
    GROUP BY D.CodeDE
)
SELECT AVG(CA) AS CA_Moyen
FROM ParDevis;

/*
C31 — 类别 CA 与 SOL 比较
FR : Donner le nom de la gamme proposant un CA prévisionnel plus élevé que la gamme SOL
中文：列出预计营业额高于 SOL 类别的工作类别名称。
来源：[C] 第 5 页，原题 31。
思路：先按工作类别累计其所有工种的预计金额，再与 SOL 的统计值比较。
口径与易错点：原题使用 SOL，但前一页列举的类别名称中没有 SOL。这里保留原词，不擅自替换为别的工种或类别；代码要求实际存在且唯一的 SOL 类别，否则参考值缺失或不唯一。
自测（自行构造）：不要把工种 Revêtement de sol 自动当成工作类别 SOL。
*/
WITH Stats AS (
    SELECT G.idGA, G.NomGA,
           NVL(SUM(C.NbHeuresPrev * T.Tarif_Heure_Clt), 0) AS CA
    FROM GAMMETRAVAUX G
    LEFT JOIN TYPETRAVAUX T ON T.idGA = G.idGA
    LEFT JOIN COMPRENDRE C ON C.CodeTY = T.CodeTY
    GROUP BY G.idGA, G.NomGA
)
SELECT S.NomGA
FROM Stats S
WHERE S.CA > (
    SELECT R.CA FROM Stats R WHERE R.NomGA = 'SOL'
);

/*
C32 — 报价数量最多的公司
FR : Donner la raison sociale des entreprises ayant proposé le plus de devis
中文：列出提出报价数量最多的公司名称。
来源：[C] 第 5 页，原题 32。
思路：先按有报价的公司数报价，再在这些计数结果中找最大，保留并列。
口径与易错点：主解把 ayant proposé 理解为有实际报价。不能用 MAX(CodeDE) 代替最多报价，那会变成最新编号。所有公司都没有报价时主解不返回对象。
自测（自行构造）：公司 A 编号 99 一份，公司 B 编号 1、2 两份：应选 B。
*/
WITH Stats AS (
    SELECT E.NSIRET, E.RaisonSoc, COUNT(D.CodeDE) AS Nb
    FROM ENTREPRISE E
    JOIN DEVIS D ON D.NSIRET = E.NSIRET
    GROUP BY E.NSIRET, E.RaisonSoc
)
SELECT S.RaisonSoc
FROM Stats S
WHERE S.Nb = (SELECT MAX(R.Nb) FROM Stats R);

/*
C33 — 参与人数最多，不是工作记录最多
FR : Donner les coordonnées du chantier (code, rue, ville) ayant fait intervenir le plus d’employés cette année (dans le cadre des devis).
中文：列出今年在报价框架内参与员工人数最多的工地信息：编号、街道、城市。
来源：[C] 第 5 页，原题 33。
思路：限定实际工作 DateT 为今年，按工地数不同员工，再比较各工地人数。
口径与易错点：同一员工多天工作、参与多份报价，仍只算一个人。主解比较今年确有报价内工作的工地。
自测（自行构造）：A 工地一人工作 20 天、B 工地两人各 1 天：按人数应选 B。
*/
WITH Stats AS (
    SELECT D.CodeCH, COUNT(DISTINCT TD.CodeE) AS NbEmployes
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    WHERE EXTRACT(YEAR FROM TD.DateT)
          = EXTRACT(YEAR FROM SYSDATE)
    GROUP BY D.CodeCH
)
SELECT CH.CodeCH, CH.RueCH, V.NomV
FROM Stats S
JOIN CHANTIER CH ON CH.CodeCH = S.CodeCH
JOIN VILLE V ON V.CodeV = CH.CodeV
WHERE S.NbEmployes = (
    SELECT MAX(R.NbEmployes) FROM Stats R
);

/*
C34 — 保留所有工地的报价外实际营业额
FR : Pour chaque chantier donner son code et son CA réalisé hors devis
中文：对每个工地，列出编号及报价外实际营业额。
来源：[C] 第 5 页，原题 34。
思路：从全部工地外连接报价外工作，用实际工时 NbHeureTrav 乘客户费率；缺失金额显示 0。
口径与易错点：题目要营业额，不是工资或利润，所以乘客户费率，不是员工费率。主解明确把未发生的金额显示为 0。
自测（自行构造）：完全没有报价外工作的工地应保留，金额为 0。
*/
SELECT CH.CodeCH,
       NVL(SUM(TH.NbHeureTrav * T.Tarif_Heure_Clt), 0) AS CA_Hors
FROM CHANTIER CH
LEFT JOIN TRAVAILLERHORSDEVIS TH ON TH.CodeCH = CH.CodeCH
LEFT JOIN TYPETRAVAUX T ON T.CodeTY = TH.CodeTY
GROUP BY CH.CodeCH;

/*
C35 — 保留所有工地的报价内实际营业额
FR : Pour chaque chantier, donner son code et son CA réalisé dans le cadre des devis
中文：对每个工地，列出编号及报价内实际营业额。
来源：[C] 第 5 页，原题 35。
思路：经 DEVIS 找到报价内工作，使用 NbHeureTravDEVIS × 客户费率。未发生金额显示 0。
口径与易错点：这是实际工时，不是 COMPRENDRE.NbHeuresPrev。不要把报价明细 C 再只按 CodeDE 连进来，会导致明细与工作记录相互乘倍。
自测（自行构造）：一份报价有 3 个预计工种、2 条实际工作记录，不能把 2 条工作放大成 6 条后求金额。
*/
SELECT CH.CodeCH,
       NVL(SUM(TD.NbHeureTravDEVIS * T.Tarif_Heure_Clt), 0) AS CA_Devis
FROM CHANTIER CH
LEFT JOIN DEVIS D ON D.CodeCH = CH.CodeCH
LEFT JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
LEFT JOIN TYPETRAVAUX T ON T.CodeTY = TD.CodeTY
GROUP BY CH.CodeCH;

/*
C36 — 两个一对多分支先汇总再合并
FR : Pour chaque chantier donner son CA total (en se limitant aux chantiers ayant des CA hors devis et des CA devis)
中文：列出各工地的总营业额，但仅限同时具有报价内营业额和报价外营业额的工地。
来源：[C] 第 5 页，原题 36。
思路：报价内、报价外各自按工地汇总成一行，再 INNER JOIN，保证两类都存在且不会重复累计。
口径与易错点：若直接连两边明细，2 条 × 3 条会形成 6 条。SUM(DISTINCT 金额) 不是正确通用修复，因为真实不同记录可能金额相同。
自测（自行构造）：报价内 100+100、报价外 50+50+50，正确总额是 350。
*/
WITH CA_Devis AS (
    SELECT D.CodeCH,
           SUM(TD.NbHeureTravDEVIS * T.Tarif_Heure_Clt) AS CA
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    JOIN TYPETRAVAUX T ON T.CodeTY = TD.CodeTY
    GROUP BY D.CodeCH
), CA_Hors AS (
    SELECT TH.CodeCH,
           SUM(TH.NbHeureTrav * T.Tarif_Heure_Clt) AS CA
    FROM TRAVAILLERHORSDEVIS TH
    JOIN TYPETRAVAUX T ON T.CodeTY = TH.CodeTY
    GROUP BY TH.CodeCH
)
SELECT D.CodeCH, D.CA + H.CA AS CA_Total
FROM CA_Devis D
JOIN CA_Hors H ON H.CodeCH = D.CodeCH;

/*
C37 — 工地数量最大的城市
FR : Donner le nom des villes possédant le plus chantiers.
中文：列出拥有工地数量最多的城市名称。
来源：[C] 第 5 页，原题 37。
思路：先按城市编号统计工地数，再与这些计数的最大值比较。主解让全部 VILLE 参与，包括零工地城市。
口径与易错点：不能只按城市名称合并不同同名城市。若所有城市都零工地，主解把它们视为并列最大；若课程要求实际拥有工地，第一层改为 JOIN。
自测（自行构造）：两座城市都有 5 个工地且并列最多：两座都要返回。
*/
WITH Stats AS (
    SELECT V.CodeV, V.NomV, COUNT(CH.CodeCH) AS Nb
    FROM VILLE V
    LEFT JOIN CHANTIER CH ON CH.CodeV = V.CodeV
    GROUP BY V.CodeV, V.NomV
)
SELECT S.NomV
FROM Stats S
WHERE S.Nb = (SELECT MAX(R.Nb) FROM Stats R);

/*
C38 — 总预计工时与 Plomberie 比较
FR : Donner les noms des types de travaux ayant plus d’heures prévisionnelles totales que le type plomberie
中文：列出预计总工时多于 Plomberie（水暖／管道工程）工种的工种名称。
来源：[C] 第 5 页，原题 38。
思路：按工种累计 NbHeuresPrev，再与参考工种的同口径总和比较。
口径与易错点：用前页列表的 Plomberie 拼写作为示例，实际文本以数据为准。假定它唯一标识参考工种。比较工时，不是 COUNT 报价或金额。
自测（自行构造）：报价出现次数更多但每次工时更少，不一定符合条件。
*/
WITH Stats AS (
    SELECT T.CodeTY, T.NomTY, NVL(SUM(C.NbHeuresPrev), 0) AS Heures
    FROM TYPETRAVAUX T
    LEFT JOIN COMPRENDRE C ON C.CodeTY = T.CodeTY
    GROUP BY T.CodeTY, T.NomTY
)
SELECT S.NomTY
FROM Stats S
WHERE S.Heures > (
    SELECT R.Heures FROM Stats R WHERE R.NomTY = 'Plomberie'
);

/*
C39 — 今年报价外总工时最多的公司
FR : Nom et type de la société ayant effectué le plus d’heures hors devis cette année.
中文：列出今年报价外实际工作总工时最多的公司名称和公司类型。
来源：[C] 第 5 页，原题 39。
思路：报价外工作没有直接的公司编号，经 EMPLOYE 找雇主；按公司累计今年 DateT 对应的实际工时。
口径与易错点：主解比较今年确有报价外工作的公司。公司归属来自做工的员工，不是工地城市，也不能借 DEVIS 间接猜测。
自测（自行构造）：一家公司人数最多不等于总工时最多；本题的指标是 SUM 工时。
*/
WITH Stats AS (
    SELECT E.NSIRET, E.RaisonSoc, E.TypeSoc,
           SUM(TH.NbHeureTrav) AS Heures
    FROM ENTREPRISE E
    JOIN EMPLOYE EM ON EM.NSIRET = E.NSIRET
    JOIN TRAVAILLERHORSDEVIS TH ON TH.CodeE = EM.CodeE
    WHERE EXTRACT(YEAR FROM TH.DateT)
          = EXTRACT(YEAR FROM SYSDATE)
    GROUP BY E.NSIRET, E.RaisonSoc, E.TypeSoc
)
SELECT S.RaisonSoc, S.TypeSoc
FROM Stats S
WHERE S.Heures = (SELECT MAX(R.Heures) FROM Stats R);

/*
C40 — 今年覆盖 31 省全部工地
FR : Donner le nom et le prénom des employés ayant travaillé dans le cadre des devis sur tous les chantiers de la Haute Garonne (département 31) cette année.
中文：列出今年在报价框架内，到过 Haute-Garonne（31 省）所有工地工作的员工姓与名。
来源：[C] 第 5 页，原题 40。
思路：外层是当前员工；第一层子查询枚举 31 省全部工地；第二层检查该员工今年是否在该工地有报价内工作。
口径与易错点：目标是 31 省全部工地，不是“31 省今年有人做过工的工地”。同一工地做了 100 次也只覆盖一个目标。若无目标工地，主解按全称逻辑返回全部员工。
自测（自行构造）：31 省有一个工地今年完全没人工作：没有员工能够覆盖全部目标。
*/
SELECT E.NomE, E.PrenomE
FROM EMPLOYE E
WHERE NOT EXISTS (
    SELECT 1
    FROM CHANTIER CH
    JOIN VILLE V ON V.CodeV = CH.CodeV
    WHERE V.CodeDeptV = '31'
      AND NOT EXISTS (
          SELECT 1
          FROM DEVIS D
          JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
          WHERE D.CodeCH = CH.CodeCH
            AND TD.CodeE = E.CodeE
            AND EXTRACT(YEAR FROM TD.DateT)
                = EXTRACT(YEAR FROM SYSDATE)
      )
);

/*
C40 — 变式 1：计数写法
目标集合非空、外键有效时，可先将达成记录限定到 31 省，再数不同工地。
*/
SELECT E.NomE, E.PrenomE
FROM EMPLOYE E
JOIN TRAVAILLERDEVIS TD ON TD.CodeE = E.CodeE
JOIN DEVIS D ON D.CodeDE = TD.CodeDE
JOIN CHANTIER CH ON CH.CodeCH = D.CodeCH
JOIN VILLE V ON V.CodeV = CH.CodeV
WHERE V.CodeDeptV = '31'
  AND EXTRACT(YEAR FROM TD.DateT) = EXTRACT(YEAR FROM SYSDATE)
GROUP BY E.CodeE, E.NomE, E.PrenomE
HAVING COUNT(DISTINCT CH.CodeCH) = (
    SELECT COUNT(*)
    FROM CHANTIER CH2
    JOIN VILLE V2 ON V2.CodeV = CH2.CodeV
    WHERE V2.CodeDeptV = '31'
);

/*
C41 — C12 的同型题：只发生报价内工作
FR : Code des chantiers n’ayant été réalisés qu’avec des travaux défini dans un devis (pas de travaux hors devis)
中文：列出仅通过报价中定义的工作进行施工、没有报价外工作的工地编号。
来源：[C] 第 5 页，原题 41。
思路：按题干括号，将它理解为“有报价内工作且没有报价外工作”，与 C12 同型，只是输出列更少。
口径与易错点：这里遵循括号“pas de travaux hors devis”，不另加“每条实际工种必须出现在 COMPRENDRE 中”的数据一致性约束；那是另一种更强的检查，题干未明确要求。
自测（自行构造）：与 C12 对比：逻辑应一致，差别仅是 C12 还输出城市。
*/
SELECT CH.CodeCH
FROM CHANTIER CH
WHERE EXISTS (
    SELECT 1
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    WHERE D.CodeCH = CH.CodeCH
)
AND NOT EXISTS (
    SELECT 1 FROM TRAVAILLERHORSDEVIS TH
    WHERE TH.CodeCH = CH.CodeCH
);

/*
C42 — 只有两类允许工作，不自动要求两类齐全
FR : Donner le code des devis contenant uniquement des travaux des gammes gros œuvre et second œuvre
中文：列出只包含 Gros œuvre 和 Second œuvre 这两种允许类别工作的报价编号。
来源：[C] 第 5 页，原题 42。
思路：主解将其解释为非空报价且不含允许集合之外的类别；单独只有其中一类也符合此解释。
口径与易错点：“只允许 A、B”与“必须 A、B 都出现且不能有其他”是不同条件。原文对后一项存在解释空间；下方给出更强版本。
自测（自行构造）：只有主体工程的报价：主解通过，“两类都必须出现”的版本不通过。
*/
SELECT D.CodeDE
FROM DEVIS D
WHERE EXISTS (
    SELECT 1 FROM COMPRENDRE C WHERE C.CodeDE = D.CodeDE
)
AND NOT EXISTS (
    SELECT 1
    FROM COMPRENDRE C
    JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
    JOIN GAMMETRAVAUX G ON G.idGA = T.idGA
    WHERE C.CodeDE = D.CodeDE
      AND (G.NomGA NOT IN ('Gros œuvre', 'Second œuvre')
           OR G.NomGA IS NULL)
);

/*
C42 — 变式 1：更强解释：恰好这两类，两类均出现
内连接保证有明细；反例计数为零排除其他类别，再要求不同的允许名称数为 2。
*/
SELECT D.CodeDE
FROM DEVIS D
JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
JOIN GAMMETRAVAUX G ON G.idGA = T.idGA
GROUP BY D.CodeDE
HAVING SUM(CASE WHEN G.NomGA IN ('Gros œuvre', 'Second œuvre')
                THEN 0 ELSE 1 END) = 0
   AND COUNT(DISTINCT G.NomGA) = 2;

/*
C43 — 整个省没有公司，不是某个城市没有
FR : Donner le code des départements n’accueillant aucune société
中文：列出没有任何公司的省份代码。
来源：[C] 第 5 页，原题 43。
思路：模式没有独立 DEPARTEMENT 表，候选省份只能来自 VILLE。对当前省的所有城市重新查询，确认没有任何公司。
口径与易错点：V2 是重新读取当前省的全部城市；只检查 E.CodeV = V.CodeV 只能证明当前城市没有公司。完全没有 VILLE 记录的省，无法从给定模式中枚举。
自测（自行构造）：同省 A 城无公司、B 城有公司：该省必须被排除。
*/
SELECT DISTINCT V.CodeDeptV
FROM VILLE V
WHERE NOT EXISTS (
    SELECT 1
    FROM VILLE V2
    JOIN ENTREPRISE E ON E.CodeV = V2.CodeV
    WHERE V2.CodeDeptV = V.CodeDeptV
);

/*
C44 — 公司数最多的省份，保留并列
FR : Donner le code du ou des départements accueillant le plus grand nombre de sociétés
中文：列出接纳公司数量最多的一个或多个省份代码。
来源：[C] 第 5 页，原题 44。
思路：以 VILLE 中可枚举的省份为集合，按省统计公司数，再保留最大。
口径与易错点：一家公司在模式里属于一座城市，这条连接路径不会重复公司。主解允许全库零公司时所有已知省份并列为 0；正数要求可另加 Nb > 0。
自测（自行构造）：两座同省城市各 3 家公司，应按省合计 6 家。
*/
WITH Stats AS (
    SELECT V.CodeDeptV, COUNT(E.NSIRET) AS Nb
    FROM VILLE V
    LEFT JOIN ENTREPRISE E ON E.CodeV = V.CodeV
    GROUP BY V.CodeDeptV
)
SELECT S.CodeDeptV
FROM Stats S
WHERE S.Nb = (SELECT MAX(R.Nb) FROM Stats R);

/*
C45 — 一个省覆盖集团全部公司
FR : Donner le code des départements accueillant toutes les sociétés du groupe
中文：列出接纳该集团全部公司的省份代码。
来源：[C] 第 5 页，原题 45。
思路：将题设 BatiTP 集团理解为 ENTREPRISE 中的全部公司。逐省检查，不存在一家不是位于该省的公司。
口径与易错点：这里不是按 GroupeSoc 的每个子集团分别做题。原背景把 GroupeSoc 定义为子集团，而题目使用整体集团。空公司集合按全称逻辑返回所有可枚举省份。
自测（自行构造）：只要全集团有一家公司在另一个省，当前省就不能通过。
*/
SELECT DISTINCT V.CodeDeptV
FROM VILLE V
WHERE NOT EXISTS (
    SELECT 1
    FROM ENTREPRISE E
    WHERE NOT EXISTS (
        SELECT 1
        FROM VILLE V2
        WHERE V2.CodeV = E.CodeV
          AND V2.CodeDeptV = V.CodeDeptV
    )
);

/*
C45 — 变式 1：计数写法
在目标公司集合非空的通常数据中，比较省内不同公司数与集团总公司数。
*/
SELECT V.CodeDeptV
FROM VILLE V
JOIN ENTREPRISE E ON E.CodeV = V.CodeV
GROUP BY V.CodeDeptV
HAVING COUNT(DISTINCT E.NSIRET) = (
    SELECT COUNT(*) FROM ENTREPRISE
);

/*
C46 — 公司数多于 75 省
FR : Donner le code des départements accueillant plus de société que le département 75.
中文：列出公司数量多于 75 省的省份代码。
来源：[C] 第 5 页，原题 46。
思路：外层统计当前省，内层独立统计参考省 75；V2、E2 是重新读取参考集合的表引用。
口径与易错点：如果把内层省份条件写成 V2.CodeDeptV = V.CodeDeptV，就变成与自身比较。内层 COUNT 没有 GROUP BY，参考省零公司时返回 0。
自测（自行构造）：75 省有 3 家，当前省也 3 家：不通过，必须严格更多。
*/
SELECT V.CodeDeptV
FROM VILLE V
JOIN ENTREPRISE E ON E.CodeV = V.CodeV
GROUP BY V.CodeDeptV
HAVING COUNT(E.NSIRET) > (
    SELECT COUNT(E2.NSIRET)
    FROM VILLE V2
    JOIN ENTREPRISE E2 ON E2.CodeV = V2.CodeV
    WHERE V2.CodeDeptV = '75'
);
