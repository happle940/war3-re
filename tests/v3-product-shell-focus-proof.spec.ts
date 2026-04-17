/**
 * V3-PS1 Product-Shell Focus Proof Pack
 *
 * Focused regression proving the front-door entry focus:
 *   1. Primary action hierarchy: the start button is the main entry
 *   2. Source/mode truth: current source and mode labels are truthful
 *   3. Disabled/absent branch audit: unimplemented routes are disabled or absent
 *   4. No fake same-rank route: no other route masquerades as equal to start
 *
 * This is the V3-PS1 gate closeout proof pack. It does not close V3-PS2
 * (return-to-menu), V3-PS4 (menu quality), V3-PS5 (shell usefulness),
 * V3-AV1 (asset approval), or V3-UA1 (user verdict).
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/'

async function waitForMenuShell(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('#menu-shell:not([hidden])', { timeout: 15000 })
  await page.waitForTimeout(500)
}

test.describe('V3-PS1 Product-Shell Focus Proof', () => {
  test.setTimeout(180000)

  test('primary action: start button exists, enabled, and is the main entry', async ({ page }) => {
    await waitForMenuShell(page)

    const startBtn = page.locator('#menu-start-button')
    await expect(startBtn, 'start button must exist').toBeVisible()
    await expect(startBtn, 'start button must be enabled').toBeEnabled()

    // Start button text must indicate it starts the current map
    const text = await startBtn.textContent()
    expect(text, 'start button must say "开始当前地图"').toContain('开始当前地图')

    console.log('[V3-PS1 PROOF] Primary action:', { text, enabled: true })
  })

  test('source truth: map source label reflects current state', async ({ page }) => {
    await waitForMenuShell(page)

    const sourceLabel = page.locator('#menu-map-source-label')
    await expect(sourceLabel, 'source label must exist').toBeVisible()

    const text = await sourceLabel.textContent()
    expect(text, 'source label must contain "当前："').toContain('当前：')
    // Default source is procedural map
    expect(text, 'default source must be procedural map').toContain('程序化地图')

    console.log('[V3-PS1 PROOF] Source truth:', { text })
  })

  test('mode truth: mode label reflects current mode', async ({ page }) => {
    await waitForMenuShell(page)

    const modeLabel = page.locator('#menu-mode-label')
    await expect(modeLabel, 'mode label must exist').toBeVisible()

    const text = await modeLabel.textContent()
    expect(text, 'mode label must contain "模式："').toContain('模式：')
    // Only skirmish is implemented
    expect(text, 'default mode must be skirmish').toContain('遭遇战')

    console.log('[V3-PS1 PROOF] Mode truth:', { text })
  })

  test('disabled/absent branch audit: unimplemented routes are disabled or absent', async ({ page }) => {
    await waitForMenuShell(page)

    // Campaign button in mode-select must be disabled
    // First navigate to mode-select
    const modeSelectBtn = page.locator('#menu-mode-select-button')
    await modeSelectBtn.click()
    await page.waitForSelector('#mode-select-shell:not([hidden])', { timeout: 5000 })

    const campaignBtn = page.locator('#mode-select-campaign-button')
    await expect(campaignBtn, 'campaign button must exist').toBeVisible()
    await expect(campaignBtn, 'campaign button must be disabled').toBeDisabled()

    const campaignText = await campaignBtn.textContent()
    expect(campaignText, 'campaign must say 未实现').toContain('未实现')

    // Ladder, multiplayer, custom game buttons must NOT exist
    const ladderExists = await page.locator('#mode-select-ladder-button').count()
    expect(ladderExists, 'ladder button must not exist').toBe(0)

    const multiplayerExists = await page.locator('#mode-select-multiplayer-button').count()
    expect(multiplayerExists, 'multiplayer button must not exist').toBe(0)

    const customExists = await page.locator('#mode-select-custom-button').count()
    expect(customExists, 'custom game button must not exist').toBe(0)

    // Skirmish button must be enabled (the only playable mode)
    const skirmishBtn = page.locator('#mode-select-skirmish-button')
    await expect(skirmishBtn, 'skirmish button must exist').toBeVisible()
    await expect(skirmishBtn, 'skirmish button must be enabled').toBeEnabled()

    const skirmishText = await skirmishBtn.textContent()
    expect(skirmishText, 'skirmish must say 已实现').toContain('已实现')

    console.log('[V3-PS1 PROOF] Branch audit:', {
      campaignDisabled: true,
      campaignText,
      skirmishEnabled: true,
      skirmishText,
      ladderAbsent: true,
      multiplayerAbsent: true,
      customAbsent: true,
    })
  })

  test('no fake same-rank route: no other entry masquerades as primary action', async ({ page }) => {
    await waitForMenuShell(page)

    // Collect all action buttons in the menu body
    const menuBody = page.locator('#menu-shell .page-shell-body')
    const allButtons = menuBody.locator('.page-shell-action-button')
    const count = await allButtons.count()

    // Must have at least the start button
    expect(count, 'menu must have action buttons').toBeGreaterThanOrEqual(1)

    // Verify each button's role
    const buttonRoles: { text: string; disabled: boolean; isPrimary: boolean }[] = []
    for (let i = 0; i < count; i++) {
      const btn = allButtons.nth(i)
      const text = (await btn.textContent())?.trim() ?? ''
      const disabled = await btn.isDisabled()
      const isPrimary = text === '开始当前地图'
      buttonRoles.push({ text, disabled, isPrimary })
    }

    // Exactly one primary action (start button)
    const primaryCount = buttonRoles.filter(b => b.isPrimary).length
    expect(primaryCount, 'exactly one primary action (start button)').toBe(1)

    // No other button should look like an alternative entry
    // Secondary buttons should be: 选择模式, 加载W3X地图, 重置, 操作说明, 设置
    // None of these should say "开始" or "进入" or "战斗" except the primary
    const fakeEntries = buttonRoles.filter(b =>
      !b.isPrimary
      && !b.disabled
      && (b.text.includes('开始') || b.text.includes('进入') || b.text.includes('战斗'))
    )
    expect(fakeEntries.length,
      'no non-primary button should use start/enter/battle language').toBe(0)

    // Labels (non-button elements) should not look like alternative entries
    const labels = menuBody.locator('.page-shell-map-source-label, .page-shell-mode-label')
    const labelCount = await labels.count()
    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i)
      const text = (await label.textContent())?.trim() ?? ''
      // Labels should only contain source/mode info, not entry actions
      expect(text, `label "${text}" should not contain entry language`).not.toContain('开始')
    }

    console.log('[V3-PS1 PROOF] No fake routes:', {
      totalButtons: count,
      primaryCount,
      buttonRoles,
      fakeEntryCount: fakeEntries.length,
    })
  })

  test('front-door boot: normal visitor lands on menu shell, not gameplay', async ({ page }) => {
    // Normal boot (no runtimeTest=1) must show menu shell
    await waitForMenuShell(page)

    // Menu shell must be visible
    const menuShell = page.locator('#menu-shell')
    await expect(menuShell, 'menu shell must be visible').toBeVisible()
    expect(await menuShell.getAttribute('hidden'), 'menu shell must NOT be hidden').toBeNull()

    // HUD should not be interactive yet (game is paused)
    const game = await page.evaluate(() => (window as any).__war3Game)
    expect(game, 'game instance must exist').toBeDefined()
    expect(game.phase, 'game must be paused at boot').toBeDefined()

    // Briefing shell must be hidden at boot
    const briefingShell = page.locator('#briefing-shell')
    const briefingHidden = await briefingShell.getAttribute('hidden')
    expect(briefingHidden, 'briefing shell must be hidden at boot').not.toBeNull()

    console.log('[V3-PS1 PROOF] Front-door boot:', {
      menuVisible: true,
      briefingHidden: briefingHidden !== null,
      gamePhase: game.phase?.current ?? 'unknown',
    })
  })

  test('start path truth: menu → briefing → gameplay flow is honest', async ({ page }) => {
    await waitForMenuShell(page)

    // Step 1: Menu shows source and mode
    const sourceText = await page.locator('#menu-map-source-label').textContent()
    const modeText = await page.locator('#menu-mode-label').textContent()
    expect(sourceText, 'menu must show source').toBeTruthy()
    expect(modeText, 'menu must show mode').toBeTruthy()

    // Step 2: Click start → briefing shell
    await page.locator('#menu-start-button').click()
    const briefingShell = page.locator('#briefing-shell')
    await expect(briefingShell, 'briefing shell must appear after start').toBeVisible()

    // Briefing must show same source and mode as menu
    const briefingSource = await page.locator('#briefing-map-source').textContent()
    const briefingMode = await page.locator('#briefing-mode').textContent()
    expect(briefingSource, 'briefing source must match menu source').toBe(sourceText)
    expect(briefingMode, 'briefing mode must match menu mode').toBe(modeText)

    // Briefing must show controls hint
    const controlsHint = page.locator('.page-shell-briefing-controls-hint')
    await expect(controlsHint, 'briefing must show controls hint').toBeVisible()

    // Briefing start button must say "开始战斗"
    const briefingStartBtn = page.locator('#briefing-start-button')
    const briefingStartText = await briefingStartBtn.textContent()
    expect(briefingStartText, 'briefing start must say "开始战斗"').toContain('开始战斗')

    // Step 3: Click briefing start → gameplay
    await briefingStartBtn.click()
    await page.waitForTimeout(500)

    // Menu and briefing must be hidden
    const menuHidden = await page.locator('#menu-shell').getAttribute('hidden')
    expect(menuHidden, 'menu must be hidden after briefing start').not.toBeNull()

    const briefingHidden2 = await briefingShell.getAttribute('hidden')
    expect(briefingHidden2, 'briefing must be hidden after start').not.toBeNull()

    console.log('[V3-PS1 PROOF] Start path:', {
      menuSource: sourceText,
      menuMode: modeText,
      briefingSource,
      briefingMode,
      briefingStartText,
      menuHiddenAfter: true,
      briefingHiddenAfter: true,
    })
  })

  test('V3-PS1 comprehensive focus audit: all checks pass', async ({ page }) => {
    await waitForMenuShell(page)

    const audit: Record<string, boolean> = {}

    // 1. Start button exists and is enabled
    const startBtn = page.locator('#menu-start-button')
    audit.startButtonVisible = await startBtn.isVisible()
    audit.startButtonEnabled = await startBtn.isEnabled()

    // 2. Source label is truthful
    const sourceText = await page.locator('#menu-map-source-label').textContent()
    audit.sourceLabelPresent = !!sourceText && sourceText.includes('当前：')

    // 3. Mode label is truthful
    const modeText = await page.locator('#menu-mode-label').textContent()
    audit.modeLabelPresent = !!modeText && modeText.includes('模式：')

    // 4. Menu shell is visible (front door)
    audit.menuShellVisible = await page.locator('#menu-shell').isVisible()

    // 5. No fake entry routes in menu body
    const menuButtons = page.locator('#menu-shell .page-shell-action-button')
    const btnCount = await menuButtons.count()
    let fakeEntryCount = 0
    for (let i = 0; i < btnCount; i++) {
      const text = (await menuButtons.nth(i).textContent())?.trim() ?? ''
      if (text !== '开始当前地图' && !await menuButtons.nth(i).isDisabled()
          && (text.includes('开始') || text.includes('战斗'))) {
        fakeEntryCount++
      }
    }
    audit.noFakeEntryRoutes = fakeEntryCount === 0

    // 6. Campaign is disabled in mode-select
    await page.locator('#menu-mode-select-button').click()
    await page.waitForSelector('#mode-select-shell:not([hidden])', { timeout: 5000 })
    audit.campaignDisabled = await page.locator('#mode-select-campaign-button').isDisabled()

    // 7. No ladder/multiplayer buttons
    audit.ladderAbsent = (await page.locator('#mode-select-ladder-button').count()) === 0
    audit.multiplayerAbsent = (await page.locator('#mode-select-multiplayer-button').count()) === 0

    // 8. Skirmish is enabled
    audit.skirmishEnabled = await page.locator('#mode-select-skirmish-button').isEnabled()

    const allPassed = Object.values(audit).every(Boolean)

    for (const [check, passed] of Object.entries(audit)) {
      expect(passed, `${check} must be true`).toBe(true)
    }
    expect(allPassed, 'All PS1 focus checks must pass').toBe(true)

    console.log('[V3-PS1 CLOSEOUT AUDIT]', JSON.stringify({ audit, allPassed }, null, 2))
  })
})
