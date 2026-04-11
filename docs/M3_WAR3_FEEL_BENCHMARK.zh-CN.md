# M3 War3 感垂直切片 — 比例/布局基准规格

> Date: 2026-04-12
> Purpose: 在 M3 触碰镜头、地形、模型大小之前，先建立当前原型 vs War3-like 目标的量化基准表。所有后续调整以此为参照，不再盲猜。
> Status: spec only — 不涉及 src/ 修改

---

## 1. 当前原型比例表

数据来源：`src/game/GameData.ts`、`src/game/Game.ts`、`src/game/CameraController.ts`、`src/map/Terrain.ts`

### 1.1 地图与 tile

| 属性 | 当前值 |
|---|---|
| 地图尺寸 | 64 × 64 tiles |
| Tile 世界尺寸 | 1.0 × 1.0 world units |
| Tile 几何体 | `PlaneGeometry(1, 1)` |
| 地形最大起伏 | ±0.8 world units（`sin*cos` 叠加） |
| 基地区 tile 语法 | 有（LightDirt / DarkStone / Dirt 分区） |

### 1.2 单位

| 实体 | data `size` | 实际几何体 | 半径 (world) | 高度 (world) | 备注 |
|---|---|---|---|---|---|
| Worker (农民) | — | `CylinderGeometry(0.22 top, 0.28 bot, h=0.6)` | ≈0.28 | 0.9 (含帽) | 矮胖圆柱 + 头 + 帽 + 镐 |
| Footman (步兵) | — | `CylinderGeometry(0.28 top, 0.32 bot, h=0.9)` | ≈0.32 | 1.46 (含羽饰) | 更高更宽 + 肩甲 + 剑盾 |
| Worker / Footman 分离半径 | `UNIT_SEPARATION_RADIUS = 0.6` | — | 0.6 | — | 单位间最小距离 |
| Worker / Footman 编队间距 | `FORMATION_SPACING = 0.7` | — | 0.7 | — | 群组移动偏移 |

### 1.3 建筑

| 实体 | data `size` (占地面积 tiles) | 主体几何体 (world) | 高度 (world) | 备注 |
|---|---|---|---|---|
| Town Hall | 4 | `BoxGeometry(3.4, 1.2, 3.4)` + 屋顶锥体 | ≈3.3 (含旗杆) | 占 4×4 tiles，mesh 3.4 宽 |
| Barracks | 3 | `BoxGeometry(2.4, 0.9, 2.2)` + 屋顶锥体 | ≈2.35 (含旗) | 占 3×3 tiles，mesh 2.4 宽 |
| Farm | 2 | `BoxGeometry(1.5, 0.4, 1.3)` + 锥屋顶 | ≈1.0 | 占 2×2 tiles，mesh 1.5 宽 |
| Tower | 2 | `CylinderGeometry(0.52, 0.62, h=1.8)` + 城垛 + 尖顶 | ≈2.8 (含旗) | 占 2×2 tiles，但 mesh 只有直径 1.24 |
| Gold Mine | 3 | `BoxGeometry(2.8, 1.4, 2.8)` + 晶体 | ≈2.5 (含晶体) | 占 3×3 tiles |

### 1.4 树

| 属性 | 当前值 |
|---|---|
| 树干 | `CylinderGeometry(r_top=0.06, r_bot=0.1, h=0.7)` |
| 三层树冠 | 底 `ConeGeometry(r=0.55, h=1.1)` → 中 `r=0.38, h=0.85` → 顶 `r=0.22, h=0.65` |
| 总高度 | ≈2.75 world units（不含随机缩放） |
| 随机缩放 | `0.8 + rng() * 0.8` → 0.8x ~ 1.6x |

### 1.5 镜头

| 属性 | 当前值 |
|---|---|
| FOV | 45° |
| 俯角 (AoA) | 55° (从水平面量起) |
| 水平旋转 | 90° (朝北) |
| 默认距离 | 24 (初始) / 22 (类内默认) |
| 缩放范围 | 10 – 70 |
| 初始 target | `(13, 14)` — 玩家基地中心 |
| 平移速度基数 | 28，随距离/22 缩放 |

### 1.6 出生布局 (玩家)

| 实体 | tile 坐标 | world center (近似) | 方位 |
|---|---|---|---|
| Town Hall | (10, 12), size=4 → 占 (10-13, 12-15) | (12.5, 14.5) | 基地核心 |
| Gold Mine | (15, 8), size=3 → 占 (15-17, 8-10) | (16.5, 9.5) | TH 东北方，TH-GM gap = 2 tiles |
| Barracks | (5, 17), size=3 → 占 (5-7, 17-19) | (6.5, 18.5) | TH 西南方 |
| Workers ×5 | tile (10..14, 11) | — | TH 南面一字排开 |

### 1.7 出生布局 (AI, 镜像)

| 实体 | tile 坐标 | world center (近似) |
|---|---|---|
| Town Hall | (50, 50), size=4 | (52.5, 52.5) |
| Gold Mine | (55, 46), size=3 | (56.5, 47.5) |
| Barracks | (45, 55), size=3 | (46.5, 56.5) |
| Workers ×5 | tile (50..54, 48) | — |

---

## 2. War3-Like 目标启发式表

以下不是精确复制 War3 数值，而是预期相对层级和间距关系。

### 2.1 建筑/单位相对大小层级

War3 的空间语法核心规则：

```
Farm << Barracks < Town Hall ≈ Gold Mine    (占地面积)
Farm << Tower < Barracks < Town Hall        (视觉高度)
Worker < Footman < Farm < Barracks < TH     (整体体积层级)
```

具体启发式比例（相对于 TH = 1.0 基准）：

| 实体 | 占地面积比 (目标) | 视觉高度比 (目标) | 说明 |
|---|---|---|---|
| Town Hall | 1.0 | 1.0 | 基准锚点，最大最醒目 |
| Gold Mine | 0.7–0.9 | 0.5–0.7 | 资源地标，占地大但不必最高 |
| Barracks | 0.4–0.6 | 0.6–0.8 | 生产建筑，比 TH 小但比 Farm 大很多 |
| Farm | 0.1–0.15 | 0.2–0.3 | 小型紧密建筑，wall piece |
| Tower | 0.1–0.15 占地 | 0.7–0.9 高度 | 占地小但竖向高，防御标志 |
| Worker | — | ≈0.3 | 可读但最小角色 |
| Footman | — | ≈0.4 | 明显比 worker 高大重 |

### 2.2 间距与寻路缓冲

| 规则 | 目标 |
|---|---|
| TH ↔ Gold Mine 距离 | 3–5 tiles（短 worker 路径） |
| 建筑间最小通道 | 1 tile = worker 可通过，2 tile = 军事可通过 |
| Farm 作为 wall piece | 紧凑排列，无寻路缓冲 |
| TH / Barracks | 有 1-tile 寻路缓冲 |
| 树线距基地 | 4–6 tiles（伐木路径可见但不紧贴） |
| 集结/出口方向 | 基地至少一面完全开阔 |

### 2.3 镜头启发式

| 属性 | 目标范围 | 说明 |
|---|---|---|
| FOV | 35°–50° | 经典 RTS 偏压缩，减少透视畸变 |
| 俯角 | 50°–60° | 看到建筑立面 + 地面深度 |
| 默认距离 | 应在 1 屏内同时看清 TH + 金矿 + worker | 当前值待实际验证 |
| 缩放范围 | 最近能看到单个 unit 细节，最远能看到整个基地 |

### 2.4 Tile / 脚印比例关键关系

War3 世界编辑器中（参考 WC3 Gym）：

| 实体 | War3 编辑器尺寸 | 寻路缓冲 |
|---|---|---|
| Town Hall / Great Hall | 4×4 | 有 1-tile buffer |
| Barracks / War Mill | 3×3 | 有 1-tile buffer |
| Farm / Burrow | 2×2 | 无 buffer |
| Tower | 2×2 | 有 buffer（某些版本） |
| Gold Mine | ~4×4 | 大型不可通行体 |
| Peasant / Footman | < 1 tile 碰撞体 | — |

---

## 3. 当前 vs 目标：Top 10 可见偏差

### 3.1 建筑层级扁平化

**现状**：Farm `size=2`, Barracks `size=3`, Tower `size=2`, TH `size=4`

**问题**：虽然数据上有差异，但 proxy mesh 的视觉表现差距不够：
- Farm mesh 宽 1.5，Barracks mesh 宽 2.4，比例 1:1.6 → 差异不够大
- War3 中 Farm 是 tiny wall piece，当前 Farm 在默认镜头下看起来像中型建筑
- Tower 占地 `size=2` 但 mesh 直径仅 1.24，显得过于纤细

**偏差严重度**：高

### 3.2 Tower 占地 vs 视觉体量严重不匹配

**现状**：Tower `size=2`（占 2×2 tiles），但 mesh 主体直径 ≈1.24 world units

**问题**：占位 2×2 但看起来只占 1 tile。玩家预期"这里有个塔"但视觉上是根棍子。

**偏差严重度**：高

### 3.3 TH ↔ Gold Mine 距离偏小

**现状**：TH edge (x=13) to GM edge (x=15) = 2 tiles gap

**问题**：War3 典型 TH-GM 距离为 3–4 tiles。当前距离太近，worker 往返路径缺乏可见度，且两个大型建筑视觉上挤在一起。

**偏差严重度**：中

### 3.4 农民在默认镜头下可读性存疑

**现状**：Worker 高 0.9 world units，半径 0.28。默认镜头距离 24。

**问题**：镜头 distance=24、FOV=45° 时，一个 0.9 高的 worker 在屏幕上的像素占比取决于分辨率，但极可能偏小。WAR3_BENCHMARK_RESEARCH_01 明确记录了"worker feel effectively invisible"的用户反馈。

**偏差严重度**：高 — 这是 M1 遗留的最高优先级视觉债

### 3.5 Footman vs Worker 剪影对比不够强

**现状**：Worker 高 0.9 / 半径 0.28，Footman 高 1.46 / 半径 0.32

**问题**：高度比 1:1.6，宽度比 1:1.14。宽度差异过小，远看两者轮廓相似。War3 中 Footman 明显更宽壮（盔甲 + 盾牌的剪影面积应该是 Worker 的 2x+）。

**偏差严重度**：中

### 3.6 Farm 太大 / 不够紧凑

**现状**：Farm `size=2`（占 2×2），mesh 宽 1.5

**问题**：War3 中 Farm 是最小最紧凑的建筑（2×2 无 buffer），主要用于 wall。当前 Farm 在基地中占据过多视觉空间，失去了"小墙件"的角色。

**偏差严重度**：中

### 3.7 树木比例与建筑比例不协调

**现状**：树高 ≈2.75（基础），随机缩放后最高 ≈4.4。Town Hall 高 ≈3.3。

**问题**：缩放后的树可能比 TH 还高。War3 中树冠不应压过主基地，树是"填空物"不是"视觉主导"。

**偏差严重度**：中

### 3.8 地形起伏可能干扰可读性

**现状**：地形 `sin*cos` 叠加 ±0.8 world units

**问题**：Worker 高 0.9，地形起伏 ±0.8，意味着 worker 可能被地形完全遮挡一半。War3 的地形起伏是极缓的，不会在玩家基地内造成"视觉陷阱"。

**偏差严重度**：中

### 3.9 缺乏寻路缓冲语义

**现状**：所有建筑只有 `size` 属性，无 pathing buffer 概念。

**问题**：War3 的 base feel 很大程度来自 pathing buffer。TH 和 Barracks 有 buffer → 周围有间隙 → 有空间感。Farm 无 buffer → 可以紧贴 → wall 感。当前系统所有建筑都是刚体方块，空间语法无法体现。

**偏差严重度**：中低（M3 阶段可通过视觉间距模拟）

### 3.10 AI 基地与玩家基地间距不自然

**现状**：玩家基地中心 ≈(12, 14)，AI 基地中心 ≈(52, 52)。直线距离 ≈55 tiles。

**问题**：64×64 地图上，对角线 ≈90。两个基地占地图中心距离的 60%。War3 1v1 地图通常基地在对角或两极，中间有丰富的 contested territory。当前布局中间区域过大，缺乏有意义的地图控制点。

**偏差严重度**：低（M3 暂不需要调整，但应记录为 M4 素材）

---

## 4. M3 实施序列

### 4.1 可安全分配给 GLM 的任务

这些任务有明确数值约束、可用测试验证比例关系、不依赖人类视觉判断最终结果：

#### T1: 建筑尺寸比例调整

- 保持 Farm `GameData.size = 2`，不要在当前 footprint 系统里引入 1.5 这种半 tile 占地
- 先只调整 proxy mesh 几何体尺寸，使 Farm 视觉更紧凑、Tower 视觉底座更宽
- 如果以后要区分视觉体量和寻路占地，应先引入独立字段：`visualScale` / `footprintSize` / `pathingBuffer`
- **验证**：ratio assertion — Farm mesh width / TH mesh width < 0.45
- **风险**：低，纯数值调整

#### T2: Footman / Worker 剪影强化

- 增大 Footman 半径（0.32 → 0.40+）和肩甲宽度
- 保持 Worker 尺寸不变或微调
- **验证**：Footman footprint area / Worker footprint area > 1.8
- **风险**：低

#### T3: 树木高度上限裁剪

- 限制随机缩放范围（`0.8 + rng() * 0.8` → `0.6 + rng() * 0.5`）
- 确保最高树 < Town Hall 高度
- **验证**：max_tree_height < TH_height
- **风险**：低

#### T4: 基地内地形起伏压制

- 在基地区域（距 TH 中心 10 tiles 内）将地形起伏乘以衰减系数
- 确保基地内起伏 < 0.2 world units
- **验证**：for base tiles, abs(getHeight) < 0.2
- **风险**：低

#### T5: TH-GM 距离调整

- 将 Gold Mine 从 (15, 8) 移到更远位置（如 (17, 7)），使 TH-GM gap ≈ 3–4 tiles
- 同步更新 Terrain.ts 中的金矿区域和资源路径渲染
- 同步更新 AI 镜像布局
- **验证**：distance(TH_center, GM_center) 在 4.5–6.0 范围
- **风险**：中（需要同步更新地形着色）

#### T6: Tower 视觉体量修正

- Tower mesh 宽度从当前直径 1.24 增加到接近占满 2×2 tile footprint
- 或：增加 Tower base 的几何体宽度
- **验证**：Tower mesh diameter / Tower data size > 0.6
- **风险**：低

#### T7: 镜头默认参数微调

- 在 CameraController 中调整默认 distance、FOV、AoA
- **验证**：数值在启发式范围内（FOV 35°–50°, AoA 50°–60°, distance 让 TH+GM+workers 同屏）
- **风险**：中（需要人类确认 feel）

### 4.2 需要 Codex / 人类视觉判断的任务

这些任务无法仅靠数值测试通过，必须有人类眼见确认：

#### T8: 整体比例 feel 确认

- GLM 完成 T1–T7 后，部署到 GitHub Pages
- **人类操作**：打开浏览器，默认镜头下判断：
  - 第一眼是否是 RTS 战场
  - Worker 是否可见可辨
  - TH 是否锚定基地
  - 金矿是否是地标
  - 建筑层级是否自然
- **输出**：通过 / 带美术债通过 / 失败：具体原因

#### T9: 地形空间语法 feel 确认

- 基地区、矿区、军事区、树线、出口的视觉分区是否一眼可辨
- **人类操作**：默认镜头下观察 base area 是否有清晰的空间组织
- **输出**：通过 / 需要调整

#### T10: 镜头 feel 确认

- WASD 移动、滚轮缩放、默认画面是否"像 RTS"
- **人类操作**：实际操作镜头 30 秒
- **输出**：通过 / FOV 需调 / 速度需调 / 距离需调

#### T11: HUD 与主战场关系确认

- HUD 是否遮挡关键区域
- 选择圈、血条是否可读
- **人类操作**：选单位、造建筑、看 HUD
- **输出**：通过 / HUD 需调 / 选择反馈需调

### 4.3 建议实施顺序

```
Phase 1 (GLM, 纯数值):
  T1 → T2 → T3 → T4 → T6
  每个任务独立，可并行或顺序

Phase 2 (GLM, 布局调整):
  T5 → T7
  依赖 Phase 1 完成后的尺寸基准

Phase 3 (人类 gate):
  T8 → T9 → T10 → T11
  必须由人类在浏览器中确认
  如果失败，记录具体偏差原因，回到 Phase 1/2
```

---

## 5. 重要警告：M3 必须有人类视觉确认

### 5.1 测试能验证什么

- 比例关系是否在目标范围内（ratio assertions）
- 数值是否自洽（建筑不超过地图、单位在建筑间可通过）
- 布局是否符合空间约束（距离、间距）

### 5.2 测试不能验证什么

- **"是否看起来像 War3"** — 这是主观视觉判断
- **"worker 是否可读"** — 取决于屏幕分辨率、DPI、浏览器渲染
- **"镜头是否舒服"** — 需要实际操作感受
- **"地形是否有 War3 味"** — 色彩、起伏、分区全靠人眼

### 5.3 M3 通过标准

M3 不以测试全绿为通过标准。

M3 通过标准是：

1. GLM 完成 Phase 1 + Phase 2
2. 所有 ratio assertions 通过
3. 部署到 GitHub Pages
4. 人类打开浏览器，在默认镜头下操作 2–3 分钟
5. 人类给出明确结论（参考 PROJECT_MILESTONES.zh-CN.md M3 判定选项）

**任何 AI agent 不得声称 M3 "visually approved" 或 "feel confirmed"。**

---

## 6. 数据快照：关键比例计算

以下计算基于当前代码，供后续调整对比。

### 6.1 当前面积/高度比

```
TH mesh 面积:     3.4 × 3.4 = 11.56
Barracks mesh 面积: 2.4 × 2.2 = 5.28
Farm mesh 面积:    1.5 × 1.3 = 1.95
Tower mesh 面积:   π × 0.62² ≈ 1.21 (底面)
GM mesh 面积:     2.8 × 2.8 = 7.84

面积比 (TH=1.0):
  Barracks / TH = 0.46   (目标 0.4–0.6) ✓ 边界
  Farm / TH     = 0.17   (目标 0.1–0.15) ✗ 偏大
  Tower / TH    = 0.10   (目标 0.1–0.15) ✓ 但视觉体量不足
  GM / TH       = 0.68   (目标 0.7–0.9) ✓ 偏下界

高度比 (TH=1.0, TH h≈3.3):
  Barracks / TH = 0.71   (目标 0.6–0.8) ✓
  Farm / TH     = 0.30   (目标 0.2–0.3) ✓
  Tower / TH    = 0.85   (目标 0.7–0.9) ✓
  GM / TH       = 0.76   (目标 0.5–0.7) ✗ 偏高
  Worker / TH   = 0.27   (目标 ≈0.3)    ✓
  Footman / TH  = 0.44   (目标 ≈0.4)    ✓
  树(基础) / TH = 0.83   (应 < 1.0)     ✓
  树(最大缩放) / TH = 1.33 (应 < 1.0)   ✗ 偏高
```

### 6.2 当前布局间距

```
TH center → GM center: √((12.5-16.5)² + (14.5-9.5)²) ≈ 6.4 tiles
TH edge → GM edge: 6.4 - TH_radius(2) - GM_radius(1.5) = 2.9 tiles
目标: 3–5 tiles                                    ✓ 下界附近

TH center → Barracks center: √((12.5-6.5)² + (14.5-18.5)²) ≈ 7.2 tiles
TH edge → Barracks edge: 7.2 - 2 - 1.5 = 3.7 tiles
目标: 4–8 tiles                                    ✓

Workers 位置: (10..14, 11)
TH 南面 z=12，workers 在 z=11
TH-worker 距离: 1 tile (z 方向)
目标: 紧贴 TH                                      ✓
```

### 6.3 运行时测量快照

来源：`npm run test:m3-scale`，提交 `e39a6cf`。这组数据来自实际运行后的 bbox，不等同于源码里的 proxy 几何体静态预估。

```
Worker:    1.240w × 1.865h × 0.963d
Footman:   0.860w × 1.360h × 0.640d
Town Hall: 2.976w × 1.893h × 2.740d
Gold Mine: 2.840w × 3.160h × 2.840d
Barracks:  5.657w × 2.750h × 5.657d
Farm:      1.500w × 1.000h × 2.200d
Tower:     1.320w × 3.500h × 1.320d

Measured ratios:
  Farm / TH area       = 0.405
  Barracks / TH area   = 3.925
  GoldMine / TH area   = 0.989
  Tower / TH area      = 0.214
  Tower height / TH    = 1.849
  Footman silhouette / Worker silhouette = 0.506
```

Interpretation:

- Default camera currently contains Town Hall, Gold Mine, and at least one Worker. This is a usable baseline.
- Workers are outside blockers and selection rings have nonzero sane radii. This is a usable baseline.
- Runtime scale is not the same as static proxy scale. The loaded asset/fallback path must be measured before every M3 tuning task.
- Footman currently measures smaller than Worker by bbox silhouette. This violates the readability contract that military units should read heavier than workers.
- Barracks currently measures much larger than Town Hall in runtime bbox area. This breaks the intended base anchor hierarchy.
- Tower has a clear vertical profile, but runtime height is far above Town Hall height. This may be acceptable only if human visual review says the tower still reads as a defensive landmark rather than a giant prop.
- Gold Mine currently measures taller than Town Hall. This supports resource landmark readability, but may weaken Town Hall as the base anchor.

Immediate M3 implication:

1. Do not tune from source constants alone.
2. First normalize runtime visual scale for Worker, Footman, Town Hall, Barracks, Gold Mine, Tower.
3. Keep footprint/pathing sizes stable until visual scale and `GameData.size` are separated.
4. Only after runtime ratios are sane should camera and terrain be tuned.

### 6.4 运行时比例归一化后快照

来源：`npm run test:m3-scale`，M3 scale normalization patch。该补丁只调整视觉代理/资产 scale/selection ring，不调整碰撞、寻路、人口或 AI 语义。

```
Worker:    1.240w × 1.865h × 0.963d
Footman:   1.365w × 2.040h × 0.960d
Town Hall: 3.508w × 2.232h × 3.229d
Gold Mine: 2.840w × 3.160h × 2.840d
Barracks:  2.546w × 2.550h × 2.546d
Farm:      1.500w × 1.000h × 2.200d
Tower:     1.320w × 3.500h × 1.320d

Measured ratios:
  Farm / TH area       = 0.291
  Barracks / TH area   = 0.572
  GoldMine / TH area   = 0.712
  Tower / TH area      = 0.154
  Tower height / TH    = 1.568
  Footman silhouette / Worker silhouette = 1.204
```

Changes from previous runtime snapshot:

- Footman silhouette changed from `0.506× Worker` to `1.204× Worker`. The previous hierarchy was inverted; this now satisfies the measurable military-readability contract.
- Barracks footprint changed from `3.925× Town Hall` to `0.572× Town Hall`. Town Hall is now the measurable base visual anchor.
- Gold Mine remains a strong landmark but no longer visually dominates Town Hall by footprint.
- Tower keeps a vertical defense profile while no longer dwarfing Town Hall beyond the current M3 guardrail.

Remaining visual debt:

1. This is still a numeric scale correction, not human visual approval.
2. Worker visibility on the live page still requires human review because the proxy can be occluded by dark terrain, tree shadows, and HUD opacity.
3. Final M3 approval still depends on browser playtest: default view, base readability, drag-select, worker construction, and first combat.

---

## 7. 参考文档

1. `docs/WAR3_BENCHMARK_RESEARCH_01.md` — War3 基准研究
2. `docs/WAR3_SYSTEM_ALIGNMENT_01.md` — M2 系统对齐
3. `docs/PROJECT_MILESTONES.zh-CN.md` — M3 里程碑定义
4. `src/game/GameData.ts` — 建筑/单位数值定义
5. `src/game/CameraController.ts` — 镜头参数
6. `src/map/Terrain.ts` — 地形系统
7. WC3 Gym Human Base Building Guide — War3 建筑 pathing 和 base grammar
8. Battle.net Human Unit Stats — War3 官方数值参考
