/**
 * 最小游戏阶段状态机
 *
 * 控制游戏当前处于哪个阶段，
 * 用于门控 update / input / HUD 渲染。
 */
export enum Phase {
  /** 启动中，初始化场景 */
  Boot = 'boot',
  /** 正在加载 W3X 地图 */
  LoadingMap = 'loading_map',
  /** 正常游戏中 */
  Playing = 'playing',
  /** 设置壳层打开，冻结模拟但保留当前会话 */
  Setup = 'setup',
  /** 会话暂停，保留当前状态但冻结输入与模拟 */
  Paused = 'paused',
  /** 游戏结束 */
  GameOver = 'game_over',
}

export class GamePhase {
  private current: Phase = Phase.Boot

  get(): Phase {
    return this.current
  }

  set(phase: Phase) {
    this.current = phase
  }

  isPlaying(): boolean {
    return this.current === Phase.Playing
  }

  isSetup(): boolean {
    return this.current === Phase.Setup
  }

  isPaused(): boolean {
    return this.current === Phase.Paused
  }

  isGameOver(): boolean {
    return this.current === Phase.GameOver
  }

  isSessionOverlayActive(): boolean {
    return this.current === Phase.Setup || this.current === Phase.Paused || this.current === Phase.GameOver
  }

  isBoot(): boolean {
    return this.current === Phase.Boot
  }

  reset() {
    this.current = Phase.Boot
  }
}
