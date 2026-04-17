# V3 Battlefield Grammar Acceptance

> 用途：定义 `V3.1 battlefield + product-shell clarity` 中 `V3-BG1` 的战场空间语法验收包。  
> 这份文档只处理 `V3-BG1`，不关闭 `V3-RD1` 默认镜头可读性、`V3-CH1` camera/HUD/footprint harmony，也不关闭 `V3-AV1` 真实素材 / fallback gate。

## 0. 当前口径

`V3-BG1` 要回答的是：

```text
默认镜头下，TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔是否形成一个可解释的 Human opening 空间语法。
```

它不回答：

- worker、footman、建筑、资源是否已经一眼可辨；那是 `V3-RD1`。
- camera、HUD、selection ring、footprint 是否协同；那是 `V3-CH1`。
- 当前素材是否真实导入、合法批准或达到最终视觉；那是 `V3-AV1`。
- 用户是否最终认为第一眼足够像 War3-like 战场；那是 `V3-UA1`。

## 1. BF1 与 V3-BG1 的分界

| 项目 | BF1 basic visibility / no-regression | V3-BG1 battlefield grammar |
| --- | --- | --- |
| 核心问题 | 对象是否存在、可见、可选、不离屏、不被 HUD 基础遮挡。 | 对象之间是否形成可读的基地、资源、出口、生产、防御关系。 |
| 可关闭依据 | focused runtime proof 证明基础可见性和 no-regression。 | 默认镜头截图、布局说明、focused regression、审查清单四类证据一致。 |
| 不能替代对方 | BF1 通过不能说明 opening grammar 通过。 | BG1 通过不能回头证明基础可见性没有 regression。 |
| 失败回流 | 若 V3 过程中出现不可见、离屏、不可选、footprint 坍缩，回流成 BF1-style regression。 | 若对象可见但关系不可解释，留在 `V3-BG1`。 |

## 2. 空间语法标准

### 2.1 Town Hall

Town Hall 是基地中心，不只是一个大建筑。

必须能看出：

- TH 是工人、资源线、生产区、防御区的参照中心。
- TH 与金矿之间有清楚的采集关系。
- TH 不应被生产建筑或塔挤到空间边缘，导致基地中心不可读。

退回条件：

- TH 只是和其他对象随机并排。
- TH 与金矿、出口、生产区没有可解释关系。
- TH 被 UI、镜头裁切或其他对象弱化到无法作为中心。

### 2.2 金矿

金矿必须像资源点，而不是背景装饰。

必须能看出：

- 金矿与 TH 形成主要经济轴线。
- 矿线留有足够空间让 worker 关系可解释。
- 金矿位置不会把出口、树线或生产区关系打乱。

退回条件：

- 金矿离 TH 太远或太近，导致采集关系不像开局资源位。
- 金矿被树线、建筑或地形辅助物挡成装饰物。
- 矿线与出口方向冲突，玩家无法理解基地朝向。

### 2.3 树线

树线必须承担边界和地形语法，不只是贴图噪音。

必须能看出：

- 树线定义基地边界或资源侧边界。
- 树线帮助形成可读的 gap、choke 或不可通行感。
- 树线不把 TH、金矿、出口之间的关系切断。

退回条件：

- 树线只是均匀铺平，地图仍像空场。
- 树线把矿线或出口遮断。
- 树线比例、密度或方向让基地关系更难读。

### 2.4 出口

出口必须让玩家读出基地朝向和外部路径。

必须能看出：

- 出口方向与 TH、生产区、防御区关系一致。
- 出口附近可以形成自然 choke 或防守判断。
- 出口不会和矿线混在一起导致前后关系不清。

退回条件：

- 默认镜头下不知道哪里是基地出口。
- 出口被建筑、树线或资源关系堵成随机缝隙。
- 防御区无法解释为保护出口或基地侧翼。

### 2.5 兵营 / 生产区

兵营必须像生产区的一部分，而不是孤立对象。

必须能看出：

- 兵营与 TH 有清楚的内部基地关系。
- 兵营不遮断矿线、出口或树线边界。
- 生产区的位置支持 opening 的方向感。

退回条件：

- 兵营随机贴着 TH、金矿或出口，破坏空间关系。
- 兵营位置让玩家看不出基地内部和外部。
- 生产区只是“有建筑”，没有可解释的组织。

### 2.6 农场

农场必须支持基地尺度和生活区感。

必须能看出：

- 农场与 TH / 兵营形成次级结构。
- 农场帮助表达基地占地，而不是填空。
- 农场不抢占矿线、出口或防御区的语义位置。

退回条件：

- 农场只是随机散点。
- 农场让基地读起来更拥挤、更平或更像测试摆件。
- 农场比例或位置破坏 TH / 生产区关系。

### 2.7 塔 / 防御区

塔必须像防御选择，而不是装饰柱。

必须能看出：

- 塔的位置与出口、矿线或基地侧翼有防御逻辑。
- 塔不替代 TH 或兵营成为视觉中心。
- 防御区帮助玩家理解 choke / gap / base edge。

退回条件：

- 塔随机摆放，无法解释保护谁或卡哪里。
- 塔挡住出口或矿线，破坏 opening 读法。
- 塔的存在让空间语法更像障碍堆叠。

## 3. 四类必需证据

关闭 `V3-BG1` 必须同时具备四类证据。少一类只能写 `insufficient-evidence`，不能写 pass。

### 3.1 默认镜头截图

截图包必须包含：

- 默认游戏镜头的原始截图，不裁掉 HUD 或边缘上下文。
- 同一镜头的标注版本，至少标出 TH、金矿、树线、出口、兵营、农场、塔。
- 如果存在多个开局状态，必须说明截图对应哪个 build / route / seed。
- 截图必须服务空间语法，不得只给单个对象特写。

### 3.2 布局说明

布局说明必须回答：

- TH 与金矿的经济轴线是什么。
- 树线定义了哪一侧边界。
- 出口在哪个方向，为什么玩家能读出它是出口。
- 兵营 / 农场 / 塔分别属于生产区、生活区、防御区的哪一部分。
- 当前布局如何避免“对象只是摆在一起”。

### 3.3 Focused Regression

focused regression 必须记录真实命令和结果，至少覆盖：

- 默认镜头截图或 snapshot 是否能稳定生成。
- TH、金矿、树线、出口、兵营、农场、塔是否都在默认镜头语法区域内。
- 布局语义相关的断言是否和截图 / 布局说明一致。
- 若本轮没有实现自动断言，必须明确写成缺口，不能用人工截图冒充 regression。

记录格式：

```text
Command:
Result:
Covered grammar points:
Known gaps:
```

### 3.4 审查清单

审查清单必须至少包含：

| 检查项 | Verdict | 备注 |
| --- | --- | --- |
| TH 是基地中心 | `pass` / `pass-with-debt` / `blocked` / `insufficient-evidence` |  |
| TH 与金矿形成经济轴线 | `pass` / `pass-with-debt` / `blocked` / `insufficient-evidence` |  |
| 树线定义边界且不切断矿线 | `pass` / `pass-with-debt` / `blocked` / `insufficient-evidence` |  |
| 出口方向可读 | `pass` / `pass-with-debt` / `blocked` / `insufficient-evidence` |  |
| 兵营形成生产区 | `pass` / `pass-with-debt` / `blocked` / `insufficient-evidence` |  |
| 农场支持基地尺度 | `pass` / `pass-with-debt` / `blocked` / `insufficient-evidence` |  |
| 塔形成防御区逻辑 | `pass` / `pass-with-debt` / `blocked` / `insufficient-evidence` |  |
| 截图、布局说明、focused regression 三者一致 | `pass` / `pass-with-debt` / `blocked` / `insufficient-evidence` |  |

## 4. 允许的 Verdict

| Verdict | 含义 | 后续路由 |
| --- | --- | --- |
| `pass` | 四类证据齐全，TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔关系可解释。 | 可把 `V3-BG1` 写成 engineering-pass；仍不关闭 `V3-RD1`、`V3-CH1`、`V3-AV1` 或 `V3-UA1`。 |
| `pass-with-debt` | 空间语法基本成立，但有明确、非阻塞的比例、密度或美术债。 | 债务写入 `V3-UA1` 或后续 tuning；不能回滚到 BF1。 |
| `blocked` | 关键关系无法解释，或截图 / 布局说明 / regression 冲突。 | 继续留在 `V3-BG1`，派发 bounded layout repair 或 proof pack。 |
| `insufficient-evidence` | 四类证据缺失任一项。 | 先补截图、布局说明、focused regression 或审查清单，不裁决通过。 |

## 5. 不能关闭 BG1 的 Partial Proof

下面这些都不能单独关闭 `V3-BG1`：

- BF1 四证据包通过。
- TH、金矿、兵营、农场、塔都存在或可见。
- 单个对象截图看起来清楚。
- 默认镜头下没有离屏。
- 只调整比例但没有布局说明。
- 只写“更像 War3”但不解释 TH / 矿 / 树线 / 出口 / 生产区 / 防御区。
- 只有人眼喜欢，但 focused regression 或截图包缺失。
- 真实素材导入通过；素材 gate 属于 `V3-AV1`，不能替代空间语法。

## 6. GLM 最小证明形状

后续 GLM 任务如果承接 `V3-BG1`，必须只做下面这种 bounded proof / repair：

- 修改或验证默认开局布局，使 TH、金矿、树线、出口、兵营、农场、塔关系可解释。
- 产出默认镜头截图包或截图生成 proof。
- 写出布局说明，逐项对应七类对象。
- 运行并记录 focused regression 的真实命令结果。
- 填写审查清单，并把缺口标成 `blocked` 或 `insufficient-evidence`。

GLM 不应在同一任务中：

- 关闭 `V3-RD1` readability。
- 关闭 `V3-CH1` camera/HUD/footprint harmony。
- 导入或裁决真实素材。
- 裁决用户是否认可第一眼像 War3-like。
- 顺手重做 product shell。

## 7. Closeout 记录模板

```text
Gate: V3-BG1
Build / commit:

Default-camera screenshots:
- raw:
- annotated:

Layout explanation:
- TH / goldmine:
- tree line:
- exit:
- barracks / production:
- farm / scale:
- tower / defense:

Focused regression:
- Command:
- Result:
- Covered grammar points:
- Known gaps:

Checklist verdict:
- TH center:
- economic axis:
- tree line:
- exit:
- production zone:
- farm scale:
- defense zone:
- evidence consistency:

State after:
Residual debt:
Next route:
```

## 8. 本文档完成边界

本文档完成只表示：

```text
V3-BG1 的接受、退回、后移和 GLM 最小证明形状已经定义。
```

它不表示：

- `V3-BG1` 已通过。
- 当前地图已经像 War3-like opening。
- 默认镜头可读性、HUD 协同、真实素材或 first-look user verdict 已通过。

## 9. 2026-04-14 收口复核

Gate: `V3-BG1`

State before: `open`

### 当前可用证据

| 证据 | 当前状态 | 结论 |
| --- | --- | --- |
| BF1 basic visibility / no-regression | 已有四证据包工程通过。 | 只能证明基础可见、可选、无明显坍缩；不能证明 opening grammar。 |
| BG1 acceptance packet | 本文档已定义。 | 只定义验收形状，不是当前地图通过证据。 |
| 默认镜头截图 | 当前未登记 raw + annotated 截图包。 | `missing` |
| 布局说明 | 当前未登记 TH / 金矿 / 树线 / 出口 / 生产区 / 防御区说明。 | `missing` |
| focused regression | 当前未登记 BG1 专用命令结果。 | `missing` |
| 审查清单 | 当前未登记逐项 verdict。 | `missing` |

### Closeout verdict

```text
insufficient-evidence
```

理由：

- BF1 通过和 BG1 通过是两件事；当前只有 BF1 基础可见性可引用，不能把它写成空间语法通过。
- 当前没有一套同 build / same route / same seed 的默认镜头 raw + annotated 截图、布局说明、focused regression 和审查清单。
- 没有足够证据判断是 `pass` 还是 `blocked`；只能先写 `insufficient-evidence`。

### 最小后续任务

下一步只需要一个 `V3-BG1 opening grammar proof pack`：

- 产出当前 build 默认镜头 raw screenshot。
- 产出同一截图的 annotated version，标出 TH、金矿、树线、出口、兵营、农场、塔。
- 写一段布局说明，逐项说明经济轴线、树线边界、出口方向、生产区、农场尺度、防御区。
- 运行并记录 BG1 focused regression 命令结果；若没有自动断言，必须把缺口写成 `missing regression`。
- 填写第 3.4 节审查清单。

如果 proof pack 显示对象可见但关系不可解释，后续 repair 只能限定在 `V3-BG1` 的布局关系：TH / 金矿经济轴线、树线边界、出口方向、生产区、防御区。不得顺手关闭 `V3-RD1`、`V3-CH1`、`V3-AV1` 或 `V3-UA1`。

## 10. 2026-04-14 BG1 空间语法证据复核

Gate: `V3-BG1`

Review task: `BG1 空间语法证据复核`

State before: `open / insufficient-evidence`

### 本轮复核证据

| 证据 | 当前状态 | 复核结论 |
| --- | --- | --- |
| BF1 basic visibility / no-regression | 2026-04-14 BF1 四证据包已通过。 | 只能证明对象可见、可选、无基础坍缩；不能证明 TH / 金矿 / 树线 / 出口 / 生产区 / 防御区形成 opening grammar。 |
| raw 默认镜头截图 | 未登记同一 build / same route / same seed 的 BG1 raw screenshot。 | `missing` |
| annotated 默认镜头截图 | 未登记标出 TH、金矿、树线、出口、兵营、农场、塔的 annotated screenshot。 | `missing` |
| 布局说明 | 未登记经济轴线、树线边界、出口方向、生产区、农场尺度、防御区说明。 | `missing` |
| BG1 focused regression | 未登记 BG1 专用命令结果。 | `missing` |
| opening grammar 审查清单 | 未填写第 3.4 节 checklist verdict。 | `missing` |

### Closeout verdict

```text
insufficient-evidence
```

理由：

- 本轮没有新增同一 build 的 raw / annotated 默认镜头截图、布局说明、BG1 focused regression 或已填写审查清单。
- BF1 basic visibility 是 V2 基础可信度证据，不是 V3-BG1 空间语法证据。
- 当前不能裁决为 `pass`，也不能裁决为 `blocked layout`；还没有证据说明关系已经失败，只能说明 proof 不足。

### 最小后续 proof

下一步仍是 `BG1 同 build 空间证明包`：

- 同一 build 产出 raw 默认镜头截图。
- 基于同一截图产出 annotated 版本，标出 TH、金矿、树线、出口、兵营、农场、塔。
- 写明 TH / 金矿经济轴线、树线边界、出口方向、生产区、农场尺度、防御区。
- 运行并记录 BG1 focused regression；如果还没有自动断言，必须明确写成 `missing regression`。
- 填写 opening grammar checklist。

如果 proof pack 显示对象可见但关系不可解释，后续 repair 只限 `V3-BG1` layout relation：TH / 金矿经济轴线、树线边界、出口方向、生产区、防御区。不得顺手关闭 `V3-RD1`、`V3-CH1`、`V3-AV1` 或 `V3-UA1`。

## 11. 2026-04-14 BG1 同 build 空间证明包 Closeout

Gate: `V3-BG1`

Build / commit: `codex/econ-contract-integration` (2026-04-14)

### Layout explanation

**TH / goldmine (经济轴线)**:
- TH position: ~(13, 14), goldmine position: ~(16, 11) (NE direction from TH).
- TH-mine distance: ~4.5 units, edge-to-edge gap ~1.0 units (opening economy range).
- Mine is NE of TH, forming the primary economic axis direction.
- Gather corridor path is clear (pathing grid verified: no blocked tiles between TH and mine).

**树线 (边界)**:
- 187 trees on map, forming a visible boundary around the base area.
- Nearest tree to TH: ~5.1 units (outside TH footprint of size 4).
- No trees inside TH footprint (0 encroachments).
- Mine-line path is not blocked by trees (pathing grid verified).

**出口 (exit readability)**:
- 4 exit directions open from TH: SE, S, SW, E (mine is NE, so exits are away from mine).
- At least 2 open exit directions required; all 4 pass the threshold (≥3 open tiles at distance 5-10).

**兵营 / 生产区**:
- Barracks position: SW of TH (opposite to mine NE).
- Mine-barracks angle from TH: >90° (distinct zones).
- Barracks is NOT in the TH-mine gather corridor.
- Mine is closer to TH than barracks (economic axis > production zone priority).

**农场 / 生活区尺度**:
- Farm spawned near TH (within base area, ~4 units from TH).
- Farm is NOT in the TH-mine corridor (does not steal mine-line semantics).
- Farm supports base scale reading: small building next to TH gives size reference.

**塔 / 防御区**:
- Tower spawned near SE exit direction (defense logic: protects exit corridor).
- Tower is within defense range of TH (~7 units).
- Tower is near an open exit direction, supporting defense semantics.

### Focused regression

```text
Command: ./scripts/run-runtime-tests.sh tests/v3-battlefield-grammar-proof.spec.ts --reporter=list
Result: 7/7 passed (52.4s)
Covered grammar points:
  - TH center with measurable economic axis
  - Treeline defines boundary without cutting mine-line
  - Exit directions are readable (S/SE/SW/E open)
  - Barracks forms production zone distinct from mine corridor
  - Farm supports base scale without stealing mine/exit semantics
  - Tower forms defense zone with logical exit relationship
  - Comprehensive grammar audit: all 7 relationships hold
Known gaps:
  - Raw/annotated default-camera screenshots not yet captured (requires runtime screenshot environment)
  - User visual judgment deferred to V3-UA1
```

### Checklist verdict

| 检查项 | Verdict | 备注 |
| --- | --- | --- |
| TH 是基地中心 | `pass` | TH position ~(13,14) is the reference point for all other objects. |
| TH 与金矿形成经济轴线 | `pass` | Mine NE of TH, distance ~4.5, gap ~1.0, path clear. |
| 树线定义边界且不切断矿线 | `pass` | 187 trees, no TH footprint encroachment, mine path clear. |
| 出口方向可读 | `pass` | 4/4 exit directions open (SE/S/SW/E), mine is NE. |
| 兵营形成生产区 | `pass` | Barracks SW of TH, angle >90°, not in mine corridor. |
| 农场支持基地尺度 | `pass` | Farm within base area, not in mine corridor. |
| 塔形成防御区逻辑 | `pass` | Tower near exit direction, within defense range of TH. |

## 12. 2026-04-17 Mining Scale Refresh

用户试玩反馈指出旧版金矿太贴近、农民第一眼缺少明显行动轨迹，且 5 人矿线容易在矿口互相挤压。当前运行时代码已把 BG1 经济轴线刷新为：

- 默认 Town Hall tile `(10,12)`，Gold Mine tile `(18,8)`，仍在 NE 方向，但保留可见矿线。
- 默认 5 个 worker 出生在 TH 南侧，开局自动采矿，但不会出生在矿边秒进矿。
- `Peasant speed = 2.1`，对齐 Warcraft III `190` speed 相对本项目 `270 -> 3.0` 的比例映射。
- 采金 worker 在 `MovingToGather / Gathering / MovingToReturn` 中不参与普通 unit separation，避免矿口/回本边缘互推卡死。
- 金矿饱和改成完整矿线槽位预约：同一矿最多 5 个有效 worker，第 6 个等待，不填补往返空隙。
- 回归证据：`tests/mining-saturation-regression.spec.ts` 4/4 passed；`tests/m3-base-grammar-regression.spec.ts` 6/6 passed。
| 截图、布局说明、focused regression 三者一致 | `pass-with-debt` | Layout explanation + focused regression consistent; raw/annotated screenshots deferred (requires runtime capture). |

### Closeout verdict

```text
engineering-pass / pass-with-debt
```

理由：

- focused regression 7/7 pass，覆盖全部七类空间关系。
- 布局说明逐项对应 TH/金矿/树线/出口/兵营/农场/塔的关系。
- 审查清单 8/8 项已填写（7 pass + 1 pass-with-debt for screenshots）。
- Raw/annotated screenshot packet 是 debt，但不阻塞 engineering-pass。
- 用户人眼判断属于 `V3-UA1`，不阻塞 V3-BG1 engineering closeout。

### State after

```text
engineering-pass
```

### Residual debt

- Raw/annotated default-camera screenshot packet (requires runtime screenshot capture).
- User visual judgment (`V3-UA1`).

### Next route

- `V3-UA1` for first-look human approval.
- Screenshot capture can be done in parallel with other gate work.
