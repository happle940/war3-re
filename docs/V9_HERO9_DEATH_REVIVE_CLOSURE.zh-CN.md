# V9 HERO9 英雄死亡 / 复活 闭环清单

> 生成时间：2026-04-16
> 范围：V9 人族圣骑士(Paladin)最小死亡 + 祭坛复活分支闭环盘点。
> 本文档 **不** 声称"完整英雄系统"或"完整人族"。

---

## 1. 任务覆盖映射

| 任务编号 | 任务名称 | 状态 | 闭环证据 |
|---------|---------|------|---------|
| Task 212 — HERO9-CONTRACT1 | 英雄死亡和复活分支合同 | accepted | `tests/v9-hero9-hero-death-revive-contract.spec.mjs` (27/27) |
| Task 213 — HERO9-SRC1 | 死亡/复活来源边界 | accepted | `tests/v9-hero9-revive-source-boundary.spec.mjs` (24→85 联合) |
| Task 214 — HERO9-IMPL1 | 英雄死亡状态运行时切片 | accepted | `tests/v9-hero9-death-state-runtime.spec.ts` (19/19 runtime) |
| Task 215 — HERO9-DATA1 | 复活数据种子 | accepted | `tests/v9-hero9-revive-data-seed.spec.mjs` (联合 49/49) |
| Task 216 — HERO9-CONTRACT2 | 祭坛复活运行时合同 | accepted | `tests/v9-hero9-revive-runtime-contract.spec.mjs` (联合 85/85) |
| Task 217 — HERO9-IMPL2 | 祭坛复活运行时 | accepted | `tests/v9-hero9-revive-runtime.spec.ts` (21/21 runtime) |

---

## 2. 运行时证明文件

### 2.1 死亡状态运行时

- **文件**：`tests/v9-hero9-death-state-runtime.spec.ts`
- **覆盖**：
  - Paladin 死亡后 `isDead=true`、`hp=0`、mesh 不可见
  - 死亡英雄停止行动和索敌
  - 死亡英雄仍占人口、阻止同类型新召唤
  - 死亡 Paladin 不能释放圣光

### 2.2 复活来源边界

- **文件**：`tests/v9-hero9-revive-source-boundary.spec.mjs`
- **覆盖**：
  - 复活费用/时间/HP/mana 映射的来源边界
  - 死亡不留普通尸体语义
  - 死亡英雄视觉/选择 deferred 记录
  - 召唤与复活路径分离

### 2.3 复活数据种子

- **文件**：`tests/v9-hero9-revive-data-seed.spec.mjs`
- **覆盖**：
  - `HERO_REVIVE_RULES` 常量存在于 `GameData.ts`
  - 复活金币/木材/时间/HP/mana 公式映射
  - Paladin 一级复活参数示例验证

### 2.4 死亡/复活合同

- **文件**：`tests/v9-hero9-hero-death-revive-contract.spec.mjs`
- **覆盖**：
  - 新召唤看同类型英雄记录是否存在
  - 复活入口单独看 `isDead === true`
  - 死亡/复活分支语义正确性

### 2.5 复活运行时合同

- **文件**：`tests/v9-hero9-revive-runtime-contract.spec.mjs`
- **覆盖**：
  - 祭坛复活按钮/队列运行时合同
  - 费用、时间 `Math.round` 映射
  - 队列形状、同一英雄记录恢复
  - 禁区和 no-runtime 边界

### 2.6 复活运行时

- **文件**：`tests/v9-hero9-revive-runtime.spec.ts`
- **覆盖**：
  - 无死亡 Paladin 时无复活入口，召唤可用
  - 存活 Paladin 阻止召唤，不开放复活
  - 死亡 Paladin 开放复活，费用/时间正确
  - 复活花费一次、排队一次、重复点击不双花
  - 资源不足拒绝复活
  - 排队中可见"正在复活"状态
  - 完成后恢复同一英雄记录，非新单位

---

## 3. 明确排除的闭环范围

以下特性 **不在** 本闭环范围内，保持关闭：

- 英雄经验值 (XP) 系统
- 英雄升级 (leveling)
- 技能点 (skill points) 分配
- 英雄 UI 升级面板
- 物品栏 / 背包系统 (inventory/items)
- 光环效果 (aura)
- 其他人族英雄（山丘之王、大法师、血法师）
- 酒馆 (Tavern) 中立英雄
- 商店 (shop)
- AI 英雄策略
- 新视觉 / 资源素材
- 空军单位
- 第二种族
- 多人联机
- 公开发布工作

---

## 4. 闭环声明

V9 HERO9 分支已通过六层递进任务（CONTRACT1 → SRC1 → IMPL1 → DATA1 → CONTRACT2 → IMPL2）完成了 **人族圣骑士(Paladin)最小死亡 + 祭坛复活** 的闭环。所有静态 proof 和运行时 proof 均通过。

本闭环 **仅** 覆盖：
- 一个英雄类型（Paladin）的死亡状态
- 通过祭坛（Altar of Kings）的复活按钮和队列
- 一级复活费用、时间、HP/mana 恢复
- 同一英雄记录恢复（非新单位）

本闭环 **不** 声称：
- "完整英雄系统" — 仅 Paladin 一个英雄
- "完整人族" — 仅死亡/复活两个运行时行为
- 任何上述排除列表中的特性
