# AI 素材生成使用红线

> 日期：2026-04-16  
> 用途：允许 AI 提速素材生产，但防止 AI 输出变成版权、平台条款或中国内地公开传播风险。

## 0. 一句话原则

```text
AI 可以做素材候选，不能直接当版权护身符。
公开分享前，AI 结果必须有干净输入、工具条款、prompt 记录、人工修改和可回退方案。
```

## 1. 允许 AI 做什么

| 用途 | 是否允许 | 条件 |
| --- | --- | --- |
| 概念方向图 | 允许 | 只能做参考，不直接入库。 |
| 低模 3D 初稿 | 允许 | 必须用干净 prompt，导出后人工清理、改造、统一风格。 |
| 图标草稿 | 允许 | 不能使用官方图标、角色名、logo、截图作输入。 |
| UI 背景草稿 | 允许 | 不得模仿 Warcraft / Blizzard 菜单、字体、边框、徽章。 |
| 宣传图草稿 | 允许 | 需要标记 AI 生成记录，不得包装成最终游戏实机画面。 |
| 玩家实时生成内容 | 当前不允许 | 公开版尤其是中国内地公开版会引入额外生成式 AI 服务合规要求。 |

## 2. 直接拒绝的 AI 输入

下面任何一种输入都直接拒绝，不进入候选台账：

- Warcraft、War3、Blizzard、Arthas、Jaina、Footman from Warcraft、Human Alliance、Stormwind 等受保护 IP / 高联想词。
- 官方截图、官方模型、官方图标、官方 logo、官方 UI frame。
- fan remake、私服资源、来源不明网盘图、未授权参考图。
- “in the style of 某在世艺术家 / 某游戏原画师 / 某公司官方美术风格”的提示词。
- 让 AI 复刻已有游戏 UI、单位、建筑、图标、纹理、阵营徽章。
- 使用网上图片但没有来源和授权记录。

允许的 prompt 应该是泛化表达，例如：

```text
low poly medieval human blacksmith building, readable from top-down RTS camera, original fantasy village, chunky silhouette, clear chimney, forge glow, blue team banner, no logos, no text
```

## 3. AI 工具分级

| 工具 / 来源 | 当前分级 | 可用边界 |
| --- | --- | --- |
| Meshy paid plan | `S6-clean candidate` | 付费用户通常可拥有平台生成资产，但必须保证输入不侵权；免费计划是 CC-BY，需要署名。 |
| Tripo paid plan | `S6-clean candidate` | 付费用户条款对输入输出权利更友好；免费用户输出不适合进入公开版素材线。 |
| Hunyuan3D-2 self-host / open model | `lab-only / blocked for public runtime until counsel review` | 条款有地域、分发、MAU、训练限制和 Notice 要求；不作为默认公开素材生产线。 |
| 通用图像生成工具 | `S6-clean candidate` | 只用于候选，必须记录工具、账号计划、条款、prompt、输入来源和人工修改。 |
| 国内素材 / AI 平台 | `case-by-case` | 默认只做参考或营销辅助；进入游戏运行时前必须逐条确认商用、嵌入网页、再分发、截图传播和授权期限。 |

## 4. AI 生成素材入库前必须补齐

每个 AI 候选至少要记录：

| 字段 | 要求 |
| --- | --- |
| `candidate_id` | 稳定 ID，例如 `ai-human-blacksmith-s6-meshy-001`。 |
| `tool` | 工具、模型、版本、账号计划。 |
| `terms_snapshot` | 条款 URL、查看日期、是否付费、是否需要署名。 |
| `prompt_summary` | 清洗后的 prompt 摘要，禁止包含受保护 IP 词。 |
| `input_sources` | 所有参考图、草图、手绘图、已有模型的来源；没有则写 `text-only`。 |
| `human_modification` | Blender / 图像工具里改了什么：比例、轮廓、材质、队伍色、贴图、拓扑、pivot。 |
| `target_runtime_key` | 要服务哪个单位、建筑、图标或壳层 surface。 |
| `public_claim` | 对外只能说什么，不能说什么。 |
| `fallback_id` | AI 素材失败时回到哪个 S0 proxy。 |
| `review_status` | `reference-only`、`candidate`、`approved-for-intake`、`approved-for-import`、`rejected`。 |

没有这些字段，不能进 `public/assets`。

## 5. 人工改造最低标准

AI 输出不能裸用。公开版至少要过这些改造：

- 改轮廓：让单位 / 建筑和现有游戏功能对应，不像已有 IP。
- 改比例：适配 RTS 俯视镜头，不按 AI 默认展示角度。
- 改材质：统一队伍色、明度、边缘对比和低多边形语言。
- 改命名：文件名、mesh 名、材质名不能包含受保护 IP 或工具临时名。
- 改 pivot / scale：适配选择圈、血条、footprint、建造放置。
- 压缩优化：GLB / glTF 走清理、去重、压缩、贴图预算。
- 留记录：prompt、工具、条款、修改记录、fallback、预览图一起进台账。

## 6. 中国内地公开边界

本项目如果只是使用离线 AI 辅助制作素材，重点是素材权利链、游戏出版 / 备案 / 隐私 / 未成年人等公开游戏合规。

如果未来让中国内地公众在游戏里实时输入并生成文本、图片、3D、音频、视频或虚拟场景，就会接近“向境内公众提供生成式人工智能服务”的场景，需要另行评估生成式 AI 服务合规、内容安全、标识、日志、用户协议等要求。

公开传播 AI 生成图片、视频、虚拟场景时，也要预留显式 / 隐式标识和平台声明流程。这个项目当前的公开版建议是：

```text
不提供玩家实时 AI 生成功能；
AI 仅作为离线生产辅助；
所有 AI 参与素材都在素材台账中标记。
```

## 7. 当前批准结论

```text
AI 可以开始做候选草稿。
AI 结果暂时不能直接导入游戏。
Meshy / Tripo 只考虑 paid-clean route。
Hunyuan3D-2 暂不作为公开版默认生产路线。
任何包含 Warcraft / Blizzard / 官方截图 / fan remake 的 AI 输入直接拒绝。
```

## 8. 参考来源

- Meshy commercial use FAQ: https://help.meshy.ai/en/articles/9992001-can-i-use-my-generated-assets-for-commercial-projects
- Tripo terms: https://www.tripo3d.ai/terms
- Hunyuan3D-2 license: https://github.com/Tencent-Hunyuan/Hunyuan3D-2/blob/main/LICENSE
- 生成式人工智能服务管理暂行办法: https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm
- 人工智能生成合成内容标识办法: https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm
