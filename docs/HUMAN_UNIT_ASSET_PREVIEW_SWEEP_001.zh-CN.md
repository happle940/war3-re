# Human Unit 素材预览 Sweep 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 目的：验证 KayKit CC0 人形角色和动画包，判断它们能否支撑公开分享版本的人族单位第一轮视觉替换。
> 边界：本 sweep 不批准导入 runtime；不复制任何第三方素材到 `public/assets`。

## 0. 本次结论

```text
approved-for-import: none
approved-for-intake: partial, KayKit Knight / Mage / Rig_Medium animation core only
runtime asset changes: none
```

这次对素材线最大的产品意义是：

- 人族 `Footman` 有了一个可继续推进的身体候选：KayKit `Knight.glb`。它像重甲步兵，但不是骑兵。
- 人族 `Sorceress / Priest` 有了一个可继续推进的法系候选：KayKit `Mage.glb`。
- 动画方向有了干净的 CC0 候选：`Rig_Medium` 的移动、近战、远程、受击、死亡、工具动作都在免费包里。
- `Rifleman` 仍未真正解决。`Ranger.glb` 读成弓弩手，不读成火枪兵。
- `Knight` 骑兵仍未解决。免费包没有马、骑乘骨架或骑兵体量。
- `Worker` 仍未解决正式 GLB。免费包里有 `engineer.png` 样张，但没有对应 GLB；runtime 侧已用项目自制 peasant proxy 兜住公开分享画面可读性。

## 1. 本次下载和 artifact

本次只通过 itch 官方免费流程获取文件：

1. 打开 `purchase` 页面。
2. 点击 `No thanks, just take me to the downloads`。
3. 只下载免费包。
4. 不下载付费 `Extra` 或 `Source Files`。

| 包 | 来源 | 免费文件 | 本地 artifact | 当前结论 |
| --- | --- | --- | --- | --- |
| KayKit Adventurers | https://kaylousberg.itch.io/kaykit-adventurers | `Free 2.0`，12 MB | `artifacts/asset-intake/downloads/kaykit-browser/KayKit_Adventurers_2.0_FREE.zip` | 可做人族步兵 / 法师候选池，但不能覆盖 Rifleman、骑兵 Knight、Worker。 |
| KayKit Character Animations | https://kaylousberg.itch.io/kaykit-character-animations | `Free 1.1`，14 MB | `artifacts/asset-intake/downloads/kaykit-browser/KayKit_Character_Animations_1.1.zip` | 可做人形动画候选池，但需要 retarget / runtime 骨架验证。 |

校验摘要：

| 文件 | SHA-256 | zip entries | 路径穿越 |
| --- | --- | ---: | --- |
| `KayKit_Adventurers_2.0_FREE.zip` | `abe48f4763fba0896bab486ee9e6d08ca6b5b3884b9601f235c8847ae94dc479` | 266 | 通过 |
| `KayKit_Character_Animations_1.1.zip` | `65882f31f905ad2e953819648a59287cdeab8f623908d5ef701971d3758be20f` | 48 | 通过 |

包内许可证均为 KayKit `License.txt`：CC0，可用于个人、教育和商业项目；署名非强制。

## 2. 预览和清单

预览图：

```text
artifacts/asset-intake/preview/kaykit-human-units-rts-preview.png
```

预览页和渲染指标：

```text
artifacts/asset-intake/preview/kaykit-human-units-preview.html
artifacts/asset-intake/preview/kaykit-human-units-preview.metrics.json
```

机器清单：

```text
artifacts/asset-intake/manifests/kaykit_adventurers_free_2.0.files.txt
artifacts/asset-intake/manifests/kaykit_adventurers_glb_inventory.json
artifacts/asset-intake/manifests/kaykit_character_animations_1.1.files.txt
artifacts/asset-intake/manifests/kaykit_character_animations_glb_inventory.json
```

动画 retarget spike：

```text
docs/HUMAN_UNIT_ANIMATION_RETARGET_SPIKE_001.zh-CN.md
docs/HUMAN_UNIT_ANIMATION_RETARGET_SPIKE_001.json
artifacts/asset-intake/preview/kaykit-animation-retarget-spike.png
```

抽取出来用于预览和后续 intake 的文件：

```text
artifacts/asset-intake/extracted/kaykit-adventurers/characters/gltf/
artifacts/asset-intake/extracted/kaykit-adventurers/assets/gltf/
artifacts/asset-intake/extracted/kaykit-character-animations/gltf/Rig_Medium/
artifacts/asset-intake/extracted/kaykit-character-animations/gltf/Rig_Large/
```

## 3. 默认镜头判断

| sub_candidate_id | 来源文件 | 目标人族角色 | 产品判断 | 当前状态 |
| --- | --- | --- | --- | --- |
| `human-kaykit-knight-footman-body-001` | `Characters/gltf/Knight.glb` | `Footman` | 重甲头盔、披风、体量在 RTS 斜俯视角下清楚，适合作为 Footman 第一候选。它不是骑兵，不能承担 `Knight`。 | `approved-for-intake` |
| `human-kaykit-mage-caster-body-001` | `Characters/gltf/Mage.glb` | `Sorceress / Priest` | 大帽子、法袍、色块很清楚，适合法系单位初筛。需要区分 Sorceress 与 Priest 的颜色、武器和施法特效。 | `approved-for-intake` |
| `human-kaykit-rig-medium-animation-core-001` | `Rig_Medium_*.glb` | 人形单位动画 | 覆盖走、跑、近战、远程、受击、死亡、工具动作。可以进入动画 intake，但必须先验证 retarget 和骨架兼容。 | `approved-for-intake` |
| `human-kaykit-ranger-ranged-proxy-001` | `Characters/gltf/Ranger.glb` + `crossbow_2handed.gltf` | `Rifleman` 候选参考 | 远程兵轮廓可读，但语义是弓弩手，不是火枪兵。可以做临时 ranged proxy，不建议直接当 Rifleman。 | `candidate` |
| `human-kaykit-barbarian-neutral-001` | `Characters/gltf/Barbarian.glb` | neutral / creep 参考 | 近战轮廓可读，但更像野蛮人或中立单位，不像 Human army 主线。 | `reference-only` |
| `human-kaykit-rogue-light-001` | `Characters/gltf/Rogue.glb`、`Rogue_Hooded.glb` | 轻甲单位参考 | 适合参考，不是当前人族第一批必须单位。 | `reference-only` |
| `human-kaykit-mounted-knight-gap-001` | 无 | `Knight` | 包内没有马、骑乘骨架或骑兵体量。人族骑士仍要另找来源或原创制作。 | `blocked-gap` |
| `human-kaykit-worker-gap-001` | 无 GLB | `Worker` | 包内有 `Samples/engineer.png`，但无对应 GLB。不能作为 runtime worker 候选；当前只由项目自制 peasant proxy 兜底。 | `blocked-gap` |

## 4. 动画覆盖判断

`KayKit Character Animations 1.1` 的页面描述为 161 个 humanoid animations；本地 GLB 解析按文件统计到 173 个 clips，原因是不同 rig、T-pose、special / duplicated categories 会影响机器计数。对外产品表述仍以来源页面的 161 为准。

对当前人族第一轮最有用的是 `Rig_Medium`：

| GLB | 机器解析 clip 数 | 第一轮用途 |
| --- | ---: | --- |
| `Rig_Medium_MovementBasic.glb` | 11 | idle / walking / running 基础移动。 |
| `Rig_Medium_General.glb` | 15 | idle、hit、death、interact。 |
| `Rig_Medium_CombatMelee.glb` | 22 | Footman 近战攻击候选。 |
| `Rig_Medium_CombatRanged.glb` | 20 | ranged proxy 攻击候选；Rifleman 还需火枪语义。 |
| `Rig_Medium_Tools.glb` | 29 | Worker 未来工具动作候选；但本包没有 worker 模型。 |

2026-04-16 已追加 retarget spike：`Knight + Melee_1H_Attack_Slice_Horizontal`、`Ranger + Ranged_2H_Shoot`、`Mage + Idle_A` 三组都没有缺失 track target，探针骨骼都发生实际旋转变化。结论是“动画绑定可继续推进”，不是 runtime 导入批准。

## 5. 进入下一步前还缺什么

这些 item 虽然可以进入 `approved-for-intake`，但仍不能导入：

- 没有 runtime key 映射和文件计划落地。
- 没有 scale、pivot、selection ring、footprint 验证。
- 没有 team-color 或阵营识别方案。
- 没有把角色模型和动画包做 retarget 验证。
- 没有 Rifleman 的火枪语义模型。
- 没有骑兵 Knight 模型。
- 没有 worker 正式 GLB 模型；当前只有项目自制 peasant proxy fallback。
- 没有 Asset Approval Handoff Packet。
- 没有 fallback regression。

## 6. 下一步建议

1. 用 `Knight.glb` 做 Footman 第一候选文件计划。
2. 用 `Mage.glb` 做 Sorceress/Priest 第一候选文件计划。
3. 把 `Ranger.glb` 只作为 ranged proxy 或 Rifleman 风格缺口说明，不直接导入。
4. 单独找 Rifleman 火枪语义来源，或走干净 AI / 人工原创路线。
5. 单独找骑兵 Knight 来源，或走人工原创路线。
6. 做更接近 runtime 的 animation mixer spike：Footman `idle/walk/melee`、caster `idle/hit/death/cast-like proxy`。`partial done: docs/HUMAN_UNIT_ANIMATION_RETARGET_SPIKE_001.zh-CN.md`

## 7. 仍禁止的动作

```text
不得把 KayKit GLB 复制到 public/assets。
不得把 approved-for-intake 写成 approved-for-import。
不得把 Ranger 说成 Rifleman 已解决。
不得把 Knight.glb 说成人族骑士已解决。
不得根据本 sweep 自动接入 AssetCatalog。
不得把 itch 页面截图当作最终授权记录；最终导入还要保留包内 License.txt。
```
