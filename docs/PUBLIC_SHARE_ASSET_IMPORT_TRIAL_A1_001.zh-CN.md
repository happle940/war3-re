# A1 公开分享素材第一切片试导入记录 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 依据：`docs/PUBLIC_SHARE_ASSET_IMPORT_CHECKLIST.zh-CN.md`
> 状态：`import-trial-active, barracks-farm-optimized, goldmine-accent-composed, goldmine-readability-boosted, tree-line-safety-proofs-passed, functional-smoke-passed-by-split-verification`

## 0. 本次结论

```text
final approved-for-import: none
approved-for-import-trial: Quaternius five-building slice + visual-only Goldmine accent
runtime asset changes: yes
fallback retained: yes
current tree line safety proofs: passed
goldmine readability boost: passed
```

这次已经把 Quaternius 第一切片接入 runtime，但只作为试导入：

```text
townhall
barracks
farm
goldmine
tower
goldmine_accent
```

Tree line 没有导入；当前 S0 tree line 已补木材闭环和工人遮挡 proof。Resource Gold accent 已作为 `goldmine` 的视觉 cue 导入，并已根据“金矿不够金”的反馈做金色可读性增强；但它仍不是独立资源对象。

## 1. 实际复制的文件

| runtime key | 目标文件 | SHA-256 |
| --- | --- | --- |
| `townhall` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/town-center.glb` | `fa7d33ff72092a96073b659eba5562ed1eadf5b60a8092d1321769b34e9177a5` |
| `barracks` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/barracks.glb` | `1b6607319c7166daec71e60c0473cd85afa4df96a1d4cd4624d6ca7ab36e7de6` |
| `farm` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/farm.glb` | `9ba5dfacf8e469b002e41a60e746fb7d5de64feb46903fb674a8e8174fa2a6bd` |
| `goldmine` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/mine.glb` | `cfbabb663904483aa9704b7ea63e053a58dbe882abbc2935e65f5a0425b21752` |
| `goldmine_accent` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/resource-gold.glb` | `a580525d732887e89ab7d538cefd6ce59c2d1657e5fea9f6b3839a484194faa7` |
| `tower` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/watch-tower.glb` | `d70f8855cb45003b4f78a093a23eab61717f9246fdcdeca281bf6b341edb442a` |

## 2. Runtime 改动

`src/game/AssetCatalog.ts` 中 5 个核心 building key 指向 vendor 候选路径，另有 1 个 visual-only accent key：

| key | path | scale |
| --- | --- | --- |
| `townhall` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/town-center.glb` | `2.5299` |
| `barracks` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/barracks.glb` | `1.4369` |
| `farm` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/farm.glb` | `0.8123` |
| `goldmine` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/mine.glb` | `1.7960` |
| `goldmine_accent` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/resource-gold.glb` | `1.15` |
| `tower` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/watch-tower.glb` | `1.8461` |

没有改 worker、footman、rifleman、tree line、图标、音频或 UI 壳层素材。

## 3. 导入中发现的问题和修复

第一次跑采矿冒烟时，真实 GLB 暴露出一个 S0 proxy 没暴露的问题：

```text
build-complete effect assumed first mesh material always has emissive.
```

Quaternius glTF 的部分材质没有 `emissive` 字段，导致建造完成时崩溃。

已修复：

- 文件：`src/game/FeedbackEffects.ts`
- 改法：完工闪光只对支持 `emissive` 的材质执行；不支持时跳过闪光，不影响 gameplay。
- 产品影响：不改变规则，只让真实 GLB 和程序 fallback 都能安全完成建造。

## 4. 验证结果

### 4.1 Build / Typecheck

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

结果：

```text
passed
```

Vite 仍有原有大 chunk warning，不是本次新增的阻断项。

### 4.2 Fallback / asset safety

```bash
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts tests/v3-asset-fallback-catalog-proof.spec.ts --reporter=list
```

结果：

```text
11 passed
0 failed
duration: 2.8m
```

关键观察：

- 5 个导入建筑都能创建有效 mesh。
- worker 仍使用项目 RTS proxy。
- tree line 仍使用程序 fallback。
- terrain aid 仍是 manifest-only / pathing runtime。
- 无严重 console error。
- 无远程外链导入。

### 4.3 玩法 smoke

原完整 24 项命令在并行 GLM / cleanup 干扰和长运行时压力下多次被 SIGTERM 中断，所以最终按文件 / 单项拆跑记录。

覆盖结果：

| 测试面 | 结果 | 说明 |
| --- | --- | --- |
| Building agency | `5/5 passed` | 单文件成功跑完，用时 3.1m。 |
| Construction lifecycle | `10/10 scenario pass outputs collected` | 前 8 项在长命令中通过后被 SIGTERM 中断；剩余 2 项单独通过。 |
| Mining saturation | `2/2 passed` | 单文件成功跑完，用时 1.1m。 |
| Static defense | `7/7 scenario pass outputs collected` | 前 6 项在长命令中通过后被 SIGTERM 中断；剩余 console 稳定性单独通过。 |

产品结论：

- Goldmine 5 人采集上限通过。
- 默认经济规模能接近 5 人采矿饱和。
- Tower 攻击、射程、友军过滤、资源目标过滤、死亡目标切换通过。
- 建造、恢复、取消、退款、builder 归属、HUD 回退通过。
- 建筑放置代理和选择顺序通过。

## 5. 性能观察

真实 GLB 导入后，部分浏览器测试明显变慢：

- Building agency 单文件从此前约分钟级内，变成 5 项 3.1m。
- Construction lifecycle 早期场景出现 40s 到 1m+ 单项。

这不是 correctness blocker，但说明第一切片后必须补资产优化工作：

- 用 glTF Transform 做 prune / dedup / meshopt 或其他压缩评估。
- 检查材质数量、节点数量、draw call 和 clone 成本。
- 判断是否要合并材质或做项目内轻量化版本。

## 6. 优化 Pass 001

2026-04-16 已完成第一轮低风险优化：

```text
docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.json
```

优化范围：

- `barracks.glb`
- `farm.glb`

结果：

| 文件 | 优化前 | 优化后 | 节省 |
| --- | ---: | ---: | ---: |
| `barracks.glb` | 475.3 KB | 365.5 KB | 23.11% |
| `farm.glb` | 225.5 KB | 174.3 KB | 22.68% |

五建筑总大小从 1,047.0 KB 降到 886.1 KB。优化没有引入 Draco / Meshopt / 纹理压缩，也没有要求改 Three.js loader decoder。

优化后复验：

- `gltf-transform validate barracks/farm`：无 error / warning。
- `npm run build`：pass。
- fallback / asset safety：11/11 pass，用时 2.1m。
- farm 建造中断 / 恢复烟测：1/1 pass，用时 37.8s。

当前 `npx tsc --noEmit -p tsconfig.app.json` 被工作树里 `src/game/Game.ts(2050,12)` 的英雄升级 WIP 挡住，错误为 `checkHeroLevelUp` 未定义；本次素材优化没有修改 `src/game/Game.ts`。

## 7. Goldmine 组合 Pass 001

2026-04-16 已完成 Goldmine 组合导入：

```text
docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.json
```

改动：

- `resource-gold.glb` 已优化后复制到 runtime vendor 目录。
- `AssetCatalog.ts` 新增 `goldmine_accent`。
- `BuildingVisualFactory.ts` 将 `goldmine` 组合为 Mine body + Resource Gold accent。
- `goldmine_accent` 只作为视觉 cue，不是独立资源对象。

复验：

- `gltf-transform validate resource-gold`：无 error / warning。
- `npm run build`：pass。
- Goldmine composition regression：1/1 pass，用时 30.1s。
- fallback / asset safety：11/11 pass，用时 3.9m。
- mining saturation：2/2 pass，用时 1.3m。

Tree line 仍不导入；直接把 Quaternius `trees.glb` 接到 `pine_tree` 已被 gate 拒绝：

```text
docs/PUBLIC_SHARE_ASSET_TREE_LINE_IMPORT_GATE_A1_001.zh-CN.md
```

## 8. Goldmine 金色可读性 Pass 002

2026-04-16 根据“金矿不够金”的反馈，已补：

```text
docs/PUBLIC_SHARE_ASSET_GOLDMINE_READABILITY_PASS_A1_002.zh-CN.md
docs/PUBLIC_SHARE_ASSET_GOLDMINE_READABILITY_PASS_A1_002.json
tests/goldmine-gold-readability-proof.spec.ts
artifacts/asset-intake/preview/goldmine-gold-readability-a1-002.png
artifacts/asset-intake/preview/goldmine-gold-readability-a1-002.json
```

改动：

- `Resource Gold` accent 从 1 处扩成 4 处。
- 新增 3 个低面数金色碎矿 cue。
- `remainingGold` 仍是 `2000`。
- 不改变 pathing、采集逻辑或金矿容量。

验证：

```bash
npm run build
./scripts/run-runtime-tests.sh tests/goldmine-accent-composition-regression.spec.ts tests/goldmine-gold-readability-proof.spec.ts --reporter=list
```

结果：

```text
build passed
2/2 passed
duration: 41.8s
mining saturation: 2/2 passed, duration: 1.7m
```

## 9. Tree line 木材闭环 Gate 001

2026-04-16 已补 Tree line 木材闭环证明：

```text
docs/PUBLIC_SHARE_ASSET_TREE_LINE_LUMBER_GATE_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_TREE_LINE_LUMBER_GATE_A1_001.json
tests/tree-line-lumber-gate-regression.spec.ts
```

验证：

```bash
./scripts/run-runtime-tests.sh tests/tree-line-lumber-gate-regression.spec.ts --reporter=list
```

结果：

```text
2/2 passed
duration: 21.6s
```

证明点：

- 默认树线可见、已注册、能阻挡 pathing。
- worker 可以以 `TreeEntry` 作为 lumber target 完成一次采木结算。
- 树木耗尽后会从 `TreeManager` 移除。
- 被移除的树 tile 会释放 blocker。

这让当前 S0 procedural tree line 可以继续作为产品安全底座；但 Tree line 最终美术仍未批准，Quaternius `trees.glb` 直接导入仍被拒绝。

## 10. Tree line 工人遮挡 Proof 001

2026-04-16 已补 Tree line worker readability proof：

```text
docs/PUBLIC_SHARE_ASSET_TREE_LINE_WORKER_READABILITY_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_TREE_LINE_WORKER_READABILITY_A1_001.json
tests/tree-line-worker-readability-proof.spec.ts
artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.png
artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.json
```

验证：

```bash
./scripts/run-runtime-tests.sh tests/tree-line-worker-readability-proof.spec.ts --reporter=list
```

结果：

```text
1/1 passed
duration: 17.6s
```

证明点：

- 使用现有树线 tile `(9, 7)`，不是临时假树。
- worker 放在采木前缘 `(9, 8)`。
- worker、tree、selection ring 都在屏幕内。
- worker screen bbox 约 `72.3 x 95.5 px`。
- selection ring bbox 约 `68.0 x 55.8 px`。
- worker/tree overlap ratio 为 `0.51`，低于 proof 阈值 `0.65`。

结论：当前 S0 procedural tree line 的采木前缘可读性可接受。未来替换树素材时必须重跑。

## 11. 当前仍然不是最终批准

当前状态最多是：

```text
approved-for-import-trial-passed-with-barracks-farm-optimization-goldmine-accent-composition-goldmine-readability-boost-tree-line-lumber-gate-and-worker-readability-proof
```

不能说：

```text
final art complete
public art solved
all A1 assets imported
```

仍然缺：

- Tree line worker 遮挡 / 采木 proof。
- Help / Credits 游戏内入口。
- Human unit 正式素材路线。
- 更深一层的材质 / primitive 合并或 decoder 级压缩 proof。

优化 proof 已补充：

```text
docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PROOF_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_TREE_LINE_IMPORT_GATE_A1_001.zh-CN.md
```
