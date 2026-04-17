# Shell -> Battlefield Cutover Criteria

> 用途：定义什么时候当前 shell / front-door trunk 已经足够收口，Codex 可以把 battlefield readability 重新打开为 V2/V3 的主要压力线。
> 范围：本文只处理当前 `V2 credible page-product vertical slice` 到 `V3 battlefield + product-shell clarity` 的切换标准，不宣称完整 War3 parity、完整产品壳层或公开 demo 已完成。

## 0. Cutover 的真实含义

这里的 cutover 不是说 shell 已经做完，也不是说 battlefield 可以跳过 V2 gate。

它只表示：

```text
shell/front-door 的剩余问题已经足够清楚、可回归、可路由；
Codex 不再需要把主要注意力继续压在 shell 真实性上；
可以把 battlefield readability 重新作为下一条主攻线推进。
```

换句话说，cutover 是“主攻权重切换”，不是“产品完成宣言”。

## 1. 必须先关闭的 shell gate

这些 gate 没过之前，Codex 不应把 battlefield readability 设为主要压力线，只能做并行准备或 intake 工作。

| Gate | 必须证明什么 | 证据形态 | 未过时怎么处理 |
| --- | --- | --- | --- |
| `S1 front-door truth` | 前门有真实入口；`start current map` 或等价 quick-start 路径能进入已验证对局。 | front-door acceptance / focused runtime proof / queue closeout。 | 继续 shell trunk，不切主攻。 |
| `S2 mode-select honesty` | 如果出现 mode-select，它只能启用真实 playable path；disabled / absent 分支不伪装完整模式。 | `MODE_SELECT_ACCEPTANCE_MATRIX` + `MODE_SELECT_PLACEHOLDER_REVIEW_CHECKLIST` 结论。 | 先修 fake route / fake wording。 |
| `S3 session shell seam` | pause、setup、results、reload、terminal reset、return source 不产生 stale state。 | session-shell / return-to-menu regression pack。 | 暂停新 shell queue refill，先集成。 |
| `S4 visible shell copy` | README、share copy、front-door/session wording 不把 V2 slice 写成 finished product。 | C72 reality sync 或同等文案审查。 | 先修外部口径。 |
| `S5 secondary surfaces boundary` | settings、help、briefing、last-session summary 若出现，只能证明真实内容，不用容器冒充进展。 | C77 / C80 acceptance matrix 或明确 absent。 | 路由为 GLM-safe slice、Codex truth work 或 user judgment。 |
| `S6 unresolved shell slices cap` | 未 review shell slice 不超过 cadence cap；没有堆积的 disconnected shell truth。 | C71 cadence 表、队列状态、review log。 | Codex 停止开新前线，先 review / integrate。 |
| `S7 V2 remaining gates` | V2 remaining gate list 中 shell blocker 已关闭、降级为 residual debt，或明确等待用户判断。 | `V2_PAGE_PRODUCT_REMAINING_GATES` / 后续 evidence ledger。 | 不能 true cutover，只能并行 battlefield 准备。 |

最低可切换组合：

```text
S1 + S2 + S3 必须有工程证据；
S4 + S5 必须没有对外或 UI 过度声明；
S6 必须没有未 review 堆积；
S7 必须把剩余项标成 blocker / residual / user judgment。
```

## 2. 可以并行推进的 battlefield gate

下面这些 battlefield 工作不需要等 shell 全部完成，可以和 shell 收口并行推进；但它们不能替代 shell gate，也不能被写成 V2 已完成。

| Battlefield gate | 可并行做什么 | 不可提前做什么 |
| --- | --- | --- |
| `B1 battlefield intake` | worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain/readability aids 的 approval matrix、fallback、hard reject。 | 未经 Codex approval 直接让 GLM import real assets。 |
| `B2 approval handoff packet` | 准备 approved batch packet、source evidence、target keys、fallback regression expectation。 | 用 chat memory 当 approval，或让 GLM 猜素材来源。 |
| `B3 readability proxy proof` | 用 proxy / S0 fallback 测默认镜头下角色、建筑、资源点可读性。 | 把 proxy 当最终美术完成。 |
| `B4 human opening grammar draft` | TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔的空间语法、截图审查点、测试候选。 | 直接改成完整地图/完整 War3 base layout。 |
| `B5 camera / HUD / footprint measurement` | 做测量、截图包、遮挡检查和回归候选。 | 以视觉品味替代用户人眼 gate。 |

并行规则：

- 只要不修改同一批 shell 文件，不阻塞 shell review，就可以推进 battlefield intake / proof。
- 并行 battlefield 只能产出准备材料、approval surface、focused proof 或候选任务。
- 不能因为 battlefield 有进展，就跳过 S1-S7 的 shell cutover 标准。

## 3. 防止过早切换的证据闸

满足以下证据前，任何“转去 battlefield”都只能写成并行准备，不能写成主线 cutover。

| 证据闸 | 要求 |
| --- | --- |
| `E1 branch inventory` | 当前 shell 可见入口、enabled / disabled / absent branch、session seam 必须有清单。 |
| `E2 regression floor` | front-door、session-shell、return-to-menu 或 mode-select 的相关 focused pack 已通过，或明确记录为什么暂不可跑。 |
| `E3 queue cleanliness` | `CODEX_ACTIVE_QUEUE` 和 `GLM_READY_TASK_QUEUE` 没有未分类 shell blocker；未 review shell slice 不超 C71 cap。 |
| `E4 residual debt label` | 每个未完成 shell gap 都被标成 blocker、residual debt、GLM-safe slice、Codex-only truth work 或 user judgment。 |
| `E5 copy truth` | 内外口径都写成 V2 page-product slice，不写成 finished product、完整主菜单或 War3 parity。 |
| `E6 battlefield source truth` | 若切到 asset/readability work，必须有 intake matrix、approved batch 或 fallback rule；不能靠非批准素材推进。 |

任何一个证据闸失败，Codex 应执行：

```text
暂停新的 shell queue refill；
先 review / integrate / route 当前 shell gaps；
只保留不冲突的 battlefield intake 准备；
不把 battlefield 改为主攻。
```

## 4. 用户判断仍然必需的地方

Codex 可以判定工程证据是否足够，但 true cutover 仍有几类用户判断不能代替：

- `U1 shell 产品感`：用户是否接受当前 front door / session shell 已足够支撑 V2 内部验证，而不是仍像测试 harness。
- `U2 disabled vs absent 产品承诺`：哪些未来模式可以 visible disabled，哪些必须 absent，仍需要用户认可。
- `U3 battlefield first-look`：默认镜头下 worker、footman、建筑、矿、树线、地形是否一眼像 War3-like 战场，必须有人眼 gate。
- `U4 素材方向`：approved real batch、proxy fallback、hybrid route 的视觉方向，需要用户最终确认。
- `U5 对外表达`：是否进入 private playtest / public share，仍走 M6/M8 类 gate，不由 cutover 自动批准。

没有用户判断时，Codex 最多可以说：

```text
engineering-ready for battlefield primary pressure
```

不能说：

```text
shell accepted by user
battlefield readability accepted
V2 finished
public-share ready
```

## 5. Cutover 结论格式

每次决定是否从 shell 主攻切回 battlefield，必须写成下面格式：

```text
Shell gates closed:
Shell gates still open:
Open items classified as blocker / residual / user judgment:
Battlefield gates allowed in parallel:
Regression evidence:
User judgment still required:
Decision: hold-shell-primary / allow-parallel-battlefield / switch-battlefield-primary
```

结论解释：

| Decision | 含义 |
| --- | --- |
| `hold-shell-primary` | shell blocker 仍影响 V2 真实产品入口，battlefield 只能做 intake 准备。 |
| `allow-parallel-battlefield` | shell 主线仍未完全切走，但 battlefield 可推进不冲突的 readability / approval work。 |
| `switch-battlefield-primary` | shell gate 已足够关闭或路由，Codex 可把 battlefield readability 设为下一主攻线；用户人眼 gate 仍另行保留。 |

## 6. 当前推荐状态

当前应采用保守口径：

```text
先把 shell gate 证明、路由和 review cadence 收清；
同时允许 battlefield intake / approval / fallback 继续并行；
只有当 S1-S7 都有明确证据或路由后，
才把 battlefield readability 切成主要压力线。
```

这能避免两个坏结果：

- shell/front-door 还在撒谎时，项目又回到“直接进局的测试 harness”。
- battlefield/readability 一直被 shell 文档工作饿住，V3 第一眼战场迟迟不开工。
