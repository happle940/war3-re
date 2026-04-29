# V9 HERO18-IMPL1 Water Elemental Runtime 验收清单

> 生成时间：2026-04-18
> 队列来源：后台 Codex 独立队列任务 `V9-CX165`
> 适用对象：GLM Task269 / `HERO18-IMPL1 Water Elemental minimal summon runtime`
> 结论性质：这是验收清单，不代表 Task269 已经 Codex accepted。
> 范围限制：不实现运行时代码、不改测试、不派发下一张 GLM 任务；后台 Codex 未运行 runtime / Playwright / Vite / browser。

---

## 1. 验收目标

Task269 只能作为 **Water Elemental 最小玩家侧召唤 runtime** 被验收。它应把 Task268 合同中已经确认的路径 B 落到 `Game.ts` 的最小行为证明中，但不得把 scope 扩大成 AI、素材、完整 Archmage、完整英雄系统或 V9 完成。

Codex 前台复核时要确认：

1. 只改 Task269 允许的文件，不碰数据、AI、素材或其他分支。
2. `WATER_ELEMENTAL_SUMMON_LEVELS` 仍是 Water Elemental 来源确认值的单一数据源。
3. Archmage 学习、施放、扣魔、冷却、生成、消散、失败路径和死亡记录边界都有 runtime proof。
4. Paladin 回归和 Archmage Altar 暴露回归仍被保留，而不是为了通过新测试弱化旧链路。
5. Task269 closeout 只说明最小 runtime 完成，不宣称 Water Elemental 分支、Archmage 或 V9 已完成。

---

## 2. 可以 accepted 的条件

### 2.1 文件和禁区

Task269 可以 accepted 的前提：

- 只修改 Task269 允许文件：`src/game/Game.ts`、`tests/v9-hero18-water-elemental-runtime.spec.ts`，以及 `docs/GLM_READY_TASK_QUEUE.md` closeout。
- `src/game/GameData.ts` 未改。
- `src/game/SimpleAI.ts` 未改。
- `src/game/UnitVisualFactory.ts` 未改。
- 不新增或修改素材、图标、粒子、声音、模型。
- 不改 Paladin 测试来规避回归。
- 不接受 Task269 或派发 Task270 之外的人工动作必须留给前台 Codex。

### 2.2 单一数据源

以下来源确认值必须从 `WATER_ELEMENTAL_SUMMON_LEVELS` 读取，不得复制为 `Game.ts` 私有战斗数据表，也不得硬编码进测试夹具作为新来源：

| 类别 | 必须读取的字段 |
|------|----------------|
| 学习门槛 | `requiredHeroLevel` |
| 施放参数 | `mana`, `cooldown`, `duration` |
| 召唤单位战斗数值 | `summonedHp`, `summonedAttackDamage`, `summonedAttackRange`, `summonedAttackType`, `summonedArmorType`, `summonedArmor`, `summonedSpeed` |

可以在 `Game.ts` 中保留 Task268 合同命名的项目本地临时默认值，但必须清楚是本地默认，不是 War3 来源确认值：

- `WE_DEFAULT_SIGHT_RANGE`
- `WE_DEFAULT_ATTACK_COOLDOWN`
- `WE_DEFAULT_SELECTION_RADIUS`
- `WE_COLLISION_MODE`
- `WE_DEFAULT_SUPPLY`
- `WE_CAST_RANGE`

### 2.3 不允许新增 runtime-facing 数据条目

Task269 accepted 必须证明仍然没有：

- `UNITS.water_elemental`
- `ABILITIES.water_elemental`
- `HERO_ABILITY_LEVELS.water_elemental`

Water Elemental 在 Task269 阶段应通过专用召唤 runtime 构造，不应被塞进生产队列单位、通用 ability 表或英雄等级表，避免制造第二数据源或伪造缺源字段。

### 2.4 Archmage 学习 proof

必须有 runtime proof 覆盖：

- Archmage 在等级 1、3、5 分别可学习 Water Elemental Lv1 / Lv2 / Lv3。
- 学习门槛来自 `WATER_ELEMENTAL_SUMMON_LEVELS.requiredHeroLevel`。
- 学习消耗技能点。
- 等级不足或技能点不足时不能学习。
- 已学习 Water Elemental 后，Archmage 死亡和复活仍保留已学等级。
- 未学习时不能施放 Water Elemental。

### 2.5 施放、扣魔、冷却和生成 proof

必须有 runtime proof 覆盖：

- 已学习且 mana 足够时，可对合法地面目标施放。
- 施放扣除 `WATER_ELEMENTAL_SUMMON_LEVELS` 当前等级的 mana，当前合同值为 125。
- 施放启动 `WATER_ELEMENTAL_SUMMON_LEVELS` 当前等级的 cooldown，当前合同值为 20 秒。
- 合法施放只生成 1 个 `water_elemental`。
- 生成单位属于 caster team。
- 生成单位可由玩家选择和控制。
- 生成单位的 HP、攻击力、攻击范围、攻击类型、护甲类型、护甲和速度匹配当前等级 source-confirmed 值。
- 多次合法施放如果 cooldown 和 mana 条件满足，不应被发明的活跃召唤上限拦截。

### 2.6 消散和死亡记录 proof

必须有 runtime proof 覆盖：

- Water Elemental 生成后按 `duration` 60 秒自动消散并从单位列表移除。
- Water Elemental 被击杀不会写入 `deadUnitRecords`。
- Water Elemental 到期消散不会写入 `deadUnitRecords`。
- Paladin Resurrection 不复活 Water Elemental。
- 证明消散或击杀后，应重新从 `window.__war3Game` / `g.units` 读取新状态，不使用旧 `const units = g.units` 快照当作证据。

### 2.7 失败路径 proof

以下失败路径必须证明 **无副作用**：

| 失败路径 | 必须无副作用 |
|----------|--------------|
| 未学习 Water Elemental | 不扣 mana、不启动 cooldown、不生成单位 |
| mana 不足 | 不扣 mana、不启动 cooldown、不生成单位 |
| cooldown 中 | 不扣 mana、不刷新 cooldown、不生成单位 |
| 目标位置无效 | 不扣 mana、不启动 cooldown、不生成单位 |
| 超出施法范围 | 不扣 mana、不启动 cooldown、不生成单位 |
| 施法者死亡 | 不扣 mana、不启动 cooldown、不生成单位 |
| 非 Archmage 或不满足任务限定 caster | 不扣 mana、不启动 cooldown、不生成单位 |

如果 proof 失败，前台 Codex 应先检查是否读了 stale DOM 或 stale game state，再判断是否需要改 runtime。

### 2.8 回归和不变边界

Task269 accepted 必须证明仍然没有打开：

- SimpleAI Archmage 策略。
- Brilliance Aura。
- Blizzard。
- Mass Teleport。
- Mountain King。
- Blood Mage。
- Water Elemental 图标、模型、粒子、声音或专属素材。
- 完整 Archmage 分支、完整英雄系统、完整 Human 或 V9 release 宣称。

同时必须证明 Paladin Holy Light / Divine Shield / Devotion Aura / Resurrection 的关键回归仍通过，不能降低或删除 Paladin regression 来让 Water Elemental 通过。

---

## 3. Rejected 条件

任一项出现，应拒绝 Task269：

1. 修改 `src/game/GameData.ts`。
2. 修改 `src/game/SimpleAI.ts`。
3. 修改 `src/game/UnitVisualFactory.ts`。
4. 新增 `UNITS.water_elemental`、`ABILITIES.water_elemental` 或 `HERO_ABILITY_LEVELS.water_elemental`。
5. 把 `WATER_ELEMENTAL_SUMMON_LEVELS` 的来源确认值复制成第二份 runtime 数据源。
6. 把 `sightRange`、`attackCooldown`、碰撞、选择半径、人口、施法范围或活跃召唤上限伪装成 War3 来源确认值。
7. 运行或记录直接 `npx playwright test`、`npm exec playwright`、`vite preview`、`npm run dev`、浏览器手工进程等命令，而不是规定的 runtime wrapper。
8. 接入 SimpleAI、AIContext 或任何 Archmage 自动施法策略。
9. 加入素材、图标、粒子、声音、模型或 `UnitVisualFactory` 特判。
10. 顺手实现 Brilliance Aura、Blizzard、Mass Teleport、Mountain King、Blood Mage、物品、商店、Tavern、第二种族或多人。
11. 弱化、删除或绕过 Paladin 回归。
12. 只证明 happy path，缺无效目标、低魔、冷却、未学习、死亡 caster 等失败路径。
13. proof 使用旧 `g.units` / DOM 快照作为 mutation 后证据。
14. 文档或 UI 文案宣称 Water Elemental、Archmage、完整英雄系统、完整 Human 或 V9 已完成。

---

## 4. Split-Fix 条件

以下情况主体 runtime 方向可能正确，但应先 split-fix Task269，而不是 accepted：

- 成功施放路径成立，但漏掉一个或多个失败路径。
- 失败路径有 proof，但没有证明无副作用。
- 学习门槛可用，但未证明 Lv2 / Lv3 来自 `requiredHeroLevel`。
- Water Elemental 可生成，但缺当前等级战斗数值比对。
- 60 秒消散可用，但没有证明消散后不进 `deadUnitRecords`。
- 被击杀清理可用，但没有证明击杀后不进 `deadUnitRecords`。
- Paladin 回归命令没跑、失败原因没复核，或为了新 runtime 弱化旧断言。
- Archmage Altar 暴露回归没跑，导致 Task264 相关入口风险未被重新确认。
- proof 仍检查过期事实，例如要求 `GameData.ts` 没有 `WATER_ELEMENTAL_SUMMON_LEVELS`。
- proof 读取 stale game state，尤其在 reload、击杀、训练、清理后继续使用旧 unit 数组。
- cleanup 证据不足，运行后未执行清理脚本或残留 runtime 进程没有说明。
- UI / closeout 措辞过度，暗示完整 Water Elemental 分支或 Archmage 已完成。
- runtime wrapper 使用不符合要求，但代码本身可能正确。

Split-fix 的最小范围应优先限制在 `src/game/Game.ts` 和 `tests/v9-hero18-water-elemental-runtime.spec.ts`；只有证据显示合同本身缺关键决策时，才回到合同 split-fix。

---

## 5. 前台 Codex 必须复跑的命令

本清单任务本身不运行 runtime / Playwright / Vite / browser。前台 Codex 复核 Task269 时，必须在本地复跑完整命令，不接受只读 GLM closeout。

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero18-water-elemental-impl-contract.spec.mjs tests/v9-hero18-water-elemental-model-bridge.spec.mjs tests/v9-hero18-water-elemental-data-seed.spec.mjs tests/v9-hero18-water-elemental-branch-contract.spec.mjs
./scripts/run-runtime-tests.sh tests/v9-hero18-water-elemental-runtime.spec.ts tests/v9-hero17-archmage-altar-exposure.spec.ts tests/v9-hero6b-paladin-summon-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

复核要求：

- runtime 必须使用 `./scripts/run-runtime-tests.sh ... --reporter=list`。
- 不得直接运行 Playwright、Vite 或浏览器进程。
- 验证输出不得用 `tail`、`grep`、`head` 或其他方式截断。
- runtime proof 发生 mutation 后，必须重新读取 `window.__war3Game` / `g.units` 状态。
- 如果 runtime 失败，先排除 stale state / stale DOM 读法，再判断是否要求修复实现。

---

## 6. Task269 accepted 后的下一张最小任务规则

默认下一张最小相邻任务：

`HERO18-UX1 — Water Elemental visible feedback only`

进入 UX1 的条件：

- Task269 已由前台 Codex 本地复核 accepted。
- 最小召唤 runtime 的学习、施放、扣魔、冷却、生成、消散、失败路径、死亡记录边界和 Paladin 回归全部稳定。
- 没有 runtime 残留进程或 cleanup 缺口。
- closeout 没有宣称完整 Water Elemental、完整 Archmage 或 V9 完成。

应先 split-fix runtime 的条件：

- 任一核心行为不稳。
- runtime proof 失败或依赖 stale state。
- Paladin / Archmage Altar 回归仍有红灯。
- cleanup 证据不足。
- 文案过度宣称但实现本体可救。

禁止跳转：

- 不跳 AI。
- 不跳 Brilliance Aura。
- 不跳 Blizzard。
- 不跳 Mass Teleport。
- 不跳 Water Elemental assets / icons / particles / sounds。
- 不跳 Mountain King、Blood Mage 或其他英雄。
- 不用 worker `completed` 代替 Codex `accepted` 后继续派发。

---

## 7. 本清单边界

- 本文档只是 Task269 的 Codex runtime 验收清单。
- 本文档不验收 Task269。
- 本文档不修改 `Game.ts`、`GameData.ts`、`SimpleAI.ts`、`UnitVisualFactory.ts` 或任何测试文件。
- 本文档不修改 `docs/GLM_READY_TASK_QUEUE.md`。
- 本文档不运行 runtime / Playwright / Vite / browser。
- 本文档不派发 Task270。
