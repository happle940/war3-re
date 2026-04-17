# Human 单位真实模型风格修正 A1-002

> 日期：2026-04-16  
> 状态：`style-pass-active-not-final-art`  
> 目标：在 A1-001 “都能看到真实模型”的基础上，先修掉最违和的观感问题。

## 这次继续改了什么

1. `rifleman` 从现代 SWAT 候选换成 `Adventurer by Quaternius`。
   - 原因：SWAT 在人族中世纪/奇幻阵营里太现代。
   - 新方案：Adventurer 本体 + runtime rifle cue，整体更接近奇幻人族。

2. `mortar_team` 不是孤零零一门炮了。
   - 现在 Cannon 旁边会挂一个缩小的 militia crew model。
   - 目的：俯视镜头下能读成“迫击炮小队”，不是一个纯道具。

3. `footman` / `knight` 增加更明确的非方块职业 cue。
   - shield 之外加了 sword、footman helmet crest。
   - 都是圆柱、圆锥、胶囊这类柔和低模，不再用方块堆主体。

4. 全单位材质做了轻量提亮。
   - 黑色材质不会在树影/绿地上直接吞掉。
   - StandardMaterial 增加极低 emissive，让默认 RTS 镜头下细节更稳。

5. 全局光照略提亮。
   - 增强 ambient / fill / hemisphere light。
   - 不改玩法、不改资源、不改单位碰撞，只让默认画面更清楚。

## 复查后没有保留的候选

这轮也试了 `Monk` 和 `Wizard`：

- `Monk` 俯视读形不稳，看起来不像可控单位。
- `Wizard` 在默认镜头下变成一大团紫色，压过了其他单位。

所以它们没有进入 runtime。`priest` 暂时继续用 Eye Cleric，`sorceress` 暂时继续用 Witch。

## 当前证明

- 截图：`artifacts/asset-intake/preview/real-unit-model-style-pass-a1-002.png`
- 指标：`artifacts/asset-intake/preview/real-unit-model-style-pass-a1-002.json`
- GLB 检查：`artifacts/asset-intake/metadata/poly-pizza-unit-glb-inspection-a1-002-2026-04-16.json`

## 已跑验证

- `npm run build`：pass
- `./scripts/run-runtime-tests.sh tests/real-unit-model-intake-proof.spec.ts --reporter=list`：1/1 pass
- `./scripts/run-runtime-tests.sh tests/real-unit-model-intake-proof.spec.ts tests/unit-visibility-regression.spec.ts --reporter=list`：3/3 pass
- `./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts tests/worker-peasant-readability-proof.spec.ts --reporter=list`：6/6 pass

## 当前还不是最终美术的地方

- `footman` 和 `knight` 仍然是 Warrior 系低模候选，不是最终专属模型。
- `sorceress` 的 Witch 是可读候选，但和 Quaternius 系角色风格仍有差异。
- `mortar_team` 现在是 Cannon + crew runtime composition，最终最好找一个完整小队 GLB。
- 后续还要做 GLB 压缩和首屏加载预算。
