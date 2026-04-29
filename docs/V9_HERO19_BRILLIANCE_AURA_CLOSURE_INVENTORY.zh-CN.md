# V9 HERO19-CLOSE1 Brilliance Aura 分支收口盘点

> 生成时间：2026-04-18
> 前置证据链：Task272 (CONTRACT1) → Task273 (SRC1) → Task274 (DATA1) → Task275 (IMPL1-CONTRACT) → Task276 (IMPL1) → Task277 (UX1) 全部 accepted。
> 本文档不修改任何生产代码。
> 本文档 **不** 声称"Brilliance Aura 完成"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 已 accepted 证据链

| 任务 | 阶段 | 关键产出 | 状态 |
|------|------|---------|------|
| Task272 | HERO19-CONTRACT1 | Brilliance Aura 分支边界、6 阶段序列、被动光环描述、禁区 | accepted |
| Task273 | HERO19-SRC1 | 来源边界锁定 RoC 原始值，记录补丁历史，延后运行时决策 | accepted |
| Task274 | HERO19-DATA1 | `HERO_ABILITY_LEVELS.brilliance_aura` 数据种子落地（`manaRegenBonus` 字段） | accepted |
| Task275 | HERO19-IMPL1-CONTRACT | 运行时合同：学习路径、受影响单位筛选、法力回复计算、不叠加规则 | accepted |
| Task276 | HERO19-IMPL1 | 最小运行时：`updateBrillianceAura()`、学习按钮、被动光环施加、法力回复 base+bonus | accepted |
| Task277 | HERO19-UX1 | 可见反馈：已学等级 HUD、受影响单位加成 HUD、命令卡禁用原因 | accepted |

---

## 2. 当前玩家可用能力

以下能力已由 Task272-277 工程证据落地，玩家可体验：

1. **学习 Brilliance Aura**：Archmage 命令卡在等级 1/3/5 可分别学习 Lv1/Lv2/Lv3，消耗技能点，门槛来自 `HERO_ABILITY_LEVELS.brilliance_aura.requiredHeroLevel`。
2. **被动法力回复光环**：学习后，Archmage 自身和同阵营存活、非建筑、maxMana > 0 且在半径 9.0 内的单位获得法力回复加成。
3. **不叠加取最高**：多个 Archmage 的 Brilliance Aura 不叠加，取最高已学等级的加成值。
4. **排除规则**：敌方单位、死亡单位、建筑、maxMana ≤ 0 的单位、超出半径的单位不受影响。
5. **法力回复计算**：`mana += (baseManaRegen + brillianceAuraBonus) * dt`，不永久修改 baseManaRegen，法力上限 maxMana。
6. **Archmage 死亡时光环停止**：Archmage 死亡后所有受影响单位的 bonus 归零。
7. **HUD 反馈**：选中已学 Brilliance Aura 的 Archmage 显示 `辉煌光环 LvN`；受影响单位显示 `辉煌光环 +X.XX 法力回复`。
8. **命令卡反馈**：学习按钮显示 `被动 法力回复+X/s 半径N`，无技能点/英雄等级不足/死亡时显示禁用原因。
9. **无施放按钮**：Brilliance Aura 为被动技能，无目标模式、无 mana 消耗、无冷却。

---

## 3. 来源确认值

### 3.1 采用值（RoC 原始值）

由 Task273 (SRC1) 锁定：

| 参数 | Lv1 | Lv2 | Lv3 |
|------|-----|-----|-----|
| manaRegenBonus | +0.75/s | +1.50/s | +2.25/s |
| requiredHeroLevel | 1 | 3 | 5 |
| auraRadius | 9.0 | 9.0 | 9.0 |
| mana | 0 | 0 | 0 |
| cooldown | 0 | 0 | 0 |
| effectType | mana_regen_aura | mana_regen_aura | mana_regen_aura |

### 3.2 补丁历史（仅记录，未采用）

| 版本 | 变化 |
|------|------|
| 1.30.0 | L2 +1.50 → +1.25, L3 +2.25 → +2.00 |

---

## 4. 生产代码当前状态

### 4.1 `GameData.ts`

- 有 `HERO_ABILITY_LEVELS.brilliance_aura`（3 个等级，含 `manaRegenBonus`、`auraRadius`、`requiredHeroLevel`）。
- 有 `manaRegenBonus?: number` 可选字段（HeroAbilityLevelDef）。
- 无 `ABILITIES.brilliance_aura`。
- 无 `UNITS.brilliance_aura`。

### 4.2 `Game.ts`

有 Brilliance Aura 最小运行时和 UX 反馈：

- `updateBrillianceAura()` — 被动光环更新（clear-all-then-apply 模式，与 Devotion Aura 一致）。
- 法力回复路径：`unit.mana = Math.min(unit.maxMana, unit.mana + (unit.manaRegen + unit.brillianceAuraBonus) * dt)`。
- 命令卡学习按钮（`学习辉煌光环 (LvN)`），含技能点/英雄等级/死亡禁用原因。
- 选中 Archmage HUD：已学等级 `辉煌光环 LvN`。
- 受影响单位 HUD：`辉煌光环 +X.XX 法力回复`。
- `Unit` 接口字段：`brillianceAuraBonus`。
- 选择缓存键：`baBonusKey`。命令卡缓存键：`baKey`。

无以下内容：

- Blizzard 运行时。
- Mass Teleport 运行时。
- Archmage AI 策略。
- `ABILITIES.brilliance_aura` 创建。

### 4.3 `SimpleAI.ts`

- 无 Archmage 策略。
- 无 Brilliance Aura 策略。

### 4.4 `UnitVisualFactory.ts`

- 未修改。无 Brilliance Aura 专属视觉。

---

## 5. 运行时规则

| 规则 | 实现 |
|------|------|
| 受影响单位 | 同阵营、存活、非建筑、maxMana > 0、在 auraRadius 内 |
| 包含自身 | Archmage 自身也获得加成 |
| 排除 | 敌方、死亡、建筑、maxMana ≤ 0、超出半径 |
| 法力回复 | base + bonus，不永久修改 baseManaRegen |
| 法力上限 | Math.min(unit.maxMana, ...) |
| 不叠加 | Math.max(existing, new)，取最高已学等级 |
| Archmage 死亡 | bonus 归零，所有受影响单位失去加成 |
| 更新频率 | 每帧，`updateBrillianceAura()` 在 `updateCasterAbilities()` 之前调用 |

---

## 6. 工程证据清单

| 证据类型 | 文件 | 覆盖范围 |
|---------|------|---------|
| 数据种子 | `src/game/GameData.ts` (`HERO_ABILITY_LEVELS.brilliance_aura`) | 3 级来源确认值 |
| 运行时实现 | `src/game/Game.ts` | 学习、被动光环、法力回复、反馈 |
| 分支合同 proof | `tests/v9-hero19-brilliance-aura-branch-contract.spec.mjs` | 9 项静态测试 |
| 来源边界 proof | `tests/v9-hero19-brilliance-aura-source-boundary.spec.mjs` | 9 项静态测试 |
| 数据种子 proof | `tests/v9-hero19-brilliance-aura-data-seed.spec.mjs` | 8 项静态测试 |
| 运行时合同 proof | `tests/v9-hero19-brilliance-aura-runtime-contract.spec.mjs` | 10 项静态测试 |
| 运行时 proof | `tests/v9-hero19-brilliance-aura-runtime.spec.ts` | 6 项 runtime 测试 |
| 可见反馈 proof | `tests/v9-hero19-brilliance-aura-visible-feedback.spec.ts` | 8 项反馈测试 |
| 分支合同文档 | `docs/V9_HERO19_BRILLIANCE_AURA_BRANCH_CONTRACT.zh-CN.md` | 分支边界 |
| 来源边界文档 | `docs/V9_HERO19_BRILLIANCE_AURA_SOURCE_BOUNDARY.zh-CN.md` | 来源锁定 |
| 数据种子文档 | `docs/V9_HERO19_BRILLIANCE_AURA_DATA_SEED.zh-CN.md` | 数据来源 |
| 运行时合同文档 | `docs/V9_HERO19_BRILLIANCE_AURA_RUNTIME_CONTRACT.zh-CN.md` | 运行时行为合同 |
| 收口盘点 | 本文档 | 收口汇总 |

---

## 7. 已解决决策

| 决策 | 结论 | 任务 |
|------|------|------|
| 光环更新模式 | clear-all-then-apply（与 Devotion Aura 一致） | Task275 |
| 法力回复路径 | base + bonus，不永久改 base | Task275 |
| 叠加规则 | 不叠加，Math.max 取最高 | Task275 |
| 更新顺序 | updateBrillianceAura() 在 updateCasterAbilities() 之前 | Task276 |
| 受影响单位筛选 | 同阵营/存活/非建筑/maxMana>0/半径内/含自身 | Task275 |
| 命令卡学习 | 条件：有技能点 + 英雄等级达标 + 未死亡，消耗 1 技能点 | Task275 |
| HUD 显示 | Archmage 显示已学等级，受影响单位显示 bonus 值 | Task277 |

---

## 8. 明确未完成 / 仍然开放

以下内容 **未** 由 Task272-277 实现，需要后续独立任务：

### 8.1 Archmage 其他能力

| 能力 | 状态 |
|------|------|
| Blizzard（暴风雪） | 未开始，需独立分支 |
| Mass Teleport（群体传送） | 未开始，需独立分支 |

### 8.2 AI 和策略

| 项目 | 状态 |
|------|------|
| Archmage AI 施法策略 | SimpleAI 无 Archmage 策略 |
| Brilliance Aura AI 评估 | 未实现 |

### 8.3 视觉和音频

| 项目 | 状态 |
|------|------|
| Brilliance Aura 光环效果 | 无 |
| Archmage 模型 | 使用通用问号头像 |
| 图标 | 无专属图标 |
| 粒子效果 | 无 |
| 声音效果 | 无 |

### 8.4 其他英雄

| 英雄 | 状态 |
|------|------|
| Mountain King（山丘之王） | 未开始 |
| Blood Mage（血法师） | 未开始 |

### 8.5 系统

| 系统 | 状态 |
|------|------|
| 物品系统 | 未开始 |
| 商店 | 未开始 |
| Tavern（酒馆） | 未开始 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |

---

## 9. 收口声明

本文档确认：

1. Brilliance Aura 最小玩家侧被动光环分支已由 Task272-277 工程证据落地。
2. 玩家可训练 Archmage、学习 Brilliance Aura、看到已学等级和受影响单位加成、友方有魔单位获得来源确认法力回复加成。
3. `GameData.ts` 为 source-only 数据种子（`HERO_ABILITY_LEVELS.brilliance_aura`），无 `ABILITIES.brilliance_aura`。
4. `SimpleAI.ts` 仍无 Archmage 策略。
5. Blizzard、Mass Teleport、Archmage AI、素材、Mountain King、Blood Mage、物品/商店/Tavern、完整英雄系统、完整人族和 V9 发布均未开始。
6. 本文档 **不** 声称"Brilliance Aura 完成"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。
