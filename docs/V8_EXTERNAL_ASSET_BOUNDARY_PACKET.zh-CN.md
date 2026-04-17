# V8 External Asset Boundary Packet

> 用途：判断 V8 外部试玩候选是否把未授权素材、来源不明素材或官方素材暴露给 tester。  
> 当前结论：`engineering-ready for V8-ASSET1 review`。本包可以作为关闭 `V8-ASSET1` 的工程证据输入，但最终仍要同步到 V8 gate / evidence ledger。

## 1. 本次盘点范围

盘点对象：

- `public/` 和 `src/` 下实际会被网页加载或渲染的图片、模型、音频、视频资源。
- `src/game/AssetCatalog.ts` 中列出的 runtime asset key。
- 现有资产批准文档：`docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md`、`docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`、`docs/HUMAN_ASSET_PREP_PACKET.zh-CN.md`。

不把下面内容当成批准素材：

- 聊天记录。
- 候选池 URL。
- README 或设计文档里的未来计划。
- GLM closeout 中未被 Codex 接受的素材说法。

## 2. 当前仓库实际二进制素材

当前 `public/` / `src/` 下实际发现的图片、模型、音频、视频资源：

| 文件 | 当前用途 | V8 结论 |
| --- | --- | --- |
| `public/assets/models/buildings/townhall.glb` | Town Hall 项目内 proxy / fallback 路线。 | 可保留为当前内部 proxy；不得宣称最终 Town Hall 美术或第三方 approved asset。 |
| `public/assets/models/units/worker.glb` | worker 项目内 proxy；运行时当前 worker 仍强制使用增强版 RTS proxy。 | 可保留为当前内部 proxy；不得宣称最终 worker 美术或外部 approved asset。 |

没有发现：

- `.png` / `.jpg` / `.jpeg` / `.gif` / `.svg` / `.webp` 图片素材。
- `.mp3` / `.wav` / `.ogg` 音频素材。
- 其他 `.glb` / `.gltf` 模型文件。

## 3. Runtime asset catalog 结论

`src/game/AssetCatalog.ts` 中有多项预留路径，例如 `footman.glb`、`rifleman.glb`、`barracks.glb`、`farm.glb`、`tower.glb`、`goldmine.glb`、`pine_tree.glb`。

这些预留路径不等于真实素材已批准或已落库。

当前实际运行边界是：

- 找不到 glTF 时走 `BuildingVisualFactory` / `UnitVisualFactory` 的程序化 fallback。
- `worker` 当前强制使用增强版 RTS proxy，不依赖 `worker.glb`。
- A1 九类 battlefield key 都绑定到 `asset-handoff-a1-s0-fallback-001` 的 S0 fallback / project-proxy route。

## 4. 已批准边界

已批准进入当前 V8 外部可见候选的只有：

| 类别 | 批准形式 | 控制文档 |
| --- | --- | --- |
| A1 战场对象 | `S0 fallback / project-proxy` | `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md` |
| H1 / V7 人族内容外观 | `S0 fallback / project-proxy` | `docs/HUMAN_ASSET_PREP_PACKET.zh-CN.md` |
| 页面壳层视觉 | CSS / 项目自制 fallback | `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md` |

未批准进入当前 V8 外部可见候选的包括：

- 官方 Warcraft / Blizzard 模型、贴图、图标、截图、音频、拆包资源。
- fan remake、私服资源包、来源不明网盘包。
- 只有候选池 URL、没有逐项许可证和 file plan 的第三方素材。
- 未经批准的 AI 生成素材。
- 任何会让 tester 误以为已经接入最终美术的素材。

## 5. 对 README / 入口页的约束

外部页面和 README 只能说：

```text
当前使用 proxy / fallback / procedural 资产。
当前目标是可读性和合法边界，不代表最终资产品质。
```

不能说：

```text
使用官方素材。
接入了完整 Warcraft-like art pack。
当前视觉已是最终质量。
真实第三方素材已经批准导入。
```

## 6. V8-ASSET1 当前结论

```text
V8-ASSET1 can be moved to engineering-pass after this packet is linked from the V8 evidence ledger.
No unauthorized official asset, ripped asset, fan remake asset, unknown-source web image, or unapproved external audio/image/model was found in the current public/src asset surface.
Current visible assets remain S0 project/procedural fallback or project proxy.
```

## 7. 后续触发条件

只要发生下面任一情况，`V8-ASSET1` 必须重新打开：

- 新增任何 `.png`、`.jpg`、`.svg`、`.webp`、`.glb`、`.gltf`、`.mp3`、`.wav`、`.ogg` 等外部可见文件。
- README / 入口页开始宣称最终素材、官方素材、完整 art pack 或 approved third-party batch。
- GLM 或 Codex 从候选池导入资源但没有对应 approved-for-import packet。
- tester 反馈指出当前视觉被误解成官方或最终素材。
