# Construction & Hôtel：82题中法详解



## 使用说明



材料范围：Construction 第 1–46 题、Hôtel 第 1–35 题；H18a 与 H18b 分开，共 82 个小问。每题均有完整主解，另有 19 条替代解法或不同口径的查询，共 101 条 SQL。

原 PDF 只有关系模式、背景和题干，没有教师标准答案。法语题目来自原文件；中文翻译、分类、SQL、解释与自测反例由本册推导。H18 的共同题干与 a/b 小问合并排版；只整理换行，不借机修正原题的含糊之处。

SQL 沿用此前的 Oracle 语境编写。没有提供实际建表脚本：本文将原模式 N°Siret 统一写成 NSIRET，将 Tarif_Heure_Employé 统一写成 Tarif_Heure_Employe；其他表、字段沿用模式。# 是原关系模式的外键标记，不写进 SQL 字段名。执行前必须对照你的 DDL。

文本常量按题目中的名称示范：Gros œuvre、Second œuvre、Plomberie、SOL、suite、France 等。数据库中的大小写、重音、œ/oe、撇号可能有差异，须与实际数据一致。SOL 在题干出现但未出现在示例类别列表，本册保留 SOL，不自动替换。

预订笔数按 Reserver 一行算一笔。模式没有独立的预订编号，也没有预订创建日期。若课程把跨多个房型行视为同一次预订，必须另定去重组合，不能虚构 reservation_id。

年度查询的“今年”使用 SYSDATE 动态获取；题目明确给出的 2018、2019 保留原年份。跨年重叠采用 [DateArr, DateDep) 的住宿区间，离店日不再占房；这是本册的明确边界约定，不是题干已规定的事实。

“有过／只做过”通常要求相关记录非空；“没有某种记录”可包含完全无记录的对象。双重 NOT EXISTS 的“所有”按全称逻辑处理空目标集；需要另外要求实际发生过记录时，必须加 EXISTS。计数替代法的空目标行为逐题提醒。

求最多／最少时保留并列。分组通常使用对象代码及需输出的名称，避免同名对象被合并。没有关联金额显示为 0、最大值是否包含零记录对象等，均在对应题目中说明，不视作原题额外给出的定义。

公司、城市、工种等名称未必是模式中的唯一键。涉及 Bati31、Toulouse、SOL、Plomberie 和指定酒店时，主解假定名称条件能定位题目的参考对象；有同名对象时，应改用已知主键。不能随便加 MAX 来掩盖参考对象不唯一。

例题 SQL 各自独立，不需要预先创建公共视图。Construction 与 Hôtel 属于两套数据库，不要把两份脚本不加选择地对同一个练习库整批运行。所有给出的解法都是 SELECT/WITH 查询，不含数据修改操作。



## 原始材料



[C] TD BD M1 MIAGE Exo1 Construction_v1 (2).pdf

[H] TD BD M1 MIAGE Exo2 Hotel.pdf



## 六步解题法



1. 先确定结果粒度：最终一行代表公司、员工、工地、城市、省、房型，还是客户＋房型组合？

2. 再确定关系方向：至少有、两类都有、没有、只有允许项，还是覆盖全部目标？

3. 确定指标：记录条数、不同对象数、数量总和、日期差，还是金额？

4. 确定比较范围：全库、筛选后的集合、指定参考对象，还是当前对象内部？

5. 确定边界：零关联对象是否保留、同名对象如何区分、日期端点如何定义、并列是否全留？

6. 最后选择 WHERE、HAVING、相关子查询或中间汇总结果。先能用一句中文解释逻辑，再写 SQL。



## 13 类结构



**01 基础连接、逐行筛选与显示**：C1、C2、C3、C4、C6、C8、C9、H1、H10、H17、H25

**02 日期、时长与区间重叠**：C5、C6、C9、C33、C39、C40、H2、H3、H4、H5、H6、H7、H8、H9、H16、H17、H30、H35

**03 至少存在／两类同时存在**：C1、C3、C5、C6、C9、C10、C14、C17、H2、H7

**04 不存在指定关联**：C11、C13、C43、H4、H12、H24、H28、H30、H32、H34

**05 只有允许项（uniquement）**：C12、C15、C16、C41、C42、H5、H6、H26、H27

**06 覆盖全部目标（tous）**：C23、C24、C40、C45、H5、H11、H13、H19、H24

**07 分组统计与数量门槛**：C18、C19、C20、C21、C22、C25、C26、C29、C34、C35、H3、H8、H10、H22、H27、H31、H33、H35

**08 保留零关联对象**：C7、C19、C22、C25、C29、C34、C35、C37、C44、H1、H21、H23、H31、H35

**09 与指定对象比较**：C26、C27、C31、C38、C46、H14

**10 原始值的最大、最小、最新**：C25、C28、H16、H17

**11 分组统计结果的最值**：C32、C33、C37、C39、C44、H9、H15、H18a、H18b、H20、H21、H23、H25、H29

**12 每个对象内部的最大／最新**：C29、H33

**13 二次汇总与多分支汇总**：C18、C30、C36、H35



## 易错对照



**至少一种 vs 两种都有**：IN (A,B) 只筛出允许行；两种都存在要分别 EXISTS，或筛选后 COUNT DISTINCT=2。（C14、C17）



**所有 vs 只有**：设 A 为实际集合，T 为目标集合：覆盖全部是 T⊆A；只有允许项是 A⊆T；恰好这些项需要二者都成立。（C40、C42、H19、H26）



**没有报价 vs 没有工作**：没有 DEVIS 不代表没有 TRAVAILLERHORSDEVIS；有 DEVIS 也不代表已经执行。（C1、C11、C13）



**条数 vs 数量**：COUNT 数记录；SUM 累计 NbChambres、NombreCH、工时或金额。（H18a、H18b、H20）



**原始最大 vs 汇总最大**：MAX(单条数量) 不等于先按对象 SUM，再选总和最大的对象。（C25、C32、H20）



**全局最大 vs 每组最大**：每组内部比较必须明确当前组，如 P2.CodeH=H.CodeH。（C29、H33）



**零行 vs 零值**：LEFT JOIN 保留对象；COUNT(关联键) 才将未匹配记作 0；NVL 不能找回已被内连接删掉的对象。（C22、H23、H31）



**筛掉坏明细 vs 排除坏对象**：WHERE 星级 IN (2,3) 不会排除同集团另外一家五星酒店；必须整体检查反例。（H26、H27）



**两个端点在年内 vs 与全年重叠**：一个从 2018 跨到 2020 的住宿会覆盖 2019，即使两个端点均不在 2019。（H4、H6、H8、H30）



**单键存在 vs 组合键存在**：酒店存在且房型存在，不证明酒店提供该房型；须同时匹配 CodeH、CodeTyCH。（H32、H34）



**先连明细 vs 先汇总**：两边分别 2、3 行，直接连接形成 6 行。金额分支先按最终键汇总，再连接。（C36、H35）



**旧别名 vs 新别名**：是否重新读一批记录决定是否重新 FROM；不是看到 COUNT、MAX、= 就自动加 V2。（C6、C27、C43、C46、H33）



## C1｜有员工实际参与的报价内工地



**FR**：Code et adresse postale complète (rue et ville) des chantiers ayant fait intervenir des employés dans le cadre de devis



**中文**：列出在报价框架内确实有员工参与过的工地编号和完整邮寄地址（街道及城市）。



来源：[C] 第 4 页，原题 1。



**题型**：基础连接、逐行筛选与显示；至少存在／两类同时存在



**思路**：从工地出发，经 DEVIS 找到 TRAVAILLERDEVIS，确认存在实际工作；再连接 VILLE 取城市。存在性检查不会把同一工地重复输出。



```sql

SELECT CH.CodeCH, CH.RueCH, V.NomV
FROM CHANTIER CH
JOIN VILLE V ON V.CodeV = CH.CodeV
WHERE EXISTS (
    SELECT 1
    FROM DEVIS D
    JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
    WHERE D.CodeCH = CH.CodeCH
);

```



**易错点／口径**：只有 DEVIS 记录不能证明员工已经工作。题目只说明地址需要街道及城市，不必强行把它们拼成一个字段。



**自测反例（自行构造）**：一个工地有报价却没有任何 TRAVAILLERDEVIS：应当不返回。



## C2｜枚举条件：BTS 或 Ingénieur



**FR**：Nom et Prénom des employés ayant un niveau d’étude supérieur au Bac (BTS ou ingénieur)



**中文**：列出学历高于高中毕业水平（BTS 或工程师）的员工姓和名。



来源：[C] 第 4 页，原题 2。



**题型**：基础连接、逐行筛选与显示



**思路**：EMPLOYE 通过 CodeQ 连接 QUALIF，再用 IN 表达两个允许的学历值。



```sql

SELECT E.NomE, E.PrenomE
FROM EMPLOYE E
JOIN QUALIF Q ON Q.CodeQ = E.CodeQ
WHERE Q.NiveauQ IN ('BTS', 'Ingénieur');

```



**易错点／口径**：学历层级不是字符串的字典序，不要用 NiveauQ > 'Bac'。文本值应与实际插入数据一致。



**自测反例（自行构造）**：一位 BTS 员工应通过；一位 Bac Pro 员工不通过。



## C3｜同一城市既有公司又有工地



**FR**：Codes des départements et noms des villes accueillant des entreprises et des chantiers (classement par ordre « alphabétique » des départements et villes)



**中文**：列出同时拥有公司和工地的城市所在省份代码及城市名称，并按省份代码、城市名称升序排列。



来源：[C] 第 4 页，原题 3。



**题型**：至少存在／两类同时存在；基础连接、逐行筛选与显示



**思路**：两种存在条件都与同一个外层 V.CodeV 关联。无需把两条一对多关系的明细全部连接。



```sql

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

```



**易错点／口径**：同一省的 A 城有公司、B 城有工地，不代表这两座城市分别都满足条件。



**自测反例（自行构造）**：一个城市有 3 家公司和 4 个工地，仍只输出该城市一次。



## C4｜逐行比例比较



**FR**：Nom des types de travaux dont le coût horaire employé représente plus de 80% du cout horaire client.



**中文**：列出员工小时成本超过客户小时价格 80% 的工种名称。



来源：[C] 第 4 页，原题 4。



**题型**：基础连接、逐行筛选与显示



**思路**：每个工种的一行就有比较所需的两个费率；直接在 WHERE 中比较，不需要分组。



```sql

SELECT T.NomTY
FROM TYPETRAVAUX T
WHERE T.Tarif_Heure_Employe > 0.8 * T.Tarif_Heure_Clt;

```



**易错点／口径**：“超过 80%”是严格 >，不是 >=；员工费率与客户费率的方向不要颠倒。



**自测反例（自行构造）**：员工 80、客户 100 时不通过；员工 81、客户 100 时通过。



## C5｜今年发生过报价外工作的工种



**FR**：Nom des types de travaux ayant nécessité des réalisations hors devis cette année



**中文**：列出今年实际发生过报价外工作的工种名称。



来源：[C] 第 4 页，原题 5。



**题型**：日期、时长与区间重叠；至少存在／两类同时存在



**思路**：年度条件放在报价外工作表的 DateT 上；从工种出发检查符合条件的实际工作是否存在。



```sql

SELECT T.NomTY
FROM TYPETRAVAUX T
WHERE EXISTS (
    SELECT 1
    FROM TRAVAILLERHORSDEVIS TH
    WHERE TH.CodeTY = T.CodeTY
      AND EXTRACT(YEAR FROM TH.DateT)
          = EXTRACT(YEAR FROM SYSDATE)
);

```



**易错点／口径**：今年的工作日期是 DateT，不是报价的 DateDe。相同工种发生多次仍只代表一个工种。



**自测反例（自行构造）**：工种今年出现 20 条工作记录，答案不应重复出现 20 次。



## C6｜比较外层公司和工地的所在地



**FR**：Raison Sociale des entreprises ayant proposé des devis cette année dans les villes où elles sont implantées



**中文**：列出今年在其自身所在城市提出过报价的公司名称。



来源：[C] 第 4 页，原题 6。



**题型**：基础连接、逐行筛选与显示；日期、时长与区间重叠；至少存在／两类同时存在



**思路**：E 是当前公司；子查询读取它今年的报价及相应工地，并直接比较 CH.CodeV 与外层 E.CodeV。



```sql

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

```



**易错点／口径**：这里只比较已知的城市代码，不必为了比较而重新引入 VILLE V2。



**自测反例（自行构造）**：公司在 A 城、今年只给 B 城工地报价：不能返回该公司。



## C7｜外连接保留没有工种的类别



**FR**：Pour chaque gamme de travaux, donner son nom et le nom des types de travaux associés s’il en possède



**中文**：对每个工作类别，列出类别名称及其关联的工种名称；没有工种的类别也要显示。



来源：[C] 第 4 页，原题 7。



**题型**：保留零关联对象



**思路**：以 GAMMETRAVAUX 为完整候选集合，LEFT JOIN 可选的工种。此题没有统计，不需要 GROUP BY。



```sql

SELECT G.NomGA, T.NomTY
FROM GAMMETRAVAUX G
LEFT JOIN TYPETRAVAUX T ON T.idGA = G.idGA;

```



**易错点／口径**：“pour chaque”不自动等于分组。一个类别有 3 个工种就输出 3 行；没有工种则保留一行空工种。



**自测反例（自行构造）**：完全没有工种的类别是否还在结果里？必须在。



## C8｜盈利条件、列标题与排序



**FR**：Nom des gammes et des types de travaux rentables (types de travaux dont le gain entre le tarif horaire payé par le client et le tarif horaire payé aux employés est supérieur à 80% du tarif horaire employé) avec en-têtes personnalisés et classement décroissant des rentabilités



**中文**：列出有盈利性的工作类别及工种名称：客户小时费率与员工小时费率之差超过员工小时费率的 80%；自定义列标题，并按盈利性降序排列。



来源：[C] 第 4 页，原题 8。



**题型**：基础连接、逐行筛选与显示



**思路**：先计算每小时差额，再应用原题的 80% 条件。主解把排序中的“盈利性”解释为相对于员工成本的利润率，并在输出中同时显示差额与利润率。



```sql

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

```



**易错点／口径**：题干明确了筛选公式，但没有严格定义排序指标。若课堂按每小时绝对差额排序，将最后一行改为 ORDER BY GainHoraire DESC；不要把这个解释差异隐藏起来。



**自测反例（自行构造）**：差额较大与利润率较大不一定是同一个工种；你必须先说清排序指标。



## C9｜盈利工种且本月出现在报价里



**FR**：Nom des types de travaux rentables proposés ce mois-ci dans des devis



**中文**：列出本月的报价中提出过的有盈利性工种名称。



来源：[C] 第 4 页，原题 9。



**题型**：基础连接、逐行筛选与显示；日期、时长与区间重叠；至少存在／两类同时存在



**思路**：沿用 C8 的盈利条件；通过 COMPRENDRE 连接 DEVIS，并用年月一起限定本月。



```sql

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

```



**易错点／口径**：只比较 MONTH 会混入往年同月；盈利定义来自 C8，不能另换一套阈值。



**自测反例（自行构造）**：去年同月的盈利工种，不算本月报价工种。



## C10｜报价内和报价外工作都存在



**FR**：Code et ville des chantiers ayant été réalisés avec des travaux répondant à des devis et des travaux hors devis



**中文**：列出既发生过报价内工作、又发生过报价外工作的工地编号和城市。



来源：[C] 第 4 页，原题 10。



**题型**：至少存在／两类同时存在



**思路**：同一个工地分别满足两个 EXISTS。报价内工作必须经 DEVIS 追溯至 CodeCH。



```sql

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

```



**易错点／口径**：这里是 A 且 B，不是 A 或 B。不要拿“存在报价”代替“实际发生报价内工作”。



**自测反例（自行构造）**：只做过报价内工作的工地必须排除。



### C10 变式 1：另一写法：INTERSECT



两边都输出工地代码后求交集，再取城市。



```sql

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

```



## C11｜完全没有报价的工地



**FR**：Code et ville des chantiers n’ayant pas fait l’objet d’un devis



**中文**：列出没有任何报价的工地编号及城市。



来源：[C] 第 4 页，原题 11。



**题型**：不存在指定关联



**思路**：从全部工地出发，排除在 DEVIS 中能找到相同工地代码的对象。



```sql

SELECT CH.CodeCH, V.NomV
FROM CHANTIER CH
JOIN VILLE V ON V.CodeV = CH.CodeV
WHERE NOT EXISTS (
    SELECT 1 FROM DEVIS D
    WHERE D.CodeCH = CH.CodeCH
);

```



**易错点／口径**：没有报价，与没有实际工作是不同概念；仍然可能存在报价外工作。



**自测反例（自行构造）**：没有报价但有报价外工作的工地，应当通过 C11，却不能通过 C13。



## C12｜只有报价内工作



**FR**：Code et ville des chantiers n’ayant été réalisés qu’avec des travaux répondant à des devis



**中文**：列出只发生过报价内工作的工地编号及城市。



来源：[C] 第 4 页，原题 12。



**题型**：只有允许项（uniquement）



**思路**：先要求确实发生过报价内工作，再排除任何报价外工作。



```sql

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

```



**易错点／口径**：只写没有报价外工作，会错误包含完全没有工作过的工地。主解按“已经施工，只使用报价内工作”理解。



**自测反例（自行构造）**：完全未施工的工地：不通过 C12，但应通过 C13。



### C12 变式 1：另一写法：MINUS



从有报价内工作的工地集合中减去有报价外工作的工地集合。



```sql

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

```



## C13｜两种实际工作都没有



**FR**：Code des chantiers n’ayant pas fait l’objet de travaux



**中文**：列出没有发生过任何实际工作的工地编号。



来源：[C] 第 4 页，原题 13。



**题型**：不存在指定关联



**思路**：报价内和报价外是两种实际工作的来源，两边都不能存在。有没有未执行的报价不影响本题。



```sql

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

```



**易错点／口径**：两个 NOT EXISTS 之间是 AND；用 OR 会把只缺少其中一种工作的工地也包括进来。



**自测反例（自行构造）**：有未执行报价但没有任何工作：应当通过。



## C14｜资格同时覆盖两个工作类别



**FR**：Nom et prénom des employés ayant une qualification relative aux gammes Gros œuvre et second œuvre.



**中文**：列出其资格同时对应 Gros œuvre（主体工程）和 Second œuvre（配套工程）的员工姓与名。



来源：[C] 第 4 页，原题 14。



**题型**：至少存在／两类同时存在



**思路**：先筛选两个目标类别，再按员工数不同的类别编号。因两种类别都需要出现，数量必须为 2。



```sql

SELECT E.NomE, E.PrenomE
FROM EMPLOYE E
JOIN AUTORISER A ON A.CodeQ = E.CodeQ
JOIN GAMMETRAVAUX G ON G.idGA = A.idGA
WHERE G.NomGA IN ('Gros œuvre', 'Second œuvre')
GROUP BY E.CodeE, E.NomE, E.PrenomE
HAVING COUNT(DISTINCT G.idGA) = 2;

```



**易错点／口径**：前提是这两个名称分别标识课程中的两个类别。IN 只保留候选类别；HAVING 才证明两类都存在。此题不禁止资格还对应其他类别。



**自测反例（自行构造）**：资格允许主体、配套、装修三类：仍应通过。



## C15｜只报价、没有实际施工的公司



**FR**：Raison sociale et groupe des sociétés n’ayant proposé que des devis (aucun travail effectué)



**中文**：列出只提出过报价、没有进行任何实际工作的公司名称及所属子集团。



来源：[C] 第 4 页，原题 15。



**题型**：只有允许项（uniquement）



**思路**：主解把“公司没有进行工作”解释为：该公司所属员工没有报价内或报价外工作；同时要求公司至少提出过一份报价。



```sql

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

```



**易错点／口径**：模式有两条“公司—报价内工作”路径：通过员工雇主或通过报价发行公司。原题没有保证两者总相同；主解明确选员工归属口径，不能假装与另一口径天然等价。



**自测反例（自行构造）**：A 公司报价由 B 公司员工执行时，必须先确认题目把该工作归到哪家公司。



### C15 变式 1：另一口径：报价内工作归发行报价的公司



仅替换报价内工作的归属路径；报价外仍按员工所属公司归属。跨公司施工时与主解可能不同。



```sql

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

```



## C16｜报价只包含一个允许类别



**FR**：Code et date des devis ne proposant que du gros œuvre



**中文**：列出只包含 Gros œuvre（主体工程）工作的报价编号与日期。



来源：[C] 第 4 页，原题 16。



**题型**：只有允许项（uniquement）



**思路**：有报价明细，并且不存在任何不能被确认为 Gros œuvre 的明细。用反例检查整个报价，而不是先隐藏其他类别。



```sql

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

```



**易错点／口径**：主解沿用模式中每个工种属于一个类别的约束，且把未知类别名称视为无法证明允许。WHERE NomGA = 'Gros œuvre' 只能挑出好明细，不能证明没有坏明细。



**自测反例（自行构造）**：一份报价同时有主体和配套工程：必须排除。



## C17｜报价同时包含两类，可含其他类



**FR**：Code et date des devis proposant du gros œuvre et du second œuvre



**中文**：列出同时包含 Gros œuvre 和 Second œuvre 的报价编号及日期。



来源：[C] 第 4 页，原题 17。



**题型**：至少存在／两类同时存在



**思路**：先保留两种目标类别，再按报价统计不同类别数等于 2。



```sql

SELECT D.CodeDE, D.DateDe
FROM DEVIS D
JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
JOIN GAMMETRAVAUX G ON G.idGA = T.idGA
WHERE G.NomGA IN ('Gros œuvre', 'Second œuvre')
GROUP BY D.CodeDE, D.DateDe
HAVING COUNT(DISTINCT G.idGA) = 2;

```



**易错点／口径**：与 C16、C42 不同，本题没有 uniquement。存在第三类不能成为排除理由。按课程名称分别唯一标识这两类的前提编写。



**自测反例（自行构造）**：只有两个主体工种，没有配套工种：COUNT 明细可能是 2，但必须不通过。



## C18｜每日累计工时再取最大



**FR**：Tableau de bord contenant, le nom, le prénom et le nombre d’heures maximum réalisé dans une journée par un employé en réponse à un devis



**中文**：制作报表：显示员工姓、名，以及员工在报价内工作中某一天达到的最大小时数。



来源：[C] 第 4 页，原题 18。



**题型**：分组统计与数量门槛；二次汇总与多分支汇总



**思路**：主解按“每个员工一天内全部报价内工作的累计工时”理解：先按员工和日期 SUM，再按员工 MAX。



```sql

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

```



**易错点／口径**：题干没有严格说明按每日总计、每日每报价，还是单条工作记录比较。主解只包含实际工作过的员工；没有工作记录的员工是否也显示，需要另加外连接口径。



**自测反例（自行构造）**：同一天两条记录为 3h 和 5h：每日累计是 8h，单条最大只是 5h。



### C18 变式 1：另一口径：单条工作记录的最大值



若老师把 NbHeureTravDEVIS 每一行直接作为要比较的日工时，使用这个版本。它不等于累计日工时。



```sql

SELECT E.NomE, E.PrenomE,
       MAX(TD.NbHeureTravDEVIS) AS MaxHeuresLigne
FROM EMPLOYE E
JOIN TRAVAILLERDEVIS TD ON TD.CodeE = E.CodeE
GROUP BY E.CodeE, E.NomE, E.PrenomE;

```



### C18 变式 2：另一口径：一天内针对同一份报价的累计工时



若“en réponse à un devis”要求每次只比较同一报价，第一层还要按 CodeDE 分组。



```sql

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

```



## C19｜报价申报工时乘客户费率



**FR**：Tableau de bord contenant la raison sociale des sociétés et le Chiffre d’Affaire (CA) réalisé dans le cadre des devis (calculé en fonction des heures déclarées dans le devis), classement par ordre décroissant des CA



**中文**：制作报表：显示公司名称及报价框架内的营业额（原题注明按报价中申报的工时计算），并按营业额降序排列。



来源：[C] 第 4 页，原题 19。



**题型**：分组统计与数量门槛；保留零关联对象



**思路**：按原题括号中的口径，用 COMPRENDRE.NbHeuresPrev × 客户小时费率。主解把报表解释为列出全部公司，没有报价明细时显示 0。



```sql

SELECT E.RaisonSoc,
       NVL(SUM(C.NbHeuresPrev * T.Tarif_Heure_Clt), 0) AS CA
FROM ENTREPRISE E
LEFT JOIN DEVIS D ON D.NSIRET = E.NSIRET
LEFT JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
LEFT JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
GROUP BY E.NSIRET, E.RaisonSoc
ORDER BY CA DESC;

```



**易错点／口径**：原题写 réalisé 但随后明确按报价中的工时算。此处遵守括号，不能擅自换成 TRAVAILLERDEVIS 的实际工时。只列有报价明细的公司时，可将这条路径改为内连接。



**自测反例（自行构造）**：预计工时 10h、实际只做 2h：本题的括号口径按 10h 算，C35 才按实际工时算。



## C20｜总工时超过门槛



**FR**：Code et ville des chantiers totalisant plus de 1000 heures de travail effectué hors devis (classement par ordre décroissant du nombre d’heures)



**中文**：列出报价外实际工作总工时超过 1000 小时的工地编号和城市，并按总工时降序排列。



来源：[C] 第 5 页，原题 20。



**题型**：分组统计与数量门槛



**思路**：按工地累计报价外工时，HAVING 筛选总和。为方便检查，将总工时也显示出来。



```sql

SELECT CH.CodeCH, V.NomV, SUM(TH.NbHeureTrav) AS TotalHeures
FROM CHANTIER CH
JOIN VILLE V ON V.CodeV = CH.CodeV
JOIN TRAVAILLERHORSDEVIS TH ON TH.CodeCH = CH.CodeCH
GROUP BY CH.CodeCH, V.NomV
HAVING SUM(TH.NbHeureTrav) > 1000
ORDER BY TotalHeures DESC;

```



**易错点／口径**：WHERE NbHeureTrav > 1000 检查单条记录，与累计工时完全不同。



**自测反例（自行构造）**：600h 与 500h 两条记录：应通过，即使没有任何单条超过 1000h。



## C21｜按省份而非城市分组



**FR**：Tableau de bord permettant d’afficher le code des départements et le nombre de chantiers associés en se limitant aux départements possédant aux minimum 5 chantiers



**中文**：显示省份代码及其工地数量，只保留至少有 5 个工地的省份。



来源：[C] 第 5 页，原题 21。



**题型**：分组统计与数量门槛



**思路**：同省多个城市的工地需要合并，所以只按 CodeDeptV 分组。



```sql

SELECT V.CodeDeptV, COUNT(CH.CodeCH) AS NbChantiers
FROM VILLE V
JOIN CHANTIER CH ON CH.CodeV = V.CodeV
GROUP BY V.CodeDeptV
HAVING COUNT(CH.CodeCH) >= 5;

```



**易错点／口径**：至少 5 是 >=5。按 V.CodeV 分组得到的是城市，不是省份。



**自测反例（自行构造）**：同省两个城市分别 2、3 个工地，该省应通过。



## C22｜数量不超过 2，必须包含 0



**FR**：Nom des villes à prospecter : celles qui ne possède pas plus de 2 chantiers



**中文**：列出需要拓展业务的城市：工地数量不超过 2 个的城市。



来源：[C] 第 5 页，原题 22。



**题型**：分组统计与数量门槛；保留零关联对象



**思路**：从全部城市出发外连接工地，用关联侧非空键 COUNT，零工地城市得到 0。



```sql

SELECT V.NomV
FROM VILLE V
LEFT JOIN CHANTIER CH ON CH.CodeV = V.CodeV
GROUP BY V.CodeV, V.NomV
HAVING COUNT(CH.CodeCH) <= 2;

```



**易错点／口径**：内连接会漏掉 0 个工地的城市；COUNT(*) 会把外连接占位行错算成 1。



**自测反例（自行构造）**：零工地城市必须返回。



## C23｜员工资格覆盖全部工作类别



**FR**：Donner le nom et le prénom des employés pouvant effectuer des travaux de toutes les gammes.



**中文**：列出有资格执行所有工作类别的员工姓和名。



来源：[C] 第 5 页，原题 23。



**题型**：覆盖全部目标（tous）



**思路**：目标集合是 GAMMETRAVAUX 的全部类别。对每个员工，检查是否不存在一个未获其资格授权的类别。



```sql

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

```



**易错点／口径**：判断资格，不是判断实际干过哪些工作。若目标类别集合为空，主解按全称逻辑返回全部员工；这是明确的空集合口径。



**自测反例（自行构造）**：一个类别没有任何工种，它仍是 GAMMETRAVAUX 中的目标类别，不能悄悄忽略。



### C23 变式 1：计数写法



在目标集合非空的通常练习数据中，可数授权覆盖的不同类别。与主解的空目标行为不同。



```sql

SELECT E.NomE, E.PrenomE
FROM EMPLOYE E
JOIN AUTORISER A ON A.CodeQ = E.CodeQ
GROUP BY E.CodeE, E.NomE, E.PrenomE
HAVING COUNT(DISTINCT A.idGA) = (
    SELECT COUNT(*) FROM GAMMETRAVAUX
);

```



## C24｜31 省公司通过报价覆盖所有工种



**FR**：Donner la raison sociale des entreprises de la Haute Garonne (département 31) proposant tous les types de travaux au travers de ses devis



**中文**：列出位于 Haute-Garonne（31 省）、通过其报价提出过全部工种的公司名称。



来源：[C] 第 5 页，原题 24。



**题型**：覆盖全部目标（tous）



**思路**：先限制公司所在地为 31 省；目标集合仍是全库的全部 TYPETRAVAUX。公司多个报价可以共同覆盖目标。



```sql

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

```



**易错点／口径**：31 限制的是公司所在地，不是工地所在地。不能要求每一份报价各自包含所有工种；题目允许所有报价合起来覆盖。空目标集合按全称逻辑处理。



**自测反例（自行构造）**：一家公司两份报价分别覆盖半数工种，合并后齐全：应通过。



## C25｜编号最大的报价及其预计营业额



**FR**：Code, date et CA prévisionnel du dernier devis (celui ayant le code le plus élevé)



**中文**：列出最后一份报价的编号、日期及预计营业额；原题明确将“最后”定义为编号最高。



来源：[C] 第 5 页，原题 25。



**题型**：分组统计与数量门槛；原始值的最大、最小、最新；保留零关联对象



**思路**：先按最大 CodeDE 选中报价，再按报价编号汇总预计工时 × 客户费率。无明细报价的金额在主解中显示 0。



```sql

SELECT D.CodeDE, D.DateDe,
       NVL(SUM(C.NbHeuresPrev * T.Tarif_Heure_Clt), 0) AS CA_Prevu
FROM DEVIS D
LEFT JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
LEFT JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
WHERE D.CodeDE = (SELECT MAX(D2.CodeDE) FROM DEVIS D2)
GROUP BY D.CodeDE, D.DateDe;

```



**易错点／口径**：本题不是 MAX(DateDe)。不要将“最大编号”和“最新日期”默认视为永远一致。



**自测反例（自行构造）**：编号 20 的日期早于编号 19，本题仍选编号 20。



## C26｜与 Bati31 的公司预计营业额比较



**FR**：Raison sociale de l’entreprise ayant réalisé un CA prévisionnel supérieur à celui de Bati31



**中文**：列出预计营业额高于 Bati31 的公司名称。



来源：[C] 第 5 页，原题 26。



**题型**：与指定对象比较；分组统计与数量门槛



**思路**：先为每家公司算出同口径 CA，然后把每家公司的 CA 与 Bati31 的 CA 比较。主解把没有报价明细的公司 CA 记为 0。



```sql

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

```



**易错点／口径**：以 Bati31 名称唯一定位参考公司为前提。没有该公司时参考值为空，多个同名公司时标量子查询不成立；应改用已知 NSIRET，不能偷偷把同名公司合计。



**自测反例（自行构造）**：参考公司 CA 为 100，其他公司 CA 为 100 与 101：只返回 101 的公司。



## C27｜工地数多于 Toulouse 的城市



**FR**：Noms des villes possédant plus de chantiers que Toulouse



**中文**：列出工地数量多于 Toulouse 的城市名称。



来源：[C] 第 5 页，原题 27。



**题型**：与指定对象比较



**思路**：外层按当前城市统计工地数；内层重新读取参考城市的工地，所以引入 V2、CH2。



```sql

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

```



**易错点／口径**：前提是 Toulouse 能在数据中唯一标识题目的参考城市。否则这个内层会累计所有同名城市，需改为参考 CodeV。参考城市存在但零工地时，COUNT 返回 0。



**自测反例（自行构造）**：当前城市代码与 Toulouse 不同：不能在子查询误写 V2.CodeV = V.CodeV，否则比较的就不是 Toulouse。



## C28｜限定 SARL 后再求最新报价



**FR**：Code et date du dernier devis émis par une SARL



**中文**：列出由 SARL 公司发行的最后一份报价的编号及日期。



来源：[C] 第 5 页，原题 28。



**题型**：原始值的最大、最小、最新



**思路**：主解沿用紧邻 C25 的约定：最后＝编号最大。必须在 SARL 的报价集合中取最大编号。



```sql

SELECT D.CodeDE, D.DateDe
FROM DEVIS D
WHERE D.CodeDE = (
    SELECT MAX(D2.CodeDE)
    FROM DEVIS D2
    JOIN ENTREPRISE E2 ON E2.NSIRET = D2.NSIRET
    WHERE E2.TypeSoc = 'SARL'
);

```



**易错点／口径**：C28 本身没有重新定义“最后”。如果教师按日期解释，使用下方版本。不能先取全库最后一份再看是不是 SARL。



**自测反例（自行构造）**：全库编号最大的一份来自 SA，仍需要返回 SARL 集合里最后的一份。



### C28 变式 1：按最新日期解释



最新日期并列时全部返回；外层也必须限定 SARL，防止混入同日的其他类型公司。



```sql

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

```



## C29｜每个公司的最后一份报价



**FR**：Pour chaque entreprise, donner sa raison sociale et son dernier devis (code et date et son Chiffre d’affaires prévisionnel)



**中文**：对每家公司，列出公司名称及其最后一份报价的编号、日期和预计营业额。



来源：[C] 第 5 页，原题 29。



**题型**：每个对象内部的最大／最新；分组统计与数量门槛；保留零关联对象



**思路**：主解沿用最后＝最大编号。先按公司求最后编号，再单独汇总各报价金额，最后从全部公司外连接两个结果。



```sql

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

```



**易错点／口径**：每家公司各自取最新，不是所有公司共享全库最大。主解保留无报价公司：报价字段及 CA 为空；有报价但无明细时 CA 显示 0，以区分两者。



**自测反例（自行构造）**：A 公司最大编号 10，B 公司最大编号 30：应该各得到一份，不能只留下 B。



### C29 变式 1：按每家公司最新日期解释



先按公司求最新日期；同一公司同日多份最新报价全部保留。



```sql

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

```



## C30｜先求每份报价金额，再求平均



**FR**：Donner le CA (Chiffre d'Affaire) prévisionnel moyen d'un devis



**中文**：求每份报价的预计营业额的平均值。



来源：[C] 第 5 页，原题 30。



**题型**：二次汇总与多分支汇总



**思路**：第一层按报价把明细金额加总，第二层对每份报价的总额求 AVG。主解让无明细报价按 0 参与平均。



```sql

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

```



**易错点／口径**：直接 AVG(明细工时 × 费率) 得到的是平均明细金额，不是平均报价金额。若课程只考虑有明细的报价，改为内连接；空表没有任何报价时 AVG 为 NULL。



**自测反例（自行构造）**：报价 A 两行各 50，报价 B 一行 300：平均报价应为 (100+300)/2=200，不是 400/3。



## C31｜类别 CA 与 SOL 比较



**FR**：Donner le nom de la gamme proposant un CA prévisionnel plus élevé que la gamme SOL



**中文**：列出预计营业额高于 SOL 类别的工作类别名称。



来源：[C] 第 5 页，原题 31。



**题型**：与指定对象比较



**思路**：先按工作类别累计其所有工种的预计金额，再与 SOL 的统计值比较。



```sql

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

```



**易错点／口径**：原题使用 SOL，但前一页列举的类别名称中没有 SOL。这里保留原词，不擅自替换为别的工种或类别；代码要求实际存在且唯一的 SOL 类别，否则参考值缺失或不唯一。



**自测反例（自行构造）**：不要把工种 Revêtement de sol 自动当成工作类别 SOL。



## C32｜报价数量最多的公司



**FR**：Donner la raison sociale des entreprises ayant proposé le plus de devis



**中文**：列出提出报价数量最多的公司名称。



来源：[C] 第 5 页，原题 32。



**题型**：分组统计结果的最值



**思路**：先按有报价的公司数报价，再在这些计数结果中找最大，保留并列。



```sql

WITH Stats AS (
    SELECT E.NSIRET, E.RaisonSoc, COUNT(D.CodeDE) AS Nb
    FROM ENTREPRISE E
    JOIN DEVIS D ON D.NSIRET = E.NSIRET
    GROUP BY E.NSIRET, E.RaisonSoc
)
SELECT S.RaisonSoc
FROM Stats S
WHERE S.Nb = (SELECT MAX(R.Nb) FROM Stats R);

```



**易错点／口径**：主解把 ayant proposé 理解为有实际报价。不能用 MAX(CodeDE) 代替最多报价，那会变成最新编号。所有公司都没有报价时主解不返回对象。



**自测反例（自行构造）**：公司 A 编号 99 一份，公司 B 编号 1、2 两份：应选 B。



## C33｜参与人数最多，不是工作记录最多



**FR**：Donner les coordonnées du chantier (code, rue, ville) ayant fait intervenir le plus d’employés cette année (dans le cadre des devis).



**中文**：列出今年在报价框架内参与员工人数最多的工地信息：编号、街道、城市。



来源：[C] 第 5 页，原题 33。



**题型**：日期、时长与区间重叠；分组统计结果的最值



**思路**：限定实际工作 DateT 为今年，按工地数不同员工，再比较各工地人数。



```sql

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

```



**易错点／口径**：同一员工多天工作、参与多份报价，仍只算一个人。主解比较今年确有报价内工作的工地。



**自测反例（自行构造）**：A 工地一人工作 20 天、B 工地两人各 1 天：按人数应选 B。



## C34｜保留所有工地的报价外实际营业额



**FR**：Pour chaque chantier donner son code et son CA réalisé hors devis



**中文**：对每个工地，列出编号及报价外实际营业额。



来源：[C] 第 5 页，原题 34。



**题型**：分组统计与数量门槛；保留零关联对象



**思路**：从全部工地外连接报价外工作，用实际工时 NbHeureTrav 乘客户费率；缺失金额显示 0。



```sql

SELECT CH.CodeCH,
       NVL(SUM(TH.NbHeureTrav * T.Tarif_Heure_Clt), 0) AS CA_Hors
FROM CHANTIER CH
LEFT JOIN TRAVAILLERHORSDEVIS TH ON TH.CodeCH = CH.CodeCH
LEFT JOIN TYPETRAVAUX T ON T.CodeTY = TH.CodeTY
GROUP BY CH.CodeCH;

```



**易错点／口径**：题目要营业额，不是工资或利润，所以乘客户费率，不是员工费率。主解明确把未发生的金额显示为 0。



**自测反例（自行构造）**：完全没有报价外工作的工地应保留，金额为 0。



## C35｜保留所有工地的报价内实际营业额



**FR**：Pour chaque chantier, donner son code et son CA réalisé dans le cadre des devis



**中文**：对每个工地，列出编号及报价内实际营业额。



来源：[C] 第 5 页，原题 35。



**题型**：分组统计与数量门槛；保留零关联对象



**思路**：经 DEVIS 找到报价内工作，使用 NbHeureTravDEVIS × 客户费率。未发生金额显示 0。



```sql

SELECT CH.CodeCH,
       NVL(SUM(TD.NbHeureTravDEVIS * T.Tarif_Heure_Clt), 0) AS CA_Devis
FROM CHANTIER CH
LEFT JOIN DEVIS D ON D.CodeCH = CH.CodeCH
LEFT JOIN TRAVAILLERDEVIS TD ON TD.CodeDE = D.CodeDE
LEFT JOIN TYPETRAVAUX T ON T.CodeTY = TD.CodeTY
GROUP BY CH.CodeCH;

```



**易错点／口径**：这是实际工时，不是 COMPRENDRE.NbHeuresPrev。不要把报价明细 C 再只按 CodeDE 连进来，会导致明细与工作记录相互乘倍。



**自测反例（自行构造）**：一份报价有 3 个预计工种、2 条实际工作记录，不能把 2 条工作放大成 6 条后求金额。



## C36｜两个一对多分支先汇总再合并



**FR**：Pour chaque chantier donner son CA total (en se limitant aux chantiers ayant des CA hors devis et des CA devis)



**中文**：列出各工地的总营业额，但仅限同时具有报价内营业额和报价外营业额的工地。



来源：[C] 第 5 页，原题 36。



**题型**：二次汇总与多分支汇总



**思路**：报价内、报价外各自按工地汇总成一行，再 INNER JOIN，保证两类都存在且不会重复累计。



```sql

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

```



**易错点／口径**：若直接连两边明细，2 条 × 3 条会形成 6 条。SUM(DISTINCT 金额) 不是正确通用修复，因为真实不同记录可能金额相同。



**自测反例（自行构造）**：报价内 100+100、报价外 50+50+50，正确总额是 350。



## C37｜工地数量最大的城市



**FR**：Donner le nom des villes possédant le plus chantiers.



**中文**：列出拥有工地数量最多的城市名称。



来源：[C] 第 5 页，原题 37。



**题型**：分组统计结果的最值；保留零关联对象



**思路**：先按城市编号统计工地数，再与这些计数的最大值比较。主解让全部 VILLE 参与，包括零工地城市。



```sql

WITH Stats AS (
    SELECT V.CodeV, V.NomV, COUNT(CH.CodeCH) AS Nb
    FROM VILLE V
    LEFT JOIN CHANTIER CH ON CH.CodeV = V.CodeV
    GROUP BY V.CodeV, V.NomV
)
SELECT S.NomV
FROM Stats S
WHERE S.Nb = (SELECT MAX(R.Nb) FROM Stats R);

```



**易错点／口径**：不能只按城市名称合并不同同名城市。若所有城市都零工地，主解把它们视为并列最大；若课程要求实际拥有工地，第一层改为 JOIN。



**自测反例（自行构造）**：两座城市都有 5 个工地且并列最多：两座都要返回。



## C38｜总预计工时与 Plomberie 比较



**FR**：Donner les noms des types de travaux ayant plus d’heures prévisionnelles totales que le type plomberie



**中文**：列出预计总工时多于 Plomberie（水暖／管道工程）工种的工种名称。



来源：[C] 第 5 页，原题 38。



**题型**：与指定对象比较



**思路**：按工种累计 NbHeuresPrev，再与参考工种的同口径总和比较。



```sql

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

```



**易错点／口径**：用前页列表的 Plomberie 拼写作为示例，实际文本以数据为准。假定它唯一标识参考工种。比较工时，不是 COUNT 报价或金额。



**自测反例（自行构造）**：报价出现次数更多但每次工时更少，不一定符合条件。



## C39｜今年报价外总工时最多的公司



**FR**：Nom et type de la société ayant effectué le plus d’heures hors devis cette année.



**中文**：列出今年报价外实际工作总工时最多的公司名称和公司类型。



来源：[C] 第 5 页，原题 39。



**题型**：日期、时长与区间重叠；分组统计结果的最值



**思路**：报价外工作没有直接的公司编号，经 EMPLOYE 找雇主；按公司累计今年 DateT 对应的实际工时。



```sql

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

```



**易错点／口径**：主解比较今年确有报价外工作的公司。公司归属来自做工的员工，不是工地城市，也不能借 DEVIS 间接猜测。



**自测反例（自行构造）**：一家公司人数最多不等于总工时最多；本题的指标是 SUM 工时。



## C40｜今年覆盖 31 省全部工地



**FR**：Donner le nom et le prénom des employés ayant travaillé dans le cadre des devis sur tous les chantiers de la Haute Garonne (département 31) cette année.



**中文**：列出今年在报价框架内，到过 Haute-Garonne（31 省）所有工地工作的员工姓与名。



来源：[C] 第 5 页，原题 40。



**题型**：日期、时长与区间重叠；覆盖全部目标（tous）



**思路**：外层是当前员工；第一层子查询枚举 31 省全部工地；第二层检查该员工今年是否在该工地有报价内工作。



```sql

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

```



**易错点／口径**：目标是 31 省全部工地，不是“31 省今年有人做过工的工地”。同一工地做了 100 次也只覆盖一个目标。若无目标工地，主解按全称逻辑返回全部员工。



**自测反例（自行构造）**：31 省有一个工地今年完全没人工作：没有员工能够覆盖全部目标。



### C40 变式 1：计数写法



目标集合非空、外键有效时，可先将达成记录限定到 31 省，再数不同工地。



```sql

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

```



## C41｜C12 的同型题：只发生报价内工作



**FR**：Code des chantiers n’ayant été réalisés qu’avec des travaux défini dans un devis (pas de travaux hors devis)



**中文**：列出仅通过报价中定义的工作进行施工、没有报价外工作的工地编号。



来源：[C] 第 5 页，原题 41。



**题型**：只有允许项（uniquement）



**思路**：按题干括号，将它理解为“有报价内工作且没有报价外工作”，与 C12 同型，只是输出列更少。



```sql

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

```



**易错点／口径**：这里遵循括号“pas de travaux hors devis”，不另加“每条实际工种必须出现在 COMPRENDRE 中”的数据一致性约束；那是另一种更强的检查，题干未明确要求。



**自测反例（自行构造）**：与 C12 对比：逻辑应一致，差别仅是 C12 还输出城市。



## C42｜只有两类允许工作，不自动要求两类齐全



**FR**：Donner le code des devis contenant uniquement des travaux des gammes gros œuvre et second œuvre



**中文**：列出只包含 Gros œuvre 和 Second œuvre 这两种允许类别工作的报价编号。



来源：[C] 第 5 页，原题 42。



**题型**：只有允许项（uniquement）



**思路**：主解将其解释为非空报价且不含允许集合之外的类别；单独只有其中一类也符合此解释。



```sql

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

```



**易错点／口径**：“只允许 A、B”与“必须 A、B 都出现且不能有其他”是不同条件。原文对后一项存在解释空间；下方给出更强版本。



**自测反例（自行构造）**：只有主体工程的报价：主解通过，“两类都必须出现”的版本不通过。



### C42 变式 1：更强解释：恰好这两类，两类均出现



内连接保证有明细；反例计数为零排除其他类别，再要求不同的允许名称数为 2。



```sql

SELECT D.CodeDE
FROM DEVIS D
JOIN COMPRENDRE C ON C.CodeDE = D.CodeDE
JOIN TYPETRAVAUX T ON T.CodeTY = C.CodeTY
JOIN GAMMETRAVAUX G ON G.idGA = T.idGA
GROUP BY D.CodeDE
HAVING SUM(CASE WHEN G.NomGA IN ('Gros œuvre', 'Second œuvre')
                THEN 0 ELSE 1 END) = 0
   AND COUNT(DISTINCT G.NomGA) = 2;

```



## C43｜整个省没有公司，不是某个城市没有



**FR**：Donner le code des départements n’accueillant aucune société



**中文**：列出没有任何公司的省份代码。



来源：[C] 第 5 页，原题 43。



**题型**：不存在指定关联



**思路**：模式没有独立 DEPARTEMENT 表，候选省份只能来自 VILLE。对当前省的所有城市重新查询，确认没有任何公司。



```sql

SELECT DISTINCT V.CodeDeptV
FROM VILLE V
WHERE NOT EXISTS (
    SELECT 1
    FROM VILLE V2
    JOIN ENTREPRISE E ON E.CodeV = V2.CodeV
    WHERE V2.CodeDeptV = V.CodeDeptV
);

```



**易错点／口径**：V2 是重新读取当前省的全部城市；只检查 E.CodeV = V.CodeV 只能证明当前城市没有公司。完全没有 VILLE 记录的省，无法从给定模式中枚举。



**自测反例（自行构造）**：同省 A 城无公司、B 城有公司：该省必须被排除。



## C44｜公司数最多的省份，保留并列



**FR**：Donner le code du ou des départements accueillant le plus grand nombre de sociétés



**中文**：列出接纳公司数量最多的一个或多个省份代码。



来源：[C] 第 5 页，原题 44。



**题型**：分组统计结果的最值；保留零关联对象



**思路**：以 VILLE 中可枚举的省份为集合，按省统计公司数，再保留最大。



```sql

WITH Stats AS (
    SELECT V.CodeDeptV, COUNT(E.NSIRET) AS Nb
    FROM VILLE V
    LEFT JOIN ENTREPRISE E ON E.CodeV = V.CodeV
    GROUP BY V.CodeDeptV
)
SELECT S.CodeDeptV
FROM Stats S
WHERE S.Nb = (SELECT MAX(R.Nb) FROM Stats R);

```



**易错点／口径**：一家公司在模式里属于一座城市，这条连接路径不会重复公司。主解允许全库零公司时所有已知省份并列为 0；正数要求可另加 Nb > 0。



**自测反例（自行构造）**：两座同省城市各 3 家公司，应按省合计 6 家。



## C45｜一个省覆盖集团全部公司



**FR**：Donner le code des départements accueillant toutes les sociétés du groupe



**中文**：列出接纳该集团全部公司的省份代码。



来源：[C] 第 5 页，原题 45。



**题型**：覆盖全部目标（tous）



**思路**：将题设 BatiTP 集团理解为 ENTREPRISE 中的全部公司。逐省检查，不存在一家不是位于该省的公司。



```sql

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

```



**易错点／口径**：这里不是按 GroupeSoc 的每个子集团分别做题。原背景把 GroupeSoc 定义为子集团，而题目使用整体集团。空公司集合按全称逻辑返回所有可枚举省份。



**自测反例（自行构造）**：只要全集团有一家公司在另一个省，当前省就不能通过。



### C45 变式 1：计数写法



在目标公司集合非空的通常数据中，比较省内不同公司数与集团总公司数。



```sql

SELECT V.CodeDeptV
FROM VILLE V
JOIN ENTREPRISE E ON E.CodeV = V.CodeV
GROUP BY V.CodeDeptV
HAVING COUNT(DISTINCT E.NSIRET) = (
    SELECT COUNT(*) FROM ENTREPRISE
);

```



## C46｜公司数多于 75 省



**FR**：Donner le code des départements accueillant plus de société que le département 75.



**中文**：列出公司数量多于 75 省的省份代码。



来源：[C] 第 5 页，原题 46。



**题型**：与指定对象比较



**思路**：外层统计当前省，内层独立统计参考省 75；V2、E2 是重新读取参考集合的表引用。



```sql

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

```



**易错点／口径**：如果把内层省份条件写成 V2.CodeDeptV = V.CodeDeptV，就变成与自身比较。内层 COUNT 没有 GROUP BY，参考省零公司时返回 0。



**自测反例（自行构造）**：75 省有 3 家，当前省也 3 家：不通过，必须严格更多。



## H1｜称谓转换与可选公司



**FR**：Pour chaque client, donner sa civilité en clair (Monsieur ou Madame), son nom, son prénom et éventuellement le nom et le domaine de sa société



**中文**：对每位客户，显示完整称谓（Monsieur 或 Madame）、姓、名，以及其公司名称和业务领域（如有公司）。



来源：[H] 第 1 页，原题 1。



**题型**：基础连接、逐行筛选与显示；保留零关联对象



**思路**：CASE 转换称谓，Client LEFT JOIN Societe 保留没有公司的客户。



```sql

SELECT CASE C.CiviC
           WHEN 'M.' THEN 'Monsieur'
           WHEN 'Mme' THEN 'Madame'
           ELSE C.CiviC
       END AS Civilite,
       C.NomC, C.PrenomC, S.RaisonSoc, S.DomaineSoc
FROM Client C
LEFT JOIN Societe S ON S.CodeSoc = C.CodeSoc;

```



**易错点／口径**：不需要 GROUP BY。将 LEFT JOIN 改为 JOIN 会漏掉没有公司的客户。称谓代码按原题给出的 M.、Mme；实际字符串应与数据一致。



**自测反例（自行构造）**：CodeSoc 为 NULL 的客户也必须出现。



## H2｜公司至少一笔今年开始的预订



**FR**：Nom des sociétés ayant effectué au moins une réservation débutant cette année



**中文**：列出至少有一笔抵达日期在今年的预订的公司名称。



来源：[H] 第 1 页，原题 2。



**题型**：日期、时长与区间重叠；至少存在／两类同时存在



**思路**：公司经客户关联预订。只检查 DateArr 所在年份，不限制 DateDep。



```sql

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

```



**易错点／口径**：débutant 指开始住宿的 DateArr，不是实际创建预订的日期；模式没有创建预订日期字段。



**自测反例（自行构造）**：今年抵达、明年离开的预订符合本题。



## H3｜恰好十笔今年开始的预订



**FR**：Nom des sociétés ayant effectué dix réservations débutant cette année



**中文**：列出恰好有 10 笔今年开始的预订的公司名称。



来源：[H] 第 1 页，原题 3。



**题型**：日期、时长与区间重叠；分组统计与数量门槛



**思路**：先筛今年抵达的预订，再按公司数预订记录，用 HAVING = 10。



```sql

SELECT S.RaisonSoc
FROM Societe S
JOIN Client C ON C.CodeSoc = S.CodeSoc
JOIN Reserver R ON R.CodeC = C.CodeC
WHERE EXTRACT(YEAR FROM R.DateArr)
      = EXTRACT(YEAR FROM SYSDATE)
GROUP BY S.CodeSoc, S.RaisonSoc
HAVING COUNT(*) = 10;

```



**易错点／口径**：这里数笔数，不是房间数，也不是预订客户数。此连接路径每条预订只对应一个客户和一个公司，因此 COUNT(*) 可数笔数。



**自测反例（自行构造）**：1 笔订 10 间房不等于 10 笔预订；今年 10 笔且去年还有预订，仍通过本题。



## H4｜没有到达、离开均在 2018 的预订



**FR**：Nom des sociétés n’ayant effectué aucune réservation en 2018 (arrivées et départs en 2018)



**中文**：列出没有任何“抵达和离开都在 2018 年”的预订的公司名称。



来源：[H] 第 1 页，原题 4。



**题型**：日期、时长与区间重叠；不存在指定关联



**思路**：原题括号明确规定两个日期都在 2018。NOT EXISTS 只排除同时满足这两个日期条件的关联预订。



```sql

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

```



**易错点／口径**：不能换成“与 2018 有重叠”的版本；那会禁止更多跨年预订。完全没有预订的公司满足“没有这类预订”。



**自测反例（自行构造）**：只有 2017-12-30 至 2018-01-03 的预订：主解不会据此排除公司。



## H5｜原题的 toutes 存在方向歧义



**FR**：Nom des sociétés ayant effectué toutes réservations débutant cette année



**中文**：列出进行了所有今年开始的预订的公司名称。原文也可能想表达“其全部预订都在今年开始”，两种理解须区分。



来源：[H] 第 1 页，原题 5。



**题型**：日期、时长与区间重叠；覆盖全部目标（tous）；只有允许项（uniquement）



**思路**：主解按字面“覆盖全库所有今年开始的预订”：不存在一笔今年开始的预订，不属于当前公司的客户。



```sql

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

```



**易错点／口径**：这是可能的字面解释，不是已确认的教师答案。若今年某笔预订来自没有公司的个人客户，则没有公司能覆盖全部；若今年没有预订，主解按全称逻辑返回全部公司。



**自测反例（自行构造）**：公司 A 的全部预订都在今年，但今年还有公司 B 的预订：A 满足下方“只有今年开始”解释，却不满足主解。



### H5 变式 1：另一读法：本公司的预订全部在今年开始



要求公司确有预订，并排除其任何不是今年开始的预订；不限制离开日期。



```sql

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

```



## H6｜所有预订都在今年到达并离开



**FR**：Nom des sociétés n’ayant effectué que des réservations cette année (arrivée et départ cette année)



**中文**：列出只做过今年预订的公司名称：其预订均在今年抵达、今年离开。



来源：[H] 第 1 页，原题 6。



**题型**：日期、时长与区间重叠；只有允许项（uniquement）



**思路**：先要求有预订，再排除任意“抵达不在今年，或离开不在今年”的预订。未知日期在主解中视为无法证明满足要求。



```sql

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

```



**易错点／口径**：好条件是 A AND B，其反例是 NOT A OR NOT B。不能用 AND 连接两个年份不符条件，否则会漏掉只有一个日期跨年的预订。



**自测反例（自行构造）**：今年 12 月抵达、明年 1 月离开：公司不能通过 H6，但可通过 H2。



## H7｜两晚不是两笔预订



**FR**：Nom et prénom des clients ayant effectué une réservation de 2 nuits



**中文**：列出做过一笔两晚住宿预订的客户姓与名。



来源：[H] 第 1 页，原题 7。



**题型**：日期、时长与区间重叠；至少存在／两类同时存在



**思路**：检查一条预订的 DateDep - DateArr 是否为 2；从客户出发用 EXISTS 防止重复。



```sql

SELECT C.NomC, C.PrenomC
FROM Client C
WHERE EXISTS (
    SELECT 1 FROM Reserver R
    WHERE R.CodeC = C.CodeC
      AND R.DateDep - R.DateArr = 2
);

```



**易错点／口径**：主解假定日期按天记录，或题目按精确两天间隔计算。若含入住、离店时间且按日历晚数算，可改为 TRUNC(DateDep)-TRUNC(DateArr)=2，但这是不同口径。



**自测反例（自行构造）**：一笔两晚应通过；两笔各一晚不能仅因笔数等于 2 就通过。



## H8｜恰好两笔与 2019 重叠的预订



**FR**：Nom et prénom des clients ayant effectué deux réservations en 2019 (ne pas se limiter à une arrivée et un départ cette année)



**中文**：列出在 2019 年有两笔预订的客户姓与名；需考虑跨年，不能只要求抵达和离开都在 2019。



来源：[H] 第 1 页，原题 8。



**题型**：日期、时长与区间重叠；分组统计与数量门槛



**思路**：把住宿区间与 2019 年做重叠判断，再按客户 COUNT(*) = 2。主解把离店日视为不占房，采用半开区间。



```sql

SELECT C.NomC, C.PrenomC
FROM Client C
JOIN Reserver R ON R.CodeC = C.CodeC
WHERE R.DateArr < DATE '2020-01-01'
  AND R.DateDep > DATE '2019-01-01'
GROUP BY C.CodeC, C.NomC, C.PrenomC
HAVING COUNT(*) = 2;

```



**易错点／口径**：只检查“到达或离开在 2019”会漏掉从 2018 跨到 2020 的长住宿。原题没有明确端点约定，教师采用包含离店日时需调整下界比较。



**自测反例（自行构造）**：2018-12-20 至 2020-01-02 这笔预订是否在 2019 有住宿？有，必须计入。



## H9｜2018 年开始的预订最多的客户



**FR**：Nom, prénom et ville du client ayant effectué le plus de réservations débutant en 2018



**中文**：列出 2018 年开始的预订笔数最多的客户的姓、名和城市。



来源：[H] 第 1 页，原题 9。



**题型**：日期、时长与区间重叠；分组统计结果的最值



**思路**：限定 DateArr 年份后按客户数预订，再比较最大。城市取客户的账单地址城市 VilleFacC。



```sql

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

```



**易错点／口径**：外层与参考最大值必须使用同一个 2018 候选集合。客户城市不是酒店城市。主解只比较确有 2018 开始预订的客户，且保留并列。



**自测反例（自行构造）**：全时期预订最多的客户，未必是 2018 年开始预订最多的客户。



## H10｜本集团原籍国超过十家酒店



**FR**：Nom des groupes hôteliers proposant plus de 10 hôtels dans le pays originaire du groupe



**中文**：列出在其原籍国拥有超过 10 家酒店的酒店集团名称。



来源：[H] 第 1 页，原题 10。



**题型**：基础连接、逐行筛选与显示；分组统计与数量门槛



**思路**：先按每个集团自己的 PaysOrigineGR 筛选酒店国家，再按集团数酒店。



```sql

SELECT G.NomGR
FROM Groupe G
JOIN Hotel H ON H.CodeGR = G.CodeGR
WHERE H.PaysH = G.PaysOrigineGR
GROUP BY G.CodeGR, G.NomGR
HAVING COUNT(H.CodeH) > 10;

```



**易错点／口径**：不能把全球酒店数与 10 比较；也不能把原籍国固定成 France。各集团的目标国家可能不同。



**自测反例（自行构造）**：全球 20 家、原籍国只有 8 家：不通过。



## H11｜法国三星酒店覆盖全部房型



**FR**：Nom des hôtels français de 3 étoiles proposant tous les types de chambres



**中文**：列出提供数据库中全部房型的法国三星级酒店名称。



来源：[H] 第 1 页，原题 11。



**题型**：覆盖全部目标（tous）



**思路**：候选酒店先满足法国、三星；目标集合为全部 TypeCH；不存在一种房型没有被当前酒店提供。



```sql

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

```



**易错点／口径**：目标不是“这个酒店自己提供过的所有房型”，而是 TypeCH 全表。空目标时主解保留所有法国三星候选酒店。



**自测反例（自行构造）**：某房型全库没有任何酒店提供，也不能从目标集合删去；它会使所有酒店都不满足覆盖全部。



### H11 变式 1：计数写法



适用于非空目标集合；Proposer 的键是酒店＋房型，COUNT DISTINCT 仍明确表达不同房型。



```sql

SELECT H.NomH
FROM Hotel H
JOIN Proposer P ON P.CodeH = H.CodeH
WHERE H.PaysH = 'France' AND H.NbetoilesH = 3
GROUP BY H.CodeH, H.NomH
HAVING COUNT(DISTINCT P.CodeTyCH) = (
    SELECT COUNT(*) FROM TypeCH
);

```



## H12｜不提供 suite，不是筛掉 suite 行



**FR**：Nom des hôtels français de 3 étoiles ne proposant pas le type de chambres « suite »



**中文**：列出不提供 suite（套房）房型的法国三星级酒店名称。



来源：[H] 第 1 页，原题 12。



**题型**：不存在指定关联



**思路**：先限定酒店，再排除其任何 suite 提供记录。



```sql

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

```



**易错点／口径**：WHERE NomTyCH <> 'suite' 仍会保留同时有套房和普通房的酒店。主解也保留完全没有提供记录的法国三星酒店，因为它确实没有 suite。



**自测反例（自行构造）**：酒店有 standard 和 suite：必须排除，不是只删 suite 那一行。



## H13｜客户在全部集团都预订过



**FR**：Nom des clients ayant réservé un hôtel dans tous les groupes hôteliers proposés par la BD



**中文**：列出在数据库中的每个酒店集团都预订过酒店的客户姓名。



来源：[H] 第 1 页，原题 13。



**题型**：覆盖全部目标（tous）



**思路**：目标是全部 Groupe，达成路径为当前客户的 Reserver → Hotel → CodeGR。



```sql

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

```



**易错点／口径**：同一集团预订了十家酒店，也只覆盖一个集团。不属于任何集团的酒店不会覆盖某个目标集团。空集团集合按全称逻辑处理。



**自测反例（自行构造）**：数据库中存在一个没有任何酒店的集团：没有客户能通过它的覆盖检查。



## H14｜与指定酒店的星级相同



**FR**：Nom des hôtels français ayant le même nombre d’étoiles que l’hôtel « le Lyon d’or » de « Toulouse »



**中文**：列出星级与 Toulouse 的“le Lyon d’or”酒店相同的法国酒店名称。



来源：[H] 第 1 页，原题 14。



**题型**：与指定对象比较



**思路**：子查询取得参考酒店星级，外层筛选法国酒店并与该属性比较。



```sql

SELECT H.NomH
FROM Hotel H
WHERE H.PaysH = 'France'
  AND H.NbetoilesH = (
      SELECT H2.NbetoilesH
      FROM Hotel H2
      WHERE H2.NomH = 'le Lyon d''or'
        AND H2.VilleH = 'Toulouse'
  );

```



**易错点／口径**：主解假定酒店名称＋城市唯一定位参考酒店，模式没有保证这种唯一性；多个结果时应明确 CodeH，不能随便加 MAX。示例将名称中的撇号用 SQL 的两个单引号转义，真实字符串需匹配数据。没有要求排除参考酒店自身。



**自测反例（自行构造）**：另一个城市同名酒店不应影响参考星级。



## H15｜房型种类最多的酒店



**FR**：Nom et villes des hôtels proposant le plus de types de chambres



**中文**：列出提供房型种类最多的酒店名称及城市。



来源：[H] 第 1 页，原题 15。



**题型**：分组统计结果的最值



**思路**：先按有提供记录的酒店统计不同房型，再与最大种类数比较。



```sql

WITH Stats AS (
    SELECT P.CodeH, COUNT(DISTINCT P.CodeTyCH) AS NbTypes
    FROM Proposer P
    GROUP BY P.CodeH
)
SELECT H.NomH, H.VilleH
FROM Stats S
JOIN Hotel H ON H.CodeH = S.CodeH
WHERE S.NbTypes = (SELECT MAX(R.NbTypes) FROM Stats R);

```



**易错点／口径**：房型种类数不是房间总量。主解比较实际提供过房型的酒店；全库没有 Proposer 时不返回酒店。



**自测反例（自行构造）**：A 酒店 2 种房型共 100 间，B 酒店 3 种共 10 间：本题选 B。



## H16｜预订全库最长住宿的公司



**FR**：Nom des sociétés ayant réservé le séjour le plus long



**中文**：列出预订了最长住宿的公司名称。



来源：[H] 第 1 页，原题 16。



**题型**：日期、时长与区间重叠；原始值的最大、最小、最新



**思路**：主解把“最长”比较范围取为 Reserver 全部预订，再返回拥有同等最长住宿的公司。



```sql

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

```



**易错点／口径**：原题未明确最长是否只在公司关联预订中比较。若最长住宿来自无公司的个人客户，主解可能没有公司符合；不能把这个范围差异隐藏。DateDep 为空的时长无法参与通常的 MAX 比较。



**自测反例（自行构造）**：个人最长 20 晚、公司最长 10 晚：全库最长口径无公司结果，公司内部候选口径会返回 10 晚的公司。



### H16 变式 1：另一口径：只在公司关联预订中比较最长



先构造所有公司相关住宿的集合，再在同一集合取最大。



```sql

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

```



## H17｜最短住宿的比较范围需要明确



**FR**：Nom des sociétés ayant réservé le séjour le plus court dans la ville de la société



**中文**：列出在公司所在城市预订了最短住宿的公司名称。



来源：[H] 第 1 页，原题 17。



**题型**：基础连接、逐行筛选与显示；日期、时长与区间重叠；原始值的最大、最小、最新



**思路**：主解先保留“酒店城市＝预订所属公司城市”的住宿，再在这些合格住宿中取全局最短。



```sql

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

```



**易错点／口径**：原文没有消除“所有公司所在地住宿的全局最短”“每个城市的最短”“每个公司自己的最短”之间的歧义。主解只是一种明确口径。模式只有城市文本，无法额外识别同名城市的行政区。



**自测反例（自行构造）**：A 城最短 2 晚、B 城最短 1 晚：全局口径只返回 1 晚对应公司；按各城市口径可能都返回。



### H17 变式 1：另一口径：与公司所在城市全部住宿的最短比较



对每家公司，在其所在地城市的全部预订（含其他公司和个人）中求最短。



```sql

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

```



## H18a｜最常被提供：按提供记录数量



**FR**：Nom du type de chambre le plus proposé — a. Au sein de la table PROPOSER



**中文**：列出最常被提供的房型名称；a 小问按 PROPOSER 表中的出现次数计算。



来源：[H] 第 1 页，原题 18a。



**题型**：分组统计结果的最值



**思路**：Proposer 的主键为酒店＋房型，因此按房型 COUNT(*) 就是提供该房型的酒店数量。



```sql

WITH Stats AS (
    SELECT P.CodeTyCH, COUNT(*) AS NbHotels
    FROM Proposer P
    GROUP BY P.CodeTyCH
)
SELECT T.NomTyCH
FROM Stats S
JOIN TypeCH T ON T.CodeTyCH = S.CodeTyCH
WHERE S.NbHotels = (SELECT MAX(R.NbHotels) FROM Stats R);

```



**易错点／口径**：这里不是 SUM(NbChambres)。主解在实际出现过的房型中比较；无任何提供记录时不返回结果。原题 H18 的共同题干与 a 小问在本条合并展示。



**自测反例（自行构造）**：A 房型 5 家酒店各 1 间，B 房型 1 家酒店 100 间：18a 选 A。



## H18b｜最常被提供：按总房间数量



**FR**：Nom du type de chambre le plus proposé — b. Autrement dit, le type possédant le plus de chambres



**中文**：列出最常被提供的房型名称；b 小问指总房间数量最多的房型。



来源：[H] 第 1 页，原题 18b。



**题型**：分组统计结果的最值



**思路**：按房型把所有酒店的 NbChambres 加总，再在总和中取最大。



```sql

WITH Stats AS (
    SELECT P.CodeTyCH, SUM(P.NbChambres) AS NbChambres
    FROM Proposer P
    GROUP BY P.CodeTyCH
)
SELECT T.NomTyCH
FROM Stats S
JOIN TypeCH T ON T.CodeTyCH = S.CodeTyCH
WHERE S.NbChambres = (SELECT MAX(R.NbChambres) FROM Stats R);

```



**易错点／口径**：18a 和 18b 只有统计函数不同，但回答的问题不同。这里使用提供数量 NbChambres，不是预订数量 NombreCH。



**自测反例（自行构造）**：沿用 18a 的例子，18b 应选 B。



## H19｜公司预订过全部房型



**FR**：Nom des sociétés ayant réservé tous les types de chambres



**中文**：列出预订过数据库中全部房型的公司名称。



来源：[H] 第 2 页，原题 19。



**题型**：覆盖全部目标（tous）



**思路**：外层公司、目标房型、覆盖关系三层。公司所有客户的预订可以合起来覆盖房型。



```sql

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

```



**易错点／口径**：同一公司不同客户分别预订不同房型可以共同完成覆盖，不要求某一个客户独自订过全部。空房型集合按全称逻辑处理。



**自测反例（自行构造）**：公司订同一种房型 100 次，不能代替订另一个缺失房型。



### H19 变式 1：计数写法



在目标集合非空且外键有效时，与主解对通常数据等价；目标为空时不能不加说明地宣称等价。



```sql

SELECT S.RaisonSoc
FROM Societe S
JOIN Client C ON C.CodeSoc = S.CodeSoc
JOIN Reserver R ON R.CodeC = C.CodeC
GROUP BY S.CodeSoc, S.RaisonSoc
HAVING COUNT(DISTINCT R.CodeTyCH) = (
    SELECT COUNT(*) FROM TypeCH
);

```



## H20｜客户＋房型的累计预订房间数最大



**FR**：Noms du client et du type de chambre pour lequel le nombre de chambres réservées est le plus grand (un client peut réserver plusieurs fois le même type de chambres)



**中文**：列出累计预订房间数最多的“客户—房型”组合中的客户姓名和房型名称；同一客户可多次预订同一种房型。



来源：[H] 第 2 页，原题 20。



**题型**：分组统计结果的最值



**思路**：按两个键 CodeC、CodeTyCH 分组，对 NombreCH 求和，再比较这些组合的累计值。



```sql

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

```



**易错点／口径**：不能只按客户分组，也不能只取 MAX(NombreCH) 的最大单笔。为便于核对，额外显示累计数。原模式无独立 reservation ID，本题不需要虚构一个。



**自测反例（自行构造）**：A 对套房订 4 间＋4 间，B 对套房订 7 间：累计最大是 A 的 8，不是 B 的单笔 7。



## H21｜酒店数量最多的集团



**FR**：Nom du groupe proposant le plus d’hôtels



**中文**：列出拥有酒店数量最多的集团名称。



来源：[H] 第 2 页，原题 21。



**题型**：分组统计结果的最值；保留零关联对象



**思路**：按每个集团统计实际匹配的酒店数，再取最大；主解保留全部集团作为候选。



```sql

WITH Stats AS (
    SELECT G.CodeGR, G.NomGR, COUNT(H.CodeH) AS NbHotels
    FROM Groupe G
    LEFT JOIN Hotel H ON H.CodeGR = G.CodeGR
    GROUP BY G.CodeGR, G.NomGR
)
SELECT S.NomGR
FROM Stats S
WHERE S.NbHotels = (SELECT MAX(X.NbHotels) FROM Stats X);

```



**易错点／口径**：不属于任何集团的酒店不算给某个集团。若所有集团均零酒店，主解把它们视为并列；若要求实际拥有酒店，再加 NbHotels > 0。



**自测反例（自行构造）**：两个集团各有 12 家且并列最多：不能只取一行。



## H22｜员工人数在模式中没有完整记录



**FR**：Nom des sociétés ayant plus de 10 employés



**中文**：列出员工人数超过 10 人的公司名称。



来源：[H] 第 2 页，原题 22。



**题型**：分组统计与数量门槛



**思路**：原模式只有 Client 与 Societe 关系，没有员工表，也没有声明全部员工都登记为客户。下列 SQL 仅在课程将关联 Client 作为员工记录的解释下成立。



```sql

SELECT S.RaisonSoc
FROM Societe S
JOIN Client C ON C.CodeSoc = S.CodeSoc
GROUP BY S.CodeSoc, S.RaisonSoc
HAVING COUNT(C.CodeC) > 10;

```



**易错点／口径**：严格按给定数据，能算的是“关联客户数量超过 10”，不能由此证明真实员工总人数。这里明确标注题目所需的额外解释，不虚构 EMPLOYE 表。



**自测反例（自行构造）**：公司真实有 100 名员工，但仅 3 人登记为客户：此数据库无法据此恢复真实员工人数。



## H23｜预订最少的房型，零次也参加



**FR**：Nom du type de chambre ayant le moins de succès (ayant le plus petit nombre de réservations)



**中文**：列出最不受欢迎的房型名称，即预订笔数最少的房型。



来源：[H] 第 2 页，原题 23。



**题型**：分组统计结果的最值；保留零关联对象



**思路**：主解让全部房型参与比较，零预订房型计为 0。外连接 Reserver 并 COUNT 其非空客户键。



```sql

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

```



**易错点／口径**：题干没有说明是否排除零预订房型。主解包含零；只在被预订过的房型中选最少时，把第一层 LEFT JOIN 改为 JOIN。不能用 COUNT(*) 计算外连接下的预订数。



**自测反例（自行构造）**：房型 A 零笔、B 一笔：包含零的口径应选 A。



## H24｜覆盖集团原籍国的全部酒店



**FR**：Nom du groupe hôtelier proposant tous les hôtels du pays dont le groupe est originaire



**中文**：列出拥有其原籍国全部酒店的酒店集团名称。



来源：[H] 第 2 页，原题 24。



**题型**：覆盖全部目标（tous）；不存在指定关联



**思路**：对每个集团，目标集合随其原籍国变化。找不到一家位于该国却不属于当前集团的酒店，即覆盖成功。



```sql

SELECT G.NomGR
FROM Groupe G
WHERE NOT EXISTS (
    SELECT 1
    FROM Hotel H
    WHERE H.PaysH = G.PaysOrigineGR
      AND (H.CodeGR <> G.CodeGR OR H.CodeGR IS NULL)
);

```



**易错点／口径**：CodeGR 可为空：独立酒店同样属于“该国全部酒店”，会成为反例，不能被 <> 与 NULL 的未知逻辑漏掉。集团可同时拥有国外酒店。若该国完全无酒店，主解按全称逻辑通过；需真实拥有本国酒店时额外加 EXISTS。



**自测反例（自行构造）**：本国所有已归集团的酒店都归 G，但另有一家独立酒店：G 仍不满足“全部”。



## H25｜本国酒店数量最多的集团



**FR**：Nom du groupe hôtelier proposant le plus d’hôtels dans le pays dont le groupe est originaire



**中文**：列出在其各自原籍国拥有酒店数量最多的酒店集团名称。



来源：[H] 第 2 页，原题 25。



**题型**：基础连接、逐行筛选与显示；分组统计结果的最值



**思路**：各集团先只数本国酒店，再对这些本国数量取最大。主解比较至少有一家本国酒店的集团。



```sql

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

```



**易错点／口径**：不把所有集团固定到同一个国家。要把零本国酒店的集团也作为候选，应将国家条件放到 LEFT JOIN 的 ON 中；主解无本国酒店候选时不返回。



**自测反例（自行构造）**：A 本国 5、国外 100；B 本国 6、国外 0：本题选 B。



## H26｜只有二星、三星酒店



**FR**：Nom des groupes hôteliers proposant uniquement des hôtels 2 et 3 étoiles



**中文**：列出只拥有二星和三星酒店的酒店集团名称。



来源：[H] 第 2 页，原题 26。



**题型**：只有允许项（uniquement）



**思路**：要求至少有一家酒店，且没有任何二星、三星以外的酒店；未知星级也视为不能证明符合。



```sql

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

```



**易错点／口径**：主解解释为星级只能属于 {2,3}，不要求两种都出现。完全没有酒店的集团不通过。未知星级排除是明确的证明口径，不是原题给出的额外事实。



**自测反例（自行构造）**：一家三星＋一家五星：不能仅筛掉五星后保留集团；只有三星的集团在主解中通过。



### H26 变式 1：更强解释：二星、三星都必须有，且没有其他星级



内连接要求有酒店，反例数为零，再要求两种不同星级。



```sql

SELECT G.NomGR
FROM Groupe G
JOIN Hotel H ON H.CodeGR = G.CodeGR
GROUP BY G.CodeGR, G.NomGR
HAVING SUM(CASE WHEN H.NbetoilesH IN (2, 3)
                THEN 0 ELSE 1 END) = 0
   AND COUNT(DISTINCT H.NbetoilesH) = 2;

```



## H27｜只有二星三星，并统计酒店数



**FR**：Nom des groupes hôteliers proposant uniquement des hôtels 2 et 3 étoiles ainsi que le nombre d’hôtels (2 ou 3 étoiles) pour chacun de ces groupes



**中文**：列出只拥有二星、三星酒店的集团名称，并显示每个集团这类酒店的数量。



来源：[H] 第 2 页，原题 27。



**题型**：只有允许项（uniquement）；分组统计与数量门槛



**思路**：先对整个集团排除任何不允许的酒店，再对留下的集团全部酒店计数。由于通过了整体约束，计数的全部酒店都是二星或三星。



```sql

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

```



**易错点／口径**：不能只用 WHERE H.NbetoilesH IN (2,3) 后分组，那会掩盖同集团其他星级酒店。与 H26 一样，主解不要求二星三星必须同时存在；需要时加 HAVING COUNT(DISTINCT H.NbetoilesH)=2。



**自测反例（自行构造）**：集团 A 有二星 2 家、五星 1 家：A 不应返回“2 家”。



### H27 变式 1：条件聚合写法



内连接保证非空，HAVING 数不允许记录为 0，可合并整体约束与数量统计。



```sql

SELECT G.NomGR, COUNT(H.CodeH) AS NbHotels
FROM Groupe G
JOIN Hotel H ON H.CodeGR = G.CodeGR
GROUP BY G.CodeGR, G.NomGR
HAVING SUM(CASE WHEN H.NbetoilesH IN (2, 3)
                THEN 0 ELSE 1 END) = 0;

```



## H28｜本国没有五星酒店



**FR**：Nom du groupe hôtelier ne proposant pas d’hôtels 5 étoiles dans son pays d’origine



**中文**：列出在其原籍国没有五星酒店的酒店集团名称。



来源：[H] 第 2 页，原题 28。



**题型**：不存在指定关联



**思路**：禁止条件是当前集团、本国、五星三项同时成立。任意不满足其中一项的酒店不是这道题的反例。



```sql

SELECT G.NomGR
FROM Groupe G
WHERE NOT EXISTS (
    SELECT 1
    FROM Hotel H
    WHERE H.CodeGR = G.CodeGR
      AND H.PaysH = G.PaysOrigineGR
      AND H.NbetoilesH = 5
);

```



**易错点／口径**：国外五星酒店允许存在；无本国酒店甚至无任何酒店的集团，也满足“本国没有五星”。不要将它升级为“全部酒店只能二三星”。



**自测反例（自行构造）**：法国原籍集团有西班牙五星酒店、法国三星酒店：应通过。



## H29｜法国城市中酒店数量最多



**FR**：Nom de la ville française proposant le plus d’hôtels



**中文**：列出拥有酒店数量最多的法国城市名称。



来源：[H] 第 2 页，原题 29。



**题型**：分组统计结果的最值



**思路**：先筛法国酒店，再按给定的 VilleH 文本分组，求酒店数最大。



```sql

WITH Stats AS (
    SELECT H.VilleH, COUNT(H.CodeH) AS NbHotels
    FROM Hotel H
    WHERE H.PaysH = 'France'
    GROUP BY H.VilleH
)
SELECT S.VilleH
FROM Stats S
WHERE S.NbHotels = (SELECT MAX(X.NbHotels) FROM Stats X);

```



**易错点／口径**：模式没有独立城市代码，只能按 VilleH 建模提供的信息分组，无法额外区分同名的不同法国城市。最大值候选集合也必须限于法国。



**自测反例（自行构造）**：国外城市酒店更多，不影响本题法国范围内的最大值。



## H30｜2018 无单笔超过十间的预订



**FR**：Nom de l’hôtel n’ayant pas de réservation de plus de 10 chambres en 2018 (les dates d'arrivée et de départ ne sont pas forcément en 2018)



**中文**：列出在 2018 年没有任何一笔超过 10 间房的预订的酒店名称；预订抵达和离开日期不一定都在 2018。



来源：[H] 第 2 页，原题 30。



**题型**：日期、时长与区间重叠；不存在指定关联



**思路**：NOT EXISTS 中同时限制当前酒店、与 2018 重叠、单笔 NombreCH > 10。主解采用离店日不占房的半开区间。



```sql

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

```



**易错点／口径**：这是没有一笔超过 10 间，不是全年合计 <=10。也不是在问酒店总容量。未知 NombreCH 不会被 >10 判定为已知反例；若要求所有记录信息完整，需要额外定义。



**自测反例（自行构造）**：两笔各 6 间可通过；一笔 11 间且与 2018 重叠必须排除。



## H31｜所有房型及可能的零酒店数量



**FR**：Nom du type de chambre avec éventuellement le nombre d’hôtels associés (certains types peuvent ne pas avoir d’hôtels associés)



**中文**：列出每种房型名称及其关联酒店数量；有些房型可能没有关联酒店。



来源：[H] 第 2 页，原题 31。



**题型**：分组统计与数量门槛；保留零关联对象



**思路**：从 TypeCH 外连接 Proposer，按房型统计 P.CodeH 非空值的数量。



```sql

SELECT T.NomTyCH, COUNT(P.CodeH) AS NbHotels
FROM TypeCH T
LEFT JOIN Proposer P ON P.CodeTyCH = T.CodeTyCH
GROUP BY T.CodeTyCH, T.NomTyCH;

```



**易错点／口径**：Proposer 的酒店＋房型为键，所以同酒店对同房型只出现一次。COUNT(P.CodeH) 已得到实际酒店数；COUNT(*) 会把零酒店错算成 1。



**自测反例（自行构造）**：某房型没有任何 Proposer 行：仍显示，数量为 0。



## H32｜已提供但没有被预订的酒店—房型对



**FR**：Nom de l'hôtel et du ou des types de chambres qu'il propose et qui ne sont pas réservés



**中文**：列出酒店名称及该酒店提供但尚未被预订的一个或多个房型名称。



来源：[H] 第 2 页，原题 32。



**题型**：不存在指定关联



**思路**：从 Proposer 中实际提供的组合出发，检查 Reserver 中没有同一个酒店、同一种房型的组合。



```sql

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

```



**易错点／口径**：题干未给时间范围，按从未被预订理解。别的酒店有该房型的预订，不代表本酒店的该房型已经被预订。



**自测反例（自行构造）**：A 酒店套房无人订，B 酒店套房有人订：A 的套房仍应返回。



## H33｜每个合格酒店内部房间数最多的房型



**FR**：Pour les hôtels proposant plus de 3 types de chambres, indiquer son nom et le nom du type de chambres ayant le plus de chambres (ainsi que ce nombre)



**中文**：对提供超过 3 种房型的酒店，列出酒店名、该酒店房间数最多的房型名称及其房间数量。



来源：[H] 第 2 页，原题 33。



**题型**：分组统计与数量门槛；每个对象内部的最大／最新



**思路**：两个独立条件：当前酒店至少 4 种房型；当前行 NbChambres 等于当前酒店内部的最大值。



```sql

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

```



**易错点／口径**：P2、P3 是重新扫描 Proposer；H 是外层当前酒店，可以直接引用，不需要 H2。没有 P2.CodeH=H.CodeH 会错误比较全库最大值。所有并列最多的房型都返回。



**自测反例（自行构造）**：一个酒店有 4 种房型，数量 10、10、2、1：应返回两个 10 的房型。



## H34｜被预订却未由该酒店提供的房型



**FR**：Donner le nom des hôtels pour lesquels il a été réservé un type de chambres et ce dernier n'est en fait pas proposé par l'hôtel.



**中文**：列出出现过某种房型预订、但该房型实际上并未由该酒店提供的酒店名称。



来源：[H] 第 2 页，原题 34。



**题型**：不存在指定关联



**思路**：从酒店出发，存在一笔预订，其酒店—房型组合在 Proposer 中找不到。双层存在性让每家酒店只输出一次。



```sql

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

```



**易错点／口径**：与 H32 的方向相反：H32 是 Proposer 减 Reserver；H34 是 Reserver 减 Proposer。不能把 Reserver 与 Proposer 先 INNER JOIN，否则异常组合早已消失。



**自测反例（自行构造）**：房型本身存在、酒店也存在，但两者在 Proposer 中没有组合：这正是本题要找的情况。



## H35｜三个统计指标、零关联与十年范围



**FR**：Pour chaque groupe hôtelier, donner son nom, le nombre d’hôtels, le nombre de types de chambres proposés et le nombre de clients ayant effectué des réservations durant les 10 dernières années.



**中文**：对每个酒店集团，列出集团名称、酒店数量、提供的房型种类数，以及过去十年内进行过预订的客户数量。



来源：[H] 第 2 页，原题 35。



**题型**：日期、时长与区间重叠；分组统计与数量门槛；保留零关联对象；二次汇总与多分支汇总



**思路**：主解按过去 120 个月内的抵达时刻统计不同客户；酒店数和提供房型种类数不加时间限制。三个分支分别按集团汇总，再从全部集团外连接。



```sql

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

```



**易错点／口径**：原模式没有“预订创建日期”，所以不能严格按下单日期回答；按 DateArr 是本题的明确解释。十年是滚动 120 个月，不是简单年份差 <=10。客户统计不经过 Proposer，否则可能漏掉 H34 的异常预订。



**自测反例（自行构造）**：同一客户在同集团两个酒店住过，客户数仍为 1；同一房型被多家酒店提供，集团房型数仍只算 1。



### H35 变式 1：另一写法：三项 COUNT(DISTINCT)



计数可以通过各自的去重对象控制连接放大。此写法的日期口径与主解相同；不要将这套写法直接套成金额 SUM。



```sql

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

```



## 校验说明



82 条主解和 19 条变式，共 101 条 SQL，经过日期与 Oracle 特定表达式适配后，在自构造 SQLite 数据库逐条运行并完成 89 项断言。未在 Oracle 实例或用户真实数据上执行；不是教师标准答案，也不保证适配未知的 DDL、文本值或解释口径。