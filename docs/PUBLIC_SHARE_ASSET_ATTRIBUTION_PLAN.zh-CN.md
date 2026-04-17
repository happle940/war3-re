# 公开分享素材署名与 Notice 方案

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 用途：在任何第三方或 AI 素材进入公开版前，先定义玩家、审查者、合作者能看到的来源说明。
> 边界：这不是法律意见；它是当前项目的工程和产品执行方案。

## 0. 当前结论

```text
public/assets/THIRD_PARTY_NOTICES.md: established and updated for Quaternius runtime import trial
in-game credits/help entry: required before CC-BY icon import
AI generated asset label trail: required before AI runtime/marketing use
final approved-for-import: none
approved-for-import-trial: Quaternius A1 five-building slice
```

即使 Quaternius、Kenney、KayKit 当前候选多为 CC0 / public domain 路线，不强制署名，公开分享版也建议统一建立 notice。原因不是“许可证一定要求”，而是产品上要让后续合作者和玩家知道素材从哪里来、哪些是候选、哪些是最终原创。

## 1. 最小落地面

第一版先做三个面：

| 位置 | 文件 / 产品入口 | 用途 |
| --- | --- | --- |
| 仓库 notice | `public/assets/THIRD_PARTY_NOTICES.md` | 玩家下载或查看项目时能看到素材来源、许可证、使用范围。 |
| 文档台账 | `docs/PUBLIC_SHARE_ASSET_CANDIDATE_LEDGER.zh-CN.md` | 开发和审查时追踪候选状态，避免 URL 变成批准导入。 |
| 游戏内入口 | Help / Credits 页面，后续接入 | 如果用了 CC-BY 图标或明显第三方视觉，玩家在游戏内也能看到来源。 |

Quaternius A1 五建筑切片已经作为 runtime import trial 进入 `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/`。`public/assets/THIRD_PARTY_NOTICES.md` 已同步更新为 `import-trial-active`，但仍不能宣称最终公开美术已经完成。

## 2. 各来源署名口径

| 来源 | 当前候选用途 | 许可证 / 条款口径 | Notice 要求 |
| --- | --- | --- | --- |
| Quaternius Ultimate Fantasy RTS | A1 建筑、自然、资源、塔 | 页面标注 CC0，包含 glTF，且说明可个人/商业项目使用。 | 不强制署名，但建议在 notice 中列出来源、包名、下载日期和具体文件。 |
| KayKit Adventurers / Character Animations / Medieval Hexagon | Human 单位、动画、建筑候选 | itch 页面写明 CC0、个人/商业使用、无需署名。 | 不强制署名，但建议列入 notice；不得把未下载成功的包写成已使用。 |
| Kenney assets | tower/tree/terrain 候选 | Kenney support 说明 asset pages 上的 game assets 为 CC0 / public domain，署名非必需，且不要使用 Kenney logo。 | 不强制署名，但建议列入 notice；不得使用 Kenney logo。 |
| Game-icons.net | 命令卡、技能、研究图标候选 | FAQ 说明图标为 CC-BY 或部分 Public Domain；CC-BY 需要 credit。 | 如果使用，必须放进 `THIRD_PARTY_NOTICES.md`，并在游戏内 Help / Credits 可访问。 |
| Meshy / Tripo paid-clean | AI 草稿候选 | 只走 paid-clean route，且必须保存工具、账号计划、prompt、输入来源和人工修改记录。 | 需要 AI 生产记录；对外素材或营销图按 AI 标识策略处理。 |
| Hunyuan3D-2 | 技术研究 | 当前为 lab-only / blocked for public runtime。 | 不进入公开版 notice，除非以后有专门法务审查和批准包。 |

## 3. `THIRD_PARTY_NOTICES.md` 模板

第一次真正导入第三方素材前，创建：

```text
# Third-Party Asset Notices

This project uses original/procedural fallback assets and selected third-party assets listed below.

## Quaternius Ultimate Fantasy RTS

- Source: https://quaternius.com/packs/ultimatefantasyrts.html
- License: CC0 1.0 Universal
- Files used:
  - public/assets/models/vendor/quaternius/ultimate-fantasy-rts/town-center.glb
  - ...
- Import date:
- Local review packet:
  - docs/PUBLIC_SHARE_ASSET_IMPORT_REVIEW_PACKET_A1_001.zh-CN.md
- Notes:
  - Modified scale/pivot/material/team-color markers for this project.

## Game-icons.net

- Source: https://game-icons.net/
- License: CC-BY or Public Domain depending on icon.
- Icons used:
  - icon name, author, URL, license
- In-game credit location:
  - Help / Credits
```

不允许只写“素材来自互联网”或“CC0 assets”。必须写到具体包、具体文件、具体 URL、导入日期和本地批准包。

## 4. AI 素材额外记录

AI 素材不是写一个 notice 就够了。每个 AI 候选还要有：

| 字段 | 说明 |
| --- | --- |
| tool / model / plan | 使用哪个工具、模型版本、账号计划。 |
| prompt_summary | 干净 prompt 摘要，不能包含官方 IP / fan remake / 截图参考。 |
| input_sources | 输入图、草图、参考图来源；没有就写 `text-only`。 |
| human_modification | 人工改了什么：轮廓、材质、队伍色、拓扑、pivot、scale。 |
| public_label | 如果它出现在公开图片、视频、虚拟场景或宣传物里，如何标识 AI 参与。 |
| fallback | 失败或下架时回到哪个 S0 proxy。 |

当前项目建议继续保持：

```text
不提供玩家实时 AI 生成功能。
AI 只做离线素材候选。
AI 输出默认 reference-only，不直接进 public/assets。
```

## 5. 中国内地公开分享边界

素材 notice 不能替代中国内地公开运营需要的其他材料。

如果只是开源代码、内部试玩或非运营性质展示，重点是不要暴露未授权素材、官方 IP、AI 误导性宣传。

如果未来面向中国内地公开运营网络游戏，需要另行准备：

- 游戏著作权或自我声明材料。
- 运营主体、出版单位、ICP 等事项。
- 游戏截图、中文脚本全文、屏蔽词库、未成年人保护相关说明。
- 版本内容和公开宣传口径一致。

如果未来让中国内地公众在游戏内实时生成文本、图片、音频、视频或虚拟场景，还会接近生成式 AI 服务场景，需要单独评估生成式 AI 服务、内容安全、显式 / 隐式标识、日志和用户协议。

## 6. 下一步

在任何 runtime import 前，先完成：

1. 保持 `public/assets/THIRD_PARTY_NOTICES.md` 的 Quaternius 第一切片为 `import-trial-active`，不要改成 final art。
2. 下一步补 GLB 优化 proof，并记录材质、节点、draw call 和测试耗时。
3. 决定 Help / Credits 入口是否在当前版本就露出。
4. 如果 Game-icons.net 进入图标线，先做单图标 author / URL / license 级台账。
5. AI 草稿继续走 `docs/AI_ASSET_GENERATION_POLICY.zh-CN.md` 和 `docs/AI_ASSET_PROMPT_PACK.zh-CN.md`。

## 7. 参考来源

- Quaternius Ultimate Fantasy RTS: https://quaternius.com/packs/ultimatefantasyrts.html
- KayKit Adventurers: https://kaylousberg.itch.io/kaykit-adventurers
- KayKit Character Animations: https://kaylousberg.itch.io/kaykit-character-animations
- KayKit Medieval Hexagon: https://kaylousberg.itch.io/kaykit-medieval-hexagon
- Kenney Support / license FAQ: https://kenney.nl/support
- Game-icons.net FAQ: https://game-icons.net/faq.html
- 生成式人工智能服务管理暂行办法: https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm
- 人工智能生成合成内容标识办法: https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm
- 国家新闻出版署国产网络游戏审批事项: https://www.nppa.gov.cn/bsfw/xksx/cbfxl/wlcbfwspsx/202210/t20221013_600725.html
