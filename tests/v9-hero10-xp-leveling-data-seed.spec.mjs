/**
 * V9 HERO10-DATA1 XP / leveling data seed.
 *
 * Static proof that HERO_XP_RULES exists in GameData.ts with all
 * source-bounded values exactly matching Task220. After HERO10-IMPL1,
 * Game.ts is expected to import the rules while Paladin seed fields remain unchanged.
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

function extractHeroXpRules(source) {
  const start = source.indexOf('export const HERO_XP_RULES')
  assert.ok(start >= 0, 'HERO_XP_RULES export is missing')
  const end = source.indexOf('// ===== 建造菜单', start)
  assert.ok(end > start, 'HERO_XP_RULES block must stay before build menu')
  return source.slice(start, end)
}

function extractInlineMap(source, fieldName) {
  const match = source.match(new RegExp(`${fieldName}:\\s*\\{([^}]+)\\}`))
  assert.ok(match, `missing ${fieldName} map`)
  return match[1]
}

// ── Expected values from SRC1 ──
const XP_THRESHOLDS = { 1: 0, 2: 200, 3: 500, 4: 900, 5: 1400, 6: 2000, 7: 2700, 8: 3500, 9: 4400, 10: 5400 }
const HERO_KILL_XP = { 1: 100, 2: 120, 3: 160, 4: 220, 5: 300, 6: 400, 7: 500, 8: 600, 9: 700, 10: 800 }
const CREEP_XP_RATE = { 1: 0.8, 2: 0.7, 3: 0.62, 4: 0.55, 5: 0 }
const NORMAL_UNIT_XP = { 1: 25, 2: 40, 3: 60, 4: 85, 5: 115, 6: 150, 7: 190, 8: 235, 9: 285, 10: 340 }

describe('HERO10-DATA1 XP / leveling data seed', () => {
  const gd = read('src/game/GameData.ts')
  const doc = read('docs/V9_HERO10_XP_LEVELING_DATA_SEED.zh-CN.md')
  const xpRules = extractHeroXpRules(gd)
  const xpThresholdMap = extractInlineMap(xpRules, 'xpThresholdsByLevel')
  const heroKillXpMap = extractInlineMap(xpRules, 'heroKillXpByLevel')
  const creepXpRateMap = extractInlineMap(xpRules, 'creepXpRateByHeroLevel')
  const normalUnitXpMap = extractInlineMap(xpRules, 'normalUnitXpByLevel')

  // ── 1. HERO_XP_RULES exported ──
  it('D1-1: GameData.ts exports HERO_XP_RULES', () => {
    assert.ok(gd.includes('export const HERO_XP_RULES'), 'missing HERO_XP_RULES export')
  })

  it('D1-2: HERO_XP_RULES is near HERO_REVIVE_RULES', () => {
    const reviveIdx = gd.indexOf('export const HERO_REVIVE_RULES')
    const xpIdx = gd.indexOf('export const HERO_XP_RULES')
    assert.ok(reviveIdx > 0, 'HERO_REVIVE_RULES must exist')
    assert.ok(xpIdx > reviveIdx, 'HERO_XP_RULES must appear after HERO_REVIVE_RULES')
  })

  // ── 2. All source values present exactly ──
  it('D1-3: maxHeroLevel is 10', () => {
    assert.ok(/maxHeroLevel:\s*10/.test(xpRules), 'missing maxHeroLevel: 10')
  })

  for (const [level, xp] of Object.entries(XP_THRESHOLDS)) {
    it(`D1-4-${level}: xpThresholdsByLevel[${level}] = ${xp}`, () => {
      assert.ok(
        new RegExp(`\\b${level}:\\s*${xp}\\b`).test(xpThresholdMap),
        `missing xpThresholds level ${level}: ${xp}`
      )
    })
  }

  for (const [level, xp] of Object.entries(HERO_KILL_XP)) {
    it(`D1-5-${level}: heroKillXpByLevel[${level}] = ${xp}`, () => {
      assert.ok(
        new RegExp(`\\b${level}:\\s*${xp}\\b`).test(heroKillXpMap),
        `missing heroKillXp level ${level}: ${xp}`
      )
    })
  }

  for (const [level, rate] of Object.entries(CREEP_XP_RATE)) {
    it(`D1-6-${level}: creepXpRateByHeroLevel[${level}] = ${rate}`, () => {
      assert.ok(
        new RegExp(`\\b${level}:\\s*${String(rate).replace('.', '\\.')}\\b`).test(creepXpRateMap),
        `missing creepXpRate level ${level}: ${rate}`
      )
    })
  }

  for (const [level, xp] of Object.entries(NORMAL_UNIT_XP)) {
    it(`D1-7-${level}: normalUnitXpByLevel[${level}] = ${xp}`, () => {
      assert.ok(
        new RegExp(`\\b${level}:\\s*${xp}\\b`).test(normalUnitXpMap),
        `missing normalUnitXp level ${level}: ${xp}`
      )
    })
  }

  it('D1-8: initialSkillPoints is 1', () => {
    assert.ok(/initialSkillPoints:\s*1/.test(xpRules), 'missing initialSkillPoints: 1')
  })

  it('D1-9: skillPointsPerLevel is 1', () => {
    assert.ok(/skillPointsPerLevel:\s*1/.test(xpRules), 'missing skillPointsPerLevel: 1')
  })

  it('D1-10: ultimateRequiredLevel is 6', () => {
    assert.ok(/ultimateRequiredLevel:\s*6/.test(xpRules), 'missing ultimateRequiredLevel: 6')
  })

  // ── 3. Game.ts imports HERO_XP_RULES after IMPL1 wires runtime consumption ──
  it('D1-11: Game.ts imports HERO_XP_RULES', () => {
    const gt = read('src/game/Game.ts')
    assert.ok(gt.includes('HERO_XP_RULES'), 'Game.ts must import HERO_XP_RULES after IMPL1')
  })

  // ── 4. Paladin seed fields unchanged ──
  it('D1-12: Paladin heroLevel still 1', () => {
    assert.ok(/paladin[\s\S]*heroLevel:\s*1/.test(gd), 'Paladin heroLevel must remain 1')
  })

  it('D1-13: Paladin heroXP still 0', () => {
    assert.ok(/paladin[\s\S]*heroXP:\s*0/.test(gd), 'Paladin heroXP must remain 0')
  })

  it('D1-14: Paladin heroSkillPoints still 1', () => {
    assert.ok(/paladin[\s\S]*heroSkillPoints:\s*1/.test(gd), 'Paladin heroSkillPoints must remain 1')
  })

  // ── 5. HERO_REVIVE_RULES still exists ──
  it('D1-15: HERO_REVIVE_RULES still exists', () => {
    assert.ok(gd.includes('export const HERO_REVIVE_RULES'), 'HERO_REVIVE_RULES must still exist')
  })

  it('D1-16: HERO_REVIVE_RULES unchanged (goldBaseFactor check)', () => {
    assert.ok(/goldBaseFactor:\s*0\.40/.test(gd), 'HERO_REVIVE_RULES goldBaseFactor must be unchanged')
  })

  // ── 6. Data-seed doc says runtime deferred ──
  it('D1-17: data-seed doc states runtime is deferred', () => {
    assert.ok(doc.includes('延后') || doc.includes('deferred'), 'doc must state runtime deferred')
  })

  it('D1-18: data-seed doc does not claim complete hero system', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'doc must explicitly deny complete hero system')
  })

  it('D1-19: data-seed doc does not claim complete Human', () => {
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'doc must explicitly deny complete Human')
  })

  // ── 7. Data matches SRC1 exactly ──
  it('D1-20: xpThresholds matches SRC1 formula (50*(l^2+l-2))', () => {
    for (let level = 2; level <= 10; level++) {
      const expected = 50 * (level * level + level - 2)
      assert.strictEqual(XP_THRESHOLDS[level], expected, `threshold mismatch at level ${level}`)
    }
  })

  it('D1-21: normalUnitXp formula validates (F(x) = F(x-1) + 5x + 5)', () => {
    const vals = [25]
    for (let x = 2; x <= 10; x++) vals.push(vals[x - 2] + 5 * x + 5)
    for (let i = 0; i < 10; i++) {
      assert.strictEqual(vals[i], NORMAL_UNIT_XP[i + 1], `unit XP mismatch at level ${i + 1}`)
    }
  })

  it('D1-22: heroKillXp validates (300 + 100*(level-5) for level 5+)', () => {
    for (let level = 5; level <= 10; level++) {
      assert.strictEqual(HERO_KILL_XP[level], 300 + 100 * (level - 5), `hero kill XP mismatch at level ${level}`)
    }
  })

  // ── 8. Data-seed doc states IMPL1 scope ──
  it('D1-23: doc states IMPL1 starts with enemy non-building unit kills', () => {
    assert.ok(
      doc.includes('非建筑单位击杀') || doc.includes('non-building'),
      'doc must state IMPL1 scope'
    )
  })
})
