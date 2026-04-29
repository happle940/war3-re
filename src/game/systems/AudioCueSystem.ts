export type AudioCueKind =
  | 'command'
  | 'combat'
  | 'ability'
  | 'objective'
  | 'pressure'
  | 'shop'
  | 'portal'
  | 'construction'
  | 'death'
  | 'result'

export interface AudioCueEvent {
  kind: AudioCueKind
  label: string
  at: number
}

export interface AudioCueSnapshot {
  enabled: boolean
  cueCount: number
  kinds: AudioCueKind[]
  assetBackedKinds: AudioCueKind[]
  lastCue: AudioCueEvent | null
}

const CUE_ASSET_PATHS: Partial<Record<AudioCueKind, string>> = {
  command: 'assets/audio/cues/command.wav',
  combat: 'assets/audio/cues/combat.wav',
  ability: 'assets/audio/cues/ability.wav',
  objective: 'assets/audio/cues/objective.wav',
  pressure: 'assets/audio/cues/pressure.wav',
  shop: 'assets/audio/cues/shop.wav',
  portal: 'assets/audio/cues/portal.wav',
  construction: 'assets/audio/cues/construction.wav',
  death: 'assets/audio/cues/death.wav',
  result: 'assets/audio/cues/result.wav',
}

const CUE_FREQUENCIES: Record<AudioCueKind, number> = {
  command: 360,
  combat: 460,
  ability: 620,
  objective: 760,
  pressure: 220,
  shop: 520,
  portal: 880,
  construction: 700,
  death: 180,
  result: 680,
}

export function getAudioCueAssetPath(kind: AudioCueKind): string | null {
  return CUE_ASSET_PATHS[kind] ?? null
}

export class AudioCueSystem {
  private enabled: boolean
  private getTime: () => number
  private events: AudioCueEvent[] = []
  private audioContext: AudioContext | null = null
  private audioBuffers = new Map<AudioCueKind, AudioBuffer | null>()
  private pendingAudioBuffers = new Map<AudioCueKind, Promise<AudioBuffer | null>>()

  constructor(input: { enabled: boolean; getTime: () => number }) {
    this.enabled = input.enabled
    this.getTime = input.getTime
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  play(kind: AudioCueKind, label: string = kind) {
    const event = { kind, label, at: this.getTime() }
    this.events.push(event)
    if (this.events.length > 48) this.events.shift()
    if (!this.enabled) return

    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      this.audioContext ??= new Ctor()
      const assetPath = getAudioCueAssetPath(kind)
      if (assetPath) {
        void this.playAssetCue(kind).catch(() => this.playOscillatorCue(kind))
        return
      }
      this.playOscillatorCue(kind)
    } catch {
      // Audio is an enhancement; browser autoplay or headless restrictions must not break gameplay.
    }
  }

  private async loadAudioBuffer(kind: AudioCueKind, ctx: AudioContext): Promise<AudioBuffer | null> {
    if (this.audioBuffers.has(kind)) return this.audioBuffers.get(kind) ?? null
    const existing = this.pendingAudioBuffers.get(kind)
    if (existing) return existing
    const assetPath = getAudioCueAssetPath(kind)
    if (!assetPath) return null

    const pending = fetch(assetPath)
      .then(response => {
        if (!response.ok) throw new Error(`Audio cue asset failed: ${assetPath}`)
        return response.arrayBuffer()
      })
      .then(bytes => ctx.decodeAudioData(bytes.slice(0)))
      .then(buffer => {
        this.audioBuffers.set(kind, buffer)
        this.pendingAudioBuffers.delete(kind)
        return buffer
      })
      .catch(() => {
        this.audioBuffers.set(kind, null)
        this.pendingAudioBuffers.delete(kind)
        return null
      })

    this.pendingAudioBuffers.set(kind, pending)
    return pending
  }

  private async playAssetCue(kind: AudioCueKind) {
    const ctx = this.audioContext
    if (!ctx) return
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => undefined)
    }
    const buffer = await this.loadAudioBuffer(kind, ctx)
    if (!buffer) {
      this.playOscillatorCue(kind)
      return
    }

    const source = ctx.createBufferSource()
    const gain = ctx.createGain()
    source.buffer = buffer
    const startAt = ctx.currentTime
    gain.gain.setValueAtTime(kind === 'death' ? 0.42 : 0.34, startAt)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + Math.max(0.08, buffer.duration))
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start(startAt)
  }

  private playOscillatorCue(kind: AudioCueKind) {
    const ctx = this.audioContext
    if (!ctx) return
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    const startAt = ctx.currentTime
    oscillator.type = kind === 'pressure' || kind === 'death' ? 'sawtooth' : 'triangle'
    oscillator.frequency.setValueAtTime(CUE_FREQUENCIES[kind], startAt)
    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(kind === 'result' ? 0.045 : 0.028, startAt + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(startAt)
    oscillator.stop(startAt + 0.2)
  }

  reset() {
    this.events = []
  }

  getSnapshot(): AudioCueSnapshot {
    return {
      enabled: this.enabled,
      cueCount: this.events.length,
      kinds: [...new Set(this.events.map(event => event.kind))],
      assetBackedKinds: [...new Set(this.events.map(event => event.kind).filter(kind => !!getAudioCueAssetPath(kind)))],
      lastCue: this.events.length > 0 ? this.events[this.events.length - 1] : null,
    }
  }
}
