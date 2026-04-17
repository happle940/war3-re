# V9 HERO8-CLOSE1 最小英雄运行时闭包清单

> 合同编号：HERO8-CLOSE1
> 前置：HERO7-IMPL1 accepted（Holy Light 手动施放运行时）
> 目的：闭合 Altar + Paladin + Holy Light 最小运行时分支的证据链，明确已开放和仍关闭的能力边界。

---

## 1. 证据链

| 切片 | 文件 | 类型 | 状态 |
|------|------|------|------|
| HERO1 | `docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md` | 合同 | accepted |
| HERO2-SRC1 | `docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md` | 源边界 | accepted |
| HERO3-DATA1 | `src/game/GameData.ts` → `BUILDINGS.altar_of_kings` | 数据种子 | accepted |
| HERO4-DATA2 | `src/game/GameData.ts` → `UNITS.paladin` | 数据种子 | accepted |
| HERO5-DATA3 | `src/game/GameData.ts` → `ABILITIES.holy_light` | 数据种子 | accepted |
| HERO6-CONTRACT4 | `docs/V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT.zh-CN.md` | 运行时合同 | accepted |
| HERO6A-IMPL1 | `src/game/Game.ts` → `PEASANT_BUILD_MENU` + `isHero` 守卫 | 运行时 | accepted |
| HERO6B-IMPL2 | `src/game/Game.ts` → 英雄专用召唤路径 + 唯一性检查 | 运行时 | accepted |
| HERO7-IMPL1 | `src/game/Game.ts` → `castHolyLight` + 命令卡按钮 | 运行时 | accepted |

每个切片有对应的静态证明文件：

| 切片 | 静态证明 | 运行时证明 |
|------|---------|-----------|
| HERO1 | `tests/v9-hero1-altar-paladin-contract.spec.mjs` | — |
| HERO2-SRC1 | `tests/v9-hero2-altar-paladin-source-boundary.spec.mjs` | — |
| HERO3-DATA1 | `tests/v9-hero3-altar-data-seed.spec.mjs` | — |
| HERO4-DATA2 | `tests/v9-hero4-paladin-data-seed.spec.mjs` | — |
| HERO5-DATA3 | `tests/v9-hero5-holy-light-data-seed.spec.mjs` | — |
| HERO6-CONTRACT4 | `tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs` | — |
| HERO6A-IMPL1 | (同 HERO6) | `tests/v9-hero6a-altar-construction-runtime.spec.ts` |
| HERO6B-IMPL2 | (同 HERO6) | `tests/v9-hero6b-paladin-summon-runtime.spec.ts` |
| HERO7-IMPL1 | (同 HERO5) | `tests/v9-hero7-holy-light-runtime.spec.ts` |

---

## 2. 已开放的运行时能力

### 2.1 祭坛建造

- 农民建造菜单包含 `altar_of_kings`
- 造价 180 金 / 50 木，建造时间 60 秒
- 建造完成后 HP 900，护甲 5（Heavy）
- `src/game/GameData.ts:PEASANT_BUILD_MENU` 包含 `'altar_of_kings'`

### 2.2 圣骑士召唤

- 完成的祭坛显示英雄专用"圣骑士"召唤按钮（非通用 trains 路径）
- 造价 425 金 / 100 木，召唤时间 55 秒，占用 5 人口
- 唯一性约束：同类型英雄已存活或已在队列时按钮禁用
- 召唤时初始化 mana = 255（来自 `UNITS.paladin.maxMana`）
- 通用 trains 路径通过 `uDef.isHero` 守卫跳过英雄单位

### 2.3 圣光术手动施放

- 选中圣骑士时命令卡显示"圣光术"按钮
- 消耗 65 mana，5 秒冷却，射程 8.0
- 治疗最低 HP 百分比的受伤友方非建筑单位（排除自身）
- 单次治疗最高 200 HP，不超过目标 maxHp
- 所有数值来自 `ABILITIES.holy_light` 数据

### 2.4 数据源验证

- 所有单位/建筑/能力数值经 HERO2-SRC1 源边界与 War3 ROC 原版数据交叉校验
- 6 个硬冲突已记录并解决
- 圣光术 75 mana 记录为非采用样本，主源值 65 mana 被采用

---

## 3. 仍关闭的能力

以下能力在本分支中**未实现**，保持关闭状态：

| 类别 | 状态 |
|------|------|
| 英雄复活 / 死亡英雄状态 / 祭坛复活 | 关闭 |
| 酒馆系统 | 关闭 |
| 英雄经验 / 升级 / 技能点消耗 | 关闭 |
| 光环系统 | 关闭 |
| 物品栏 / 物品系统 / 商店 | 关闭 |
| 圣光术自动施放 | 关闭 |
| AI 英雄策略 | 关闭 |
| 其他三个英雄（大法师、山丘之王、血法师） | 关闭 |
| 英雄专属视觉/音效/资源 | 关闭 |
| 空军单位 | 关闭 |
| 第二阵营（兽族等） | 关闭 |
| 多人模式 | 关闭 |
| 公开发布 | 关闭 |

`SimpleAI.ts` 不引用 `altar_of_kings`、`paladin` 或 `holy_light`。

---

## 4. 源数据映射总结

| War3 ROC 原版值 | 项目采纳值 | 映射说明 |
|----------------|-----------|---------|
| Altar 造价 180/50 | `cost: { gold: 180, lumber: 50 }` | 直接映射 |
| Altar HP 900 | `hp: 900` | 直接映射 |
| Altar 护甲类型 Fortified | `armorType: ArmorType.Heavy` | Fortified → Heavy 映射 |
| Paladin 造价 425/100 | `cost: { gold: 425, lumber: 100 }` | 直接映射 |
| Paladin HP 650 | `hp: 650` | 冲突 3：候选值 700 → 修正为 650 |
| Paladin 训练时间 55 | `trainTime: 55` | 冲突 2：候选值 35 → 修正为 55 |
| Paladin 攻击冷却 2.2 | `attackCooldown: 2.2` | 冲突：候选值 1.8 → 修正为 2.2 |
| Paladin 护甲 4 | `armor: 4` | 冲突：候选值 3 → 修正为 4 |
| Paladin mana 255 | `maxMana: 255` | 直接映射 |
| Paladin 速度 270 | `speed: 3.0` | War3 270 → 项目 3.0 比例映射 |
| Holy Light mana 65 | `cost: { mana: 65 }` | 当前 Blizzard Classic 主源值 |
| Holy Light 治疗 200 | `effectValue: 200` | 直接映射 |
| Holy Light 射程 800 (War3) | `range: 8.0` | 单位映射 |
| Holy Light 冷却 5s | `cooldown: 5` | 直接映射 |
| Hero 攻击类型 | `attackType: AttackType.Normal` | Hero → Normal 映射 |
| Hero 护甲类型 | `armorType: ArmorType.Heavy` | Hero → Heavy 映射 |

---

## 5. 已知未解决项

| 项目 | 状态 | 推迟原因 |
|------|------|---------|
| `manaRegen` | 未映射 | ROC 源数据 mana 回复率未确认 |
| 复活费用/时间 | 未实现 | 需要英雄死亡状态运行时 |
| `heroSkillPoints` 消耗 | 未实现 | 需要升级系统 |
| `heroXP` / `heroLevel` 增长 | 未实现 | 需要经验系统 |
| `isDead` 运行时语义 | 未实现 | 需要英雄死亡/复活系统 |

---

## 6. 推荐下一步

**推荐分支：HERO-REVIVE 英雄死亡与复活**

范围：
- 英雄死亡时设置 `isDead = true`，保留在地图上
- 祭坛显示死亡英雄的复活按钮
- 复活费用 = `UNITS.paladin.cost` × 比例
- 复活时间 = 英雄等级相关
- 死亡英雄不占用人口但仍消耗英雄名额

不包含：XP/升级、其他英雄、物品、AI。

**备选分支：HERO-XP 英雄经验与升级**

范围：
- 击杀敌方单位获得 XP
- 英雄升级增加属性
- 升级获得技能点
- 技能点用于解锁/升级技能

两个分支互不依赖，可并行或按优先级排序。
