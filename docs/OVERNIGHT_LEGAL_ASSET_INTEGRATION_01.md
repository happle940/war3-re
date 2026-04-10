# Overnight Legal Asset Integration Alpha

> Session theme: 合法资产接入骨架 — glTF 替换通道 + fallback 体系
> Purpose: 把项目从程序几何体原型推进到使用合法可公开资产的 War3-like 代理视觉层
> Status: IN PROGRESS

---

## Goal

这轮不做新游戏系统、不做截图、不继续调几何体参数。

只做一件事：

> 建立合法资产接入骨架：当 glTF 素材放入指定目录时，游戏自动使用它；没有素材时自动 fallback 到当前程序几何体。

一句话：**资产替换通道成立，游戏不因资产缺失而崩溃。**

---

## Asset Route

目标来源（合法可公开）：
1. Quaternius Ultimate Fantasy RTS
2. Quaternius Universal Base Characters
3. Quaternius Modular Weapons Pack
4. Quaternius Ultimate Stylized Nature Pack

资产目录约定：
- `public/assets/models/units/` — 单位 glTF
- `public/assets/models/buildings/` — 建筑 glTF
- `public/assets/models/nature/` — 自然物 glTF

---

## Phase Checklist

- [ ] Phase 0: Baseline + Audit
- [ ] Phase 1: Asset Loader Foundation
- [ ] Phase 2: Unit Visual Integration
- [ ] Phase 3: Building Visual Integration
- [ ] Phase 4: Nature Integration
- [ ] Phase 5: Goldmine Strategy
- [ ] Phase 6: Runtime Proof

---

## Asset Mapping (Phase 0 Audit)

| Key | Type | glTF Path | 本轮状态 |
|-----|------|-----------|----------|
| worker | Unit | `assets/models/units/worker.glb` | 接入骨架 + fallback |
| footman | Unit | `assets/models/units/footman.glb` | 接入骨架 + fallback |
| townhall | Building | `assets/models/buildings/townhall.glb` | 接入骨架 + fallback |
| barracks | Building | `assets/models/buildings/barracks.glb` | 接入骨架 + fallback |
| farm | Building | `assets/models/buildings/farm.glb` | 接入骨架 + fallback |
| tree | Nature | `assets/models/nature/pine_tree.glb` | 接入骨架 + fallback |
| goldmine | Building | 原创代理方案 | 接入架构纳入 |

**本轮所有资产都是骨架 + fallback**（工作区无 glTF 文件）。

---

## Scope

允许修改：
- `src/game/Game.ts`（createUnitMesh/createBuildingMesh/spawnTrees → 调用 factory）
- 新增 `src/game/AssetCatalog.ts`
- 新增 `src/game/AssetLoader.ts`
- 新增 `src/game/UnitVisualFactory.ts`
- 新增 `src/game/BuildingVisualFactory.ts`
- 新增 `public/assets/` 目录结构

Non-goals：
- 不碰 GameCommand.ts、SimpleAI.ts、TeamResources.ts
- 不做动画系统
- 不做 ECS 重构
- 不调几何体参数
- 不做截图链
- 不做 HUD 大重构

---

## Key Line Numbers (Phase 0)

- `createUnitMesh`: `Game.ts:2275`
- `createBuildingMesh`: `Game.ts:2528`
- `spawnTrees`: `Game.ts:2859`
- `spawnUnit`: `Game.ts:2631`
- `spawnBuilding`: `Game.ts:2673`
- `TEAM_COLORS`: `Game.ts:115`

---

## Verification Log

### Phase 0
- `npm run build` ✅
- `npx tsc --noEmit -p tsconfig.app.json` ✅

### Phase 1 (covers Phase 2 & 3)
- `npm run build` ✅
- `npx tsc --noEmit -p tsconfig.app.json` ✅
- 新文件: AssetCatalog.ts, AssetLoader.ts, UnitVisualFactory.ts, BuildingVisualFactory.ts
- Game.ts spawnUnit/spawnBuilding → 调用 factory

### Phase 4
- `npm run build` ✅
- `npx tsc --noEmit -p tsconfig.app.json` ✅
- spawnTrees 重构为 createSingleTree()，支持 glTF/programmatic fallback
- 树几何体提取为 static readonly 共享资源

### Phase 5
- goldmine 已在 Phase 1 中纳入 BuildingVisualFactory
- 原创代理方案：
  - 岩石基座（0x6a6050）
  - 金色晶体簇（OctahedronGeometry，0xffdd00 emissive）
  - 发光点光源（PointLight 0xffaa00）
  - 可读的资源点语义
- glTF 路径: `assets/models/buildings/goldmine.glb`
- 无 glTF 时使用 createProxyGoldmine fallback

### Phase 6
- `npm run build` ✅
- `npx tsc --noEmit -p tsconfig.app.json` ✅
- Playwright smoke ✅:
  - Canvas 渲染: RGBA(179,179,157,255) 非黑
  - Game loop 推进: 00:02 → 00:04 (3s)
  - HUD 正常: gold=500
  - Zero console errors
  - AssetLoader 缺失文件不崩溃，fallback 正常

---

## Decisions Taken Without User Confirmation

1. **工厂模式而非内联改造**：新建独立 factory 文件而非在 Game.ts 内部重构。理由：Game.ts 已经 3800+ 行，不继续膨胀。
2. **静态共享树几何体**：fallback 树几何体作为 Game 类的 static readonly 属性，避免每棵树重建。当 glTF 可用时这些不会被创建。
3. **goldmine 不找外部素材**：保持当前原创代理设计（岩+晶体+发光），纳入 factory 架构。
4. **异步不阻塞**：`loadAllAssets()` 返回 Promise 但不 await — 游戏立即用 fallback 启动，资产后台加载。

---

## Morning Handoff

### Result

**目标达成。** 资产替换通道已建立：

- `npm run build` ✅ 通过
- `npx tsc --noEmit -p tsconfig.app.json` ✅ 通过
- Playwright runtime ✅ 无错误、canvas 渲染、fallback 正常

### Asset Mapping

| Key | glTF Path | 状态 | 说明 |
|-----|-----------|------|------|
| worker | `assets/models/units/worker.glb` | 骨架+fallback | 放入 glB 即替换 |
| footman | `assets/models/units/footman.glb` | 骨架+fallback | 放入 glB 即替换 |
| townhall | `assets/models/buildings/townhall.glb` | 骨架+fallback | 放入 glB 即替换 |
| barracks | `assets/models/buildings/barracks.glb` | 骨架+fallback | 放入 glB 即替换 |
| farm | `assets/models/buildings/farm.glb` | 骨架+fallback | 放入 glB 即替换 |
| tower | `assets/models/buildings/tower.glb` | 骨架+fallback | 放入 glB 即替换 |
| goldmine | `assets/models/buildings/goldmine.glb` | 骨架+fallback | 原创代理方案已就位 |
| pine_tree | `assets/models/nature/pine_tree.glb` | 骨架+fallback | 放入 glB 即替换全部树木 |

**如何使用：** 把对应 `.glb` 文件放入 `public/assets/models/` 下的对应子目录，刷新页面即生效。

### Files Changed

| 文件 | 职责 | 状态 |
|------|------|------|
| `src/game/AssetCatalog.ts` | 资产 key/path/scale 注册表 | 新增 |
| `src/game/AssetLoader.ts` | glTF 异步加载 + 缓存 + fallback 标记 | 新增 |
| `src/game/UnitVisualFactory.ts` | 单位视觉创建（glTF/fallback） | 新增 |
| `src/game/BuildingVisualFactory.ts` | 建筑视觉创建（glTF/fallback） | 新增 |
| `src/game/Game.ts` | spawnUnit/spawnBuilding 调用 factory，spawnTrees 使用 createSingleTree | 修改 |
| `public/assets/models/` | 资产目录结构（空，待放入 glTF） | 新增 |
| `docs/OVERNIGHT_LEGAL_ASSET_INTEGRATION_01.md` | 执行文档 | 新增 |

### Git Pushes

| Commit | Phase | Message |
|--------|-------|---------|
| `4ead9e8` | Phase 0 | `assets: Phase 0 — baseline audit, asset directory structure, execution doc` |
| `5acdc60` | Phase 1 | `assets: Phase 1 — AssetLoader foundation + UnitVisualFactory + BuildingVisualFactory with glTF/fallback` |
| `b712788` | Phase 4 | `assets: Phase 4 — trees refactored to use createSingleTree with glTF/fallback` |
| `7f63666` | Phase 5 | `assets: Phase 5 — goldmine strategy documented, already in factory/fallback architecture` |

### Remaining Risks

1. **glTF 材质/缩放不匹配**：放入 glB 后可能需要调整 `AssetCatalog.ts` 中的 scale/offsetY
2. **团队色**：当前依赖材质 name === 'team_color'，不同资产命名可能不同
3. **动画**：当前不加载/播放动画，只显示 T-pose 或默认姿态
4. **性能**：大量树木如果用 glTF clone 可能比共享几何体慢

### Next Theme

**下载 Quaternius 资产并实际接入** — 把下载的 glTF 放入 `public/assets/models/`，调整 scale/offsetY/team_color 材质映射，让人眼确认替换效果。
