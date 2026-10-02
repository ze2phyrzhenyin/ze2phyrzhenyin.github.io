/* Hotel — 完整中法题解 / Oracle SQL
只包含 SELECT/WITH；每道题独立执行，不要在错误的练习库批量运行。
主解与变式可能代表不同题意口径，并非同时执行的步骤。
N°Siret -> NSIRET；Tarif_Heure_Employé -> Tarif_Heure_Employe。
请核对实际 DDL、大小写、重音及文本值。未连接 Oracle 实例执行。
原题来源：TD BD M1 MIAGE Exo2 Hotel.pdf
*/

/*
H1 — 称谓转换与可选公司
FR : Pour chaque client, donner sa civilité en clair (Monsieur ou Madame), son nom, son prénom et éventuellement le nom et le domaine de sa société
中文：对每位客户，显示完整称谓（Monsieur 或 Madame）、姓、名，以及其公司名称和业务领域（如有公司）。
来源：[H] 第 1 页，原题 1。
思路：CASE 转换称谓，Client LEFT JOIN Societe 保留没有公司的客户。
口径与易错点：不需要 GROUP BY。将 LEFT JOIN 改为 JOIN 会漏掉没有公司的客户。称谓代码按原题给出的 M.、Mme；实际字符串应与数据一致。
自测（自行构造）：CodeSoc 为 NULL 的客户也必须出现。
*/
SELECT CASE C.CiviC
           WHEN 'M.' THEN 'Monsieur'
           WHEN 'Mme' THEN 'Madame'
           ELSE C.CiviC
       END AS Civilite,
       C.NomC, C.PrenomC, S.RaisonSoc, S.DomaineSoc
FROM Client C
LEFT JOIN Societe S ON S.CodeSoc = C.CodeSoc;

/*
H2 — 公司至少一笔今年开始的预订
FR : Nom des sociétés ayant effectué au moins une réservation débutant cette année
中文：列出至少有一笔抵达日期在今年的预订的公司名称。
来源：[H] 第 1 页，原题 2。
思路：公司经客户关联预订。只检查 DateArr 所在年份，不限制 DateDep。
口径与易错点：débutant 指开始住宿的 DateArr，不是实际创建预订的日期；模式没有创建预订日期字段。
自测（自行构造）：今年抵达、明年离开的预订符合本题。
*/
SELECT S.RaisonSoc
FROM Societe S
WHERE EXISTS (
    SELECT 1
    FROM Client C
    JOIN Reserver R ON R.CodeC = C.CodeC
    WHERE C.CodeSoc = S.CodeSoc
      AND EXTRACT(YEAR FROM R.DateArr)
          = EXTRACT(YEAR FROM SYSDATE)
);

/*
H3 — 恰好十笔今年开始的预订
FR : Nom des sociétés ayant effectué dix réservations débutant cette année
中文：列出恰好有 10 笔今年开始的预订的公司名称。
来源：[H] 第 1 页，原题 3。
思路：先筛今年抵达的预订，再按公司数预订记录，用 HAVING = 10。
口径与易错点：这里数笔数，不是房间数，也不是预订客户数。此连接路径每条预订只对应一个客户和一个公司，因此 COUNT(*) 可数笔数。
自测（自行构造）：1 笔订 10 间房不等于 10 笔预订；今年 10 笔且去年还有预订，仍通过本题。
*/
SELECT S.RaisonSoc
FROM Societe S
JOIN Client C ON C.CodeSoc = S.CodeSoc
JOIN Reserver R ON R.CodeC = C.CodeC
WHERE EXTRACT(YEAR FROM R.DateArr)
      = EXTRACT(YEAR FROM SYSDATE)
GROUP BY S.CodeSoc, S.RaisonSoc
HAVING COUNT(*) = 10;

/*
H4 — 没有到达、离开均在 2018 的预订
FR : Nom des sociétés n’ayant effectué aucune réservation en 2018 (arrivées et départs en 2018)
中文：列出没有任何“抵达和离开都在 2018 年”的预订的公司名称。
来源：[H] 第 1 页，原题 4。
思路：原题括号明确规定两个日期都在 2018。NOT EXISTS 只排除同时满足这两个日期条件的关联预订。
口径与易错点：不能换成“与 2018 有重叠”的版本；那会禁止更多跨年预订。完全没有预订的公司满足“没有这类预订”。
自测（自行构造）：只有 2017-12-30 至 2018-01-03 的预订：主解不会据此排除公司。
*/
SELECT S.RaisonSoc
FROM Societe S
WHERE NOT EXISTS (
    SELECT 1
    FROM Client C
    JOIN Reserver R ON R.CodeC = C.CodeC
    WHERE C.CodeSoc = S.CodeSoc
      AND EXTRACT(YEAR FROM R.DateArr) = 2018
      AND EXTRACT(YEAR FROM R.DateDep) = 2018
);

/*
H5 — 原题的 toutes 存在方向歧义
FR : Nom des sociétés ayant effectué toutes réservations débutant cette année
中文：列出进行了所有今年开始的预订的公司名称。原文也可能想表达“其全部预订都在今年开始”，两种理解须区分。
来源：[H] 第 1 页，原题 5。
思路：主解按字面“覆盖全库所有今年开始的预订”：不存在一笔今年开始的预订，不属于当前公司的客户。
口径与易错点：这是可能的字面解释，不是已确认的教师答案。若今年某笔预订来自没有公司的个人客户，则没有公司能覆盖全部；若今年没有预订，主解按全称逻辑返回全部公司。
自测（自行构造）：公司 A 的全部预订都在今年，但今年还有公司 B 的预订：A 满足下方“只有今年开始”解释，却不满足主解。
*/
SELECT S.RaisonSoc
FROM Societe S
WHERE NOT EXISTS (
    SELECT 1
    FROM Reserver R
    WHERE EXTRACT(YEAR FROM R.DateArr)
          = EXTRACT(YEAR FROM SYSDATE)
      AND NOT EXISTS (
          SELECT 1
          FROM Client C
          WHERE C.CodeC = R.CodeC
            AND C.CodeSoc = S.CodeSoc
      )
);

/*
H5 — 变式 1：另一读法：本公司的预订全部在今年开始
要求公司确有预订，并排除其任何不是今年开始的预订；不限制离开日期。
*/
SELECT S.RaisonSoc
FROM Societe S
WHERE EXISTS (
    SELECT 1
    FROM Client C
    JOIN Reserver R ON R.CodeC = C.CodeC
    WHERE C.CodeSoc = S.CodeSoc
)
AND NOT EXISTS (
    SELECT 1
    FROM Client C
    JOIN Reserver R ON R.CodeC = C.CodeC
    WHERE C.CodeSoc = S.CodeSoc
      AND (R.DateArr IS NULL
           OR EXTRACT(YEAR FROM R.DateArr)
              <> EXTRACT(YEAR FROM SYSDATE))
);

/*
H6 — 所有预订都在今年到达并离开
FR : Nom des sociétés n’ayant effectué que des réservations cette année (arrivée et départ cette année)
中文：列出只做过今年预订的公司名称：其预订均在今年抵达、今年离开。
来源：[H] 第 1 页，原题 6。
思路：先要求有预订，再排除任意“抵达不在今年，或离开不在今年”的预订。未知日期在主解中视为无法证明满足要求。
口径与易错点：好条件是 A AND B，其反例是 NOT A OR NOT B。不能用 AND 连接两个年份不符条件，否则会漏掉只有一个日期跨年的预订。
自测（自行构造）：今年 12 月抵达、明年 1 月离开：公司不能通过 H6，但可通过 H2。
*/
SELECT S.RaisonSoc
FROM Societe S
WHERE EXISTS (
    SELECT 1
    FROM Client C
    JOIN Reserver R ON R.CodeC = C.CodeC
    WHERE C.CodeSoc = S.CodeSoc
)
AND NOT EXISTS (
    SELECT 1
    FROM Client C
    JOIN Reserver R ON R.CodeC = C.CodeC
    WHERE C.CodeSoc = S.CodeSoc
      AND (R.DateArr IS NULL OR R.DateDep IS NULL
           OR EXTRACT(YEAR FROM R.DateArr)
              <> EXTRACT(YEAR FROM SYSDATE)
           OR EXTRACT(YEAR FROM R.DateDep)
              <> EXTRACT(YEAR FROM SYSDATE))
);

/*
H7 — 两晚不是两笔预订
FR : Nom et prénom des clients ayant effectué une réservation de 2 nuits
中文：列出做过一笔两晚住宿预订的客户姓与名。
来源：[H] 第 1 页，原题 7。
思路：检查一条预订的 DateDep - DateArr 是否为 2；从客户出发用 EXISTS 防止重复。
口径与易错点：主解假定日期按天记录，或题目按精确两天间隔计算。若含入住、离店时间且按日历晚数算，可改为 TRUNC(DateDep)-TRUNC(DateArr)=2，但这是不同口径。
自测（自行构造）：一笔两晚应通过；两笔各一晚不能仅因笔数等于 2 就通过。
*/
SELECT C.NomC, C.PrenomC
FROM Client C
WHERE EXISTS (
    SELECT 1 FROM Reserver R
    WHERE R.CodeC = C.CodeC
      AND R.DateDep - R.DateArr = 2
);

/*
H8 — 恰好两笔与 2019 重叠的预订
FR : Nom et prénom des clients ayant effectué deux réservations en 2019 (ne pas se limiter à une arrivée et un départ cette année)
中文：列出在 2019 年有两笔预订的客户姓与名；需考虑跨年，不能只要求抵达和离开都在 2019。
来源：[H] 第 1 页，原题 8。
思路：把住宿区间与 2019 年做重叠判断，再按客户 COUNT(*) = 2。主解把离店日视为不占房，采用半开区间。
口径与易错点：只检查“到达或离开在 2019”会漏掉从 2018 跨到 2020 的长住宿。原题没有明确端点约定，教师采用包含离店日时需调整下界比较。
自测（自行构造）：2018-12-20 至 2020-01-02 这笔预订是否在 2019 有住宿？有，必须计入。
*/
SELECT C.NomC, C.PrenomC
FROM Client C
JOIN Reserver R ON R.CodeC = C.CodeC
WHERE R.DateArr < DATE '2020-01-01'
  AND R.DateDep > DATE '2019-01-01'
GROUP BY C.CodeC, C.NomC, C.PrenomC
HAVING COUNT(*) = 2;

/*
H9 — 2018 年开始的预订最多的客户
FR : Nom, prénom et ville du client ayant effectué le plus de réservations débutant en 2018
中文：列出 2018 年开始的预订笔数最多的客户的姓、名和城市。
来源：[H] 第 1 页，原题 9。
思路：限定 DateArr 年份后按客户数预订，再比较最大。城市取客户的账单地址城市 VilleFacC。
口径与易错点：外层与参考最大值必须使用同一个 2018 候选集合。客户城市不是酒店城市。主解只比较确有 2018 开始预订的客户，且保留并列。
自测（自行构造）：全时期预订最多的客户，未必是 2018 年开始预订最多的客户。
*/
WITH Stats AS (
    SELECT R.CodeC, COUNT(*) AS Nb
    FROM Reserver R
    WHERE EXTRACT(YEAR FROM R.DateArr) = 2018
    GROUP BY R.CodeC
)
SELECT C.NomC, C.PrenomC, C.VilleFacC
FROM Stats S
JOIN Client C ON C.CodeC = S.CodeC
WHERE S.Nb = (SELECT MAX(R.Nb) FROM Stats R);

/*
H10 — 本集团原籍国超过十家酒店
FR : Nom des groupes hôteliers proposant plus de 10 hôtels dans le pays originaire du groupe
中文：列出在其原籍国拥有超过 10 家酒店的酒店集团名称。
来源：[H] 第 1 页，原题 10。
思路：先按每个集团自己的 PaysOrigineGR 筛选酒店国家，再按集团数酒店。
口径与易错点：不能把全球酒店数与 10 比较；也不能把原籍国固定成 France。各集团的目标国家可能不同。
自测（自行构造）：全球 20 家、原籍国只有 8 家：不通过。
*/
SELECT G.NomGR
FROM Groupe G
JOIN Hotel H ON H.CodeGR = G.CodeGR
WHERE H.PaysH = G.PaysOrigineGR
GROUP BY G.CodeGR, G.NomGR
HAVING COUNT(H.CodeH) > 10;

/*
H11 — 法国三星酒店覆盖全部房型
FR : Nom des hôtels français de 3 étoiles proposant tous les types de chambres
中文：列出提供数据库中全部房型的法国三星级酒店名称。
来源：[H] 第 1 页，原题 11。
思路：候选酒店先满足法国、三星；目标集合为全部 TypeCH；不存在一种房型没有被当前酒店提供。
口径与易错点：目标不是“这个酒店自己提供过的所有房型”，而是 TypeCH 全表。空目标时主解保留所有法国三星候选酒店。
自测（自行构造）：某房型全库没有任何酒店提供，也不能从目标集合删去；它会使所有酒店都不满足覆盖全部。
*/
SELECT H.NomH
FROM Hotel H
WHERE H.PaysH = 'France'
  AND H.NbetoilesH = 3
  AND NOT EXISTS (
      SELECT 1
      FROM TypeCH T
      WHERE NOT EXISTS (
          SELECT 1 FROM Proposer P
          WHERE P.CodeH = H.CodeH
            AND P.CodeTyCH = T.CodeTyCH
      )
  );

/*
H11 — 变式 1：计数写法
适用于非空目标集合；Proposer 的键是酒店＋房型，COUNT DISTINCT 仍明确表达不同房型。
*/
SELECT H.NomH
FROM Hotel H
JOIN Proposer P ON P.CodeH = H.CodeH
WHERE H.PaysH = 'France' AND H.NbetoilesH = 3
GROUP BY H.CodeH, H.NomH
HAVING COUNT(DISTINCT P.CodeTyCH) = (
    SELECT COUNT(*) FROM TypeCH
);

/*
H12 — 不提供 suite，不是筛掉 suite 行
FR : Nom des hôtels français de 3 étoiles ne proposant pas le type de chambres « suite »
中文：列出不提供 suite（套房）房型的法国三星级酒店名称。
来源：[H] 第 1 页，原题 12。
思路：先限定酒店，再排除其任何 suite 提供记录。
口径与易错点：WHERE NomTyCH <> 'suite' 仍会保留同时有套房和普通房的酒店。主解也保留完全没有提供记录的法国三星酒店，因为它确实没有 suite。
自测（自行构造）：酒店有 standard 和 suite：必须排除，不是只删 suite 那一行。
*/
SELECT H.NomH
FROM Hotel H
WHERE H.PaysH = 'France'
  AND H.NbetoilesH = 3
  AND NOT EXISTS (
      SELECT 1
      FROM Proposer P
      JOIN TypeCH T ON T.CodeTyCH = P.CodeTyCH
      WHERE P.CodeH = H.CodeH
        AND T.NomTyCH = 'suite'
  );

/*
H13 — 客户在全部集团都预订过
FR : Nom des clients ayant réservé un hôtel dans tous les groupes hôteliers proposés par la BD
中文：列出在数据库中的每个酒店集团都预订过酒店的客户姓名。
来源：[H] 第 1 页，原题 13。
思路：目标是全部 Groupe，达成路径为当前客户的 Reserver → Hotel → CodeGR。
口径与易错点：同一集团预订了十家酒店，也只覆盖一个集团。不属于任何集团的酒店不会覆盖某个目标集团。空集团集合按全称逻辑处理。
自测（自行构造）：数据库中存在一个没有任何酒店的集团：没有客户能通过它的覆盖检查。
*/
SELECT C.NomC
FROM Client C
WHERE NOT EXISTS (
    SELECT 1
    FROM Groupe G
    WHERE NOT EXISTS (
        SELECT 1
        FROM Reserver R
        JOIN Hotel H ON H.CodeH = R.CodeH
        WHERE R.CodeC = C.CodeC
          AND H.CodeGR = G.CodeGR
    )
);

/*
H14 — 与指定酒店的星级相同
FR : Nom des hôtels français ayant le même nombre d’étoiles que l’hôtel « le Lyon d’or » de « Toulouse »
中文：列出星级与 Toulouse 的“le Lyon d’or”酒店相同的法国酒店名称。
来源：[H] 第 1 页，原题 14。
思路：子查询取得参考酒店星级，外层筛选法国酒店并与该属性比较。
口径与易错点：主解假定酒店名称＋城市唯一定位参考酒店，模式没有保证这种唯一性；多个结果时应明确 CodeH，不能随便加 MAX。示例将名称中的撇号用 SQL 的两个单引号转义，真实字符串需匹配数据。没有要求排除参考酒店自身。
自测（自行构造）：另一个城市同名酒店不应影响参考星级。
*/
SELECT H.NomH
FROM Hotel H
WHERE H.PaysH = 'France'
  AND H.NbetoilesH = (
      SELECT H2.NbetoilesH
      FROM Hotel H2
      WHERE H2.NomH = 'le Lyon d''or'
        AND H2.VilleH = 'Toulouse'
  );

/*
H15 — 房型种类最多的酒店
FR : Nom et villes des hôtels proposant le plus de types de chambres
中文：列出提供房型种类最多的酒店名称及城市。
来源：[H] 第 1 页，原题 15。
思路：先按有提供记录的酒店统计不同房型，再与最大种类数比较。
口径与易错点：房型种类数不是房间总量。主解比较实际提供过房型的酒店；全库没有 Proposer 时不返回酒店。
自测（自行构造）：A 酒店 2 种房型共 100 间，B 酒店 3 种共 10 间：本题选 B。
*/
WITH Stats AS (
    SELECT P.CodeH, COUNT(DISTINCT P.CodeTyCH) AS NbTypes
    FROM Proposer P
    GROUP BY P.CodeH
)
SELECT H.NomH, H.VilleH
FROM Stats S
JOIN Hotel H ON H.CodeH = S.CodeH
WHERE S.NbTypes = (SELECT MAX(R.NbTypes) FROM Stats R);

/*
H16 — 预订全库最长住宿的公司
FR : Nom des sociétés ayant réservé le séjour le plus long
中文：列出预订了最长住宿的公司名称。
来源：[H] 第 1 页，原题 16。
思路：主解把“最长”比较范围取为 Reserver 全部预订，再返回拥有同等最长住宿的公司。
口径与易错点：原题未明确最长是否只在公司关联预订中比较。若最长住宿来自无公司的个人客户，主解可能没有公司符合；不能把这个范围差异隐藏。DateDep 为空的时长无法参与通常的 MAX 比较。
自测（自行构造）：个人最长 20 晚、公司最长 10 晚：全库最长口径无公司结果，公司内部候选口径会返回 10 晚的公司。
*/
SELECT S.RaisonSoc
FROM Societe S
WHERE EXISTS (
    SELECT 1
    FROM Client C
    JOIN Reserver R ON R.CodeC = C.CodeC
    WHERE C.CodeSoc = S.CodeSoc
      AND R.DateDep - R.DateArr = (
          SELECT MAX(R2.DateDep - R2.DateArr)
          FROM Reserver R2
      )
);

/*
H16 — 变式 1：另一口径：只在公司关联预订中比较最长
先构造所有公司相关住宿的集合，再在同一集合取最大。
*/
WITH Sejours AS (
    SELECT C.CodeSoc, R.DateDep - R.DateArr AS Duree
    FROM Client C
    JOIN Reserver R ON R.CodeC = C.CodeC
    WHERE C.CodeSoc IS NOT NULL
)
SELECT S.RaisonSoc
FROM Societe S
WHERE EXISTS (
    SELECT 1 FROM Sejours X
    WHERE X.CodeSoc = S.CodeSoc
      AND X.Duree = (SELECT MAX(Y.Duree) FROM Sejours Y)
);

/*
H17 — 最短住宿的比较范围需要明确
FR : Nom des sociétés ayant réservé le séjour le plus court dans la ville de la société
中文：列出在公司所在城市预订了最短住宿的公司名称。
来源：[H] 第 1 页，原题 17。
思路：主解先保留“酒店城市＝预订所属公司城市”的住宿，再在这些合格住宿中取全局最短。
口径与易错点：原文没有消除“所有公司所在地住宿的全局最短”“每个城市的最短”“每个公司自己的最短”之间的歧义。主解只是一种明确口径。模式只有城市文本，无法额外识别同名城市的行政区。
自测（自行构造）：A 城最短 2 晚、B 城最短 1 晚：全局口径只返回 1 晚对应公司；按各城市口径可能都返回。
*/
WITH Sejours AS (
    SELECT S.CodeSoc, R.DateDep - R.DateArr AS Duree
    FROM Societe S
    JOIN Client C ON C.CodeSoc = S.CodeSoc
    JOIN Reserver R ON R.CodeC = C.CodeC
    JOIN Hotel H ON H.CodeH = R.CodeH
    WHERE H.VilleH = S.VilleSoc
)
SELECT S.RaisonSoc
FROM Societe S
WHERE EXISTS (
    SELECT 1 FROM Sejours X
    WHERE X.CodeSoc = S.CodeSoc
      AND X.Duree = (SELECT MIN(Y.Duree) FROM Sejours Y)
);

/*
H17 — 变式 1：另一口径：与公司所在城市全部住宿的最短比较
对每家公司，在其所在地城市的全部预订（含其他公司和个人）中求最短。
*/
SELECT S.RaisonSoc
FROM Societe S
WHERE EXISTS (
    SELECT 1
    FROM Client C
    JOIN Reserver R ON R.CodeC = C.CodeC
    JOIN Hotel H ON H.CodeH = R.CodeH
    WHERE C.CodeSoc = S.CodeSoc
      AND H.VilleH = S.VilleSoc
      AND R.DateDep - R.DateArr = (
          SELECT MIN(R2.DateDep - R2.DateArr)
          FROM Reserver R2
          JOIN Hotel H2 ON H2.CodeH = R2.CodeH
          WHERE H2.VilleH = S.VilleSoc
      )
);

/*
H18a — 最常被提供：按提供记录数量
FR : Nom du type de chambre le plus proposé — a. Au sein de la table PROPOSER
中文：列出最常被提供的房型名称；a 小问按 PROPOSER 表中的出现次数计算。
来源：[H] 第 1 页，原题 18a。
思路：Proposer 的主键为酒店＋房型，因此按房型 COUNT(*) 就是提供该房型的酒店数量。
口径与易错点：这里不是 SUM(NbChambres)。主解在实际出现过的房型中比较；无任何提供记录时不返回结果。原题 H18 的共同题干与 a 小问在本条合并展示。
自测（自行构造）：A 房型 5 家酒店各 1 间，B 房型 1 家酒店 100 间：18a 选 A。
*/
WITH Stats AS (
    SELECT P.CodeTyCH, COUNT(*) AS NbHotels
    FROM Proposer P
    GROUP BY P.CodeTyCH
)
SELECT T.NomTyCH
FROM Stats S
JOIN TypeCH T ON T.CodeTyCH = S.CodeTyCH
WHERE S.NbHotels = (SELECT MAX(R.NbHotels) FROM Stats R);

/*
H18b — 最常被提供：按总房间数量
FR : Nom du type de chambre le plus proposé — b. Autrement dit, le type possédant le plus de chambres
中文：列出最常被提供的房型名称；b 小问指总房间数量最多的房型。
来源：[H] 第 1 页，原题 18b。
思路：按房型把所有酒店的 NbChambres 加总，再在总和中取最大。
口径与易错点：18a 和 18b 只有统计函数不同，但回答的问题不同。这里使用提供数量 NbChambres，不是预订数量 NombreCH。
自测（自行构造）：沿用 18a 的例子，18b 应选 B。
*/
WITH Stats AS (
    SELECT P.CodeTyCH, SUM(P.NbChambres) AS NbChambres
    FROM Proposer P
    GROUP BY P.CodeTyCH
)
SELECT T.NomTyCH
FROM Stats S
JOIN TypeCH T ON T.CodeTyCH = S.CodeTyCH
WHERE S.NbChambres = (SELECT MAX(R.NbChambres) FROM Stats R);

/*
H19 — 公司预订过全部房型
FR : Nom des sociétés ayant réservé tous les types de chambres
中文：列出预订过数据库中全部房型的公司名称。
来源：[H] 第 2 页，原题 19。
思路：外层公司、目标房型、覆盖关系三层。公司所有客户的预订可以合起来覆盖房型。
口径与易错点：同一公司不同客户分别预订不同房型可以共同完成覆盖，不要求某一个客户独自订过全部。空房型集合按全称逻辑处理。
自测（自行构造）：公司订同一种房型 100 次，不能代替订另一个缺失房型。
*/
SELECT S.RaisonSoc
FROM Societe S
WHERE NOT EXISTS (
    SELECT 1
    FROM TypeCH T
    WHERE NOT EXISTS (
        SELECT 1
        FROM Client C
        JOIN Reserver R ON R.CodeC = C.CodeC
        WHERE C.CodeSoc = S.CodeSoc
          AND R.CodeTyCH = T.CodeTyCH
    )
);

/*
H19 — 变式 1：计数写法
在目标集合非空且外键有效时，与主解对通常数据等价；目标为空时不能不加说明地宣称等价。
*/
SELECT S.RaisonSoc
FROM Societe S
JOIN Client C ON C.CodeSoc = S.CodeSoc
JOIN Reserver R ON R.CodeC = C.CodeC
GROUP BY S.CodeSoc, S.RaisonSoc
HAVING COUNT(DISTINCT R.CodeTyCH) = (
    SELECT COUNT(*) FROM TypeCH
);

/*
H20 — 客户＋房型的累计预订房间数最大
FR : Noms du client et du type de chambre pour lequel le nombre de chambres réservées est le plus grand (un client peut réserver plusieurs fois le même type de chambres)
中文：列出累计预订房间数最多的“客户—房型”组合中的客户姓名和房型名称；同一客户可多次预订同一种房型。
来源：[H] 第 2 页，原题 20。
思路：按两个键 CodeC、CodeTyCH 分组，对 NombreCH 求和，再比较这些组合的累计值。
口径与易错点：不能只按客户分组，也不能只取 MAX(NombreCH) 的最大单笔。为便于核对，额外显示累计数。原模式无独立 reservation ID，本题不需要虚构一个。
自测（自行构造）：A 对套房订 4 间＋4 间，B 对套房订 7 间：累计最大是 A 的 8，不是 B 的单笔 7。
*/
WITH Stats AS (
    SELECT R.CodeC, R.CodeTyCH, SUM(R.NombreCH) AS TotalChambres
    FROM Reserver R
    GROUP BY R.CodeC, R.CodeTyCH
)
SELECT C.NomC, T.NomTyCH, S.TotalChambres
FROM Stats S
JOIN Client C ON C.CodeC = S.CodeC
JOIN TypeCH T ON T.CodeTyCH = S.CodeTyCH
WHERE S.TotalChambres = (
    SELECT MAX(X.TotalChambres) FROM Stats X
);

/*
H21 — 酒店数量最多的集团
FR : Nom du groupe proposant le plus d’hôtels
中文：列出拥有酒店数量最多的集团名称。
来源：[H] 第 2 页，原题 21。
思路：按每个集团统计实际匹配的酒店数，再取最大；主解保留全部集团作为候选。
口径与易错点：不属于任何集团的酒店不算给某个集团。若所有集团均零酒店，主解把它们视为并列；若要求实际拥有酒店，再加 NbHotels > 0。
自测（自行构造）：两个集团各有 12 家且并列最多：不能只取一行。
*/
WITH Stats AS (
    SELECT G.CodeGR, G.NomGR, COUNT(H.CodeH) AS NbHotels
    FROM Groupe G
    LEFT JOIN Hotel H ON H.CodeGR = G.CodeGR
    GROUP BY G.CodeGR, G.NomGR
)
SELECT S.NomGR
FROM Stats S
WHERE S.NbHotels = (SELECT MAX(X.NbHotels) FROM Stats X);

/*
H22 — 员工人数在模式中没有完整记录
FR : Nom des sociétés ayant plus de 10 employés
中文：列出员工人数超过 10 人的公司名称。
来源：[H] 第 2 页，原题 22。
思路：原模式只有 Client 与 Societe 关系，没有员工表，也没有声明全部员工都登记为客户。下列 SQL 仅在课程将关联 Client 作为员工记录的解释下成立。
口径与易错点：严格按给定数据，能算的是“关联客户数量超过 10”，不能由此证明真实员工总人数。这里明确标注题目所需的额外解释，不虚构 EMPLOYE 表。
自测（自行构造）：公司真实有 100 名员工，但仅 3 人登记为客户：此数据库无法据此恢复真实员工人数。
*/
SELECT S.RaisonSoc
FROM Societe S
JOIN Client C ON C.CodeSoc = S.CodeSoc
GROUP BY S.CodeSoc, S.RaisonSoc
HAVING COUNT(C.CodeC) > 10;

/*
H23 — 预订最少的房型，零次也参加
FR : Nom du type de chambre ayant le moins de succès (ayant le plus petit nombre de réservations)
中文：列出最不受欢迎的房型名称，即预订笔数最少的房型。
来源：[H] 第 2 页，原题 23。
思路：主解让全部房型参与比较，零预订房型计为 0。外连接 Reserver 并 COUNT 其非空客户键。
口径与易错点：题干没有说明是否排除零预订房型。主解包含零；只在被预订过的房型中选最少时，把第一层 LEFT JOIN 改为 JOIN。不能用 COUNT(*) 计算外连接下的预订数。
自测（自行构造）：房型 A 零笔、B 一笔：包含零的口径应选 A。
*/
WITH Stats AS (
    SELECT T.CodeTyCH, T.NomTyCH, COUNT(R.CodeC) AS NbReservations
    FROM TypeCH T
    LEFT JOIN Reserver R ON R.CodeTyCH = T.CodeTyCH
    GROUP BY T.CodeTyCH, T.NomTyCH
)
SELECT S.NomTyCH
FROM Stats S
WHERE S.NbReservations = (
    SELECT MIN(X.NbReservations) FROM Stats X
);

/*
H24 — 覆盖集团原籍国的全部酒店
FR : Nom du groupe hôtelier proposant tous les hôtels du pays dont le groupe est originaire
中文：列出拥有其原籍国全部酒店的酒店集团名称。
来源：[H] 第 2 页，原题 24。
思路：对每个集团，目标集合随其原籍国变化。找不到一家位于该国却不属于当前集团的酒店，即覆盖成功。
口径与易错点：CodeGR 可为空：独立酒店同样属于“该国全部酒店”，会成为反例，不能被 <> 与 NULL 的未知逻辑漏掉。集团可同时拥有国外酒店。若该国完全无酒店，主解按全称逻辑通过；需真实拥有本国酒店时额外加 EXISTS。
自测（自行构造）：本国所有已归集团的酒店都归 G，但另有一家独立酒店：G 仍不满足“全部”。
*/
SELECT G.NomGR
FROM Groupe G
WHERE NOT EXISTS (
    SELECT 1
    FROM Hotel H
    WHERE H.PaysH = G.PaysOrigineGR
      AND (H.CodeGR <> G.CodeGR OR H.CodeGR IS NULL)
);

/*
H25 — 本国酒店数量最多的集团
FR : Nom du groupe hôtelier proposant le plus d’hôtels dans le pays dont le groupe est originaire
中文：列出在其各自原籍国拥有酒店数量最多的酒店集团名称。
来源：[H] 第 2 页，原题 25。
思路：各集团先只数本国酒店，再对这些本国数量取最大。主解比较至少有一家本国酒店的集团。
口径与易错点：不把所有集团固定到同一个国家。要把零本国酒店的集团也作为候选，应将国家条件放到 LEFT JOIN 的 ON 中；主解无本国酒店候选时不返回。
自测（自行构造）：A 本国 5、国外 100；B 本国 6、国外 0：本题选 B。
*/
WITH Stats AS (
    SELECT G.CodeGR, G.NomGR, COUNT(H.CodeH) AS NbHotels
    FROM Groupe G
    JOIN Hotel H ON H.CodeGR = G.CodeGR
    WHERE H.PaysH = G.PaysOrigineGR
    GROUP BY G.CodeGR, G.NomGR
)
SELECT S.NomGR
FROM Stats S
WHERE S.NbHotels = (SELECT MAX(X.NbHotels) FROM Stats X);

/*
H26 — 只有二星、三星酒店
FR : Nom des groupes hôteliers proposant uniquement des hôtels 2 et 3 étoiles
中文：列出只拥有二星和三星酒店的酒店集团名称。
来源：[H] 第 2 页，原题 26。
思路：要求至少有一家酒店，且没有任何二星、三星以外的酒店；未知星级也视为不能证明符合。
口径与易错点：主解解释为星级只能属于 {2,3}，不要求两种都出现。完全没有酒店的集团不通过。未知星级排除是明确的证明口径，不是原题给出的额外事实。
自测（自行构造）：一家三星＋一家五星：不能仅筛掉五星后保留集团；只有三星的集团在主解中通过。
*/
SELECT G.NomGR
FROM Groupe G
WHERE EXISTS (
    SELECT 1 FROM Hotel H WHERE H.CodeGR = G.CodeGR
)
AND NOT EXISTS (
    SELECT 1
    FROM Hotel H2
    WHERE H2.CodeGR = G.CodeGR
      AND (H2.NbetoilesH NOT IN (2, 3)
           OR H2.NbetoilesH IS NULL)
);

/*
H26 — 变式 1：更强解释：二星、三星都必须有，且没有其他星级
内连接要求有酒店，反例数为零，再要求两种不同星级。
*/
SELECT G.NomGR
FROM Groupe G
JOIN Hotel H ON H.CodeGR = G.CodeGR
GROUP BY G.CodeGR, G.NomGR
HAVING SUM(CASE WHEN H.NbetoilesH IN (2, 3)
                THEN 0 ELSE 1 END) = 0
   AND COUNT(DISTINCT H.NbetoilesH) = 2;

/*
H27 — 只有二星三星，并统计酒店数
FR : Nom des groupes hôteliers proposant uniquement des hôtels 2 et 3 étoiles ainsi que le nombre d’hôtels (2 ou 3 étoiles) pour chacun de ces groupes
中文：列出只拥有二星、三星酒店的集团名称，并显示每个集团这类酒店的数量。
来源：[H] 第 2 页，原题 27。
思路：先对整个集团排除任何不允许的酒店，再对留下的集团全部酒店计数。由于通过了整体约束，计数的全部酒店都是二星或三星。
口径与易错点：不能只用 WHERE H.NbetoilesH IN (2,3) 后分组，那会掩盖同集团其他星级酒店。与 H26 一样，主解不要求二星三星必须同时存在；需要时加 HAVING COUNT(DISTINCT H.NbetoilesH)=2。
自测（自行构造）：集团 A 有二星 2 家、五星 1 家：A 不应返回“2 家”。
*/
SELECT G.NomGR, COUNT(H.CodeH) AS NbHotels
FROM Groupe G
JOIN Hotel H ON H.CodeGR = G.CodeGR
WHERE NOT EXISTS (
    SELECT 1
    FROM Hotel H2
    WHERE H2.CodeGR = G.CodeGR
      AND (H2.NbetoilesH NOT IN (2, 3)
           OR H2.NbetoilesH IS NULL)
)
GROUP BY G.CodeGR, G.NomGR;

/*
H27 — 变式 1：条件聚合写法
内连接保证非空，HAVING 数不允许记录为 0，可合并整体约束与数量统计。
*/
SELECT G.NomGR, COUNT(H.CodeH) AS NbHotels
FROM Groupe G
JOIN Hotel H ON H.CodeGR = G.CodeGR
GROUP BY G.CodeGR, G.NomGR
HAVING SUM(CASE WHEN H.NbetoilesH IN (2, 3)
                THEN 0 ELSE 1 END) = 0;

/*
H28 — 本国没有五星酒店
FR : Nom du groupe hôtelier ne proposant pas d’hôtels 5 étoiles dans son pays d’origine
中文：列出在其原籍国没有五星酒店的酒店集团名称。
来源：[H] 第 2 页，原题 28。
思路：禁止条件是当前集团、本国、五星三项同时成立。任意不满足其中一项的酒店不是这道题的反例。
口径与易错点：国外五星酒店允许存在；无本国酒店甚至无任何酒店的集团，也满足“本国没有五星”。不要将它升级为“全部酒店只能二三星”。
自测（自行构造）：法国原籍集团有西班牙五星酒店、法国三星酒店：应通过。
*/
SELECT G.NomGR
FROM Groupe G
WHERE NOT EXISTS (
    SELECT 1
    FROM Hotel H
    WHERE H.CodeGR = G.CodeGR
      AND H.PaysH = G.PaysOrigineGR
      AND H.NbetoilesH = 5
);

/*
H29 — 法国城市中酒店数量最多
FR : Nom de la ville française proposant le plus d’hôtels
中文：列出拥有酒店数量最多的法国城市名称。
来源：[H] 第 2 页，原题 29。
思路：先筛法国酒店，再按给定的 VilleH 文本分组，求酒店数最大。
口径与易错点：模式没有独立城市代码，只能按 VilleH 建模提供的信息分组，无法额外区分同名的不同法国城市。最大值候选集合也必须限于法国。
自测（自行构造）：国外城市酒店更多，不影响本题法国范围内的最大值。
*/
WITH Stats AS (
    SELECT H.VilleH, COUNT(H.CodeH) AS NbHotels
    FROM Hotel H
    WHERE H.PaysH = 'France'
    GROUP BY H.VilleH
)
SELECT S.VilleH
FROM Stats S
WHERE S.NbHotels = (SELECT MAX(X.NbHotels) FROM Stats X);

/*
H30 — 2018 无单笔超过十间的预订
FR : Nom de l’hôtel n’ayant pas de réservation de plus de 10 chambres en 2018 (les dates d'arrivée et de départ ne sont pas forcément en 2018)
中文：列出在 2018 年没有任何一笔超过 10 间房的预订的酒店名称；预订抵达和离开日期不一定都在 2018。
来源：[H] 第 2 页，原题 30。
思路：NOT EXISTS 中同时限制当前酒店、与 2018 重叠、单笔 NombreCH > 10。主解采用离店日不占房的半开区间。
口径与易错点：这是没有一笔超过 10 间，不是全年合计 <=10。也不是在问酒店总容量。未知 NombreCH 不会被 >10 判定为已知反例；若要求所有记录信息完整，需要额外定义。
自测（自行构造）：两笔各 6 间可通过；一笔 11 间且与 2018 重叠必须排除。
*/
SELECT H.NomH
FROM Hotel H
WHERE NOT EXISTS (
    SELECT 1
    FROM Reserver R
    WHERE R.CodeH = H.CodeH
      AND R.NombreCH > 10
      AND R.DateArr < DATE '2019-01-01'
      AND R.DateDep > DATE '2018-01-01'
);

/*
H31 — 所有房型及可能的零酒店数量
FR : Nom du type de chambre avec éventuellement le nombre d’hôtels associés (certains types peuvent ne pas avoir d’hôtels associés)
中文：列出每种房型名称及其关联酒店数量；有些房型可能没有关联酒店。
来源：[H] 第 2 页，原题 31。
思路：从 TypeCH 外连接 Proposer，按房型统计 P.CodeH 非空值的数量。
口径与易错点：Proposer 的酒店＋房型为键，所以同酒店对同房型只出现一次。COUNT(P.CodeH) 已得到实际酒店数；COUNT(*) 会把零酒店错算成 1。
自测（自行构造）：某房型没有任何 Proposer 行：仍显示，数量为 0。
*/
SELECT T.NomTyCH, COUNT(P.CodeH) AS NbHotels
FROM TypeCH T
LEFT JOIN Proposer P ON P.CodeTyCH = T.CodeTyCH
GROUP BY T.CodeTyCH, T.NomTyCH;

/*
H32 — 已提供但没有被预订的酒店—房型对
FR : Nom de l'hôtel et du ou des types de chambres qu'il propose et qui ne sont pas réservés
中文：列出酒店名称及该酒店提供但尚未被预订的一个或多个房型名称。
来源：[H] 第 2 页，原题 32。
思路：从 Proposer 中实际提供的组合出发，检查 Reserver 中没有同一个酒店、同一种房型的组合。
口径与易错点：题干未给时间范围，按从未被预订理解。别的酒店有该房型的预订，不代表本酒店的该房型已经被预订。
自测（自行构造）：A 酒店套房无人订，B 酒店套房有人订：A 的套房仍应返回。
*/
SELECT H.NomH, T.NomTyCH
FROM Proposer P
JOIN Hotel H ON H.CodeH = P.CodeH
JOIN TypeCH T ON T.CodeTyCH = P.CodeTyCH
WHERE NOT EXISTS (
    SELECT 1
    FROM Reserver R
    WHERE R.CodeH = P.CodeH
      AND R.CodeTyCH = P.CodeTyCH
);

/*
H33 — 每个合格酒店内部房间数最多的房型
FR : Pour les hôtels proposant plus de 3 types de chambres, indiquer son nom et le nom du type de chambres ayant le plus de chambres (ainsi que ce nombre)
中文：对提供超过 3 种房型的酒店，列出酒店名、该酒店房间数最多的房型名称及其房间数量。
来源：[H] 第 2 页，原题 33。
思路：两个独立条件：当前酒店至少 4 种房型；当前行 NbChambres 等于当前酒店内部的最大值。
口径与易错点：P2、P3 是重新扫描 Proposer；H 是外层当前酒店，可以直接引用，不需要 H2。没有 P2.CodeH=H.CodeH 会错误比较全库最大值。所有并列最多的房型都返回。
自测（自行构造）：一个酒店有 4 种房型，数量 10、10、2、1：应返回两个 10 的房型。
*/
SELECT H.NomH, T.NomTyCH, P.NbChambres
FROM Hotel H
JOIN Proposer P ON P.CodeH = H.CodeH
JOIN TypeCH T ON T.CodeTyCH = P.CodeTyCH
WHERE P.NbChambres = (
    SELECT MAX(P2.NbChambres)
    FROM Proposer P2
    WHERE P2.CodeH = H.CodeH
)
AND (
    SELECT COUNT(*)
    FROM Proposer P3
    WHERE P3.CodeH = H.CodeH
) > 3;

/*
H34 — 被预订却未由该酒店提供的房型
FR : Donner le nom des hôtels pour lesquels il a été réservé un type de chambres et ce dernier n'est en fait pas proposé par l'hôtel.
中文：列出出现过某种房型预订、但该房型实际上并未由该酒店提供的酒店名称。
来源：[H] 第 2 页，原题 34。
思路：从酒店出发，存在一笔预订，其酒店—房型组合在 Proposer 中找不到。双层存在性让每家酒店只输出一次。
口径与易错点：与 H32 的方向相反：H32 是 Proposer 减 Reserver；H34 是 Reserver 减 Proposer。不能把 Reserver 与 Proposer 先 INNER JOIN，否则异常组合早已消失。
自测（自行构造）：房型本身存在、酒店也存在，但两者在 Proposer 中没有组合：这正是本题要找的情况。
*/
SELECT H.NomH
FROM Hotel H
WHERE EXISTS (
    SELECT 1
    FROM Reserver R
    WHERE R.CodeH = H.CodeH
      AND NOT EXISTS (
          SELECT 1
          FROM Proposer P
          WHERE P.CodeH = R.CodeH
            AND P.CodeTyCH = R.CodeTyCH
      )
);

/*
H35 — 三个统计指标、零关联与十年范围
FR : Pour chaque groupe hôtelier, donner son nom, le nombre d’hôtels, le nombre de types de chambres proposés et le nombre de clients ayant effectué des réservations durant les 10 dernières années.
中文：对每个酒店集团，列出集团名称、酒店数量、提供的房型种类数，以及过去十年内进行过预订的客户数量。
来源：[H] 第 2 页，原题 35。
思路：主解按过去 120 个月内的抵达时刻统计不同客户；酒店数和提供房型种类数不加时间限制。三个分支分别按集团汇总，再从全部集团外连接。
口径与易错点：原模式没有“预订创建日期”，所以不能严格按下单日期回答；按 DateArr 是本题的明确解释。十年是滚动 120 个月，不是简单年份差 <=10。客户统计不经过 Proposer，否则可能漏掉 H34 的异常预订。
自测（自行构造）：同一客户在同集团两个酒店住过，客户数仍为 1；同一房型被多家酒店提供，集团房型数仍只算 1。
*/
WITH HotelsStats AS (
    SELECT H.CodeGR, COUNT(*) AS NbHotels
    FROM Hotel H
    GROUP BY H.CodeGR
), TypesStats AS (
    SELECT H.CodeGR, COUNT(DISTINCT P.CodeTyCH) AS NbTypes
    FROM Hotel H
    JOIN Proposer P ON P.CodeH = H.CodeH
    GROUP BY H.CodeGR
), ClientsStats AS (
    SELECT H.CodeGR, COUNT(DISTINCT R.CodeC) AS NbClients
    FROM Hotel H
    JOIN Reserver R ON R.CodeH = H.CodeH
    WHERE R.DateArr >= ADD_MONTHS(SYSDATE, -120)
      AND R.DateArr <= SYSDATE
    GROUP BY H.CodeGR
)
SELECT G.NomGR,
       NVL(H.NbHotels, 0) AS NbHotels,
       NVL(T.NbTypes, 0) AS NbTypes,
       NVL(C.NbClients, 0) AS NbClients
FROM Groupe G
LEFT JOIN HotelsStats H ON H.CodeGR = G.CodeGR
LEFT JOIN TypesStats T ON T.CodeGR = G.CodeGR
LEFT JOIN ClientsStats C ON C.CodeGR = G.CodeGR;

/*
H35 — 变式 1：另一写法：三项 COUNT(DISTINCT)
计数可以通过各自的去重对象控制连接放大。此写法的日期口径与主解相同；不要将这套写法直接套成金额 SUM。
*/
SELECT G.NomGR,
       COUNT(DISTINCT H.CodeH) AS NbHotels,
       COUNT(DISTINCT P.CodeTyCH) AS NbTypes,
       COUNT(DISTINCT R.CodeC) AS NbClients
FROM Groupe G
LEFT JOIN Hotel H ON H.CodeGR = G.CodeGR
LEFT JOIN Proposer P ON P.CodeH = H.CodeH
LEFT JOIN Reserver R ON R.CodeH = H.CodeH
    AND R.DateArr >= ADD_MONTHS(SYSDATE, -120)
    AND R.DateArr <= SYSDATE
GROUP BY G.CodeGR, G.NomGR;
