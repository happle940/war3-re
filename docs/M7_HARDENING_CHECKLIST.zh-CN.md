# M7 Hardening Checklist

> 目的：在不改变玩家可见行为的前提下，降低长期工程风险。
> 这是工程收口清单，不是新的产品方向文档。

---

## 入口条件

- 主要行为合同已有 runtime 测试保护
- `Game.ts` 风险图已经完成
- 产品方向没有在此阶段发生根本改变
- 允许做零行为变化的抽取、边界整理和覆盖补洞

---

## 核心完成标准

### 1. 风险边界

- [ ] `Game.ts` 的主要子系统边界不再继续膨胀
- [ ] 高风险视觉/反馈逻辑已抽到独立模块
- [ ] 选择/放置等可机械抽取的子系统继续脱离主文件

### 2. 合同覆盖

- [ ] 命令系统关键路径有 deterministic regression packs
- [ ] 资源/供给/采矿饱和有 regression packs
- [ ] 路径/占地/死亡清理有 regression packs
- [ ] AI 开局与恢复行为有 regression packs
- [ ] 对局循环主状态转换有 regression packs

### 3. 发布前稳定性

- [ ] `npm run build`
- [ ] `npx tsc --noEmit -p tsconfig.app.json`
- [ ] `npm run test:runtime`
- [ ] cleanup 后没有本地 Vite / Playwright / Chromium 残留

### 4. 非目标

- [ ] 不借机重做产品方向
- [ ] 不借机改视觉品味
- [ ] 不用抽取名义偷改 gameplay semantics

---

## 备注

- `M7` 默认不需要用户确认，除非某个工程重构开始影响产品方向、开发速度或玩家可见行为。
