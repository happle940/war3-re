# A1 核心建筑加载失败 fallback Proof 001

> 日期：2026-04-16  
> 分支：`codex/asset-public-share`  
> 依据：`docs/A1_CORE_BUILDING_RULE_FIT_PROOF_001.zh-CN.md`  
> 目的：在任何 Quaternius runtime 导入前，先证明当前 S0 / project-proxy fallback 安全网是稳的。  
> 边界：本 proof 不导入 Quaternius GLB，不修改 `public/assets`，不修改 `AssetCatalog`。

## 0. 本次结论

```text
approved-for-import: none
fallback proof: passed
runtime asset changes: none
```

执行命令：

```bash
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts tests/v3-asset-fallback-catalog-proof.spec.ts --reporter=list
```

结果：

```text
11 passed
0 failed
duration: 1.4m
```

机器记录：

```text
docs/A1_CORE_BUILDING_LOAD_FAILURE_FALLBACK_PROOF_001.json
```

## 1. 这次证明了什么

这次不是证明 Quaternius 已经可以导入，而是证明“导入失败时不能把游戏打坏”的基础安全网存在。

通过的关键点：

- 缺失 asset path 时，worker、footman、townhall、barracks、farm、tower、goldmine 都能创建可见 fallback。
- fake asset 的 clone、材质隔离、队伍色隔离、refresh scale 合同通过。
- 显式 refresh 不会改变 live entity 的位置和旋转。
- 启动和 refresh 没有严重 console error。
- manifest status audit 没有未批准导入，也没有外部 asset URL。
- worker 使用强制 RTS proxy 且有队伍色。
- tree line 使用程序 fallback。
- 九个 A1 target key 都能追溯到 fallback route。
- 综合 V3-AV1 fallback audit 通过。

## 2. 运行时观察

测试输出里有几个对素材导入特别关键的数字：

| 项 | 结果 |
| --- | --- |
| visible runtime types | `townhall`、`goldmine`、`barracks`、`worker`、`blacksmith`、`farm`、`footman`、`tower` |
| all meshes valid | `true` |
| trees valid | `true` |
| tree count | `187` |
| pathing grid exists | `true` |
| no external imports | `true` |
| closeout audit no console errors | `true` |
| terrain aid manifest only | `true` |

## 3. 产品判断

这条 proof 让 Quaternius 后续导入尝试更安全：

```text
当前 S0 fallback 足够作为导入失败时的保护网。
```

但它不等于 Quaternius 已经可以导入。它只说明：后续如果做导入包，必须保留这个 fallback 机制，不能因为换美术删掉 S0 proxy。

## 4. 仍然没证明的事

下一步还要补真实 gameplay smoke：

- Goldmine：Mine + Resource Gold 组合后，worker 能靠近、采集、回收，不被模型挡住。
- Tower：候选高度下 projectile spawn、射程、目标选择不漂移。
- Town Hall / Barracks / Farm：选中、血条、建造中状态、训练和 rally 不坏。
- Quaternius GLB 真正复制到 runtime 路径后的加载失败回退，还需要在 approved-for-import packet 阶段单独测。

所以当前状态仍然是：

```text
approved-for-intake, not approved-for-import
```
