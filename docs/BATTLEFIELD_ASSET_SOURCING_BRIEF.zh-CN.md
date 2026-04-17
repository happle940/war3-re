# 战场素材 Sourcing Brief

> 用途：把第一批可读的 War3-like 战场素材采购/筛选任务说清楚，避免继续停留在“找点素材”的模糊请求。

## 1. 目标和边界

本 brief 只覆盖第一批局内战场素材，目标是让默认镜头下的战场第一眼能读懂：

- 谁是经济单位。
- 谁是基础战斗单位。
- 哪个是主基地、哪个是生产建筑、哪个是人口/防御建筑。
- 哪里是金矿、哪里是树线、哪里是路径/出口/坡道/不可走边界。

本 brief 不覆盖：

- 主菜单、loading、pause、results、settings、help 等页面壳层素材。
- 音频、BGM、语音。
- 新种族、新单位、新建筑、英雄、技能或科技树。
- gameplay、AI、经济、路径、建造规则或测试改动。

核心口径：

```text
先找能合法进入候选包、默认镜头可读、可回退的第一批素材。
不找官方 Warcraft III 资源，不做 remake 资产复刻，不为了素材改玩法。
```

## 2. 第一批素材类别

| 类别 | 第一眼必须读出什么 | 真实批次候选必须具备 | proxy / fallback 可接受形态 |
| --- | --- | --- | --- |
| `worker` | 这是经济/建造单位，不是士兵。 | 小型人形；工具、背包、采集或建造 cue 明确；队伍色不被吞掉；与 footman 并排可分。 | 明亮队伍色人形 proxy，加工具 silhouette；宁可夸张，也不能小黑糊。 |
| `footman` | 这是基础近战战斗单位，比 worker 更重。 | 持盾/武器/盔甲 cue；站姿更宽；战斗姿态不误导；默认镜头 1 秒内能和 worker 区分。 | shield+sword 或重甲人形 proxy；肩宽、盾牌块面和武器轮廓优先。 |
| `town hall` | 这是基地核心和资源回收 anchor。 | 全批次最大主建筑；入口/屋顶/旗帜/核心结构明显；与 goldmine 形成经济 pair。 | 大体量主厅 proxy；宽底座、高屋顶、入口朝向和队伍旗帜必须保留。 |
| `barracks` | 这是军事生产建筑，不是主基地或民房。 | 军营/训练场/武器架/门洞 cue；体量低于 town hall、高于 farm；出口方向可读。 | 长条军营 proxy；门洞、武器/盾牌标识、生产侧朝向优先。 |
| `farm` | 这是小型人口/墙面 support 建筑。 | 低矮、可重复、边界清楚；成排时能读成建筑墙，不像地形噪声。 | 小农舍/粮仓 proxy；浅屋顶、清楚边缘、小 footprint。 |
| `tower` | 这是静态防御和威胁来源。 | 垂直塔身、顶部攻击点或警戒结构明显；比 farm 更高、更危险。 | 高柱体 + 顶部平台/旗帜 proxy；攻击来源必须读得出。 |
| `goldmine` | 这是经济资源点，不是普通岩石或建筑。 | 岩体/洞口/金色价值 cue；和 town hall 的关系一眼可读；worker 采集目标明确。 | rock + gold cue proxy；允许金色高光、晶体或洞口夸张。 |
| `trees / tree line` | 这是木材资源、地图边界和基地围合。 | 连续树冠/树墙 mass；可采集前缘清楚；不遮单位主体。 | 模块化树线 proxy；连续树冠带、暗边缘、清楚前缘。 |
| `ground / path / cliff readability aids` | 哪里能走、哪里是出口、哪里是坡道/边界。 | 地表明度分区、路径贴花、坡道/悬崖边缘提示；不吞单位和建筑。 | 程序化路径、矿路磨损、树线阴影、cliff/不可走边缘线。 |

## 3. 法律来源口径

### 3.1 首选来源

| 来源类别 | 是否可做真实批次候选 | 使用条件 |
| --- | --- | --- |
| `S0` 项目自制 / 程序化 proxy | 可以 | 记录作者、生成方式、用途和文件清单；默认可作为 fallback。 |
| `S1` CC0 / Public Domain | 可以 | 记录来源页、许可证页、下载时间、原始文件名。 |
| `S2` 允许商用和再分发的署名许可 | 可以 | 署名要求必须记录；修改和再分发限制必须清楚。 |
| `S3` 付费或商业素材包 | 条件允许 | 许可证必须明确允许网页 demo、repo 或构建产物分发；不能只凭购买截图。 |
| `S6` AI 生成候选 | 条件允许 | 不使用受保护 IP、角色名、官方资产、特定画师风格；记录 prompt 摘要、工具、条款和人工修改。 |

### 3.2 只能参考，不能入库

| 来源类别 | 允许做什么 | 禁止做什么 |
| --- | --- | --- |
| `S4` 参考图 / 风格参考 | 观察 silhouette、比例、基地语法、路径表达。 | 不得复制、描摹、切图、重建 mesh、转贴图或放入仓库。 |

### 3.3 硬拒绝来源

以下来源直接 `rejected`，不得进入 `public/`、`src/`、构建产物、测试 fixture 或 GLM handoff：

| 硬拒绝类别 | 拒绝原因 |
| --- | --- |
| 官方 Warcraft III / Blizzard ripped assets | 未授权 IP 资源，不能作为项目素材。 |
| 未授权 fan remake / mod rip / 私服包 | 来源和再分发权利不可控。 |
| 来源不明下载、网盘包、二次搬运包 | 无法证明许可证和授权链。 |
| 带水印或图库预览图 | 明确不是可分发成品。 |
| 禁止商用、禁止修改、禁止再分发素材 | 与仓库/demo/构建产物使用冲突。 |
| 只允许个人本地使用的商业素材 | 不能进入可分发项目。 |
| AI prompt 明确要求 Warcraft、Blizzard、特定角色、特定画师风格 | 来源风险和风格复刻风险过高。 |

最低规则：

```text
缺许可证、缺来源、缺再分发结论时，不是 candidate，而是 blocked。
```

## 4. 每类素材要解决的可读性任务

| 类别 | 主要可读性任务 | 失败表现 | 处理 |
| --- | --- | --- | --- |
| `worker` | 经济身份、建造身份、弱战斗身份。 | 像 footman、太暗、太小、工具看不见。 | 调亮、放大工具、改 silhouette；仍失败就 fallback。 |
| `footman` | 战斗身份和近战威胁。 | 像 worker 或普通村民；武器/盾牌读不出。 | 强化盾/武器/肩宽；弱真实模型不得进入第一批。 |
| `town hall` | 基地核心、资源回收、视觉中心。 | 像普通房子或 barracks；体量不够。 | 保持最大体量和入口 anchor；不合格则用主厅 proxy。 |
| `barracks` | 军事生产侧和 rally/出口方向。 | 像民房、town hall 或仓库；出口不可读。 | 加门洞、武器 cue、长条体量和朝向。 |
| `farm` | 小型支持建筑、墙面 piece。 | 像地形装饰或资源点；成排糊成噪声。 | 降低高度、强化边缘和重复节奏。 |
| `tower` | 防御威胁和攻击来源。 | 像 farm 或装饰柱；高度不明显。 | 增高、强化顶部平台/射击点。 |
| `goldmine` | 经济目标和采集目的地。 | 像普通石头、cliff 或建筑。 | 加洞口、金色 cue 和资源高光。 |
| `trees / tree line` | 木材资源、阻挡、基地围合。 | 遮单位、边界碎、和地表混。 | 用连续 mass，清楚可采集前缘。 |
| `ground / path / cliff readability aids` | 路径、出口、坡道、不可走边界。 | 单位被地表吞掉；出口和坡道不可读。 | 用明度分区、路径磨损、边缘线和阴影带。 |

## 5. 真实批次候选 vs proxy/fallback

| 判定 | 可进入第一批真实候选 | 只能做 proxy / fallback | 只能做 reference |
| --- | --- | --- | --- |
| 来源 | `S0/S1/S2` 优先，`S3/S6` 条件允许。 | `S0` 自制或程序化。 | `S4`。 |
| 许可 | 来源、许可证、署名、再分发限制清楚。 | 自制记录清楚即可。 | 可没有入库许可，但必须标注不能入库。 |
| 默认镜头 | 3 秒内能识别类别和用途。 | 必须比弱真实资产更可读。 | 只提炼 silhouette / 比例 / 空间语法。 |
| 同批一致性 | 不破坏 Human-like 基地语法和阵营读法。 | 可风格简化，但必须稳定。 | 不参与风格复制。 |
| 导入价值 | 可以替换当前 proxy 并提升第一眼读法。 | 保障缺资产、弱资产、加载失败时仍可读。 | 只帮助 Codex 写判断标准。 |

第一批不追求最终美术完整度，但必须避免两种失败：

- 合法但默认镜头不可读。
- 好看但来源不可用。

## 6. 推荐 sourcing 顺序

| 优先级 | 类别 | 为什么先找 |
| --- | --- | --- |
| `P0` | `worker`、`town hall`、`goldmine`、`trees / tree line`、`ground / path / cliff readability aids` | 决定第一眼经济 loop、基地 anchor、资源关系和地图边界。 |
| `P1` | `footman`、`barracks`、`farm`、`tower` | 决定军事、生产、人口和防御角色是否能分开。 |
| `P2` | 同批风格统一、动画、细节增强 | 重要，但不能早于合法性和默认镜头可读性。 |

执行要求：

1. 每个 `P0` 类别先找至少 1 个真实批次候选和 1 个 `S0` fallback。
2. `P1` 类别可以先用 fallback，但进入 GLM import 前必须有明确 candidate / fallback 取舍。
3. `P2` 不得阻塞 `P0/P1` 第一批可读性完成。
4. 任何单个漂亮资产如果没有同批可读性价值，只能放入 later candidate，不进入第一批 brief。

## 7. 候选记录最低字段

每个 sourcing 结果必须能填下面字段，填不全就不能交给 GLM：

| 字段 | 要求 |
| --- | --- |
| `candidate_id` | 稳定 ID，例如 `bf-worker-s1-001`。 |
| `category` | 必须是本文九类之一。 |
| `source_class` | `S0/S1/S2/S3/S4/S5/S6`。 |
| `source_url_or_path` | 外部来源 URL 或本地生成路径。 |
| `license_summary` | 许可证、署名、修改、再分发限制摘要。 |
| `intended_role` | 真实批次候选、fallback、proxy、reference 四选一。 |
| `first-look_readability` | 默认镜头下类别、用途、混淆风险的判断。 |
| `fallback_plan` | 真实候选失败时使用哪个 `S0` fallback。 |
| `codex_decision` | `approved-for-intake`、`approved-for-import`、`blocked`、`rejected`。 |
| `reject_reason` | blocked/rejected 时必填。 |

## 8. Codex 批准口径

Codex 在批准前负责：

- 判定来源类别和许可证是否可进入候选包。
- 判断素材是否支持第一眼战场读法。
- 判断真实候选是否优于当前 proxy。
- 标记每类 fallback，不允许导入时临时猜。
- 写明哪些视觉判断仍需要 human approval。

Codex 批准结论只能写成：

| 结论 | 含义 |
| --- | --- |
| `approved-for-intake` | 可以继续补预览、许可证、默认镜头评估。 |
| `approved-for-import` | 来源、用途、fallback 和第一眼可读性都够，可以交给 GLM。 |
| `blocked` | 缺来源、缺许可证、缺 fallback 或可读性证据不足。 |
| `rejected` | 来源、许可、类别适配或可读性失败。 |

不能写成“看起来不错”“GLM 导入后再判断”“先放进去以后换”。

## 9. GLM 接手边界

GLM 只能在 Codex 给出 `approved-for-import` 后接手：

- 整理已批准文件到约定 asset 目录。
- 写 manifest / catalog。
- 接 deterministic fallback。
- 补 attribution / license ledger 的机械字段。
- 写资源缺失、加载失败、fallback 切换的导入合同。
- 跑 import/runtime 验证并报告结果。

GLM 不允许：

- 新增未批准外部素材。
- 把 `reference-only` 素材放进仓库。
- 替 Codex 判断许可证、风格方向或第一眼可读性。
- 为适配素材改 gameplay、AI、经济、路径、单位数据或建筑规则。
- 把“模型加载成功”写成“视觉通过”。

GLM closeout 必须列出：

```text
导入了哪些 approved candidate；
每个 candidate 的 fallback 是什么；
哪些导入/缺失资源验证通过；
哪些仍等待 human-approved readability。
```

## 10. 完成定义

本 sourcing brief 对第一批战场素材的完成定义：

- 九类素材都有 sourcing 记录，或明确 deferred。
- `P0` 类别都有真实批次候选或强 fallback。
- 每个候选都有来源、许可证、用途、fallback 和第一眼可读性判断。
- `S4/S5` 没有任何文件进入仓库路径。
- Codex 已给出 `approved-for-import` 列表或明确 blocked/rejected 原因。
- GLM 接手时不需要补 sourcing、licensing 或美术方向判断。

最终判断：

```text
第一批素材的目标不是最终美术完成，而是合法、可追溯、默认镜头可读、可回退。
Codex 批准候选；GLM 只导入批准候选；最终视觉成功仍需要人眼确认。
```
