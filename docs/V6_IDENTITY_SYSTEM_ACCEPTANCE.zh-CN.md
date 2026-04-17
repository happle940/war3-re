# V6-ID1 身份系统最小验收稿

> 生成时间：2026-04-14  
> 适用范围：V6 War3 identity alpha / V6-ID1  
> 用途：定义“至少一个英雄、法术、物品或等价身份系统”怎样才算有玩法表达。  
> 重要边界：本文件只写验收口径和可派发切片，不改运行时代码，不导入真实素材，不要求完整英雄池、完整法术书或完整物品系统。

## 1. V6-ID1 关什么

V6-ID1 要证明当前项目不只是“单位能移动、攻击、建造”，而是至少出现一个可观察的身份系统。这个系统可以是英雄、法术、物品，也可以是等价的 War3-like 身份表达。

最小通过必须同时满足五件事：

| 面 | 最小通过标准 | 不通过示例 |
| --- | --- | --- |
| 可见状态 | 玩家能看见该系统当前是否可用、进行中、冷却中、已生效或被限制。 | 只有一个按钮、图标、名字或说明文字。 |
| 触发方式 | 玩家或 AI 有真实触发入口，触发后 state log 或 DOM 能证明动作发生。 | 文案写“可使用”，但点击后没有状态变化。 |
| 效果反馈 | 触发后至少一个可观测效果改变了单位、战斗、状态、范围、持续时间或选择。 | 播放装饰动画，但没有 gameplay state。 |
| 限制条件 | 系统有成本、冷却、目标、前置、范围、唯一性或状态限制，且限制会给出真实 disabled reason。 | 可以无限按、永远有效、无目标校验。 |
| focused regression | 有 focused proof 覆盖触发、效果、限制、反馈和 cleanup。 | 只靠截图、手测描述或单次胜负。 |

## 2. 明确拒绝

下面内容不能关闭 V6-ID1：

- 只新增按钮、图标、热键、tooltip、名称或菜单分组。
- 只换颜色、换名字、加装饰动画或加占位文案。
- 只把 Rifleman、Long Rifles 或现有人族科技线再描述一遍。
- 只证明一场战斗胜负，而没有触发、效果、限制和反馈的独立证据。
- 只做完整英雄池、完整法术书、完整物品系统、商店、背包、经验等级或掉落系统的大设计。
- 导入官方素材、来源不明素材或未批准第三方素材。

## 3. 真实素材边界

V6-ID1 的第一批实现只能使用自制 fallback / proxy / 几何标记 / 现有项目内合法素材。

允许：

- 纯 CSS / Canvas / Three.js / DOM 状态标记。
- 自制简化图形、色块、描边、状态环、冷却遮罩。
- 已在项目内批准的 fallback/proxy 表达。

禁止：

- 官方 Warcraft 3 提取素材。
- 来源不明的图标、模型、音效或贴图。
- 未批准第三方素材。
- 把素材 sourcing、授权判断或风格审批交给 GLM。

素材表达只负责“反馈可见”，不能替代 gameplay state proof。

## 4. 可选最小切片

### 4.1 推荐切片：人族集结号令

| 项 | 内容 |
| --- | --- |
| 类型 | 等价法术 / 指挥能力。 |
| 核心想法 | 让一个已有或最小新增的人族指挥入口触发“集结号令”，短时间影响附近己方单位，例如移动、攻击节奏、集结状态或士气标记中的一种。 |
| 为什么推荐 | 它不需要完整英雄池、背包、商店或真实素材；可以用现有人族单位和简单状态反馈证明触发、效果、限制、反馈。 |
| 必须证明 | command-card 出现真实可用/不可用状态；点击触发后有 state log；效果只作用于合法目标；冷却或持续时间限制真实生效；状态结束后 cleanup 不残留。 |
| 禁止扩大 | 不做完整英雄等级、完整光环系统、完整士气系统、完整音效素材或正式技能树。 |

推荐把第一条 GLM runtime proof 切成：

```text
人族集结号令最小证明包：
- allowed files 只覆盖 GameData / Game / command-card 展示 / focused spec 的必要区域。
- proof 覆盖 trigger、effect、restriction、feedback、cleanup。
- 不导入真实素材，不新增完整英雄系统。
```

### 4.2 备选切片：队长代理光环

| 项 | 内容 |
| --- | --- |
| 类型 | 英雄-like 代理 / 被动身份系统。 |
| 核心想法 | 增加一个最小“队长”或等价身份单位，只证明它给附近人族单位一个可见、可测、有限范围的被动效果。 |
| 适合时机 | 当项目需要更明显的“英雄感”，但还不准备做经验、升级、技能点和物品。 |
| 必须证明 | 队长存在时效果生效；离开范围或队长死亡后效果消失；UI 能显示效果来源；state log 能证明范围与 cleanup。 |
| 风险 | 比“集结号令”更容易滑向完整英雄系统，所以默认不推荐第一批做。 |

### 4.3 备选切片：补给物品代理

| 项 | 内容 |
| --- | --- |
| 类型 | 物品-like 代理 / 消耗品身份系统。 |
| 核心想法 | 做一个固定来源的补给物品或一次性补给命令，证明“获得 -> 可用 -> 触发 -> 消耗 -> 反馈”。 |
| 适合时机 | 当后续想验证物品感或补给节奏，但还不做商店、掉落、背包。 |
| 必须证明 | 物品或补给状态可见；触发后产生有限效果；使用后消耗或进入不可用状态；无物品时 disabled reason 真实。 |
| 风险 | 需要最小库存或持有状态，容易扩成背包和商店系统，所以不是第一推荐。 |

## 5. 第一批 GLM proof 形状

无论选择哪条切片，focused proof 必须覆盖：

| Proof 面 | 必须证明什么 |
| --- | --- |
| `visible-state` | command-card、选择面板、状态文本、状态环或日志中能看见可用、冷却、持续、失效或限制状态。 |
| `trigger` | 玩家点击、AI 使用或测试直接触发后，fresh game state 里出现真实事件或状态变化。 |
| `effect` | 至少一个单位、建筑、战斗、范围、持续时间或状态字段发生可测变化。 |
| `restriction` | 缺前置、冷却中、目标非法、范围外、状态冲突或资源不足时不能触发，并显示真实原因。 |
| `feedback` | 玩家能看到触发成功、效果持续、效果结束或失败原因；反馈必须绑定 state，不只是装饰。 |
| `cleanup` | reload、return/re-entry、单位死亡、效果结束或重新开始后没有旧状态残留。 |

运行时 proof 仍必须遵守 runtime safety：如果测试杀单位、重载地图、训练/重建单位或触发 cleanup，必须 mutation 后重新读取 `window.__war3Game` / `g.units`，不能复用旧快照。

## 6. Codex 收口口径

后续 Codex 复核 V6-ID1 时，只能给出下面四类结论：

| 结论 | 条件 |
| --- | --- |
| `pass` | 五个 proof 面都有 focused evidence，且不是按钮/图标/文案占位。 |
| `insufficient-evidence` | 有实现或部分截图，但缺 trigger、effect、restriction、feedback 或 cleanup 的任何一面。 |
| `blocked` | focused proof 明确失败，例如限制不生效、效果无 state、cleanup 残留或素材边界违规。 |
| `defer` | 任务滑向完整英雄池、完整法术书、完整物品系统、真实素材或后续版本内容，需要重新拆分。 |

Codex 不能把 V6-ID1 通过扩大解释为：

- 完整英雄系统通过。
- 完整法术书通过。
- 完整物品/商店/背包通过。
- 完整人族身份表达通过。
- War3-like first-look 通过。

V6-ID1 只证明“至少一个身份系统已经有可观察玩法表达”。`V6-W3L1` 仍需要把 ID1、FA1 和人眼 review packet 合在一起判断。

## 7. 当前推荐

```text
V6-ID1 的第一条实现切片推荐“人族集结号令”。
它是最小等价法术/指挥能力：能证明可见状态、触发方式、效果反馈、限制条件和 focused regression，又不会提前引入完整英雄池、完整法术书、完整物品系统或真实素材。
```

## 8. 当前“人族集结号令”复核清单

GLM 当前正在执行 `人族集结号令最小证明包`。Codex 接受 closeout 前必须按下面清单复核，不能只看报告里写了 “passed”。

### 8.1 文件边界

允许范围：

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `src/styles.css`
- `tests/v6-human-rally-call-identity-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` 只允许做 closeout 状态同步

如果出现真实素材导入、完整英雄系统、完整法术书、物品/背包/商店、主菜单 UI 或其他测试无关文件，直接退回或接管。

### 8.2 必须证明的行为

| 面 | 接受口径 | 退回信号 |
| --- | --- | --- |
| 可见状态 | 玩家能在命令卡或选择面板看到可用、冷却中、增益中或被限制。 | 只有按钮，没有状态变化或 disabled reason。 |
| 触发入口 | 玩家拥有的合法人族单位能触发，触发后 runtime state 改变。 | 测试直接改字段，或敌方/建筑/非法对象也能触发。 |
| 效果 | 增益期间伤害或等价 gameplay state 有可测变化，结束后恢复。 | 只改文案/动画，或永久改变 `attackDamage`。 |
| 限制 | 冷却、持续时间、合法目标或范围限制真实生效。 | 可以无限连点、无限叠加、全地图生效或多选触发导致异常叠加。 |
| 反馈 | 成功、冷却、持续、结束都能被 HUD 或 state log 观察到。 | 反馈不随真实状态刷新，或缓存导致按钮/状态过期。 |
| cleanup | 新对局、reload、单位死亡、持续时间结束后没有旧状态残留。 | 旧 buff、旧 cooldown、旧 HUD 状态跨 fresh state 残留。 |

### 8.3 测试质量

`tests/v6-human-rally-call-identity-proof.spec.ts` 至少要覆盖：

1. 触发后单位进入有限持续的集结状态，并显示玩家可见反馈。
2. 增益期间伤害计算发生可测变化，但基础攻击值不被永久污染。
3. 冷却中不能再次触发，并显示真实原因。
4. 非法触发对象或非法目标不会生效。
5. 持续时间结束、新 fresh runtime 或 cleanup 后没有残留。

测试应尽量从 `GameData` / runtime state 推导期望，不能把当前数字写死后反过来证明代码正确。

### 8.4 Codex 本地验证命令

接受前至少跑：

```bash
./scripts/cleanup-local-runtime.sh
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-human-rally-call-identity-proof.spec.ts tests/v6-visible-numeric-hints-proof.spec.ts tests/v6-research-effect-model-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

如果实现触碰 `dealDamage()`、命令卡缓存、选择 HUD 或单位创建路径，Codex 应额外加跑：

```bash
./scripts/run-runtime-tests.sh tests/v6-attack-armor-type-proof.spec.ts tests/v5-human-long-rifles-tech.spec.ts tests/command-regression.spec.ts --reporter=list
```

若 `tests/command-regression.spec.ts` 在当前仓库不存在，应换成当前命令面相关 focused spec，不得跳过同类覆盖。

### 8.5 接受后动作

如果通过：

- 把 `V6-ID1` 在 `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md` 记录为 `engineering-pass`。
- 把 `V6-ID1` 在 `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md` 更新为 `engineering-pass`。
- 把 `人族集结号令最小证明包` 在 `docs/GLM_READY_TASK_QUEUE.md` 标记为 `accepted`。
- 再按 `docs/V6_FACTION_IDENTITY_TASK_SEED.zh-CN.md` 派发 `FA-B`。

如果不通过：

- 不派 FA-B。
- 只补 ID1 repair，不生成新的身份系统候选。
