# 战场素材 Intake Matrix

> 用途：把 `A1` 战场可读性素材包从“去找素材”改成可筛选、可拒绝、可交接的 intake 矩阵。

## 0. 当前批准口径

本文对应 `C69`：把第一批战场可读性素材包变成真实 approval surface。

当前目标不是最终美术替换，也不是追求完整 Warcraft-like 资产库，而是让第一批 battlefield readability batch 具备明确批准条件：

```text
合法来源 + 默认镜头可读 + 有 fallback + 可交给 GLM 做机械导入验证
```

Codex 在这里做 sourcing、许可、可读性和 approval 判断；GLM 只在 Codex 给出 `approved-for-import` 清单后接 asset manifest、fallback wiring 和 import/runtime verification。

没有批准真资产时，战场仍然继续使用 `S0` proxy / 程序化 fallback 推进；不允许为了“先换成真素材”导入来源不清、官方相似、reference-only 或默认镜头不可读的资源。

### 0.1 C69 approval surface 硬要求

`A1` 战场素材包只有同时满足下面条件，才可以进入 `approved-for-import` 或交给 GLM：

| 要求 | 本文控制点 |
| --- | --- |
| 九类战场素材不遗漏 | `worker`、`footman`、`townhall`、`barracks`、`farm`、`tower`、`goldmine`、`trees / tree line`、`terrain readability aids` 都必须有记录，或明确 `deferred`。 |
| 来源等级清楚 | 每个 candidate 必须标记 `S0-S6`，并附来源、许可证、署名/限制摘要。 |
| 硬拒绝已执行 | `S4/S5`、官方/ripped/来源不明/禁止再分发/不干净 AI 输入不得进入仓库或 GLM handoff。 |
| 类别级可读性已判断 | 每个非 deferred 类别必须写出通用 `R0-R7` 和对应类别检查结论。 |
| 无真资产时有 fallback | 没有 approved real batch 时，九类必须保留或建立 `S0` proxy / 程序化 fallback。 |
| Codex-to-GLM 边界清楚 | GLM 只接 `approved-for-import` packet，不能代做 sourcing、licensing、art direction 或 human readability approval。 |

## 1. 适用范围

本文只覆盖局内战场第一批素材：

- `worker`
- `footman`
- `townhall`
- `barracks`
- `farm`
- `tower`
- `goldmine`
- `trees / tree line`
- `terrain readability aids`

不覆盖：

- 主菜单、loading、pause、results 等页面壳层素材。
- 音频、语音、BGM。
- 新单位、新建筑、新种族、英雄、法术、科技树。
- gameplay 数值、AI、路径、建造规则改动。

核心原则：

```text
素材只有在合法、可追溯、默认镜头可读时，才有资格进入导入队列。
加载成功不等于可读性成功。
```

## 2. 来源等级

| 等级 | 名称 | 可进入仓库 | 使用边界 | 必填证据 |
| --- | --- | --- | --- | --- |
| `S0` | 项目自制 / 程序化 proxy | 可以 | 可直接作为 fallback 或临时正式素材；仍需可读性验收。 | 作者、生成方式、用途、文件清单。 |
| `S1` | CC0 / Public Domain | 可以 | 首选外部来源；仍要记录来源页和下载时间。 | 来源 URL、许可证页、原始文件名。 |
| `S2` | 允许商用和再分发的署名许可 | 可以，但必须署名 | 例如明确允许 repo/demo 分发的 CC-BY 或 MIT-like 资产；署名文本必须随资产记录。 | 来源 URL、许可证文本、署名要求、修改说明。 |
| `S3` | 付费或商业素材包 | 条件允许 | 仅当许可证明确允许在网页 demo / repo / 构建产物中分发；禁止只凭购买截图入库。 | 许可证文本、购买/授权记录、分发限制摘要。 |
| `S4` | 参考图 / 风格参考 | 不可以 | 只能用于研究 silhouette、比例、空间语法；不得复制、描摹或转成 repo 资产。 | 来源 URL、参考用途、不能入库标记。 |
| `S5` | 禁止来源 | 不可以 | ripped game assets、官方 Warcraft III 资产、未授权 fan remake、来源不明下载、带水印素材、禁止商用或禁止再分发素材。 | 记录拒绝原因即可。 |
| `S6` | AI 生成候选 | 条件允许 | 只接受不使用受保护 IP 名称、角色名、画师风格或官方资产作输入的候选；仍按 `S0-S3` 同级记录权利和生成过程。 | prompt 摘要、工具/模型、使用条款、人工修改记录。 |

最低规则：

- 任何 `S4/S5` 资产不得进入 `public/`、`src/`、构建产物或测试 fixture。
- 任何候选缺少来源、许可证或授权记录时，状态只能是 `blocked`。
- “像 Warcraft III”只能作为空间语法和可读性参考，不能变成复制官方美术、命名、纹理或模型。
- 付费素材必须确认许可证允许网页 demo、repo、构建产物和截图传播；只允许个人本地使用的素材不能进入仓库。
- AI 生成候选必须记录生成工具、条款、prompt 摘要和人工修改；使用官方截图、官方资产、受保护角色名、特定画师风格或现有游戏 UI / 模型作为输入时直接拒绝。

### 2.1 硬拒绝来源

以下来源不进入候选包，不交给 GLM，不做“先导入再清理”：

| 来源 | 拒绝原因 |
| --- | --- |
| 官方 Warcraft III / Blizzard 模型、贴图、图标、截图、音画拆包 | 未授权 IP 资产，不能作为 repo/demo 资源。 |
| ripped assets、fan remake、私服资源包、来源不明网盘包 | 来源和权利链不可追溯。 |
| 带水印、禁止商用、禁止修改、禁止再分发、只限个人本地使用素材 | 与网页 demo、repo、构建产物或截图传播冲突。 |
| 只提供购买截图但没有许可证文本的商业包 | 无法证明分发边界。 |
| AI 生成但输入包含官方截图、官方资产、角色名、logo、特定画师风格或未授权参考图 | 无法建立干净来源。 |
| 默认镜头不可读、类别混淆、破坏 TH-矿-树线-出口关系的强风格素材 | 合法也不能作为第一批 battlefield readability 资产。 |

## 3. Intake 状态

| 状态 | 含义 | 下一步 |
| --- | --- | --- |
| `reference-only` | 只能看，不能用。 | Codex 提炼可读性要求；不得交给 GLM 导入。 |
| `candidate` | 来源可能合法，正在筛。 | 补齐许可证、预览图、用途和可读性判断。 |
| `approved-for-intake` | Codex 认可来源和用途，可以进入候选包。 | 做默认镜头可读性评估。 |
| `approved-for-import` | 来源、用途、fallback、可读性 gate 都过线。 | GLM 可以接 manifest、fallback、import contract。 |
| `integrated` | 已接入仓库并能加载。 | 继续等待 runtime proof 和人眼确认。 |
| `human-approved` | 用户或目标玩家确认默认镜头可读。 | 才能作为视觉成功证据引用。 |
| `rejected` | 来源、许可、风格或可读性失败。 | 不导入；保留拒绝原因。 |

## 4. 通用可读性验收 Gate

| Gate | 判定问题 | 通过标准 | 失败处理 |
| --- | --- | --- | --- |
| `R0` 来源 gate | 能不能合法使用和分发？ | 来源、许可证、署名、限制都清楚。 | 停止 intake；只能降级为 `reference-only` 或 `rejected`。 |
| `R1` 默认镜头 gate | 正常 RTS zoom 下能不能一眼认出？ | 不看 HUD label，3 秒内能识别类别和阵营归属。 | 调整比例、轮廓、颜色或退回 proxy。 |
| `R2` 角色区分 gate | 是否和相邻类别混淆？ | worker/footman、farm/tower、barracks/townhall、goldmine/terrain 明显不同。 | 拒绝或改成更强 silhouette。 |
| `R3` 体积一致 gate | 视觉大小是否和交互 footprint 对齐？ | 点击、选择圈、血条、占地感与可见模型不冲突。 | 禁止只换模型；需要导入前标记 footprint 风险。 |
| `R4` 基地语法 gate | 是否支持 Human-like 基地读法？ | TH-矿-树线-出口-生产侧关系更清楚，而不是更乱。 | 不进入 `approved-for-import`。 |
| `R5` 地形对比 gate | 是否从地面和树线里跳出来？ | 单位、建筑、资源在地表上有足够明度/颜色/轮廓对比。 | 调色、outline、底座或 proxy fallback。 |
| `R6` 运动/状态 gate | 动画缺失时是否仍可读？ | idle pose 也能读；移动、采集、建造、战斗状态至少不误导。 | 先用静态强 proxy，不为弱动画牺牲可读性。 |
| `R7` HUD/FX 冲突 gate | 是否被 selection ring、血条、UI、特效盖住？ | 选择后仍能看清本体和类别。 | 调整尺寸、锚点或拒绝。 |

Gate 结论必须写成：

```text
pass / pass-with-tuning / blocked / rejected
```

不能写成“应该可以”“看起来还行”“GLM 导入后再说”。

## 5. 战场素材 Intake 矩阵

| 类别 | 战场职责 | 首选来源等级 | 最低候选形态 | 可读性 gate | 无批准真资产时的 fallback |
| --- | --- | --- | --- | --- | --- |
| `worker` | 经济、建造、弱战斗；玩家第一批可控单位。 | `S0/S1/S2` | 小型人形、工具/背包/采集姿态明确，队伍色可读。 | 默认镜头能立刻找到；不能像 footman；采集和建造状态不丢。 | 使用放大的低多边形 worker proxy：明亮队伍色、工具 silhouette、清晰选择圈；宁可 cartoon-readable，不用暗小真模型。 |
| `footman` | 基础近战军事单位；必须比 worker 更重。 | `S0/S1/S2` | 持盾/武器/盔甲感明确的人形；站姿更宽，体块更硬。 | 与 worker 并排时 1 秒内可分；不能像普通村民；战斗状态可读。 | 使用 shield+sword proxy 或重甲人形 proxy；加肩宽、盾牌块面、冷色金属明度，不追求真实比例。 |
| `townhall` | 基地 anchor、训练 worker、资源回收点。 | `S0/S1/S2/S3` | 最大主建筑，入口/屋顶/旗帜或基地核心特征明显。 | 必须是基地视觉中心；不能和 barracks 混；与 goldmine 形成经济 pair。 | 使用大体量主厅 proxy：宽底座、高屋顶、队伍旗帜、入口朝向；保留最大建筑身份。 |
| `barracks` | 军事生产建筑，定义生产侧和出口方向。 | `S0/S1/S2/S3` | 中大型军营、训练场、武器架、门洞或防御墙体特征。 | 必须像生产建筑；不能像 townhall 或普通房子；rally/出口侧更清楚。 | 使用军营 proxy：长条体量、武器/盾牌标识、开口朝向战场出口；不要用通用木屋。 |
| `farm` | 人口建筑、小型 support / wall piece。 | `S0/S1/S2` | 小、低、可重复，边界清楚；适合形成紧凑墙面。 | 必须比 barracks/townhall 小；不能像资源点；成排时不糊成地形。 | 使用低矮农舍/粮仓 proxy：小 footprint、浅色屋顶、明显边缘；优先 wall readability。 |
| `tower` | 静态防御、垂直威胁地标。 | `S0/S1/S2/S3` | 细高塔身、顶部射击点或警戒结构明显。 | 必须比 farm 更高、更危险；默认镜头下能读出攻击来源。 | 使用垂直 tower proxy：高柱体、顶部平台、队伍色旗帜、攻击方向提示；不要用矮方块。 |
| `goldmine` | 经济地标、worker 采集目标。 | `S0/S1/S2/S3` | 岩体、洞口、金色/高价值视觉元素明确。 | 必须像资源，不像建筑或地形装饰；TH-矿关系一眼可读。 | 使用 rock+gold proxy：深色岩体加金色高光/晶体/洞口；允许夸张发光以保证识别。 |
| `trees / tree line` | 木材资源、地图边界、基地空间围合。 | `S0/S1/S2` | 成片树冠或树墙，边界连续，个体和 mass 都可读。 | 必须读成可采伐/阻挡边界；不能遮住单位；边缘不能和地表混成噪声。 | 使用模块化 tree-line proxy：连续树冠带、暗边缘、可采集前缘；优先 mass shape，不散摆小树。 |
| `terrain readability aids` | 地表、路径、悬崖、出口、可走区和不可走区提示。 | `S0/S1/S2` | 路径贴花、地表明度分区、边缘线、cliff/坡道提示。 | 单位和建筑不能被地表吞掉；玩家能读出出口、矿路、树线前缘和交战通道。 | 使用程序化地表辅助：浅色路径、矿路磨损、树线阴影边、建造区底色；不等正式 terrain art。 |

## 6. 每类可读性验收清单

每个类别都必须写出 `pass / pass-with-tuning / blocked / rejected`，不能只写“好看”“像 RTS”。

| 类别 | 必过检查 | 常见拒绝条件 |
| --- | --- | --- |
| `worker` | 默认镜头 3 秒内能找到；工具/采集身份明显；和 footman 并排不混；采集、建造、移动时队伍色仍可见。 | 太小、太暗、像村民装饰、没有工具 silhouette、被树线/地表吞掉。 |
| `footman` | 比 worker 更宽更重；盾/武器/盔甲块面明确；攻击状态不靠特效才可读。 | 像普通 worker、武器太细、动作/姿态导致默认镜头只剩噪点。 |
| `townhall` | 第一眼是最大基地 anchor；入口/屋顶/旗帜明确；与 goldmine 形成经济 pair；不和 barracks 混。 | 只是普通大屋、入口不清、体量和 footprint 冲突、抢成资源点。 |
| `barracks` | 军事生产语义明确；门洞/出口方向可读；和 townhall、farm 区分。 | 像民房、像主基地、rally/出口侧不可读。 |
| `farm` | 小型、低矮、可重复；成排时能读成 support/wall piece；不被地形吞掉。 | 太像 barracks、太像装饰地形、重复后糊成噪声。 |
| `tower` | 垂直高度和危险感明确；顶部攻击点可读；和 farm 并排不混。 | 太矮、像普通柱子、攻击来源不清、选中后被血条/FX 盖住。 |
| `goldmine` | 明确是资源点；洞口/金色 cue/岩体关系清楚；TH-矿距离和采集目标可读。 | 像普通地形、像建筑、金色 cue 太小、worker 采集点不清。 |
| `trees / tree line` | 读成连续可采伐/阻挡边界；前缘清楚；不遮单位和建筑；mass shape 支持出口判断。 | 散树噪声、边界断裂、树冠遮住 worker、和地表明度混成一片。 |
| `terrain readability aids` | 路径、矿路、出口、树线前缘、可走/不可走区域清楚；单位建筑对比不下降。 | 地表纹理抢主角、路径提示误导、cliff/坡道不清、整体太花。 |

## 7. 每类候选必须提交什么

每个 candidate 至少要有一条记录：

| 字段 | 要求 |
| --- | --- |
| `candidate_id` | 稳定 ID，例如 `bf-worker-s1-001`。 |
| `category` | 必须属于本文九类之一。 |
| `source_class` | `S0-S6` 中的一类。 |
| `source_url_or_path` | 外部 URL 或本地生成路径。 |
| `license_summary` | 许可证、署名、再分发限制摘要。 |
| `runtime_use` | 用作正式素材、proxy、fallback、参考，四选一。 |
| `readability_notes` | 对 `R1-R7` 的简短判断。 |
| `category_acceptance` | 对本文第 6 节对应类别检查的结论。 |
| `fallback_id` | 导入失败或可读性失败时使用哪个 fallback。 |
| `status` | `candidate`、`approved-for-import` 等状态。 |
| `owner_decision` | Codex 的批准、拒绝或阻塞说明。 |

没有这些字段，不允许进入 GLM handoff。

## 8. Fallback 规则

### 8.0 没有 approved real batch 时怎么办

如果 `A1` 没有任何 `approved-for-import` 真资产，战场可读性不等待外部素材：

- `worker`、`footman`、`townhall`、`barracks`、`farm`、`tower`、`goldmine`、`trees / tree line`、`terrain readability aids` 每类都保留或建立一个 `S0` fallback。
- fallback 可以是程序几何、简化模型、CSS/canvas 辅助、材质调色、路径贴花或地表辅助，但必须比弱真资产更可读。
- GLM 可以在批准后接 fallback manifest、缺失资源回归和 deterministic fallback 验证；不能因为没有真资产就自行新增外部来源。
- 完成定义降级为“九类都有可读 fallback，且缺图时运行时不坏”，而不是“真资产已经导入”。

### 8.1 通用规则

- fallback 是正式生产路径，不是失败遮羞布。
- fallback 必须 deterministic：同一类别、同一缺失原因，每次都落到同一 proxy。
- fallback 必须比弱真资产更可读；如果真实模型合法但默认镜头不可读，优先 fallback。
- fallback 名称和用途必须写进候选记录，不能在导入时临时猜。
- reference-only 素材只能影响 fallback 的读法要求，不能贡献贴图、mesh、轮廓描摹或文件。

### 8.2 何时强制 fallback

| 情况 | 处理 |
| --- | --- |
| 来源或许可证不清 | 不导入；使用现有 proxy 或新建 `S0` proxy。 |
| 真资产默认镜头太小、太暗、太碎 | 先尝试 scale/value/outline tuning；仍失败则 fallback。 |
| 类别混淆 | 不靠 HUD label 修；改 silhouette 或 fallback。 |
| 体积和交互 footprint 冲突 | 暂停导入；Codex 决定调资产还是开工程任务。 |
| 素材风格强但破坏基地语法 | 拒绝；可保留为 `reference-only`。 |
| 只有单个漂亮模型但缺少同批风格 | 可作参考，不进入第一批 import。 |

### 8.3 Fallback 的最低形态

| 类别 | fallback 最低要求 |
| --- | --- |
| `worker` | 人形、工具、队伍色、默认镜头可见。 |
| `footman` | 人形、盾/武器、比 worker 更宽更重。 |
| `townhall` | 最大体量、主入口、队伍旗帜或屋顶 anchor。 |
| `barracks` | 军事生产标识、门洞、出口朝向。 |
| `farm` | 小型低矮、可重复、适合墙面。 |
| `tower` | 垂直塔身、顶部攻击点、危险感。 |
| `goldmine` | 岩体加金色资源 cue。 |
| `trees / tree line` | 连续树墙、前缘清楚、不遮单位。 |
| `terrain readability aids` | 路径、边界、坡道/不可走提示清楚。 |

## 9. Codex / GLM 交接边界

### 9.1 Codex 批准前负责

Codex owns：

- 定义每类素材缺口和优先级。
- 判定来源等级、许可风险和是否可入库。
- 维护候选记录、fallback 记录和拒绝原因。
- 做默认镜头可读性初筛。
- 判断素材是否支持 Human-like 基地语法。
- 决定 `approved-for-import` 列表。

Codex 的 approval packet 至少包含：

- `approved-for-import` candidate 列表。
- 每个 candidate 的 category、source_class、license_summary、runtime_use、fallback_id。
- 第 4 节通用 gate 和第 6 节类别验收结论。
- 哪些素材只允许 `reference-only`，以及拒绝原因。
- 哪些判断仍需要 human-approved readability。

Codex 不把下面事项交给 GLM 代判：

- “这个来源是否合法”。
- “这个素材够不够像 War3-like 战场”。
- “真实资产是否可以替代 proxy”。
- “是否可以为了素材改 gameplay 规则”。

### 9.2 GLM 批准后可以做

GLM 只能在 `approved-for-import` 之后接手：

- 复制或整理已批准文件到约定 asset 目录。
- 写入 asset manifest / catalog。
- 接入 deterministic fallback。
- 补 attribution / license ledger 的机械字段。
- 写 import contract 和缺失资源回归测试。
- 证明资源缺失、加载失败、fallback 切换不会破坏运行时。

GLM 的工作边界是机械导入和验证，不是重新选择素材：

- 可以验证文件存在、manifest 正确、fallback deterministic、加载失败不崩、runtime contract 不回退。
- 可以反馈导入尺寸、锚点、材质、性能或缺文件问题。
- 不能把 import green 写成 human readability approved。
- 不能把未批准素材、参考图或许可证不清素材放进 repo。

GLM closeout 必须说明：

```text
导入了哪些 approved candidate；
每个 candidate 的 fallback 是什么；
跑了哪些 import / runtime 验证；
哪些仍需要 human-approved readability。
```

### 9.3 GLM 不允许做

- 不允许新增未批准外部素材。
- 不允许把 `reference-only` 素材放进仓库。
- 不允许根据导入方便程度替换 category 目标。
- 不允许把“模型能加载”写成“视觉通过”。
- 不允许为了某个素材顺手改 gameplay、AI、经济、路径或单位数据。
- 不允许把许可证不清的素材先接入再等以后清理。

## 10. 第一批 intake 顺序

| 优先级 | 类别 | 原因 |
| --- | --- | --- |
| `P0` | `worker`、`goldmine`、`townhall`、`trees / tree line`、`terrain readability aids` | 决定第一眼经济 loop 和基地空间是否成立。 |
| `P1` | `footman`、`barracks`、`farm`、`tower` | 决定生产、防守和军事实体是否有角色区分。 |
| `P2` | 同批风格统一、动画、细节 polish | 重要，但不能早于合法性和默认镜头可读性。 |

执行顺序：

1. 先填 `P0` 候选记录。
2. 每类至少保留一个 `S0` fallback。
3. 再补 `P1` 候选。
4. Codex 做 `approved-for-import` 批准。
5. GLM 才做 manifest、fallback、import contract。

## 11. 完成定义

本矩阵下，一个战场素材候选包只有满足以下条件，才算可以交给 GLM：

- 九类范围没有遗漏，或者明确标记为 deferred。
- 每个非 deferred 类别至少有一个 `S0` fallback。
- 每个 `approved-for-import` 素材都有来源、许可证、用途、fallback、通用 gate 和类别验收 notes。
- `S4/S5` 没有任何文件进入仓库路径。
- 硬拒绝来源没有进入 candidate 包或 repo。
- Codex 已写明哪些视觉判断仍需要 human approval。
- 交接不要求 GLM 做 licensing、sourcing 或美术方向判断。

一句话：

```text
Codex 决定哪些素材可以成为批准候选；
GLM 只把批准候选安全、可回退、可验证地接进运行时；
最终视觉成功仍需要人眼确认。
```

## 12. 2026-04-14 A1 第一批批准结论

当前没有真实素材候选满足 `approved-for-import` 的来源、许可证、署名、再分发、默认镜头可读性和类别验收证据。因此 A1 第一批交接包采取 fallback-only 路线：

```text
approved real candidates: none
approved S0 fallback candidates: 9
handoff packet: asset-handoff-a1-s0-fallback-001
```

### 12.1 批准的 S0 fallback

| 类别 | target_runtime_key | approved fallback candidate | fallback_id | 交接状态 |
| --- | --- | --- | --- | --- |
| worker | `bf-unit-worker` | `a1-s0-worker-fallback` | `fallback-readable-worker-proxy` | approved S0 fallback |
| footman | `bf-unit-footman` | `a1-s0-footman-fallback` | `fallback-readable-footman-proxy` | approved S0 fallback |
| townhall | `bf-building-town-hall` | `a1-s0-townhall-fallback` | `fallback-readable-th-proxy` | approved S0 fallback |
| barracks | `bf-building-barracks` | `a1-s0-barracks-fallback` | `fallback-readable-barracks-proxy` | approved S0 fallback |
| farm | `bf-building-farm` | `a1-s0-farm-fallback` | `fallback-readable-farm-proxy` | approved S0 fallback |
| tower | `bf-building-tower` | `a1-s0-tower-fallback` | `fallback-readable-tower-proxy` | approved S0 fallback |
| goldmine | `bf-resource-goldmine` | `a1-s0-goldmine-fallback` | `fallback-readable-goldmine-proxy` | approved S0 fallback |
| trees / tree line | `bf-terrain-tree-line` | `a1-s0-tree-line-fallback` | `fallback-readable-tree-line-proxy` | approved S0 fallback |
| terrain readability aids | `bf-terrain-aid` | `a1-s0-terrain-aid-fallback` | `fallback-readable-terrain-aid-proxy` | approved S0 fallback |

### 12.2 仍未批准的内容

- 没有真实 `S1/S2/S3/S6` battlefield asset 被批准导入。
- `S4/S5`、官方/ripped/fan remake/来源不明/网页截图/未授权 AI 生成候选仍是 hard reject 或 blocked。
- GLM 不能把 fallback-only handoff 当成真实素材导入许可。

### 12.3 GLM 接手边界

GLM 可以基于 `asset-handoff-a1-s0-fallback-001` 做九类 target key、fallback id、缺图回退和 deterministic validation；不能代做 sourcing、licensing、art direction、human readability approval，也不能把 fallback validation 写成 `V3-BG1`、`V3-RD1`、`V3-CH1` 或 `V3-UA1` 关闭。

## 13. 2026-04-14 V3-AV1 真实素材批准输入边界

本节把 A1 真实素材从“可以找一批图”改成可审查输入。当前没有真实素材 source evidence，因此结论保持：

```text
real asset candidates: deferred
approved-for-import: none
allowed GLM route: approved S0 fallback handoff only
```

### 13.1 批准输入四类结论

| 结论 | 何时使用 | 是否可交 GLM | A1 当前状态 |
| --- | --- | --- | --- |
| `approved` | source、license、permission、attribution、approvedUse、forbiddenUse、fallbackId 和 reviewer 都齐全。 | 可交机械导入和回归。 | 当前无。 |
| `fallback-only` | 真实素材未批准，但已有项目自制 proxy / S0 fallback。 | 只可交 fallback manifest、catalog、缺图回归。 | 九类 target key 当前都是此状态。 |
| `rejected` | 命中 hard reject 或许可证/用途明确不允许。 | 不可交。 | 当前没有进入候选的 rejected 真资产。 |
| `deferred` | 可能后续评估，但缺 source evidence、许可、署名、截图或人眼 verdict。 | 不可交。 | 真实素材批次整体 deferred。 |

### 13.2 九类 target key 当前输入记录

| category | target_runtime_key | sourceType | licenseOrPermission | approvedUse | forbiddenUse | attribution | fallbackId | input conclusion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| worker | `bf-unit-worker` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback manifest / runtime regression。 | 不得声明真实 worker 素材或 RD1 人眼可读通过。 | none / project-owned | `fallback-readable-worker-proxy` | `fallback-only` |
| footman | `bf-unit-footman` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback manifest / runtime regression。 | 不得声明真实 footman 素材或战斗单位美术通过。 | none / project-owned | `fallback-readable-footman-proxy` | `fallback-only` |
| townhall | `bf-building-town-hall` | `S0 project/proxy` | 项目自制 proxy；`townhall.glb` 仅限项目内 proxy。 | fallback / legal project proxy route。 | 不得声明最终 TH 美术、第三方批准或 BG1 通过。 | none / project-owned | `fallback-readable-th-proxy` | `fallback-only` |
| barracks | `bf-building-barracks` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback manifest / runtime regression。 | 不得声明 approved building pack 或 production-zone 通过。 | none / project-owned | `fallback-readable-barracks-proxy` | `fallback-only` |
| farm | `bf-building-farm` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback manifest / runtime regression。 | 不得声明最终 farm art 或 wall readability 通过。 | none / project-owned | `fallback-readable-farm-proxy` | `fallback-only` |
| tower | `bf-building-tower` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback manifest / runtime regression。 | 不得声明真实 tower art、defense-zone 通过或 CH1 通过。 | none / project-owned | `fallback-readable-tower-proxy` | `fallback-only` |
| goldmine | `bf-resource-goldmine` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback manifest / runtime regression。 | 不得声明真实 resource art 或 economy-axis 通过。 | none / project-owned | `fallback-readable-goldmine-proxy` | `fallback-only` |
| trees / tree line | `bf-terrain-tree-line` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback manifest / runtime regression。 | 不得声明最终 terrain art、tree-line readability 通过或 BG1 通过。 | none / project-owned | `fallback-readable-tree-line-proxy` | `fallback-only` |
| terrain readability aids | `bf-terrain-aid` | `S0 pathing-grid-runtime fallback` | 项目自制 runtime aid，无第三方许可依赖。 | fallback / pathing-grid runtime regression。 | 不得声明 terrain art、RD1 runtime visual 通过或 user-approved readability。 | none / project-owned | `fallback-readable-terrain-aid-proxy` | `fallback-only` |

### 13.3 真实候选进入 `approved` 的最低字段

每个真实候选必须绑定：

- `target_runtime_key`：只能对应九类 A1 key，不允许新增半套 target。
- `sourceType`：`S1/S2/S3` 或干净 `S6`；`S4/S5` 直接拒绝。
- `sourceEvidence`：来源 URL/path、下载或生成时间、原始文件名、预览和修改说明。
- `licenseOrPermission`：必须覆盖 repo、web demo、构建产物、截图传播、修改和署名。
- `approvedUse` / `forbiddenUse`：写清允许的 runtime surface 和不能冒充的 gate claim。
- `attribution`：署名文本、license ledger 路径或明确 none。
- `fallbackId`：真实素材加载失败、缺图或可读性失败时的 deterministic fallback。

缺字段时只允许 `deferred` 或 `fallback-only`；GLM 不能代补 sourcing、license、style 或 reviewer 判断。
