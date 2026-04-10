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

(后续 phase 逐个追加)

---

## Decisions Taken Without User Confirmation

(Phase 进行中记录)

---

## Morning Handoff

(Phase 8 完成后填写)
