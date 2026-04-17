# H1 人族火枪手科技线范围包

> 用途：把 `V5-HUMAN1` 的玩家可见人族 roster / tech 缺口切成 GLM 可执行的最小实现路线。  
> 来源背景板：`docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`。  
> 当前结论：H1 只做 `Blacksmith -> Rifleman -> Long Rifles -> AI composition`，不做完整人族科技树。

## 0. Closeout 口径

```text
milestone: V5 strategy backbone alpha
gate: V5-HUMAN1
scopePacket: H1 Rifleman tech line
status: engineering-pass / blocker-cleared
```

H1 要回答的是一个很窄的问题：

> 玩家现在是否能看见、训练、研究并遭遇一条新人族单位/科技线，而不是继续只有 worker + footman。

H1 不回答：

- `V5-COUNTER1` 是否通过。
- 完整人族科技树是否完成。
- 英雄、法术、物品、车间、空军、骑士、法师线是否完成。
- 真实素材是否批准或导入。
- V6 War3 identity alpha 是否启动。

## 1. H1 最小路线

H1 的唯一实现路线是：

```text
Peasant / worker -> Farm -> Barracks -> Blacksmith -> Rifleman -> Long Rifles -> AI Rifleman composition
```

最小玩家可见结果：

1. 玩家能建造 `Blacksmith`。
2. `Barracks` 在没有完成 `Blacksmith` 时显示 `Rifleman` 训练入口，但必须禁用并给出真实原因。
3. `Blacksmith` 完成后，玩家能从 `Barracks` 训练 `Rifleman`。
4. `Rifleman` 是真实单位数据，消耗资源和人口，有远程攻击行为，不能由测试直接 spawn 冒充。
5. 玩家能在 `Blacksmith` 或等价真实研究入口研究 `Long Rifles`。
6. `Long Rifles` 完成后，`Rifleman` 的射程或实战交战距离有可复跑差异。
7. AI 能使用同一套建筑、训练、研究规则形成可观察的 `Rifleman` composition，不得绕过资源、人口、建筑前置或研究状态。

## 2. 明确不做

H1 禁止扩张到：

| 不做内容 | 原因 |
| --- | --- |
| 完整人族科技树 | H1 只关玩家可见第一条新人族单位/科技线。 |
| Blacksmith 全攻防三段升级 | `Long Rifles` 是本包唯一研究目标。 |
| Knight、Militia、Priest、Sorceress、Mortar、Flying Machine、Gryphon、Dragonhawk | 这些属于后续 H2-H5 或 V6+，不能抢 H1 范围。 |
| 英雄、法术、物品、Altar、Arcane Vault | 属于 V6 identity 或更后阶段。 |
| Workshop、Arcane Sanctum、Gryphon Aviary、Lumber Mill tech line | 需要独立系统合同。 |
| 完整 AI build order 或平衡调参 | H1 只证明 AI 会用 Rifleman 线，不做全局智能。 |
| 真实素材导入 | 当前只允许 fallback / proxy。 |
| `V5-COUNTER1` closeout | H1 可以给 COUNTER1 提供未来输入，但不能关闭 COUNTER1。 |

## 3. 素材规则

给用户看的素材边界：

- 当前只允许项目自制的 fallback / proxy。
- Rifleman 可以先用自制低模、几何组合、简化枪管、队伍颜色和程序化 projectile 表达“远程火枪兵”。
- Blacksmith 可以先用自制建筑 proxy 表达“铁匠铺”：烟囱、铁砧、锻造屋轮廓即可。
- Long Rifles 图标可以先用自制枪管 / 射程 icon。
- 禁止导入官方提取模型、官方图标、官方音频、截图转贴图、来源不明素材、未批准第三方素材。
- GLM 不负责 sourcing、授权判断或风格审批；GLM 只能使用 packet 已允许的 fallback / proxy。

H1 的素材不是最终美术验收。只要默认镜头下能读出新建筑、新远程单位和研究状态，就可作为工程 proof 的 fallback 通过。

## 4. GLM 后续切片

### Task 104 — H1 Blacksmith 与 Rifleman 可玩切片

Status: `done`.

Gate: `V5-HUMAN1`.

Goal:

新增最小 Blacksmith + Rifleman 玩家可玩链路：玩家能建 Blacksmith，Barracks 在 Blacksmith 完成后能训练 Rifleman；没有 Blacksmith 时命令卡给出真实禁用原因。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `src/game/AssetCatalog.ts`
- `tests/v5-human-rifleman-techline.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Runtime proof:

- `Rifleman` 存在于真实 unit data，不是测试直接 spawn。
- `Blacksmith` 存在于真实 building data，可由玩家建造并完成。
- `Barracks` 命令卡显示 Rifleman；无 Blacksmith 时 disabled reason 可见。
- Blacksmith 完成后 Rifleman 可训练，资源和人口真实扣除，新单位从 Barracks 出生。
- Rifleman 有基础远程攻击或 projectile / attackRange proof。
- 默认镜头下 Rifleman 和 Blacksmith 使用 fallback/proxy 可读。

Cleanup / verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v5-human-rifleman-techline.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Forbidden:

- 不做 Long Rifles。
- 不做完整 Blacksmith 攻防升级。
- 不做 AI composition。
- 不做英雄、法术、车间、空军、真实素材导入。

### Task 105 — H1 Long Rifles 研究切片

Status: `done`.

Gate: `V5-HUMAN1`.

Goal:

新增最小 `Long Rifles` 研究：研究完成后 Rifleman 射程增加，命令卡显示真实研究状态，不能重复研究。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v5-human-long-rifles-tech.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Runtime proof:

- Long Rifles 通过真实 research queue 或等价 runtime research state 完成，不是测试直接改数值。
- 研究按钮存在真实 enabled / disabled / completed 状态。
- 资源不足、前置不足、已研究时，命令卡原因真实可见。
- 研究前后 Rifleman attackRange 或实战交战距离有可复跑差异。
- 研究状态影响新训练和已有 Rifleman 的口径必须写清。

Cleanup / verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v5-human-long-rifles-tech.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Forbidden:

- 不做 Blacksmith 全攻防三段。
- 不做 Rifleman 之外的科技。
- 不做完整 research system 抽象，除非它是 Long Rifles 最小实现所必需。
- 不做英雄、法术、车间、空军、真实素材导入。

### Task 106 — H1 AI Rifleman 组成切片

Status: `done`.

Gate: `V5-HUMAN1`.

Goal:

让 AI 在同一套 Blacksmith / Rifleman / Long Rifles 规则下形成可观察 composition：会建 Blacksmith，会训练 Rifleman，必要时研究 Long Rifles。

Allowed files:

- `src/game/SimpleAI.ts`
- `src/game/Game.ts` only if AI hook needs existing public game APIs exposed
- `tests/v5-human-ai-rifleman-composition.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Runtime proof:

- AI 不直接 spawn Rifleman。
- AI 不绕过资源、人口、建筑前置或研究状态。
- state log 记录 AI 的 Blacksmith、Rifleman、Long Rifles 或未研究原因。
- AI composition 与原 footman-only 路线有可观察差异。
- proof 必须在训练、建造、研究或 cleanup 后重新读取 fresh `window.__war3Game` / `g.units`，不能用旧单位快照。

Cleanup / verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v5-human-ai-rifleman-composition.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Forbidden:

- 不做完整 AI build order 智能。
- 不做平衡 polish。
- 不关闭 `V5-COUNTER1`。
- 不做英雄、法术、车间、空军、真实素材导入。

## 5. H1 closeout 标准

H1 可以关闭 `V5-HUMAN1` 的工程 blocker，只有在三段 proof 都成立后：

| 证明面 | 通过标准 |
| --- | --- |
| 玩家可训练 | Blacksmith 完成后，玩家从 Barracks 真实训练 Rifleman。 |
| 玩家可研究 | Long Rifles 通过真实研究状态完成，且研究前后 Rifleman 射程或交战距离不同。 |
| AI 可使用 | AI 用同一套规则建 Blacksmith、训练 Rifleman，并至少一次形成非 footman-only composition。 |
| 命令卡真实 | Rifleman 和 Long Rifles 的 enabled / disabled / completed reason 与 runtime state 一致。 |
| 素材合规 | 只用自制 fallback/proxy；无官方提取、来源不明或未批准第三方素材。 |
| V5-COUNTER1 独立 | H1 不能替代 COUNTER1 proof；counter 仍需独立 relation / composition / combat log。 |

H1 失败或 insufficient-evidence 时，必须点名失败发生在：

- Blacksmith 前置。
- Rifleman 训练。
- Rifleman 远程攻击或可读性。
- Long Rifles 研究状态。
- Long Rifles 射程变化。
- AI composition。
- 素材边界。

## 6. 当前结论

```text
H1 scope packet 已定义。
Task 104 已完成 Blacksmith/Rifleman 玩家链路，Task 105 已完成 Long Rifles 研究链路。
Task 106 已完成 AI Rifleman composition 链路；Codex 复核补了 Blacksmith 丢失后不排 Rifleman 的前置保护测试。
V5-HUMAN1 工程项可以关闭，但这不等于完整人族完成。
V5-COUNTER1 保持独立，不由 H1 关闭。
H1 只允许 fallback/proxy，不允许真实素材导入。
```
