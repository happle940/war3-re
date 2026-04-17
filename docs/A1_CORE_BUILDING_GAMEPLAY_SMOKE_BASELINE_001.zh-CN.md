# A1 核心建筑真实玩法冒烟基线 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 依据：`docs/A1_CORE_BUILDING_LOAD_FAILURE_FALLBACK_PROOF_001.zh-CN.md`
> 目的：在任何 Quaternius runtime 导入前，先确认当前建筑相关玩法基线是稳的。
> 边界：本次不导入 Quaternius GLB，不复制文件到 `public/assets`，不修改 `AssetCatalog`。

## 0. 本次结论

```text
approved-for-import: none
pre-import gameplay baseline: passed
runtime asset changes: none
```

执行命令：

```bash
./scripts/run-runtime-tests.sh tests/mining-saturation-regression.spec.ts tests/static-defense-regression.spec.ts tests/construction-lifecycle-regression.spec.ts tests/building-agency-regression.spec.ts --reporter=list
```

结果：

```text
24 passed
0 failed
duration: 3.6m
```

机器记录：

```text
docs/A1_CORE_BUILDING_GAMEPLAY_SMOKE_BASELINE_001.json
```

## 1. 这次证明了什么

这次不是证明 Quaternius 已经可以直接导入，而是证明“导入前要保护的真实玩法合同”目前是稳的。

通过的关键场景：

- Goldmine 采矿容量没有破：同时有效采集工人不会超过 5 个。
- 默认经济规模能接近 5 人采矿饱和，不是只有单工人脚本能跑。
- Tower 能打到射程内敌人。
- 未完工 Tower 不会攻击。
- Tower 不会误伤友军。
- Tower 攻击时不会移动或追人。
- Tower 清掉死亡目标后能重新找新目标。
- Tower 不会把 goldmine 或资源物当成攻击目标。
- 建造中的 Farm 可以被暂停、恢复、取消。
- 工人在建筑边缘就能进入建造状态，不需要走到被阻挡的中心点。
- 取消建造会释放占位、清理 builder 状态，并且退款不可重复。
- 选中建造中建筑后点取消，选择圈、HUD、命令面板能回到有效状态。
- 多工人建造归属不会被第二个工人抢走，除非原 builder 死亡或停止。
- 建筑放置代理能稳定选择正确工人，取消放置会清掉临时 builder 状态。

## 2. 对素材导入有什么意义

这条基线把后续 Quaternius 导入的验收口径压实了：

| 面向玩家的场景 | 当前基线状态 | 后续导入时必须继续保持 |
| --- | --- | --- |
| Goldmine | 5 人采集上限和饱和节奏通过 | Mine + Resource Gold 组合不能挡路、不能改变采集上限。 |
| Tower | 攻击、射程、目标过滤、静态防御通过 | Watch Tower 高度、攻击点、队伍色不能让弹道和目标选择漂移。 |
| Farm / 建造 | 建造、暂停、恢复、取消、退款通过 | 新模型 footprint 和视觉边界不能误导玩家点选和路径。 |
| Town Hall / Barracks 类建筑 | 建筑代理、选择/HUD、命令面板状态通过 | 新主基地/兵营体量不能遮住选择圈、血条、rally 和训练反馈。 |

换句话说，Quaternius 后续如果进入 runtime 试导入，不能只看截图好不好看；必须继续跑这条真实玩法基线。

## 3. 本次顺手修正的测试口径

冒烟第一次跑时暴露了一个旧断言：命令面板现在已经是 4x4 的 16 格槽位，但该取消建造测试仍按旧槽位数检查。

已把 `tests/construction-lifecycle-regression.spec.ts` 的相关断言修正为 16，并单独复跑该用例通过。这个修正不改变产品行为，只让测试跟当前产品界面保持一致。

## 4. 仍然没证明的事

当前状态仍然不是 `approved-for-import`：

- Quaternius GLB 还没有复制到 runtime 路径。
- `AssetCatalog` 还没有指向 Quaternius 文件。
- 真实候选模型的 marker、team-color、attack point、healthbar anchor 还没有在游戏内落地。
- 后续第一次 import packet 必须继续保留 S0 fallback，并再次跑 fallback proof 和本玩法冒烟包。

所以当前结论仍然是：

```text
approved-for-intake, not approved-for-import
```
