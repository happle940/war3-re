# A1 公开分享素材第一切片优化 Pass 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 依据：`docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PROOF_A1_001.zh-CN.md`
> 状态：`optimization-pass-applied-runtime-replaced-fallback-proof-passed`

## 0. 本次结论

```text
optimized runtime files: barracks.glb, farm.glb
method: glTF Transform prune + dedup + weld + prune
decoder impact: none
fallback retained: yes
asset regression: passed
```

这次没有扩大素材范围，只把 Quaternius 第一切片里最重、最常见的两个模型先做结构精简：

- `barracks.glb`
- `farm.glb`

优化版已经替换到运行目录：

```text
public/assets/models/vendor/quaternius/ultimate-fantasy-rts/barracks.glb
public/assets/models/vendor/quaternius/ultimate-fantasy-rts/farm.glb
```

原始试导入文件保留在：

```text
artifacts/asset-intake/optimized/quaternius-a1-pass-001/originals/
```

优化候选和最终产物保留在：

```text
artifacts/asset-intake/optimized/quaternius-a1-pass-001/work/
artifacts/asset-intake/optimized/quaternius-a1-pass-001/final/
```

## 1. 优化结果

| 文件 | 原始大小 | 优化后大小 | 节省 | 节省比例 | 原始 SHA-256 | 优化后 SHA-256 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| `barracks.glb` | 486,740 B / 475.3 KB | 374,272 B / 365.5 KB | 112,468 B | 23.11% | `b62a47e6cf8cdacc87be9afb6c5201a6becaf3e2616fd5d6797958b00e99ef74` | `1b6607319c7166daec71e60c0473cd85afa4df96a1d4cd4624d6ca7ab36e7de6` |
| `farm.glb` | 230,864 B / 225.5 KB | 178,512 B / 174.3 KB | 52,352 B | 22.68% | `403cd4f1218f2d45392becbf63e1bec64df527152235f99895342c5dd2b8b2c2` | `9ba5dfacf8e469b002e41a60e746fb7d5de64feb46903fb674a8e8174fa2a6bd` |

五建筑总量变化：

```text
before: 1,072,168 B / 1,047.0 KB
after:    907,348 B /   886.1 KB
saved:    164,820 B /   160.9 KB
saved%:   15.37%
```

这次收益主要来自清掉未引用 accessor / bufferView，并没有改变可见几何数量。

## 2. 结构对比

| 文件 | primitives | materials | vertices | triangles | accessors 前/后 | bufferViews 前/后 | textures | animations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `barracks.glb` | 9 | 9 | 13,546 | 6,900 | 36 -> 27 | 36 -> 10 | 0 | 0 |
| `farm.glb` | 7 | 7 | 6,142 | 4,162 | 28 -> 21 | 28 -> 8 | 0 | 0 |

产品判断：

- 外观复杂度没有被砍掉，RTS 镜头下的建筑轮廓应该保持一致。
- `weld` 没有进一步改变体积，说明这批 GLB 的主要冗余是未引用数据，不是大量重复顶点。
- `dedup` 没有进一步减少体积，说明当前两个文件内部没有明显可复用 accessor / texture。
- 因为没有 textures / images，纹理压缩仍然不是这一切片的第一优先级。

## 3. 工具和命令

工具：

```text
@gltf-transform/cli 4.3.0
```

注意：第一次并发 `npx` 会把 npm 临时目录打坏，出现 `language-tags` 缺包和 `ENOTEMPTY` 清理失败。最终改用独立临时 cache 单进程执行：

```bash
npm_config_cache=/tmp/war3-re-gltf-npm-cache npx --yes @gltf-transform/cli@4.3.0 ...
```

优化流程：

```text
prune original -> work/*.01-prune.glb
dedup *.01-prune.glb -> work/*.02-dedup.glb
weld *.02-dedup.glb -> work/*.03-weld.glb
prune *.03-weld.glb -> final/*.glb
```

没有使用：

- Draco
- Meshopt
- KTX2 / BasisU
- WebP / AVIF

原因：这些路线需要额外 loader decoder 或贴图链路支持，本次目标是低风险结构精简，不改变运行时加载合同。

## 4. 验证结果

### 4.1 GLB validator

```bash
npm_config_cache=/tmp/war3-re-gltf-npm-cache npx --yes @gltf-transform/cli@4.3.0 validate artifacts/asset-intake/optimized/quaternius-a1-pass-001/final/barracks.glb
npm_config_cache=/tmp/war3-re-gltf-npm-cache npx --yes @gltf-transform/cli@4.3.0 validate artifacts/asset-intake/optimized/quaternius-a1-pass-001/final/farm.glb
```

结果：

```text
barracks: no errors, no warnings, no infos, no hints
farm:     no errors, no warnings, no infos, no hints
```

### 4.2 构建

```bash
npm run build
```

结果：

```text
passed
```

仍有 Vite 大 chunk warning，不是本次优化新增问题。

### 4.3 Typecheck

```bash
npx tsc --noEmit -p tsconfig.app.json
```

当前结果：

```text
blocked by unrelated WIP
src/game/Game.ts(2050,12): error TS2339: Property 'checkHeroLevelUp' does not exist on type 'Game'.
```

这个错误来自当前工作树里英雄升级相关 WIP，不是本次素材优化引入；本次没有修改 `src/game/Game.ts`。

### 4.4 素材安全回归

```bash
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts tests/v3-asset-fallback-catalog-proof.spec.ts --reporter=list
```

结果：

```text
11 passed
0 failed
duration: 2.1m
```

关键观察：

- `barracks` 仍能创建 9 个 mesh。
- `farm` 仍能创建 7 个 mesh。
- Tree line 仍走程序 fallback。
- Worker / Footman 仍走项目内 proxy / fallback。
- 无远程外链导入。
- 无严重 console error。

### 4.5 建造路径烟测

```bash
./scripts/run-runtime-tests.sh tests/construction-lifecycle-regression.spec.ts --reporter=list --grep "stopping an active builder leaves construction resumable"
```

结果：

```text
1 passed
duration: 37.8s
```

这条覆盖了优化后的 `farm.glb` 在建造中断 / 恢复路径里的基本 runtime 稳定性。

## 5. 当前运行素材清单

| runtime key | 文件 | SHA-256 | 状态 |
| --- | --- | --- | --- |
| `townhall` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/town-center.glb` | `fa7d33ff72092a96073b659eba5562ed1eadf5b60a8092d1321769b34e9177a5` | import trial |
| `barracks` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/barracks.glb` | `1b6607319c7166daec71e60c0473cd85afa4df96a1d4cd4624d6ca7ab36e7de6` | import trial, optimized |
| `farm` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/farm.glb` | `9ba5dfacf8e469b002e41a60e746fb7d5de64feb46903fb674a8e8174fa2a6bd` | import trial, optimized |
| `goldmine` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/mine.glb` | `cfbabb663904483aa9704b7ea63e053a58dbe882abbc2935e65f5a0425b21752` | import trial |
| `goldmine_accent` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/resource-gold.glb` | `a580525d732887e89ab7d538cefd6ce59c2d1657e5fea9f6b3839a484194faa7` | visual-only composition |
| `tower` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/watch-tower.glb` | `d70f8855cb45003b4f78a093a23eab61717f9246fdcdeca281bf6b341edb442a` | import trial |

## 6. 剩余问题

这次优化让第一切片更轻，但还没到最终预算：

| 指标 | 当前 | 目标 | 状态 |
| --- | ---: | ---: | --- |
| 五建筑总大小 | 886.1 KB | <= 750 KB | 未达成 |
| 总 primitives | 28 | <= 20 | 未达成 |
| 总 materials | 28 | <= 20 | 未达成 |
| 总 vertices | 29,054 | <= 22,000 | 未达成 |
| Barracks 大小 | 365.5 KB | <= 320 KB | 未达成 |
| Farm 大小 | 174.3 KB | <= 160 KB | 接近但未达成 |

下一轮如果继续做性能，需要进入更有风险的路线：

- 材质 / primitive 合并。
- 减面或 LOD。
- Meshopt / Draco 压缩加 loader decoder。
- 或重做更轻的原创模型。

## 7. 下一步

建议不要继续扩大导入面，先补两个产品 proof：

1. Tree line worker 遮挡 / 采木 proof。
2. Resource Gold accent + Goldmine 组合渲染 proof。`done: docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.zh-CN.md`

如果这两个 proof 不过，第一切片即使性能更好，也还不能称为公开分享素材落地完成。
