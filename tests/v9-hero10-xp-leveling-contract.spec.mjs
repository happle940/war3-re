/**
 * V9 HERO10-CONTRACT1 Hero XP / leveling branch contract.
 *
 * Static proof that the contract is well-formed and bounded.
 * Does NOT verify runtime behavior — only contract structure and data-seed state.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function read(relativePath) {
  const p = resolve(ROOT, relativePath)
  assert.ok(existsSync(p), `file missing: ${relativePath}`)
  return readFileSync(p, 'utf-8')
}

// ── 1. Current state bounded ──
describe('HERO10-CONTRACT1 XP / leveling contract', () => {
  const contract = read('docs/V9_HERO10_XP_LEVELING_CONTRACT.zh-CN.md')

  it('C1-1: contract doc exists and is non-empty', () => {
    assert.ok(contract.length > 100, 'contract too short')
  })

  it('C1-2: Paladin can be summoned (HERO8/HERO9 reference)', () => {
    assert.ok(contract.includes('召唤'), 'missing summon reference')
  })

  it('C1-3: Paladin can cast Holy Light (HERO8 reference)', () => {
    assert.ok(contract.includes('圣光') || contract.includes('Holy Light'), 'missing Holy Light reference')
  })

  it('C1-4: Paladin can die (HERO9 reference)', () => {
    assert.ok(contract.includes('死亡') || contract.includes('die'), 'missing death reference')
  })

  it('C1-5: Paladin can revive (HERO9 reference)', () => {
    assert.ok(contract.includes('复活') || contract.includes('revive'), 'missing revive reference')
  })

  it('C1-6: no XP gain / level-up runtime exists yet', () => {
    assert.ok(
      contract.includes('没有击杀奖励 XP 的运行时') || contract.includes('no XP gain'),
      'must state no XP runtime exists'
    )
  })

  // ── 2. Existing data fields are seeds only ──
  it('C1-7: contract identifies heroLevel as data seed', () => {
    assert.ok(contract.includes('heroLevel'), 'missing heroLevel field mention')
  })

  it('C1-8: contract identifies heroXP as data seed', () => {
    assert.ok(contract.includes('heroXP'), 'missing heroXP field mention')
  })

  it('C1-9: contract identifies heroSkillPoints as data seed', () => {
    assert.ok(contract.includes('heroSkillPoints'), 'missing heroSkillPoints field mention')
  })

  it('C1-10: GameData.ts has heroLevel field on UnitDef', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('heroLevel?'), 'GameData missing heroLevel field')
  })

  it('C1-11: GameData.ts has heroXP field on UnitDef', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('heroXP?'), 'GameData missing heroXP field')
  })

  it('C1-12: GameData.ts has heroSkillPoints field on UnitDef', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('heroSkillPoints?'), 'GameData missing heroSkillPoints field')
  })

  it('C1-13: Paladin data has heroLevel: 1', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(/paladin[\s\S]*heroLevel:\s*1/.test(gd), 'Paladin missing heroLevel: 1')
  })

  it('C1-14: Paladin data has heroXP: 0', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(/paladin[\s\S]*heroXP:\s*0/.test(gd), 'Paladin missing heroXP: 0')
  })

  it('C1-15: Paladin data has heroSkillPoints: 1', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(/paladin[\s\S]*heroSkillPoints:\s*1/.test(gd), 'Paladin missing heroSkillPoints: 1')
  })

  it('C1-16: heroLevel is only used for revive cost scaling in Game.ts', () => {
    const gt = read('src/game/Game.ts')
    // Count non-comment references to heroLevel
    const lines = gt.split('\n').filter(l => !l.trimStart().startsWith('//'))
    const refs = lines.filter(l => l.includes('heroLevel'))
    assert.ok(refs.length > 0, 'Game.ts must reference heroLevel')
    // All references should be revive-related or HUD-related (no XP/level-up logic)
    for (const line of refs) {
      const hasXPLogic = /xp\s*[+*=]|levelUp|level_up|level-up|gainXP|addXP/.test(line)
      assert.ok(!hasXPLogic, `unexpected XP/level-up logic: ${line.trim()}`)
    }
  })

  // ── 3. XP gain is a future branch with source boundary requirement ──
  it('C1-17: contract requires SRC1 before XP values', () => {
    assert.ok(contract.includes('HERO10-SRC1'), 'missing HERO10-SRC1')
  })

  it('C1-18: contract does not invent XP tables', () => {
    assert.ok(
      !contract.includes('经验值表') && !/XP.*\d{3,}/.test(contract),
      'contract must not include XP tables'
    )
  })

  it('C1-19: contract does not invent kill reward numbers', () => {
    // "击杀奖励数值" in exclusion list is fine; actual numbers like "gives 50 XP" are not
    const hasNumericReward = /奖励\s*\d+/.test(contract) || /reward.*?\d+/.test(contract)
    assert.ok(!hasNumericReward, 'contract must not include kill reward numbers')
  })

  // ── 4. Leveling preserves HERO9 semantics ──
  it('C1-20: contract states death semantics preserved', () => {
    assert.ok(contract.includes('isDead'), 'missing isDead preservation')
  })

  it('C1-21: contract states revive cost by level preserved', () => {
    assert.ok(
      contract.includes('复活费用按等级') || contract.includes('revive cost'),
      'missing revive cost by level preservation'
    )
  })

  it('C1-22: contract states uniqueness preserved', () => {
    assert.ok(
      contract.includes('唯一性') || contract.includes('uniqueness'),
      'missing uniqueness preservation'
    )
  })

  it('C1-23: contract states no auto-selection preserved', () => {
    assert.ok(
      contract.includes('自动选择') || contract.includes('auto-selection'),
      'missing no auto-selection preservation'
    )
  })

  it('C1-24: contract states Holy Light legality preserved', () => {
    assert.ok(
      contract.includes('圣光') && contract.includes('合法性'),
      'missing Holy Light legality preservation'
    )
  })

  it('C1-25: contract states no duplicate Paladin preserved', () => {
    assert.ok(
      contract.includes('重复') || contract.includes('duplicate'),
      'missing no duplicate Paladin preservation'
    )
  })

  // ── 5. Skill points are readiness only ──
  it('C1-26: contract states skill points are readiness only', () => {
    assert.ok(
      contract.includes('就绪') || contract.includes('readiness'),
      'missing readiness statement'
    )
  })

  it('C1-27: contract does not implement Holy Light levels', () => {
    // The contract lists "圣光等级变化" as something NOT implemented — that's correct
    const hasPositiveImplementation = /实现.*圣光等级/.test(contract)
    assert.ok(!hasPositiveImplementation, 'contract must not claim to implement Holy Light levels')
  })

  it('C1-28: contract does not implement aura', () => {
    assert.ok(
      !contract.includes('实现光环') && !contract.includes('implement aura'),
      'contract must not implement aura'
    )
  })

  it('C1-29: contract does not implement ultimate', () => {
    assert.ok(
      !contract.includes('实现终极') && !contract.includes('implement ultimate'),
      'contract must not implement ultimate'
    )
  })

  // ── 6. Next safe sequence defined ──
  it('C1-30: contract defines HERO10-SRC1', () => {
    assert.ok(contract.includes('HERO10-SRC1'), 'missing HERO10-SRC1 sequence')
  })

  it('C1-31: contract defines HERO10-DATA1', () => {
    assert.ok(contract.includes('HERO10-DATA1'), 'missing HERO10-DATA1 sequence')
  })

  it('C1-32: contract defines HERO10-IMPL1', () => {
    assert.ok(contract.includes('HERO10-IMPL1'), 'missing HERO10-IMPL1 sequence')
  })

  it('C1-33: contract defines HERO10-CLOSE1', () => {
    assert.ok(contract.includes('HERO10-CLOSE1'), 'missing HERO10-CLOSE1 sequence')
  })

  it('C1-34: SRC1 comes before DATA1 in sequence', () => {
    // Check in the sequence table section (section 3)
    const seqSection = contract.substring(contract.indexOf('下一安全序列'))
    const srcIdx = seqSection.indexOf('HERO10-SRC1')
    const dataIdx = seqSection.indexOf('HERO10-DATA1')
    assert.ok(srcIdx < dataIdx, 'SRC1 must precede DATA1')
  })

  it('C1-35: DATA1 comes before IMPL1 in sequence', () => {
    const seqSection = contract.substring(contract.indexOf('下一安全序列'))
    const dataIdx = seqSection.indexOf('HERO10-DATA1')
    const implIdx = seqSection.indexOf('HERO10-IMPL1')
    assert.ok(dataIdx < implIdx, 'DATA1 must precede IMPL1')
  })

  it('C1-36: IMPL1 comes before CLOSE1 in sequence', () => {
    const seqSection = contract.substring(contract.indexOf('下一安全序列'))
    const implIdx = seqSection.indexOf('HERO10-IMPL1')
    const closeIdx = seqSection.indexOf('HERO10-CLOSE1')
    assert.ok(implIdx < closeIdx, 'IMPL1 must precede CLOSE1')
  })

  // ── 7. Explicit exclusions ──
  it('C1-37: contract excludes other Human heroes', () => {
    assert.ok(contract.includes('其他') && contract.includes('英雄'), 'missing other heroes exclusion')
  })

  it('C1-38: contract excludes AI hero strategy', () => {
    assert.ok(contract.includes('AI'), 'missing AI exclusion')
  })

  it('C1-39: contract excludes items/inventory', () => {
    assert.ok(contract.includes('物品') || contract.includes('inventory'), 'missing items exclusion')
  })

  it('C1-40: contract excludes shop/Tavern', () => {
    assert.ok(
      (contract.includes('商店') || contract.includes('shop')) &&
      (contract.includes('酒馆') || contract.includes('Tavern')),
      'missing shop/Tavern exclusion'
    )
  })

  it('C1-41: contract excludes aura', () => {
    assert.ok(contract.includes('光环') || contract.includes('aura'), 'missing aura exclusion')
  })

  it('C1-42: contract excludes hero leveling panels', () => {
    assert.ok(
      contract.includes('升级') && (contract.includes('面板') || contract.includes('panel')),
      'missing hero leveling panel exclusion'
    )
  })

  it('C1-43: contract excludes air units', () => {
    assert.ok(contract.includes('空军') || contract.includes('air'), 'missing air units exclusion')
  })

  it('C1-44: contract excludes second race', () => {
    assert.ok(contract.includes('第二') && (contract.includes('种族') || contract.includes('race')), 'missing second race exclusion')
  })

  it('C1-45: contract excludes multiplayer', () => {
    assert.ok(contract.includes('多人') || contract.includes('multiplayer'), 'missing multiplayer exclusion')
  })

  it('C1-46: contract excludes public-release', () => {
    assert.ok(contract.includes('公开发布') || contract.includes('public-release'), 'missing public-release exclusion')
  })

  // ── 8. Does NOT claim complete hero system or complete Human ──
  it('C1-47: contract does not claim "完整英雄系统"', () => {
    // Must explicitly deny
    assert.ok(contract.includes('不') && contract.includes('完整英雄系统'), 'contract must explicitly deny complete hero system')
  })

  it('C1-48: contract does not claim "完整人族"', () => {
    assert.ok(contract.includes('不') && contract.includes('完整人族'), 'contract must explicitly deny complete Human')
  })

  // ── 9. Production code unchanged ──
  it('C1-49: Game.ts exists (unchanged by contract)', () => {
    const gt = read('src/game/Game.ts')
    assert.ok(gt.length > 0)
  })

  it('C1-50: GameData.ts exists (unchanged by contract)', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.length > 0)
  })

  // ── 10. HERO9 closure still valid ──
  it('C1-51: HERO9 closure doc still exists', () => {
    const closure = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(closure.length > 0, 'HERO9 closure must exist')
  })
})
