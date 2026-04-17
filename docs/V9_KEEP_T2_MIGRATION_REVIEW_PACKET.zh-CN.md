# V9 Keep/T2 建筑解锁迁移复核包

> 用途：Task127 完成后，Codex 用这份清单判断能不能接受。  
> 目标不是扩大二本内容，而是验证 Workshop / Arcane Sanctum 是否真的迁移到 Keep 门槛。

## 1. 本次只验收什么

本次只验收一件事：

```text
Workshop 和 Arcane Sanctum 的建造门槛从旧状态迁移到 completed Keep。
```

旧状态：

- Workshop：没有 `techPrereq`。
- Arcane Sanctum：`techPrereq: 'barracks'`。

目标状态：

- Workshop：`techPrereq: 'keep'`。
- Arcane Sanctum：`techPrereq: 'keep'`。
- Peasant build menu 仍能看到这两个按钮；没有 Keep 时按钮禁用，有 Keep 后可用。

## 2. 必须拒收的情况

出现任意一条，Task127 不能接受：

- 只改测试，不改 `src/game/GameData.ts` 的真实生产数据。
- 继续用 monkey patch 模拟 Keep gate，当成最终证明。
- 把断言从“必须 Keep”弱化成“有任意建筑即可”或“按钮存在即可”。
- 为了让测试过，把 Workshop、Mortar、Arcane Sanctum、Priest 从菜单或 proof 里删掉。
- 顺手加 Castle、Knight、英雄、物品、飞行单位、新科技或素材。
- 改 Town Hall -> Keep 升级流程本身。
- 改 AI 完整二本策略，而不是复用 Task126 的最小 Keep 升级能力。
- runtime proof 使用旧的 `g.units` 快照，不在建造、升级、清理后重新读取 fresh state。

## 3. 复核矩阵

| 维度 | 必须看到的证据 | 不能接受的替代品 |
| --- | --- | --- |
| 生产数据 | `BUILDINGS.workshop.techPrereq === 'keep'`；`BUILDINGS.arcane_sanctum.techPrereq === 'keep'` | 文档说要迁移，但 GameData 没变 |
| 命令卡 | 没有 completed Keep 时，worker 命令卡中 Workshop / Arcane Sanctum 禁用，原因包含 `主城` | 只检查按钮存在 |
| 解锁行为 | 生成或升级出 completed Keep 后，两类建筑 availability 变为 ok | 用 Barracks / Blacksmith 代替 Keep |
| V7 内容保活 | 拥有 Keep 的 fixture 里，Workshop / Mortar 和 Arcane / Priest 仍能训练或使用 | 删掉 V7 proof 或跳过相关断言 |
| V9 baseline | baseline smoke 若覆盖 V7 内容，fixture 必须显式提供 Keep | 让 baseline 不再覆盖相关内容 |
| 边界 | Castle / Knight / 新素材仍不存在 | “顺手补完整二本” |

## 4. 本地复验命令

Codex 复核时至少运行：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v7-workshop-mortar-combat-model-proof.spec.ts tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-baseline-replay-smoke.spec.ts --reporter=list
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

运行完必须检查本地残留：

```bash
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep'
```

## 5. 接受结论模板

```text
Task127 acceptance:
- Data migration: pass/fail
- Command card gate: pass/fail
- Runtime unlock after Keep: pass/fail
- V7 content still reachable: pass/fail
- Baseline still green: pass/fail
- Boundary check: pass/fail
- Cleanup/no leftovers: pass/fail
- Verdict: accepted / rejected / Codex takeover
```

## 6. 下一张任务边界

如果 Task127 accepted，下一张不能直接跳完整二本。更安全的相邻任务是二选一：

- 用户可见反馈：升级主城时的进度、完成提示、解锁说明、命令卡原因更清楚。
- 数值账本对齐：Keep、Workshop、Arcane、Mortar、Priest 的成本、时间、人口、科技层级和当前 War3-like 差距记录。

除非用户明确改方向，否则不从 Task127 直接跳 Castle / Knight / 英雄 / 第二阵营。
