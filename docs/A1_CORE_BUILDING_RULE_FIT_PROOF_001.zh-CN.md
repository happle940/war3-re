# A1 核心建筑规则适配 Proof 001

> 日期：2026-04-16  
> 分支：`codex/asset-public-share`  
> 依据：`docs/A1_CORE_BUILDING_TEAM_MARKER_CONCEPTS_001.zh-CN.md`  
> 目的：验证 Quaternius 核心建筑候选是否能放进当前游戏规则表面：footprint、选择圈、血条、工人靠近、树线重复摆放、塔射程。  
> 边界：这是 artifact proof，不批准 runtime 导入，不修改 `public/assets`，不修改 `AssetCatalog`。

## 0. 本次结论

```text
approved-for-import: none
rule-fit proof: passed with scale tuning
runtime asset changes: none
```

预览图：

```text
artifacts/asset-intake/preview/quaternius-rule-fit-proof.png
```

机器记录：

```text
docs/A1_CORE_BUILDING_RULE_FIT_PROOF_001.json
artifacts/asset-intake/preview/quaternius-rule-fit-proof.metrics.json
```

Playwright 校验结果：

- 页面加载成功。
- 6 组 proof 全部加载成功。
- 预览 failure 为 0。
- canvas 非空采样通过。
- footprint fit 最终为 6/6。

## 1. 这次证明了什么

这张 proof 把 Quaternius 候选从“静态好看”推进到“可以继续进入 runtime 导入包准备”：

| 规则表面 | Proof 内容 | 当前判断 |
| --- | --- | --- |
| footprint | 使用当前 runtime size：Town Hall 4、Barracks 3、Farm 2、Goldmine 3、Tower 2 | 最终 6/6 fit。 |
| selection ring | 每个候选都有黄色选择圈 | 位置可读，没有明显漂移。 |
| healthbar | 每个候选都有红色血条锚点 | 可放，但后续要在真实 HUD 下复核。 |
| Goldmine worker lane | Mine + Resource Gold 旁边有 worker approach lane | 静态路径可读，仍需真实采集循环证明。 |
| Tree line | `Trees` 做 7 组重复摆放 | 可形成资源边界，仍需遮挡和采木 proof。 |
| Tower range | Watch Tower 带射程圈、攻击起点、目标线 | 方向可行，仍需真实 projectile spawn proof。 |

## 2. 暴露出来的缩放风险

第一次按粗略比例放置时，有几类轻微溢出。最终 proof 已经通过缩放收口，但这些风险必须写进后续导入包：

| 类别 | 原始风险 | 收口后结果 | 结论 |
| --- | --- | --- | --- |
| Town Hall | 初始 bbox 比 size 4 footprint 宽约 0.24、深约 0.20 | final scale 从 `2.7220` 收到 `2.5299` 后 fit | 主基地可用，但 scale 不能照预览页裸用。 |
| Barracks | 初始 bbox 比 size 3 footprint 宽约 0.10 | final scale 从 `1.5076` 收到 `1.4369` 后 fit | 兵营可用，导入时需要轻微缩小。 |
| Farm | 初始 bbox 比 size 2 footprint 宽约 0.07、深约 0.11 | final scale 从 `0.8701` 收到 `0.8123` 后 fit | 农场可用，必须控制体量。 |
| Goldmine | 无 footprint 溢出 | 原比例 fit | 矿洞主体尺寸最稳，但采集点还没验证。 |
| Tower | 无 footprint 溢出 | 原比例 fit | 塔尺寸稳，但攻击点和射程要进 runtime proof。 |
| Tree line | 重复摆放经收口后 fit | 7 组树线 fit | 可做资源边界，但要继续测 worker 遮挡。 |

## 3. 产品判断

这次的结论比上一轮更接近落地：

```text
Quaternius 核心建筑可以继续进入导入包准备，但必须使用 proof 里的缩放收口方案。
```

仍然不能导入，因为当前只证明了视觉和规则表面的静态适配，还没有证明真实游戏生命周期：

- 建造、取消、续建、训练、集结点还没跑。
- Goldmine 的真实采集循环还没跑。
- Tower 的真实攻击、目标选择、弹道起点还没跑。
- GLB 加载失败时回退 S0 fallback 还没跑。
- marker 是 runtime child object 还是 baked GLB 还没定。

## 4. 下一步门槛

下一张证据应该从 artifact preview 进入 runtime smoke：

1. 做 GLB load-failure fallback proof：候选 GLB 不存在或加载失败时，仍然回到 S0 proxy。
2. 做 Goldmine 真实采集 proof：worker 能靠近、采集、回收，不被 Mine body / Resource Gold accent 挡住。
3. 做 Tower 真实攻击 proof：projectile spawn、射程、目标选择不因模型高度变化漂移。
4. 做 Town Hall / Barracks / Farm 建造与选择 smoke：选中、血条、建造中状态、rally 不坏。

这些完成前，Quaternius 仍然保持：

```text
approved-for-intake, not approved-for-import
```
