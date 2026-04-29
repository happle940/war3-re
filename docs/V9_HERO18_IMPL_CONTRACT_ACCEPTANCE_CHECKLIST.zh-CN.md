# V9 HERO18-IMPL1 Water Elemental 运行时合同接收清单

> 生成时间：2026-04-18
> 队列来源：后台 Codex 独立队列任务 `V9-CX164`
> 适用对象：GLM Task268 / `HERO18-IMPL1-CONTRACT Water Elemental summon runtime contract`
> 结论性质：这是接收清单，不代表 Task268 已经 Codex accepted。
> 范围限制：不实现召唤运行时、命令卡、AI、素材或其他 Archmage 能力；不修改 GLM 当前 allowed files。

---

## 1. 接收目标

Task268 只能作为 **Water Elemental 召唤运行时合同** 被验收。它应把 Task267 的模型桥接问题收敛成未来 `HERO18-IMPL1` 可以实现和证明的规则，但本身不得实现任何运行时代码。

Codex 复核时要确认：

1. 前置引用正确，Task265 / Task266 / Task267 均为 Codex accepted 前置，而不是 worker completed。
2. 生产代码未改，尤其 `GameData.ts`、`Game.ts`、`SimpleAI.ts` 不变。
3. 桥接形态明确：未来 runtime 如何消费 `WATER_ELEMENTAL_SUMMON_LEVELS`。
4. source-confirmed 值必须从 `WATER_ELEMENTAL_SUMMON_LEVELS` 读取，而不是复制或硬编码进 `Game.ts`。
5. 缺源值被清楚分类为“来源确认 / 项目本地临时决定 / 继续暂缓”。
6. 合同列出未来 IMPL1 必须证明的成功路径、失败路径和不变边界。

---

## 2. 可以 accepted 的条件

### 2.1 前置和文件范围

Task268 可以 accepted 的前提：

- 引用 Task265 / HERO18-CONTRACT1：Water Elemental 分支合同已 accepted。
- 引用 Task266 / HERO18-DATA1：`WATER_ELEMENTAL_SUMMON_LEVELS` source-only 数据种子已 accepted。
- 引用 Task267 / HERO18-MODEL1：数据-模型桥接合同已 accepted。
- 只修改 Task268 允许的合同文档、静态 proof 和 GLM 队列 closeout。
- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`。
- 不运行 runtime / Playwright / Vite / browser。

### 2.2 桥接形态必须明确

合同必须说明未来 IMPL1 如何从 source-only 数据进入 runtime。可接受的写法包括：

- 明确选择 Task267 的路径 A / B / C，或提出等价新路径。
- 说明未来 runtime 读取 `WATER_ELEMENTAL_SUMMON_LEVELS[level - 1]` 或等价 resolver。
- 说明 future resolver 如何处理未来源确认字段。
- 说明是否新增 runtime-facing helper / interface，以及它是否仍保持 source data 与项目本地临时决定分离。

不可接受的写法：

- 只说“复用 `spawnUnit`”但不说明缺源字段如何 resolve。
- 只说“添加 Water Elemental 单位”但不说明 `UnitDef` 必填字段来源。
- 把 source object 当成已经可直接 runtime 消费。

### 2.3 source-confirmed 值读取规则

未来 IMPL1 必须从 `WATER_ELEMENTAL_SUMMON_LEVELS` 读取以下来源确认值：

| 类别 | 字段 |
|------|------|
| 能力等级 | `level`, `requiredHeroLevel` |
| 施放消耗 | `mana`, `cooldown`, `duration` |
| 召唤单位战斗数据 | `summonedHp`, `summonedAttackDamage`, `summonedAttackRange`, `summonedAttackType`, `summonedArmorType`, `summonedArmor`, `summonedSpeed` |

合同应禁止把这些值复制到 `Game.ts` 常量、命令卡硬编码或测试夹具私有表中作为新的来源。

### 2.4 缺源字段分类

Task268 必须对以下字段逐一分类：

| 字段/行为 | 可接受分类 |
|-----------|------------|
| `sightRange` | 来源确认 / 项目本地临时决定 / 继续暂缓 |
| `attackCooldown` | 来源确认 / 项目本地临时决定 / 继续暂缓 |
| 碰撞体积 / footprint / 选择半径 | 来源确认 / 项目本地临时决定 / 继续暂缓 |
| 召唤单位人口 / supply / 是否占用供给 | 来源确认 / 项目本地临时决定 / 继续暂缓 |
| 活跃召唤上限 | 来源确认 / 项目本地临时决定 / 继续暂缓 |
| `deadUnitRecords` / Resurrection 交互 | 来源确认 / 项目本地临时决定 / 继续暂缓 |
| 目标位置合法性 | 项目本地临时决定或继续暂缓，不得伪装成来源确认 |
| 所属队伍 / ownership | 项目实现规则，需明确跟随 caster team |
| 清理生命周期 | source duration 是来源确认；具体移除方式是项目本地实现决定 |
| mana / cooldown timing | source 数值确认；扣费时机和失败回滚是项目本地实现规则 |
| 命令卡学习/施放表面 | 项目本地实现规则，必须遵守英雄技能学习门槛 |
| no-AI 边界 | 必须继续关闭 |

若合同采用项目本地临时决定，必须写清：

- 决定名。
- 临时值或行为。
- 为什么需要这个本地决定才能实现最小 runtime。
- 它不是 War3 来源确认值。
- 后续可被 source 修正或 balance 修正覆盖。

---

## 3. Rejected 条件

任一项出现，应拒绝 Task268：

1. 直接实现运行时代码，包括召唤函数、命令卡按钮、cooldown/mana 扣除、目标选择、生命周期清理或单位生成。
2. 修改 `GameData.ts`、`Game.ts` 或 `SimpleAI.ts`。
3. 新增 `UNITS.water_elemental`、`ABILITIES.water_elemental`、`HERO_ABILITY_LEVELS.water_elemental`，或改写 `WATER_ELEMENTAL_SUMMON_LEVELS`。
4. 把项目本地临时决定伪装成 War3 来源，例如把 `sightRange`、`attackCooldown`、collision、supply、active cap 写成已来源确认。
5. 缺少失败路径：无效目标、低魔、冷却中、未学习、英雄等级不足、死亡施法者、敌方/非玩家施法边界等。
6. 没有声明失败路径不得扣 mana、不得启动 cooldown、不得生成单位、不得污染 selection / command-card state。
7. 打开 AI、AIContext 施放入口、SimpleAI Archmage 策略或任何自动施法逻辑。
8. 打开 Brilliance Aura、Blizzard、Mass Teleport、Mountain King、Blood Mage、物品、商店、Tavern、空军、第二种族或多人。
9. 添加模型、图标、粒子、声音、贴图或其他素材。
10. 宣称 Water Elemental 已实现、完整 Archmage 已完成、完整英雄系统 / 完整 Human / V9 已完成。

---

## 4. Split-Fix 条件

以下情况主体方向可能正确，但应先 split-fix 合同或 proof 后再 accepted：

- 合同列出缺源字段，但没有逐项归类为“来源确认 / 项目本地临时决定 / 继续暂缓”。
- 合同说读取 `WATER_ELEMENTAL_SUMMON_LEVELS`，但没有列出必须读取的字段集合。
- 合同漏掉某个关键失败路径，例如死亡 caster、未学习、cooldown、无效目标或低魔。
- 合同没有写清失败路径的无副作用要求。
- proof 仍检查过期事实，例如要求 `GameData.ts` 没有 `WATER_ELEMENTAL_SUMMON_LEVELS`，或忽略 Task266 已有 source-only 数据。
- proof 只检查文档存在，不检查生产代码仍无 runtime / AI。
- 文档措辞过度，暗示 Water Elemental 已可施放、已在命令卡出现或已可被 AI 使用。
- closeout 建议直接进入 UX / AI / 素材，而不是最小 IMPL1 runtime 或合同修复。

最小 split-fix 范围应保持在 Task268 的合同文档和静态 proof；不得借 split-fix 修改生产代码。

---

## 5. 未来 IMPL1 必须证明的行为

Task268 accepted 后，下一张 `HERO18-IMPL1` 最小 runtime 必须证明以下行为。

### 5.1 成功路径

- Archmage 只有在满足学习门槛后才能施放 Water Elemental。
- 学习门槛遵守等级 1 / 3 / 5 和技能点消费语义，不绕过现有英雄学习框架。
- 施放读取 `WATER_ELEMENTAL_SUMMON_LEVELS` 当前等级数据。
- 施放扣除 125 mana，并启动 20 秒 cooldown。
- 只在合法目标位置生成单位。
- 每次合法施放召唤 1 个可控 Water Elemental。
- 召唤单位属于 caster team。
- 召唤单位使用来源确认战斗数值：HP、attackDamage、attackRange、attackType、armorType、armor、speed。
- 召唤单位 60 秒后按合同定义消散/清理。

### 5.2 失败路径

以下情况必须无副作用：

- 目标位置无效。
- mana 不足。
- cooldown 未结束。
- 未学习 Water Elemental。
- 英雄等级不满足学习/施放要求。
- 施法者死亡或不是 Archmage。
- 施法者不属于玩家可控 team，若合同限定玩家侧。

无副作用必须至少包括：

- 不扣 mana。
- 不启动 cooldown。
- 不生成 Water Elemental。
- 不改变已有单位数。
- 不污染 selection / command-card cache。
- 不影响 Paladin、已有英雄、AI 或其他 Archmage 能力。

### 5.3 不变边界

未来 IMPL1 必须证明仍未打开：

- Paladin 行为变化。
- SimpleAI / AIContext Archmage 施法。
- Brilliance Aura。
- Blizzard。
- Mass Teleport。
- assets / icons / particles / sounds。
- Mountain King / Blood Mage。
- 完整 Archmage / 完整英雄系统 / 完整 Human / V9 release。

---

## 6. Task268 accepted 后的下一张任务规则

默认下一张：

`HERO18-IMPL1 — Water Elemental minimal summon runtime`

进入 IMPL1 的条件：

- Task268 合同已被 Codex 本地复核 accepted。
- 桥接形态已明确。
- 缺源字段分类完整。
- 成功路径、失败路径和不变边界可转成 focused runtime proof。
- 没有 production code 在合同阶段被提前修改。

先 split-fix 合同的条件：

- 缺关键模型决策。
- 缺失败路径或无副作用要求。
- 项目本地临时决定和 War3 来源确认混淆。
- proof 检查过期事实或没有覆盖 no-runtime/no-AI。

禁止的下一步：

- 不得跳到 UX。
- 不得跳到 AI。
- 不得做素材、图标、粒子或声音。
- 不得做 Brilliance Aura / Blizzard / Mass Teleport。
- 不得用 Task268 worker `completed` 代替 Codex `accepted` 后继续派发。

---

## 7. 复核建议命令

本清单任务本身不运行这些命令；它们是前台/集成 Codex 复核 Task268 时的建议。

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero18-water-elemental-impl-contract.spec.mjs tests/v9-hero18-water-elemental-model-bridge.spec.mjs tests/v9-hero18-water-elemental-data-seed.spec.mjs tests/v9-hero18-water-elemental-branch-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
```

仍然禁止 runtime / Playwright / Vite / browser。

---

## 8. 本清单边界

- 本文档只是 Task268 的 Codex 接收清单。
- 本文档不验收 Task268。
- 本文档不读取或修正 Task268 的合同/proof 产物。
- 本文档不修改 `GameData.ts`、`Game.ts`、`SimpleAI.ts`。
- 本文档不允许后台 Codex 越过前台复核直接派发 IMPL1。
