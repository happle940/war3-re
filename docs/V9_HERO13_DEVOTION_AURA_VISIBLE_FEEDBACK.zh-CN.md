# V9 HERO13-UX1 Devotion Aura 可见反馈

> 任务编号：Task 243 — HERO13-UX1
> 前置：HERO13-IMPL2（学习表面，Task 242）
> 合同：V9_HERO13_DEVOTION_AURA_CONTRACT.zh-CN.md

## 1. UX1 范围

本切片为 Devotion Aura 添加 **可见反馈**：

1. 选中已学习 DA 的 Paladin 时，HUD 显示 `虔诚光环 Lv${level}`。
2. 选中受光环影响的友方单位时，HUD 显示 `虔诚光环 +${bonus} 护甲`。
3. 光环消失（Paladin 死亡或单位离开范围）时，bonus 行消失。
4. 敌方/建筑不显示友方光环状态。
5. 无 DA 施放按钮（被动技能，无命令卡按钮）。
6. Holy Light、Divine Shield、HERO9 复活不变。

## 2. 修改文件

| 文件 | 修改 |
|------|------|
| `src/game/Game.ts` | HUD stats 区添加 DA level 行与 aura bonus 行 |

## 3. HUD 文本契约

| 条件 | 文本 |
|------|------|
| Paladin 已学习 DA（level ≥ 1） | `虔诚光环 Lv${level}` |
| 友方单位在光环范围内 | `虔诚光环 +${bonus} 护甲` |
| Paladin 死亡 / 单位离开范围 | bonus 行消失 |
| 敌方单位 | 不显示 `虔诚光环 +` |

## 4. 不修改

- `GameData.ts` — 数据已在 DATA1 确定
- `ABILITIES` — 无 DA 条目（被动技能）
- Holy Light / Divine Shield 运行时逻辑
- AI、物品、商店、Tavern、资产
- 命令卡按钮 — DA 无施放按钮，仅学习按钮（IMPL2）

## 5. 运行时证明

文件：`tests/v9-hero13-devotion-aura-visible-feedback.spec.ts`

| ID | 证明 |
|----|------|
| VF-DA-1 | Paladin 学习 DA 后 HUD 显示等级 |
| VF-DA-2 | 友方单位受光环影响显示护甲加成 |
| VF-DA-3 | Paladin 死亡后 bonus 消失 |
| VF-DA-4 | 敌方不显示光环状态 |
| VF-DA-5 | 无 DA 施放按钮，学习按钮仍存在 |

## 6. 明确延后

- 光环地面视觉效果
- 光环范围指示器
- 命令卡图标替换
- 完整圣骑士、完整英雄系统、完整人族
- V9 发布

## 7. 合同声明

本切片遵守 HERO13-CONTRACT1 合同边界：
- 不引入施放按钮
- 不修改 `ABILITIES`
- 不引入完整圣骑士、完整英雄系统、完整人族、V9 发布
- 所有数值来源于 SRC1 → DATA1
