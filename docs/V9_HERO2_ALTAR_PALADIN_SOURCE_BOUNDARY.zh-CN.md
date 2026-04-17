# V9 HERO2-SRC1 Altar + Paladin + Holy Light 来源边界

> 用途：核对并固定英雄入口数据种子进入 `GameData.ts` 前的候选值。  
> 上游：HERO1 合同把所有数值标注为"候选参考值"；本任务把它们升级为"采用值"或记录冲突。
> 范围：只写来源边界文档和静态 proof，不改生产代码。

## 0. 来源层级

| 层级 | 来源 | 用途 |
| --- | --- | --- |
| 主源 | classic.battle.net 当前可访问的 Blizzard Classic 战网 Human 页面 | 优先采用 |
| 交叉校验 | Liquipedia、Wowpedia、StrategyWiki | 确认一致性 |
| 冲突样本 | 旧补丁记录、社区资料或历史数值说法 | 记录差异，不采用 |

冲突时采用主源值，记录理由。

## 1. Altar of Kings

| 字段 | HERO1 候选值 | 主源 ROC 值 | 交叉校验 | 采用值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| cost.gold | 180 | 180 | Liquipedia/Wowpedia 一致 | **180** | 无冲突 |
| cost.lumber | 50 | 50 | Liquipedia/Wowpedia 一致 | **50** | 无冲突 |
| buildTime | 60s | 60s | Liquipedia 一致 | **60** | 无冲突 |
| hp | 900 | 900（基础） | Wowpedia 一致 | **900** | 无 Masonry 升级 |
| armor | — | 5 | Wowpedia | **5** | HERO1 未给，补齐 |
| armorType | — | Fortified | 项目尚未定义 Fortified | **Heavy** | 项目映射：建筑 → Heavy（现有 tower 为 Heavy） |
| supply | 0 | 0 | 一致 | **0** | 无冲突 |
| size | 3 | 3（标准大型建筑） | 一致 | **3** | 无冲突 |
| trains | ['paladin'] | Paladin | 一致 | **['paladin']** | 无冲突 |
| techPrereq | 无 | T1 无前置 | 一致 | **无** | 无冲突 |

**冲突 1 — armorType**：War3 原版为 Fortified，项目当前只有 `{ Medium, Heavy, Unarmored }`。采用 Heavy 作为建筑统一映射（与现有 tower 一致），不新增 Fortified 类型。

## 2. Paladin（等级 1）

| 字段 | HERO1 候选值 | 主源 ROC 值 | 交叉校验 | 采用值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| cost.gold | 425 | 425 | Liquipedia/StrategyWiki 一致 | **425** | 无冲突 |
| cost.lumber | 100 | 100 | 一致 | **100** | 无冲突 |
| trainTime | 35s | **55s** | Liquipedia/StrategyWiki 一致 | **55** | HERO1 候选值偏低，采用主源 |
| hp | 700 | **650** | 一致 | **650** | HERO1 候选值偏高，采用主源 |
| speed | 3.2 | 270（War3 单位） | — | **3.0** | 项目映射：270 → 3.0 格/秒（footman 300 → 3.0） |
| supply | 5 | 5 | 一致 | **5** | 无冲突 |
| attackDamage | 24 | 24-34（平均 29） | — | **24** | 采用下限（项目用固定值不用范围） |
| attackRange | 1.0 | 近战 | 一致 | **1.0** | 无冲突 |
| attackCooldown | 1.8 | **2.2** | 一致 | **2.2** | HERO1 候选值偏低，采用主源 |
| armor | 3 | **4** | 一致 | **4** | HERO1 候选值偏低，采用主源 |
| sightRange | 10 | — | — | **10** | HERO1 候选值，无主源冲突 |
| attackType | Normal | **Hero** | 项目无 Hero 攻击类型 | **Normal** | 项目映射：Hero → Normal（Hero 攻击对大多数护甲 1.0x，与 Normal 相近） |
| armorType | Heavy | **Hero** | 项目无 Hero 护甲类型 | **Heavy** | 项目映射：Hero 护甲 → Heavy（Hero 护甲对大多数攻击 1.0x，与 Heavy 相近） |
| maxMana | — | 255（17 INT × 15） | 一致 | **255** | HERO1 合同中提及，确认 |
| manaRegen | — | .01 | — | **暂不固定** | 官方页给出 `.01`，但项目字段单位是每秒回复；HERO4 data seed 不应直接套用 Priest/Sorceress 的 0.5 |

**冲突 2 — trainTime**：HERO1 候选值 35s，主源 ROC 55s。采用 55s。

**冲突 3 — hp**：HERO1 候选值 700，主源 ROC 650。采用 650。

**冲突 4 — attackCooldown**：HERO1 候选值 1.8s，主源 ROC 2.2s。采用 2.2s。

**冲突 5 — armor**：HERO1 候选值 3，主源 ROC 4。采用 4。

**冲突 6 — attackType/armorType**：War3 原版有 Hero 攻击/护甲类型，项目只有 Normal/Piercing/Siege/Magic × Medium/Heavy/Unarmored。映射 Hero → Normal 攻击、Hero → Heavy 护甲，不新增类型。

## 3. Holy Light（等级 1）

| 字段 | HERO1 候选值 | 主源 ROC 值 | 交叉校验 | 采用值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| cost.mana | 65 | **65** | 交叉资料存在历史差异说法 | **65** | 采用当前 Blizzard Classic 主源值 |
| cooldown | 5s | 5s | 一致 | **5** | 无冲突 |
| range | 8.0 | 80（War3 单位） | — | **8.0** | 项目映射：80 → 8.0 格 |
| effectValue | 200 | 200 | 一致 | **200** | 无冲突 |
| effectType | flatHeal | — | — | **flatHeal** | 复用现有 |
| targetRule | ally + injured | 友方有机单位，不含自己 | 一致 | **ally + injured** | 需加 excludeSelf 逻辑 |

**非采用样本 — mana cost 75**：调研中出现 Holy Light 75 mana 的历史说法，但当前可访问的 Blizzard Classic 页面列出 Level 1 mana cost 为 65；本任务不把 75 写成 ROC 主源值，也不把它带入后续 data seed。

**补充 — targetRule**：War3 原版 Holy Light 不能对自己施放。当前 `priest_heal` 的 targetRule 没有 excludeSelf 字段。后续 runtime 任务需扩展 targetRule 或在施放逻辑中排除自己。

## 4. Revive

| 字段 | War3 原版 | 采用值 | 说明 |
| --- | --- | --- | --- |
| reviveTime | 5s × heroLevel | **暂缓** | revive runtime 留 HERO7 |
| reviveCost.gold | 基于召唤费 × 等级系数 | **暂缓** | 复活费用公式复杂，留 runtime 任务 |
| reviveCost.lumber | 同上 | **暂缓** | 同上 |

**决策**：复活费用和时间不在数据种子中固定候选值。等 HERO7 revive runtime 时再定义，避免现在锁定一个后续发现不合适的数值。

## 5. 英雄特有字段

| 字段 | 类型 | 采用值 | 说明 |
| --- | --- | --- | --- |
| isHero | boolean | true | 英雄标识 |
| heroLevel | number | 1 | 初始等级 |
| heroXP | number | 0 | 初始经验 |
| heroSkillPoints | number | 1 | 等级 1 有 1 个技能点 |
| isDead | boolean | false | 初始未死亡 |

这些字段需在 HERO4 Paladin data seed 中扩展 `UnitDef` 接口。

## 6. 采用值汇总（进入 HERO3/HERO4/HERO5 数据种子）

### Altar of Kings (HERO3)
```
key: 'altar_of_kings'
name: '国王祭坛'
cost: { gold: 180, lumber: 50 }
buildTime: 60, hp: 900, supply: 0, size: 3
description: '英雄祭坛，召唤英雄'
trains: ['paladin']
attackDamage: 0, attackRange: 0, attackCooldown: 0
armor: 5
armorType: ArmorType.Heavy
```

### Paladin (HERO4)
```
key: 'paladin'
name: '圣骑士'
cost: { gold: 425, lumber: 100 }
trainTime: 55, hp: 650, speed: 3.0, supply: 5
attackDamage: 24, attackRange: 1.0, attackCooldown: 2.2
armor: 4, sightRange: 10
canGather: false
description: '圣骑士英雄'
attackType: AttackType.Normal
armorType: ArmorType.Heavy
maxMana: 255
isHero: true, heroLevel: 1, heroXP: 0, heroSkillPoints: 1, isDead: false
```

### Holy Light (HERO5)
```
key: 'holy_light'
name: '圣光术'
ownerType: 'paladin'
cost: { mana: 65 }
cooldown: 5, range: 8.0
targetRule: { teams: 'ally', alive: true, excludeTypes: [], includeCondition: 'injured' }
effectType: 'flatHeal', effectValue: 200, duration: 0, stackingRule: 'none'
```

## 7. 来源边界确认

- 所有采用值均有主源或交叉校验支撑。
- 6 处硬冲突已记录并给出采用理由；Holy Light 75 mana 只作为非采用样本记录。
- 暂缓的 revive 数值留 HERO7 runtime 任务。
- 不新增 Fortified/Hero 攻击/护甲类型，使用项目现有映射。
