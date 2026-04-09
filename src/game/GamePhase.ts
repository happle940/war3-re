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

  isBoot(): boolean {
    return this.current === Phase.Boot
  }

  reset() {
    this.current = Phase.Boot
  }
}
