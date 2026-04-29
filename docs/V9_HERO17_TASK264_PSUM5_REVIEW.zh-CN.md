# V9 HERO17 Task264 PSUM-5 失败归因复核

> 生成时间：2026-04-17
> 队列来源：后台 Codex 独立队列任务 `V9-CX161`
> 结论性质：本复核只给 Task264 集成验收提供证据，不代表前台 Codex 已完成最终验收。
> 范围限制：未修改 `GameData.ts`、`Game.ts`、`SimpleAI.ts` 或任何 runtime 测试；未运行 Playwright / Vite / 浏览器。

---

## 1. 结论

建议：`split-fix`，但不把 PSUM-5 作为 Task264 的 Archmage Altar 暴露 blocker。

- 对 Task264：现有证据支持把 PSUM-5 归为 Paladin 旧夹具/旧断言问题，而不是 Archmage 暴露回归。Task264 可进入前台 Codex acceptance 的候选证据链，但最终 accept 仍由前台 Codex 决定。
- 对 PSUM-5：需要拆出独立 Paladin 测试夹具修复。它仍按 HERO7 早期语义断言“新召唤 Paladin 直接出现圣光术施法按钮”，但 HERO11 之后真实语义已经变成“新 Paladin 有 1 点技能点，先显示学习圣光术；学习后才显示圣光术施法按钮”。
- 对 Archmage 暴露：没有证据要求回滚或修复 `BUILDINGS.altar_of_kings.trains = ['paladin', 'archmage']`。该改动只扩展 Altar 英雄训练列表，不改变 Paladin 的 `abilityLevels`、Holy Light 学习门槛或 Paladin 命令卡分支。

---

## 2. PSUM-5 本来想证明什么

`tests/v9-hero6b-paladin-summon-runtime.spec.ts` 的 PSUM-5 名称是：

`Holy Light appears only on Paladin command card after HERO7`

它的原始证明目标是：

1. 通过 Altar 召唤 Paladin。
2. 训练完成后选择 Paladin。
3. Paladin 命令卡上存在 `圣光术`。
4. 再选择 Altar，证明 Altar 命令卡上不存在 `圣光术`。

这个目标在 HERO7 刚落地时成立：HERO7 打开的是 Holy Light 手动施法 runtime，所以旧测试把“Paladin command card has 圣光术”作为回归护栏。

但 HERO11 之后，Holy Light 进入技能学习链：

- 新 Paladin 出生时 `abilityLevels` 是空对象。
- 新 Paladin 有 `heroSkillPoints: 1`。
- 命令卡先显示 `学习圣光术 (Lv1)`。
- 只有 `abilityLevels.holy_light >= 1` 后，才显示 `圣光术 (Lv1)` 施法按钮。

因此 PSUM-5 的第一半已经不是当前产品语义。

---

## 3. 这次失败画面说明什么

已有错误上下文显示失败点是：

`expect(result.paladinHasHolyLight).toBe(true)` 收到 `false`。

页面快照停在 Altar 被重新选中后的状态：

- 面板标题是 `国王祭坛`。
- 命令卡只有 `集结点` 和禁用的 `圣骑士`。
- `圣骑士` 禁用原因是 `圣骑士已存活`。
- 命令卡没有 `圣光术`。

这个画面能说明两件事：

1. PSUM-5 的第二半“Altar 不显示 Holy Light”仍符合预期。
2. 失败来自前一段读取的 `paladinHasHolyLight=false`，也就是 Paladin 被选中时没有施法按钮。

这不是 stale `g.units` 读数问题：PSUM-5 在训练快进后重新从 `g.units` 查找 Paladin，再选择 Paladin 并同步调用 `g.updateHUD(0.016)` 后读取 DOM。问题不在旧单位数组快照，而在断言没有执行 HERO11 要求的学习步骤。

---

## 4. 为什么更像 Paladin 旧夹具

当前 `Game.ts` 的英雄出生路径在 `spawnUnit` 中初始化：

- `heroSkillPoints` 来自单位数据，Paladin / Archmage 初始为 1。
- `abilityLevels` 对英雄初始化为空对象 `{}`。

当前 `Game.ts` 的 Paladin 命令卡逻辑是：

- `primary.type === 'paladin'` 时读取 `primary.abilityLevels?.holy_light ?? 0`。
- 未学会时显示 `学习圣光术 (LvN)`。
- 只有 `learnedLevel >= 1` 时才 push `圣光术 (LvN)` 施法按钮。

相邻测试已经体现了这个新合同：

- `tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts` 的 SP-1 明确证明“新 Paladin 有学习按钮、没有施法按钮、不能施法”。
- `tests/v9-hero7-holy-light-runtime.spec.ts` 也已经补了 `learnHolyLightLv1` helper，先写入 `abilityLevels.holy_light = 1` 再断言 Holy Light 施法按钮。

PSUM-5 没有任何学习步骤，仍直接查找标签精确等于 `圣光术` 的按钮，所以在 HERO11 之后会自然失败。

---

## 5. Task264 是否可能影响 PSUM-5

Task264 的目标是 Archmage Altar 暴露：

- `BUILDINGS.altar_of_kings.trains` 从只含 `paladin` 扩展为 `['paladin', 'archmage']`。
- Archmage 复用英雄专用训练路径。
- Archmage 命令卡没有 Water Elemental / Brilliance Aura / Blizzard / Mass Teleport 等能力按钮。
- Paladin 训练入口和唯一性继续存在。

从静态差异看，Archmage 暴露会影响 Altar 选择时的英雄训练按钮循环，但不会影响 Paladin 单位被选中时的能力按钮分支。Paladin 是否显示 `圣光术` 只取决于 `primary.type === 'paladin'` 和 `primary.abilityLevels.holy_light`，与 Altar `trains` 数组里是否多一个 `archmage` 没有关联。

`tests/v9-hero17-archmage-altar-exposure.spec.ts` 的 AEXP-5 也专门覆盖了 Paladin 训练/唯一性不被 Archmage 暴露破坏。它证明的是 Paladin 能继续训练、唯一性禁用仍按 Paladin 生效；它不声称新 Paladin 已经学会 Holy Light。

所以 PSUM-5 红灯不应归因到 Task264。

---

## 6. 三种处理结论

### A. 可接受的旧失败

对 Task264 的 acceptance 证据链来说，可以把 PSUM-5 记录为“旧 Paladin 夹具与 HERO11 后语义不一致”的非 Archmage blocker。

但它不应被永久忽略。只要联合 runtime gate 仍包含 PSUM-5，这个红灯会继续污染后续验收，所以仍需要拆出修复。

### B. 需要修 Paladin 测试夹具

需要。最小文件范围：

- `tests/v9-hero6b-paladin-summon-runtime.spec.ts`

最小修复方向：

1. 在 PSUM-5 召唤并选中 Paladin 后，先通过命令卡点击 `学习圣光术 (Lv1)`，或复用 HERO7 测试里的等价 helper 让 `abilityLevels.holy_light = 1`。
2. 重新选择 Paladin 并刷新 HUD。
3. 断言 Paladin 命令卡存在 `圣光术 (Lv1)` 或以 `startsWith('圣光术')` 匹配施法按钮。
4. 保留 Altar 不显示 `圣光术` 的断言。

这属于测试夹具修复，不需要修改 Paladin runtime。

### C. 需要回滚/修复 Archmage 暴露

不需要。现有静态证据没有显示 Task264 改动会导致 Paladin Holy Light 施法按钮消失。回滚 `archmage` Altar 暴露不能修复 PSUM-5 的真实断言问题；最多只是掩盖联合验收中的旧失败。

---

## 7. 建议的最小后续命令

当前任务已禁止 runtime，所以这里只列出后续 split-fix 或前台验收可以运行的最小命令。

Paladin 夹具修复后：

```bash
git diff --check -- tests/v9-hero6b-paladin-summon-runtime.spec.ts
npm run build
npm run typecheck
./scripts/run-runtime-tests.sh tests/v9-hero6b-paladin-summon-runtime.spec.ts tests/v9-hero17-archmage-altar-exposure.spec.ts --reporter=list
```

如果前台 Codex 只复核 Task264 的 Archmage 暴露，不修 PSUM-5：

```bash
npm run build
npm run typecheck
./scripts/run-runtime-tests.sh tests/v9-hero17-archmage-altar-exposure.spec.ts --reporter=list
```

---

## 8. 本任务边界

- 本文档是后台 Codex 独立队列任务的归因记录。
- 本文档不接受 `docs/GLM_READY_TASK_QUEUE.md` 中的 Task264。
- 本文档不代表前台 Codex 已完成 Task264 最终验收。
- 本文档没有运行 runtime，也没有修改任何生产代码或测试代码。
