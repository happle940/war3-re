# V9 HN7-AI16 Blacksmith Upgrade AI Closure Inventory

> 用途：证明 Task191 策略合同 + Task192 实现 + Task192 runtime proof 已形成闭环。
> 前提：HN7-AI14 合同 accepted；HN7-AI15 实现 accepted（runtime 18/18）。

## 0. 闭环总览

| 证据层 | 文件 | 结果 |
| --- | --- | --- |
| AI14 策略合同 | `docs/V9_HN7_BLACKSMITH_UPGRADE_AI_STRATEGY_CONTRACT.zh-CN.md` | 定义三条链 9 个升级、GC1-GC4 + MC/RC/PC 条件、预算、优先级、禁区 |
| AI14 静态 proof | `tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs` | 24/24 pass |
| AI15 实现 | `src/game/SimpleAI.ts` section 5e | data-driven: 从 RESEARCHES 读 key/cost/time/requiresBuilding/prerequisiteResearch/effects |
| AI15 runtime proof | `tests/v9-hn7-blacksmith-upgrade-ai-runtime.spec.ts` | 18/18 pass (Codex accepted) |
| AI16 收口 proof | `tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs` | 本文件 |

## 1. 三条链 9 个升级覆盖

### 近战武器链
| 等级 | key | 合同触发 | 实现 | Runtime |
| --- | --- | --- | --- | --- |
| L1 | iron_forged_swords | MC1-MC4 | RESEARCHES.iron_forged_swords | BS-RT-1 正向, BS-RT-4 已完成跳过 |
| L2 | steel_forged_swords | MC1-MC4 + Keep | def.requiresBuilding='keep' + def.prerequisiteResearch | BS-RT-8, BS-RT-10 不跳级, BS-RT-16 data-driven prereq |
| L3 | mithril_forged_swords | MC1-MC4 + Castle | def.requiresBuilding='castle' + def.prerequisiteResearch | BS-RT-9, BS-RT-17 data-driven tier |

### 护甲 Plating 链
| 等级 | key | 合同触发 | 实现 | Runtime |
| --- | --- | --- | --- | --- |
| L1 | iron_plating | PC1-PC4 | RESEARCHES.iron_plating | BS-RT-14 melee L1 done 后 |
| L2 | steel_plating | PC1-PC4 + Keep | def.requiresBuilding='keep' + def.prerequisiteResearch | BS-RT-10 不跳级 |
| L3 | mithril_plating | PC1-PC4 + Castle | def.requiresBuilding='castle' + def.prerequisiteResearch | BS-RT-17 Keep 时 L3 不触发 |

### 远程火药链
| 等级 | key | 合同触发 | 实现 | Runtime |
| --- | --- | --- | --- | --- |
| L1 | black_gunpowder | RC1-RC5 + Long Rifles | def.effects → affectsRanged + hasLongRifles | BS-RT-5 无 melee 走 ranged, BS-RT-6a LR 优先, BS-RT-6b LR 后触发 |
| L2 | refined_gunpowder | RC1-RC5 + Keep | def.requiresBuilding='keep' + def.prerequisiteResearch | BS-RT-10 不跳级 |
| L3 | imbued_gunpowder | RC1-RC5 + Castle | def.requiresBuilding='castle' + def.prerequisiteResearch | BS-RT-17 data-driven tier |

## 2. 通用条件覆盖

| 条件 | 合同 | 实现 | Runtime |
| --- | --- | --- | --- |
| GC1: Blacksmith 完成 | 合同 §2a | hasBlacksmith + find blacksmith | BS-RT-12 无 Blacksmith 跳过 |
| GC2: 研究队列为空 | 合同 §2a | blacksmith.researchQueue.length === 0 | BS-RT-3 队列占用跳过 |
| GC3: 预算充足 | 合同 §3 | def.cost + wCost + fCost | BS-RT-7 预算不足跳过 |
| GC4: waveCount >= 1 | 合同 §2a | this.waveCount >= 1 | BS-RT-2 waveCount=0 跳过 |

## 3. 预算边界

- Worker + footman 储备：从 `UNITS.worker.cost` / `UNITS.footman.cost` 读取
- 不硬编码：BS-CLOSE-5 证明使用 `def.cost` / `def.researchTime` / `def.key`

## 4. 优先级

- Long Rifles 保持现有逻辑不变（section 2e）
- AWT 保持现有逻辑不变（section 5d）
- Blacksmith 升级在两者之后（section 5e）
- 放置顺序：BS-CLOSE-32 静态证明

## 5. 数据驱动证明

| 数据字段 | 来源 | 证明 |
| --- | --- | --- |
| key | RESEARCHES.xxx.key | BS-CLOSE-1, BS-CLOSE-5 |
| cost | RESEARCHES.xxx.cost | BS-CLOSE-1, BS-CLOSE-5 |
| researchTime | RESEARCHES.xxx.researchTime | BS-CLOSE-5 |
| requiresBuilding | def.requiresBuilding | BS-CLOSE-2, BS-RT-17 |
| prerequisiteResearch | def.prerequisiteResearch | BS-CLOSE-3, BS-RT-16 |
| effects (unit kind) | def.effects → targetUnitType | BS-CLOSE-4 |

## 6. 禁区

- 不实现 Castle 升级：BS-CLOSE-29
- 不实现 Knight 训练：BS-CLOSE-29
- 不包含 Leather Armor：BS-CLOSE-30
- 不改 GameData.ts / Game.ts：BS-CLOSE-31
- Long Rifles 现有逻辑未修改：BS-CLOSE-8, BS-RT-6a

## 7. 下一步安全延续

HN7-AI16 完成后，HN7 相邻候选：

- Leather Armor source reconciliation（如果项目需要 Medium armor 升级线）。
- AI Keep → Castle 升级（如果 Knight 路线需要 AI 主动升级 Castle）。
- AI Knight 训练（如果 AI 需要主动产出 Knight）。
- HN7 / Human 全局收口（盘点 HN1-HN7 所有链路）。

不能直接开英雄、空军、物品、素材或完整三本战术。
