# 产品壳层素材 Intake Matrix

> 用途：把 `A2` 页面壳层素材包从“找一些菜单素材”改成可筛选、可拒绝、可交接的 intake 矩阵。

## 0. 当前里程碑口径

本文对应 `C70 / C62`：把 product-shell sourcing brief 落成可执行 intake matrix，并成为 title / menu / loading / pause / results / settings / help 第一批素材的真实 approval surface。

当前真实里程碑不是商业发布视觉完成，也不是完整 War3-like identity，而是：

```text
V2 credible page-product vertical slice
```

所以本文只服务一个目标：

```text
让 title / menu / loading / pause / results / settings / help 这些产品壳层 surface
可以合法、可回退、可验证地进入第一批页面版产品候选包。
```

批准条件必须同时满足：

```text
合法来源 + 不误导当前 V2 page-product slice + 不遮挡核心操作 + 有 deterministic fallback + 可交给 GLM 做机械导入验证
```

本文不创建素材、不导入素材、不要求 GLM 判断美术方向，也不为了素材扩大 runtime、gameplay、AI、经济、路径或胜负系统所有权。

## 1. 适用范围

本文只覆盖产品壳层和会话壳层第一批素材：

- `front door / main menu background`
- `logo / wordmark / title treatment`
- `mode select tiles / cards`
- `loading / briefing illustration`
- `pause shell visuals`
- `results shell visuals`
- `settings/help iconography and panel assets`
- `shared UI chrome / frame / button / panel materials`
- `cursor / pointer / emphasis cues`

不覆盖：

- 局内 worker、footman、建筑、树线、地形等战场素材。
- gameplay 规则、AI、经济、路径、战斗、建造或胜负逻辑。
- 外部宣传海报、README 截图、社媒图。
- 音频、BGM、语音、UI SFX。
- 完整品牌系统或商业发行级视觉 identity。

核心原则：

```text
产品壳层素材必须让玩家更快理解“这是什么、从哪里开始、现在处于哪个状态、下一步能做什么”。
装饰性素材不能遮挡入口、CTA、状态、设置、帮助或结果判断。
```

## 2. 来源等级

| 等级 | 名称 | 可进入仓库 | 使用边界 | 必填证据 |
| --- | --- | --- | --- | --- |
| `S0` | 项目自制 / 程序化 proxy | 可以 | 首选 fallback；可用 CSS、canvas、简单图形、手写 wordmark、通用 icon。 | 作者、生成方式、用途、文件清单。 |
| `S1` | CC0 / Public Domain | 可以 | 首选外部素材；适合背景、纹理、通用图标、装饰件。 | 来源 URL、许可证页、原始文件名、下载时间。 |
| `S2` | 允许商用和再分发的署名许可 | 可以，但必须署名 | 例如允许 repo/demo 分发的 CC-BY、MIT-like icon set；署名必须随记录保存。 | 来源 URL、许可证文本、署名要求、修改说明。 |
| `S3` | 付费或商业素材包 | 条件允许 | 仅当许可证明确允许网页 demo、repo、构建产物和截图传播；不能只凭购买记录入库。 | 许可证文本、购买/授权记录、分发限制摘要。 |
| `S4` | 参考图 / 风格参考 | 不可以 | 只能用于理解菜单层级、信息密度、氛围、构图；不得复制、描摹或转成 repo 资产。 | 来源 URL、参考用途、不能入库标记。 |
| `S5` | 禁止来源 | 不可以 | ripped game UI、官方 Warcraft III logo/UI/纹理、未授权 fan remake、来源不明包、带水印素材、禁止商用或禁止再分发素材。 | 记录拒绝原因即可。 |
| `S6` | AI 生成候选 | 条件允许 | 不得使用受保护 IP 名称、官方 logo、角色名、截图、特定画师风格或现有游戏 UI 作输入；仍需记录工具条款和生成过程。 | prompt 摘要、工具/模型、使用条款、人工修改记录。 |

最低规则：

- `S4/S5` 不得进入 `public/`、`src/`、构建产物或测试 fixture。
- 缺少来源、许可证、署名或授权记录的候选只能是 `blocked`。
- “War3-like”只能用于会话结构、暗示性氛围和 RTS 入口理解，不能复制官方品牌、logo、UI frame、按钮、纹理或图标。
- 任何素材不得暗示当前产品已经支持未实现的战役、多人天梯、四族完整阵营、英雄系统或官方授权。
- 付费素材必须确认许可证允许 repo 内分发、网页 demo 加载、构建产物传播和截图传播；只允许“个人本地使用”的素材不能进仓库。
- AI 生成素材必须能证明没有使用官方截图、官方 logo、受保护角色、特定画师风格或未授权素材作输入；无法证明时按 `S4/S5` 处理。
- 许可证条款、署名要求、修改说明和拒绝原因必须随 candidate 记录保存；不能由 GLM 在导入阶段补判。

### 2.1 硬拒绝来源

以下来源不进入候选包，不交给 GLM，不做“先导入再清理”：

| 来源 | 拒绝原因 |
| --- | --- |
| 官方 Warcraft III / Blizzard logo、字体、UI frame、按钮、贴图、截图、拆包素材 | 未授权 IP 资产，且会误导为官方或 remake。 |
| ripped game UI、未授权 fan remake、私服资源包、来源不明网盘包 | 来源和权利链不可追溯。 |
| 带水印、禁止商用、禁止修改、禁止再分发、只限个人本地使用素材 | 与网页 demo、repo、构建产物或截图传播冲突。 |
| 只有购买截图但没有许可证文本的商业包 | 无法证明 repo/demo 分发边界。 |
| AI 生成但输入包含官方截图、官方 logo、受保护角色名、特定画师风格、现有游戏 UI 或未授权参考图 | 无法建立干净来源。 |
| 高相似 Warcraft 字标、阵营徽章、按钮样式、边框纹理或菜单构图 | 即使文件可用，也会制造 IP / 官方授权误导。 |
| 暗示当前产品已有完整战役、四族、英雄、多人天梯、完整模式选择或官方授权的素材 | 超出当前 V2 page-product slice 的产品承诺。 |
| 合法但遮挡 CTA、破坏状态识别、压住文案或让 pause/results/menu 语义混乱的强风格素材 | 不适合作为第一批 shell approval 资产。 |

## 3. Tone / Style 约束

产品壳层素材必须支持“可信页面版 RTS slice”，而不是做成营销 landing、官方 remake 伪装或素材拼贴。

### 3.1 必须保留的语气

- 战术、克制、可操作：玩家第一眼应该知道自己能开始、暂停、返回、重开、查看结果或打开设置/帮助。
- War3-like 只能体现在 RTS 会话感、地图/战场暗示、基地轮廓、纸面战术感和中世纪奇幻的泛化氛围。
- 页面壳层应比局内更安静，优先服务入口、状态和文案，而不是抢战场演出。
- 当前 `V2` 只承诺可信页面版 vertical slice；素材不能把产品说成完整战役、完整四族、完整英雄系统或多人平台。

### 3.2 禁止的风格误导

- 不使用官方 Warcraft III logo、字体仿制、阵营徽章、UI frame、按钮、纹理、截图或高相似复刻。
- 不使用“已完成商业游戏主菜单”的语气包装当前 slice。
- 不把 settings/help 做成缺少文字说明的纯图标谜题。
- 不让 pause/results 看起来像局内 HUD 的普通浮层，必须明确表达会话状态已经切换。
- 不使用过度高噪声、低对比、强装饰边框或复杂背景压住 CTA、版本状态、错误、结果摘要和帮助文本。

### 3.3 与当前 V2 的关系

第一批壳层素材只需要支持：

- 有前门。
- 能开始当前可信地图/模式入口。
- 能从 loading / briefing 进入局内。
- 能暂停、返回、重开。
- 能显示胜负和摘要。
- 能打开设置和帮助，并诚实说明当前已实现 / 未实现边界。

超出上述范围的视觉承诺一律降级、隐藏或拒绝。

## 4. Intake 状态

| 状态 | 含义 | 下一步 |
| --- | --- | --- |
| `reference-only` | 只能看，不能用。 | Codex 提炼壳层需求；不得交给 GLM 导入。 |
| `candidate` | 来源可能合法，正在筛。 | 补齐许可证、预览图、用途、fallback 和 surface fit。 |
| `approved-for-intake` | Codex 认可来源和用途，可以进入候选包。 | 做页面可用性和状态匹配评估。 |
| `approved-for-import` | 来源、用途、fallback、可用性 gate 都过线。 | GLM 可以接 asset catalog、fallback、导入验证。 |
| `integrated` | 已接入仓库并能加载。 | 继续等待页面状态 proof 和人眼确认。 |
| `human-approved` | 用户或目标玩家确认页面可理解、可操作、不误导。 | 才能作为产品壳层视觉成功引用。 |
| `rejected` | 来源、许可、风格、可用性或产品承诺失败。 | 不导入；保留拒绝原因。 |

## 5. 产品壳层可用性 Gate

| Gate | 判定问题 | 通过标准 | 失败处理 |
| --- | --- | --- | --- |
| `U0` 来源 gate | 能不能合法使用、分发、截图传播？ | 来源、许可证、署名、限制都清楚。 | 停止 intake；降级为 `reference-only` 或 `rejected`。 |
| `U1` 入口理解 gate | 首屏是否说明“这是一个可开始的页面 RTS 产品”？ | 玩家 5 秒内能找到开始入口、模式入口、设置或版本状态。 | 换背景、降噪、重排视觉权重或 fallback。 |
| `U2` CTA 可见 gate | 主按钮和可交互入口是否被素材抢走？ | `开始`、`继续`、`返回`、`再来一局` 等操作比装饰更显眼。 | 素材降级为背景层、裁切、压暗或拒绝。 |
| `U3` 状态匹配 gate | 素材是否符合当前页面状态？ | menu、loading、pause、results、settings/help 的视觉语义不混。 | 改用途或拒绝；不能一张图强行通用全部状态。 |
| `U4` 文案共存 gate | 标题、说明、版本、错误、结果文字是否可读？ | 中文/英文混排、长文本、按钮标签在桌面和移动宽度都不被压住。 | 降低纹理复杂度、换对比、改成 proxy 面板。 |
| `U5` 响应式裁切 gate | 素材在宽屏、普通桌面、移动视口是否仍成立？ | 关键视觉不依赖某一个裁切点；不遮挡可操作区。 | 需要安全裁切区；没有则拒绝或只用于固定局部。 |
| `U6` 对比与可访问 gate | 控件、焦点、禁用态、错误态是否清楚？ | 文本/按钮/焦点 ring 有足够对比；色彩不是唯一状态来源。 | 调色、加边框/底板/图标，或 fallback。 |
| `U7` 交互 affordance gate | 玩家能不能判断哪里可点、哪里只是装饰？ | hover、focus、pressed、disabled、selected 等状态有稳定视觉。 | 不允许只靠装饰图；需要 UI chrome 或 CSS fallback。 |
| `U8` 壳层一致 gate | 各页面是否属于同一个产品，而不是素材拼贴？ | 背景、面板、按钮、tile、icon 语言能共存。 | 限制使用范围、重建 shared chrome 或拒绝。 |
| `U9` 产品承诺 gate | 素材是否暗示未实现能力或官方授权？ | 不出现官方 logo、战役承诺、多人天梯暗示、未实现阵营入口。 | 删除、替换或拒绝。 |
| `U10` 加载与错误 gate | loading、fallback、缺图时是否仍能理解当前状态？ | 素材缺失时页面仍有标题、状态、下一步和错误恢复路径。 | 必须接 deterministic fallback；否则不交给 GLM。 |

Gate 结论必须写成：

```text
pass / pass-with-tuning / blocked / rejected
```

不能写成“后面再润色”“上线前再换”“GLM 接进去看看”。

## 6. 产品壳层素材 Intake 矩阵

| 类别 | 产品职责 | 首选来源等级 | 最低候选形态 | 可用性 gate | 无批准真资产时的 fallback |
| --- | --- | --- | --- | --- | --- |
| `front door / main menu background` | 建立入口氛围，并让玩家知道可开始。 | `S0/S1/S2/S3` | RTS 战场、地图、城镇、旗帜、纸质地图或抽象可控背景；必须有安全留白。 | 不遮挡开始、模式、设置、版本状态；不能像普通 landing hero 或纯壁纸。 | 使用程序化背景：低噪声地形/地图纹理、暗化 vignette、固定安全区；CTA 区域保持清晰。 |
| `logo / wordmark / title treatment` | 定义产品名和入口身份。 | `S0/S1/S2` | 自制字标、排版处理、简单徽记；不得接近官方 Warcraft 字体、logo 或阵营徽章。 | 标题在移动和桌面都可读；不抢主 CTA；不暗示官方授权。 | 使用纯文字 wordmark：稳定字体、描边/底板、版本标签分离；优先清楚，不追求复杂装饰。 |
| `mode select tiles / cards` | 帮玩家理解可选开始方式。 | `S0/S1/S2` | 快速开始、skirmish、自定义/沙盒等 tile 的图标、缩略图或面板材料。 | 已实现与未实现状态分明；selected/disabled/hover 不跳版；tile 不承诺不存在的内容。 | 使用 CSS tile + 文本标签 + 简单 line icon；未实现项明确 disabled 或 hidden。 |
| `loading / briefing illustration` | 从菜单世界过渡到对局世界，说明地图、目标、控制提示。 | `S0/S1/S2/S3` | 地图片段、战术简图、基地剪影、任务插图或 briefing 面板背景。 | loading 文案、地图名、目标和提示清楚；不假装有战役剧情或官方任务。 | 使用 map-silhouette proxy、进度/状态文字、简化 briefing panel；缺图不阻塞进局。 |
| `pause shell visuals` | 表示会话已暂停，并保留控制权。 | `S0/S1/S2` | 半透明遮罩、系统菜单面板、暂停标记、选项分隔材料。 | 继续、重开、返回菜单、设置入口最清楚；战场背景不能让玩家误以为仍在实时运行。 | 使用 deterministic overlay：暗化背景、清晰面板、固定按钮顺序、焦点态。 |
| `results shell visuals` | 让胜负和收口动作明确。 | `S0/S1/S2/S3` | victory/defeat banner、摘要分隔、结果面板、徽章或战报插图。 | 胜负结果第一眼明确；再来一局、返回菜单、摘要不被装饰压住。 | 使用 typographic result banner + 统计表面板 + 两个主操作按钮；不依赖插图。 |
| `settings/help iconography and panel assets` | 支撑设置、控制说明、帮助阅读。 | `S0/S1/S2` | 音量、画面、控制、热键、帮助、返回等通用 icon 和 panel 材料。 | 图标含义不靠猜；文字说明可读；键鼠提示和当前实现边界清楚。 | 使用通用线性图标或文本标签；图标缺失时不得隐藏功能。 |
| `shared UI chrome / frame / button / panel materials` | 统一按钮、面板、边框、分隔、禁用态、焦点态。 | `S0/S1/S2` | 可复用面板边框、button states、frame texture、divider、surface tokens。 | 各页面看起来属于同一产品；控件状态稳定；不会把整页变成卡片堆叠。 | 使用 CSS token chrome：面板底色、细边框、固定半径、清楚 hover/focus/disabled。 |
| `cursor / pointer / emphasis cues` | 强化指向、hover、focus、选中、重要提示。 | `S0/S1/S2` | 自定义 cursor、pointer、arrow、spark、pulse、focus ring、emphasis underline。 | 不妨碍浏览器基本可用性；键盘 focus 明确；强调不误导成可点击。 | 使用浏览器默认 cursor + CSS focus outline + 简单强调线；必要时只做局部 pointer cue。 |

## 7. 每类候选必须提交什么

每个 candidate 至少要有一条记录：

| 字段 | 要求 |
| --- | --- |
| `candidate_id` | 稳定 ID，例如 `shell-menu-bg-s1-001`。 |
| `category` | 必须属于本文九类之一。 |
| `surface` | 具体页面或状态：main-menu、mode-select、loading、pause、results、settings、help、shared。 |
| `source_class` | `S0-S6` 中的一类。 |
| `source_url_or_path` | 外部 URL 或本地生成路径。 |
| `license_summary` | 许可证、署名、截图/构建产物/再分发限制摘要。 |
| `runtime_use` | 用作正式素材、proxy、fallback、参考，四选一。 |
| `usability_notes` | 对 `U1-U10` 的简短判断。 |
| `responsive_safe_area` | 关键视觉和可裁切区域说明；没有则写 `none` 并说明限制。 |
| `copy_collision_risk` | 是否会压住标题、按钮、说明、错误或结果摘要。 |
| `unsupported_promise_risk` | 是否暗示未实现玩法、官方授权或不存在的模式。 |
| `fallback_id` | 加载失败、裁切失败或可用性失败时使用哪个 fallback。 |
| `status` | `candidate`、`approved-for-import` 等状态。 |
| `owner_decision` | Codex 的批准、拒绝或阻塞说明。 |

没有这些字段，不允许进入 GLM handoff。

## 8. Fallback 规则

### 8.0 没有 approved batch 时怎么办

如果 `A2` 没有任何 `approved-for-import` 素材，产品壳层仍然必须向前推进，但只能使用 `S0` 程序化 / 自制 fallback：

- 主菜单、模式选择、loading/briefing、pause、results、settings、help 必须先用 CSS token、文字、稳定布局、简单几何、map silhouette 或通用 line icon 成立。
- 不允许为了“先好看一点”导入 `reference-only`、来源不清、许可证不清、官方相似或 AI 来源不明素材。
- 不允许把没有素材写成 GLM 阻塞；GLM 可以接入 fallback manifest 和缺图验证，但不能替 Codex 批准外部来源。
- 没有 approved batch 时，完成定义从“真实素材导入”降级为“每个 shell surface 有 deterministic fallback 且核心操作成立”。

### 8.1 通用规则

- fallback 是产品壳层完成路径，不是临时占位借口。
- fallback 必须 deterministic：同一 surface、同一缺失原因，每次落到同一 proxy。
- 缺图时页面仍必须能完成核心职责：开始、选择模式、读 briefing、暂停、看结果、改设置、读帮助。
- fallback 必须保护文案、CTA、焦点态和错误恢复路径。
- reference-only 素材只能影响构图要求，不能贡献贴图、icon、logo、frame、按钮形态或描摹结果。
- 如果真实素材合法但损害入口理解、状态识别或操作可用性，优先使用 fallback。

### 8.2 何时强制 fallback

| 情况 | 处理 |
| --- | --- |
| 来源或许可证不清 | 不导入；使用 `S0` proxy。 |
| 背景压住主 CTA 或版本状态 | 降噪、裁切、暗化；仍失败则 fallback。 |
| logo/wordmark 接近官方 IP | 直接拒绝；使用自制文字处理。 |
| tile/card 暗示未实现模式 | 改文案和状态；不能修正则 fallback 或隐藏。 |
| loading 插图暗示不存在战役剧情 | 降级为 map/briefing proxy。 |
| pause overlay 让玩家误以为仍在实时操作 | 使用明确暂停遮罩和系统菜单 proxy。 |
| results 图压住胜负和主操作 | 使用 typographic result proxy。 |
| icon 语义不清 | 用文字标签或通用 line icon fallback。 |
| shared chrome 造成页面拼贴感或控件状态不稳 | 回退到 CSS token chrome。 |
| 自定义 cursor 影响可访问性或基本点击 | 使用浏览器默认 cursor 和 CSS focus cue。 |

### 8.3 Fallback 的最低形态

| 类别 | fallback 最低要求 |
| --- | --- |
| `front door / main menu background` | 低噪声背景、安全留白、CTA 清晰。 |
| `logo / wordmark / title treatment` | 可读文字标题、版本标签独立、不侵权。 |
| `mode select tiles / cards` | 文本 tile、明确 enabled/disabled/selected/hover。 |
| `loading / briefing illustration` | map silhouette、目标文字、控制提示、进入状态。 |
| `pause shell visuals` | 暗化 overlay、系统面板、继续/重开/返回/设置按钮。 |
| `results shell visuals` | 胜负标题、摘要区域、再来一局、返回菜单。 |
| `settings/help iconography and panel assets` | 文本标签优先，图标只是辅助。 |
| `shared UI chrome / frame / button / panel materials` | CSS 面板、按钮、边框、焦点、禁用态。 |
| `cursor / pointer / emphasis cues` | 默认 cursor、可见 focus outline、稳定 hover cue。 |

## 9. Codex / GLM 交接边界

### 9.1 Codex 批准前负责

Codex owns：

- 定义每个 shell surface 的素材缺口和优先级。
- 判定来源等级、许可风险、署名要求和是否可入库。
- 判断候选是否适合 main menu、mode select、loading、pause、results、settings/help 或 shared chrome。
- 维护 candidate、fallback、拒绝原因和 unsupported promise 风险。
- 做入口理解、CTA 可见、状态匹配、文案共存、响应式裁切和可访问性初筛。
- 决定 `approved-for-import` 列表。

Codex 的 approval packet 至少包含：

- `approved-for-import` candidate 列表。
- 每个 candidate 的 category、surface、source_class、license_summary、runtime_use、fallback_id。
- 对 `U0-U10` 的结论和必要 tuning notes。
- 哪些素材只允许 `reference-only`，以及拒绝原因。
- 哪些判断仍需要 human-approved usability。

Codex 不把下面事项交给 GLM 代判：

- “这个来源是否合法”。
- “这个素材是否适合作为产品前门”。
- “这个 tile 是否承诺了未实现模式”。
- “这个背景是否能遮住按钮也无所谓”。
- “这个 logo 是否太接近官方 Warcraft identity”。

### 9.2 GLM 批准后可以做

GLM 只能在 `approved-for-import` 之后接手：

- 复制或整理已批准文件到约定 asset 目录。
- 写入 shell asset manifest / catalog。
- 接入 deterministic fallback。
- 补 attribution / license ledger 的机械字段。
- 写缺失资源、加载失败、fallback 切换的导入验证。
- 证明素材缺失时 shell 仍能进入、暂停、返回、显示结果或打开设置/帮助。

GLM closeout 必须说明：

```text
导入了哪些 approved candidate；
每个 candidate 属于哪个 surface；
每个 candidate 的 fallback 是什么；
跑了哪些 import / shell verification；
哪些仍需要 human-approved usability。
```

### 9.3 GLM 不允许做

- 不允许新增未批准外部素材。
- 不允许把 `reference-only` 素材放进仓库。
- 不允许根据导入方便程度替换 surface 目标。
- 不允许把“图片能加载”写成“产品壳层通过”。
- 不允许为了某个素材改 gameplay、AI、经济、路径、胜负或 runtime tests。
- 不允许把许可证不清的素材先接入再等以后清理。
- 不允许把未实现页面、模式或产品承诺藏进视觉素材。

## 10. 第一批 intake 顺序

| 优先级 | 类别 | 原因 |
| --- | --- | --- |
| `P0` | `shared UI chrome / frame / button / panel materials`、`front door / main menu background`、`logo / wordmark / title treatment` | 先建立产品前门、主操作和统一控件语言。 |
| `P1` | `mode select tiles / cards`、`loading / briefing illustration`、`pause shell visuals`、`results shell visuals` | 让开始、进入对局、中断、收口四个会话节点成立。 |
| `P2` | `settings/help iconography and panel assets`、`cursor / pointer / emphasis cues` | 支撑理解和可访问性，但不能先于主路径。 |

执行顺序：

1. 先为 `P0` 每类建立至少一个 `S0` fallback。
2. 再筛 `P0` 真实候选，确保来源和 CTA 可见 gate 通过。
3. 补 `P1` 候选，逐个绑定具体 surface 和 fallback。
4. 补 `P2` 候选，优先通用 icon 和 focus/emphasis cue。
5. Codex 写出 `approved-for-import` 清单。
6. GLM 才做 shell manifest、fallback wiring、缺图验证。

## 11. 完成定义

本矩阵下，一个产品壳层素材候选包只有满足以下条件，才算可以交给 GLM：

- 九类范围没有遗漏，或者明确标记为 deferred。
- 每个非 deferred 类别至少有一个 `S0` fallback。
- 每个 `approved-for-import` 素材都有来源、许可证、surface、用途、fallback、responsive safe area 和 usability notes。
- `S4/S5` 没有任何文件进入仓库路径。
- 硬拒绝来源没有进入 candidate 包或 repo。
- 主菜单、模式选择、loading/briefing、pause、results、settings/help 的核心操作不依赖外部图片才可用。
- 没有候选素材暗示官方授权、未实现模式、未实现战役、多人天梯或不存在的功能。
- Codex 已写明哪些页面判断仍需要 human-approved usability。
- 交接不要求 GLM 做 licensing、sourcing、产品承诺或视觉方向判断。

一句话：

```text
Codex 决定哪些壳层素材可以代表产品 surface；
GLM 只把批准候选安全、可回退、可验证地接进 shell；
最终产品壳层是否可理解、可操作、不误导，仍需要人眼确认。
```
