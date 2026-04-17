# War3 页面版完整产品总规划

> 用途：重新定义这个项目的顶层目标。  
> 这份文档把项目从“一个会自动开局的局内 RTS slice”重写成“一个完整的 War3 页面版产品”。

## 1. 先把误区说透

过去顶层规划最大的盲点，不是少写了一个“菜单页”，而是：

```text
我们把产品默认为“打开页面就直接进局的 RTS 模拟器”，
而不是“一个有前门、有开始方式、有设置、有暂停、有结算、有返回路径的完整产品”。
```

这会带来连锁错误：

1. 菜单、设置、暂停、结算会被误归类为“后期包装”
2. 顶层规划会天然偏向局内系统，而忽略产品会话结构
3. 阶段任务会不断从当前游戏内缺口出发，而不是从完整产品体验出发

所以从现在开始，顶层目标必须改写为：

```text
做一个完整的 War3 页面版产品，
而不是只做一个可运行的 War3-like 对局内核。
```

## 2. 什么叫“完整的 War3 页面版产品”

这里的“完整页面版”不是说马上做到完整 Warcraft III。

它的意思是：一个玩家打开网页后，应该经历完整而自然的产品路径：

1. 进入前门
2. 理解自己在哪里
3. 选择模式或开始方式
4. 配置一局
5. 进入对局
6. 可以暂停、调整、退出、重开
7. 看到清楚的胜负与结果
8. 能返回、再来一局、换地图、改设置

换句话说：

```text
完整页面版 = 产品壳层 + 对局壳层 + War3-like 对局内核
```

## 3. 完整页面版的产品层级

| 层级 | 名称 | 作用 | 当前状态 |
| --- | --- | --- | --- |
| `L0` | 产品前门 | 告诉玩家“这是什么、从哪里开始” | V2 最小前门已进入 acceptance 口径；完整前门仍未完成 |
| `L1` | 会话壳层 | 组织开始、暂停、结束、返回 | pause / setup / results / reload 等 seam 已有 proof 路线；完整 return/re-entry 仍按后续任务推进 |
| `L2` | 对局配置层 | 组织地图、模式、难度、阵营、规则选择 | 仍主要是 placeholder / dormant；只能按真实 enabled/disabled/absent 状态验收 |
| `L3` | 对局内核层 | 组织命令、经济、建造、战斗、AI | 部分成立 |
| `L4` | 战场与可读性层 | 组织第一眼战场判断和空间语法 | 明显不足 |
| `L5` | 对局弧线层 | 组织一局的开始、中期压力、结束 | 明显不足 |
| `L6` | 战略深度层 | 组织 tech / timing / counter / 重玩理由 | 大量缺失 |
| `L7` | War3 身份层 | 组织英雄、中立、法术、种族识别 | 大量缺失 |
| `L8` | 外部产品化层 | 组织 README、说明、私测、分享、反馈 | 大量缺失 |

## 4. 必须存在的页面 / 状态 / 会话节点

### `S0` 标题页 / 主菜单

- 进入产品的前门
- 至少提供：开始游戏、模式入口、设置、版本状态
- 如果出现“上局摘要 / last-session summary”，必须遵守 `docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md`：只展示真实 session facts，不暗示存档、match history、profile、campaign progress 或 replay。

### `S1` 模式选择页

- 让玩家知道自己可以怎么开始
- 至少提供：快速开始、skirmish/自定义地图、sandbox/test mode
- 当前验收口径由 `docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md` 约束：`V2` 只接受诚实 placeholder，只有真实可玩的路径可以 enabled，未实现的近邻路径必须 disabled 或 absent。

### `S2` 对局配置页

- 让玩家在开始前形成“我要打一局什么”
- 至少提供：地图、难度、阵营、规则开关

### `S3` Loading / Briefing 页

- 让玩家从菜单世界进入对局世界
- 至少提供：地图名、目标、控制提示

### `S4` 局内主页面

- 承载 RTS 主体验
- 至少提供：HUD、minimap、command card、资源/人口、状态反馈

### `S5` Pause / System Menu

- 允许玩家中断会话而不失去控制
- 至少提供：继续、重开、返回菜单、设置

### `S6` Victory / Defeat / Results 页

- 让一局有收口
- 至少提供：胜负结果、摘要、再来一局、返回菜单

### `S7` 设置页

- 让页面版产品真正可调、可理解
- 至少提供：音量、画面、操作/热键说明、HUD/镜头选项

### `S8` 帮助 / 控制说明页

- 降低第一次进入成本
- 至少提供：鼠标语义、常用命令、当前已实现/未实现边界

## 5. 为什么菜单不是“后期包装”

菜单不是装饰，不是 marketing，不是上线前才补的壳。

它至少承担 5 个产品职责：

1. 定义产品边界
2. 定义入口与模式
3. 定义会话控制权
4. 定义对局前理解
5. 定义产品完成感

所以它不是 `H7` 的东西，而是很早就应该存在最小版的产品结构。

当前产品壳层是否“成立”，用 `docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md` 做验收口径。

从 `C68` 起，本文只描述完整页面版产品目标；具体某个 surface 能否算作当前 `V2 credible page-product vertical slice` 的事实，必须按 acceptance brief 的 `accept` / `defer` / `reject` / `needs-user-judgment` 分类处理。

这份 acceptance brief 把产品壳层拆成三类判断：

- real front door：普通访问路径、开始动作、runtime-test bypass、当前来源说明是否真实。
- truthful pause/results loop：pause、setup、results、reload、return-to-menu 是否有真实会话状态和回归证明。
- dormant infrastructure：mode select、loading、settings、help、re-entry、asset-backed shell 等是否仍只能写成计划或占位。

因此，后续不能把“DOM 容器存在”“按钮能点”“GLM closeout green”直接写成“产品壳层通过”。

模式选择的占位和升级边界，单独用 `docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md` 判断。

这份 matrix 固定四件事：

- `V2` 允许一个真实 placeholder，但 enabled path 必须真的能进入已验证对局。
- manual map entry、custom map、skirmish、sandbox/test mode 只能按真实实现程度 enabled、disabled 或 absent。
- 完整 skirmish setup、地图池、阵营/难度/规则开关属于 `V3/V4` 产品工作。
- 战役、多人、天梯、完整四族、英雄和长期模式生态不能被 mode-select placeholder 提前暗示。

前门上的 last-session summary 也必须单独验收：

- `docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md`

这份 matrix 固定：summary 只能展示真实 terminal/results/session source 已经知道的小事实；没有有效记录时要显示 empty state 或隐藏；不能把一块摘要面板写成继续游戏、完整历史、战报、账号资料、战役进度或 replay 系统。

## 6. 当前产品和“完整页面版”的真实差距

### 已经进入 V2 acceptance 的事实

- 对局内核的一部分：选择、命令、采集、建造、训练、基础战斗和 AI 已有 runtime proof 路线。
- 最小 front door / menu shell：普通入口、当前可玩路径、runtime-test bypass 和 mode placeholder 已纳入真实/禁用/缺席判断。
- 会话壳层：pause、setup、results、reload、terminal reset 和 session transition 已有 focused proof 路线。
- 二级 surface：help、settings、briefing 的当前内容、返回路径和边界必须按 secondary acceptance 记录。

### 仍不能写成完整页面版完成

- 完整主菜单、完整模式池、完整 map browser、难度/阵营/规则配置。
- 完整 loading / briefing、失败恢复、正式 onboarding。
- 完整 return-to-menu / re-entry / rematch / session continuity。
- 完整设置系统、热键重绑定、音频/画面偏好持久化。
- 资产驱动的 shell 视觉、最终 UI identity、公开分享包装。

### 这意味着什么

当前产品不再只是“自动进局的 RTS 原型”，但也不是完整页面版产品。当前准确口径是：

```text
V2 credible page-product vertical slice candidate:
最小页面产品事实正在成立，完整产品壳层仍在 V3+ 继续推进。
```

## 7. 顶层规划以后必须分成三条主线

### 主线 A：产品壳层

- 前门
- 模式选择
- 对局配置
- Loading / Briefing
- Pause
- Results
- Settings / Help

主线 A 的第一批素材 intake / approval 由 `docs/PRODUCT_SHELL_ASSET_INTAKE_MATRIX.zh-CN.md` 约束。

这意味着 title、menu、loading、pause、results、settings、help 和 shared shell chrome 只有在来源、许可、hard reject、tone/style、fallback 和 surface fit 都明确时，才可以进入 `approved-for-import`。在没有批准素材包时，产品壳层仍然用 `S0` 程序化 / 自制 fallback 推进；不能把来源不清、官方相似、War3 parity 暗示或 reference-only 素材当作临时成品塞进页面。

当前口径仍然是：

```text
V2 credible page-product vertical slice
```

所以产品壳层素材只负责让页面产品路径可信、可读、可操作，不承诺完整战役、完整四族、英雄系统、多人平台或官方授权。

### 主线 B：War3-like 对局内核

- 输入
- 经济
- 建造
- 战斗
- AI
- 可读性
- 基地语法

### 主线 C：长期深度与产品化

- 战略骨架
- 身份系统
- 外部试玩
- 长期扩展

过去的问题是：

```text
我们几乎只在推进主线 B，
偶尔讨论主线 C，
而主线 A 基本没被写进顶层总规划。
```

## 8. 正确的顶层拆法

以后不应该再直接从“当前最缺哪个 gameplay contract”开始。

而应该先问：

1. 完整页面版产品还缺哪一层
2. 这一层缺哪些具体页面 / 系统 /能力
3. 再把它们映射到未来地平线和 capability program
4. 最后才生成阶段任务

## 9. 一句话复盘

```text
过去的顶层规划，是在规划“怎么把局内 RTS 做对”；
但你真正要的是“怎么把它做成一个完整的 War3 页面版产品”。
```
