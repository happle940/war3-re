# M4 系统问题抽象

> 目的：把用户试玩反馈抽象为系统缺口，避免继续按单个现象做局部 patch。

## 1. 最新反馈不是三个 bug

用户反馈：

1. 多个农民一起采矿时，金矿难选中/难右键到。
2. 当前金矿与基地距离、农民移动速度、采矿节奏不像 Warcraft III 的 5 农民饱和规律。
3. Codex 与 GLM 仍会互等，缺少真正独立并行的任务拆分。

这些问题分别落在三类系统缺口：

| 表面问题 | 系统归类 | 本质问题 |
|---|---|---|
| 金矿被农民遮挡，难选中 | S1 命令目标解析 / S4 实体可交互性 | 右键命令目标仍按 raycaster 第一命中处理，没有“玩家意图优先级”和“资源/建筑命令 hit target”概念 |
| 5 个农民采矿节奏不对 | S5 经济标定 / M3 尺度标定 | 地图距离、单位速度、采集时间、携带量、矿点排队不是一套统一经济模型 |
| Codex/GLM 互等 | 执行架构 / 队列系统 | 任务按文件或 bug 切，而不是按可独立验证的系统泳道切 |

## 2. 系统一：Command Target Resolver

### 当前症状

农民围在金矿附近时，玩家想点金矿，但 raycaster 第一命中可能是农民、旗帜、建筑子 mesh 或其他遮挡对象。当前 `handleRightClick()` 只取 `intersectObjects()[0]`，因此玩家意图会被几何遮挡劫持。

### 正确抽象

右键命令不应该等同于“第一命中的 Object3D”。

它应该是：

```text
selected units + all raycast hits + command context -> intended command target
```

例如：

- 选中 worker，hit list 里包含 goldmine：优先 goldmine 采集。
- 选中 footman，hit list 里包含 goldmine：不能采集，移动到矿旁。
- 选中战斗单位，hit list 里包含敌方单位：攻击敌方单位。
- 选中单位，hit list 只有己方单位/己方建筑：根据目标类型决定跟随/移动/续建。
- 左键选择可以仍然按可见第一命中；右键命令应使用命令语义优先级。

### 下一步

GLM Task25 已加入 `Crowded goldmine targetability`：

- 5 个 worker 围绕 goldmine。
- 选中 idle worker。
- 通过 live-like raycaster + `handleRightClick()` 点金矿可视区域。
- 断言 worker 进入采矿语义，不能退化成 move 到某个 worker。

如果失败，最小产品修复应在 `handleRightClick()` 增加右键目标解析策略，而不是改左键选择或改模型。

## 3. 系统二：Mining Saturation Benchmark

### 当前症状

玩家感觉金矿、基地、农民速度之间的比例不对。

这不是“把金矿挪近一点”能解决的问题。Warcraft III 的经济感来自一组联动参数：

- town hall 与 gold mine 的边缘距离。
- worker 移动速度。
- worker 每趟携带量。
- mine 内采集时间。
- 返程交付点。
- 矿点入口/排队规则。
- 5 个 worker 饱和后，第 6 个 worker 不应显著提高 gold/sec。

### 外部基准

当前可作为方向性基准：

- Blizzard Classic Battle.net Peasant 页面：Human Peasant 金矿建议上限是 5 个，且农民可以右键未完成建筑参与加速建造。
- Blizzard Classic Battle.net Rookie Mistakes：Human/Orc 金矿通常 5 个 worker 是最大有效采矿数；基地离矿过远时可能需要 6-7 个。
- Blizzard Classic Battle.net Economy：Night Elf / Undead 每矿 5 个；Human / Orc 若 Town Hall 离矿太远，可能需要超过 5 个。
- Liquipedia Gold Mine：每个 worker 采 10 gold 需要约 5 秒；基地距离合适时，Human/Orc 超过 5 个 worker 不提高效率。

### 当前项目已知参数

当前代码：

- `GOLD_GATHER_TIME = 5`
- `LUMBER_GATHER_TIME = 3`
- `GOLD_PER_TRIP = 10`
- worker speed = `3.5`
- 默认 Town Hall：tile `(10,12)`，size `4`
- 默认 Gold Mine：tile `(15,8)`，size `3`

问题是这些参数没有被一个“5 worker 饱和合同”统一约束。

### 下一步 Codex 独立泳道

Codex 应建立 `Mining Saturation Benchmark`，不与 GLM Task25 冲突：

- 新建 runtime spec，例如 `tests/mining-saturation-regression.spec.ts`。
- 测量 1/2/3/4/5/6 workers 在固定时间窗口内的 gold income。
- 验收方向：
  - 5 workers 明显高于 4 workers。
  - 6 workers 不应显著高于 5 workers。
  - 初始 TH-GM 距离下，5 workers 应接近饱和。
- 如果不满足，再调整距离、速度、采集时间或矿点排队规则。

不能先靠肉眼挪位置。

## 4. 系统三：Dual-Agent Independent Workstreams

### 当前症状

Codex 等 GLM，或 GLM 等 Codex。

### 正确抽象

并行不是“两个 agent 同时在一个任务里干”，而是：

```text
一个产品里程碑 -> 两条互不写同一文件的系统泳道 -> 各自验证 -> Codex 集成
```

### 下一阶段分工

#### GLM 泳道：Command Surface Matrix

职责：

- 写 `tests/command-surface-regression.spec.ts`。
- 覆盖右键目标矩阵、命令卡禁用原因、塔武器 HUD 可读性。
- 允许最小修改 `src/game/Game.ts`。

禁止：

- 采矿经济参数。
- 地图/镜头/视觉。
- AI。

#### Codex 泳道：Mining Saturation Benchmark

职责：

- 定义 5 worker 饱和合同。
- 量化当前 gold/sec 曲线。
- 判断是距离、速度、采集时间还是缺少矿点排队导致问题。

禁止：

- 改 `tests/command-surface-regression.spec.ts`。
- 抢 GLM 的 `Game.ts` right-click target resolver 修改，除非 GLM 完成后由 Codex review。

## 5. 需要用户确认的点

当前不需要用户确认。

下一次需要用户确认的是大里程碑试玩，不是工程拆分：

1. 金矿是否容易点中。
2. 5 农民采矿是否感觉接近 War3。
3. 农民绕矿/回基地路径是否自然。
4. 命令卡是否能解释“为什么点不了”。
5. 5-10 分钟人机流程是否从“可运行”变成“能玩”。

在这些之前，Codex 和 GLM 应继续推进可自动验证的系统合同。
