# 素材采集与资产治理

> 用途：把“谁去找素材、找什么素材、按什么边界找、找完怎么落库”从隐含职责变成显式执行线。

## 1. 先把现实说清楚

如果没有明确任务卡，素材不会“自然出现”。

当前仓库里已经有：

- 资产导入与可读性相关代码
- proxy / hybrid 的讨论
- 视觉可读性角色定义

但还没有被正式写成一条持续执行线的，是：

- 谁现在就去找素材
- 先找哪一批
- 哪些是局内素材，哪些是页面壳层素材
- 哪些只是参考图，哪些是可直接进入仓库的候选资源
- 许可、来源、替换计划由谁维护

所以从现在开始，必须把“素材采集”当成正式生产任务，而不是附属工作。

## 2. 临时执行口径

在没有稳定专职 owner 之前，按下面的口径执行：

| 职能 | 临时 owner | 负责什么 | 不负责什么 |
| --- | --- | --- | --- |
| 素材采集总协调 | Codex lane | 定义优先级、缺口、批次、接入顺序 | 不替代最终美术判断 |
| 局内视觉素材筛选 | 技术美术 / 可读性方向 | worker、footman、建筑、树线、金矿、地表等素材候选 | 不做许可拍板 |
| 页面壳层素材筛选 | HUD/UX + 演出方向 | menu、loading、pause、results、settings、help 素材候选 | 不做局内空间语法判断 |
| 音频素材筛选 | 演出 / 音频方向 | UI SFX、环境、战斗反馈、BGM 候选 | 不做系统实现 |
| 落库与格式治理 | 技术总监 / 工程侧 | 命名、格式、压缩、atlas、导入规范 | 不做风格路线拍板 |
| 资产合同与导入验证 | GLM lane | 在候选资源确定后做 manifest、fallback、import contract、回归验证 | 不负责 sourcing / licensing 决策 |

一句话：

```text
找素材这件事，当前必须由 Codex lane 显式推进；
GLM 只在素材被选定后接管机械化导入和验证。
```

## 3. 素材批次必须怎么拆

### `A1` 战场可读性素材包

目标：先解决“像不像一片能读懂的 War3-like 战场”。

范围：

- worker
- footman
- townhall
- barracks
- farm
- tower
- goldmine
- tree line / forest mass
- ground / cliff / path 基础贴图或替代方案

验收标准：

- 默认镜头下轮廓可分
- 单位与建筑角色不混淆
- TH / 矿 / 树线 / 出口关系读得出来
- 不破坏现有运行时合同

当前 `A1` 的控制文档是：

- `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md`

这份矩阵对应 `C69`，只负责 worker、footman、townhall、barracks、farm、tower、goldmine、trees / tree line、terrain readability aids 的第一批可读性素材批准规则。

`A1` 的 controlling approval surface 只有这份 battlefield intake matrix。聊天记录、松散候选清单、reference board、购买截图、GLM closeout 或“先导入看看”的便利判断，都不能替代它。

所以 `A1` 现在不是追求最终战场美术，而是先建立合法、可追溯、默认镜头可读、可回退的 battlefield readability approval surface。

若没有任何 approved real batch，`A1` 不阻塞战场可读性推进；默认继续使用或建立 `S0` proxy / 程序化 fallback，并把缺图、加载失败和 fallback 行为留给 GLM 在批准后做机械验证。

2026-04-14，Codex 已产出第一批 A1 fallback-only 批准交接包：

- Packet id: `asset-handoff-a1-s0-fallback-001`
- 控制文档：`docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md`
- 批准范围：九类 A1 battlefield target key 的 `S0` fallback route。
- 未批准范围：没有任何真实 `S1/S2/S3/S6` battlefield asset 被批准导入；官方/ripped/fan remake/来源不明/网页截图/未授权 AI 生成候选仍禁止进入仓库。

因此 GLM 在 `A1` 上不再因为“缺批准包”整体 blocked，但只允许接这个 fallback-only packet 做 manifest、catalog、fallback wiring、缺图回退和 runtime regression。GLM 仍不能做 sourcing、licensing、art-direction 或 human readability approval。

### `A2` 页面壳层素材包

目标：把产品从“直接进局”变成“有前门和收口”。

范围：

- title / main menu 背景和装饰
- mode select / skirmish / sandbox 入口素材
- loading / briefing 背景与图标
- pause / results / settings / help 的 UI 素材
- 页面壳层基础 icon 集

验收标准：

- 页面态与局内态视觉上能区分
- 主菜单、pause、results 不是纯文本临时页
- UI 素材风格不和局内完全断裂

当前 `A2` 的控制文档是：

- `docs/PRODUCT_SHELL_ASSET_INTAKE_MATRIX.zh-CN.md`

这份矩阵对应 `C70 / C62`，只负责 title、menu、loading/briefing、pause、results、settings、help 和 shared shell chrome 的 intake / approval 规则，包括 legal source、hard reject、tone/style、fallback 和 GLM handoff 边界。它服务当前真实里程碑：

```text
V2 credible page-product vertical slice
```

所以 `A2` 现在不是追求最终商业美术，也不是复刻 Warcraft III 官方壳层或承诺 War3 parity，而是先建立合法、可回退、可验证的页面产品素材入口。

若没有任何 approved shell batch，`A2` 不阻塞产品壳层推进；默认回退到 `S0` 程序化 / 自制 fallback，让每个 shell surface 先具备清楚标题、主操作、状态、返回路径和帮助说明。

### `A3` 音频与交互反馈素材包

目标：补会话层和基础交互反馈。

范围：

- UI hover / click / confirm / cancel
- selection / command / error feedback
- gather / build / combat 最小反馈
- menu / loading / results 的最小氛围层

### `A4` 资产台账与替换计划

目标：避免仓库里堆满来源不明、状态不明的素材。

每个候选素材至少要记录：

- 用途
- 来源
- 许可状态
- 当前状态：reference / candidate / approved / integrated / deprecated
- 替换计划

### `A5` 资产批准交接包

目标：把 Codex 批准后的素材批次变成 GLM 可以机械导入和验证的固定 packet。

当前 `A5` 的控制文档是：

- `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md`

这份 packet 对应 `C75`，只定义批准后交给 GLM 的必填字段、fallback、target runtime key、license evidence、regression 期望和退回规则。

没有 `A5` packet 时，不允许 GLM 依据聊天记忆、口头批准或不完整候选清单导入素材。

### `A-Human` 人族科技/建筑/单位素材包

目标：把人族 roster、建筑、科技图标、projectile、法术/英雄/工程/空军素材，从“以后再找”变成持续台账。

当前控制文档是：

- `docs/HUMAN_ASSET_PREP_PACKET.zh-CN.md`

当前口径：

- `A-H1` 服务 V5 的 `Blacksmith -> Rifleman -> Long Rifles` 最小玩家可见科技线。
- `A-H1` 当前只允许 `S0` 项目自制 fallback/proxy，不能导入真实第三方素材。
- `A-H1` 的当前 fallback-only 交接包是 `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md` 里的 `asset-handoff-human-h1-s0-fallback-001`。
- Quaternius、Kenney、KayKit、Game-icons.net 等来源只作为候选池；每个真实素材必须单独补来源、许可证、文件计划、fallback、默认镜头可读性和署名方案。
- GLM 当前只能接 H1 fallback/proxy 的运行时接入与验证，不能做 sourcing、licensing 或真实素材导入。
- H2-H9 继续覆盖 Militia、Defend、Lumber Mill、塔线、Workshop、Arcane Sanctum、Gryphon Aviary、Altar、英雄和法术素材。

## 4. 当前优先级

按产品逼近顺序，不按“哪个看起来酷”排序：

1. `A1` 战场可读性素材包
2. `A2` 页面壳层素材包
3. `A-Human` 人族科技/建筑/单位素材包
4. `A4` 资产台账与替换计划
5. `A5` 资产批准交接包
6. `A3` 音频与交互反馈素材包

原因很简单：

- 没有 `A1`，项目第一眼不像 War3-like 战场
- 没有 `A2`，项目不是完整页面版产品
- 没有 `A-Human`，人族科技线会停留在名字和数值，玩家看不到新兵种、新建筑和新研究
- 没有 `A4`，后面会失控
- 没有 `A5`，GLM 导入会依赖聊天记忆而不是批准证据
- `A3` 很重要，但应该在前两批之后并行补

## 5. Codex 与 GLM 后续怎么分工

### Codex lane

- 写 sourcing brief
- 定义每批素材缺口
- 判定先收哪一批
- 对齐产品风格与合法边界
- 审核“哪些可以进仓库、哪些只能做参考”
- 维护 `BATTLEFIELD_ASSET_INTAKE_MATRIX` 里的 battlefield source class、hard reject、readability gate、fallback 和 approved-for-import 边界
- 维护 `PRODUCT_SHELL_ASSET_INTAKE_MATRIX` 里的 shell source class、hard reject、tone/style、fallback 和 approved-for-import 边界
- 产出 `ASSET_APPROVAL_HANDOFF_PACKET`，明确 approved candidates、fallback、source evidence、target runtime keys、regression 期望和退回规则

### GLM lane

在 Codex 给出完整批准交接包后，GLM 才接手：

- 资产清单同步
- manifest / catalog 接入
- fallback 规则
- 资源缺失时的 deterministic behavior
- 资产导入回归测试

GLM 不接下面几类输入：

- 只有聊天里说“这批可以”的素材
- 只有候选清单但没有 `approved-for-import` 和 fallback 的素材
- 来源、许可证、署名或再分发限制不清的素材
- reference-only、hard reject 或产品承诺风险未判定的素材

## 6. 当前结论

从现在开始，答案不再是“也许以后有人会去找素材”，而是：

```text
素材采集已经被正式立项；
Codex lane 先负责把战场素材包和页面壳层素材包拉起来；
GLM 后续只接完整资产批准交接包内的导入与验证。
```
