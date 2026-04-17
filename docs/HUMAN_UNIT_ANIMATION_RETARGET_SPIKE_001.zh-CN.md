# Human Unit 动画 Retarget Spike 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 来源：KayKit Adventurers `Free 2.0` + KayKit Character Animations `Free 1.1`
> 边界：本 spike 只验证 intake 区绑定，不批准导入 runtime。

## 0. 本次结论

```text
runtime asset changes: none
retarget binding: pass for sampled Knight / Ranger / Mage clips
approved-for-import: none
```

这一步解决的是一个关键风险：KayKit 角色模型和 KayKit `Rig_Medium` 动画包能不能互相认骨骼。

结果是：三组抽样都能绑定，没有缺失 track target，并且探针骨骼发生了实际旋转变化。

| 角色 | 动画文件 | clip | missing targets | 探针骨骼变化 | 判断 |
| --- | --- | --- | ---: | ---: | --- |
| `Knight.glb` | `Rig_Medium_CombatMelee.glb` | `Melee_1H_Attack_Slice_Horizontal` | 0 | `0.2813` | 绑定成功，能动。 |
| `Ranger.glb` | `Rig_Medium_CombatRanged.glb` | `Ranged_2H_Shoot` | 0 | `0.5191` | 绑定成功，能动。 |
| `Mage.glb` | `Rig_Medium_General.glb` | `Idle_A` | 0 | `0.0263` | 绑定成功，能动。 |

## 1. 预览和指标

预览页：

```text
artifacts/asset-intake/preview/kaykit-animation-retarget-spike.html
```

截图：

```text
artifacts/asset-intake/preview/kaykit-animation-retarget-spike.png
```

机器指标：

```text
artifacts/asset-intake/preview/kaykit-animation-retarget-spike.metrics.json
```

## 2. 产品意义

这让 KayKit 从“只有静态角色能看”推进到“有机会做可动的人族第一批视觉”：

- `Footman` 可以继续测试 `Knight body + melee attack / walk / idle`。
- `Sorceress / Priest` 可以继续测试 `Mage body + idle / hit / death / cast-like proxy`。
- `Ranged proxy` 可以继续测试 `Ranger body + ranged shoot`，但它仍然不是 Rifleman。

## 3. 仍然不能导入的原因

这个 spike 只证明“能绑定、能动”，还没有证明“适合进游戏”：

- 没有接入当前 `UnitVisualFactory` 或 `AssetCatalog`。
- 没有验证当前 runtime 的 `AnimationMixer` 生命周期。
- 没有检查移动时脚底打滑。
- 没有定义攻击命中帧和 projectile 发射帧。
- 没有把武器 attach 到 hand slot。
- 没有处理队伍色。
- 没有和选择圈、血条、死亡清理一起测。
- 没有 fallback regression。

## 4. 下一步建议

1. 做一个最小 intake runtime spike：只在测试分支临时加载 `Knight + Idle/Walk/Melee`，验证生命周期。
2. 如果 Footman 通过，再做 Mage 的 idle/hit/death/cast proxy。
3. Rifleman 不使用 Ranger 直接冒充；继续寻找火枪 silhouette 或走原创 / AI clean route。
4. 动画命名表要独立维护，不能在 gameplay 代码里硬编码一堆 KayKit clip name。

## 5. 仍然禁止

```text
不得把本 spike 说成动画导入完成。
不得根据本 spike 自动复制素材到 public/assets。
不得把 Ranger + Ranged_2H_Shoot 对外说成 Rifleman 已完成。
不得跳过 fallback、脚底滑动、命中帧、死亡清理测试。
```
