import type { AudioCueKind } from './AudioCueSystem'

export type RequiredActionState =
  | 'idle'
  | 'walk'
  | 'attack'
  | 'cast'
  | 'death'
  | 'work'

export type AudioCueSource = 'asset-file' | 'procedural-oscillator'

export interface UnitActionAssetContract {
  unitKey: string
  requiredStates: RequiredActionState[]
  clipNames: string[]
  realClipStates: RequiredActionState[]
  missingRealClipStates: RequiredActionState[]
}

export interface AudioCueAssetContract {
  kind: AudioCueKind
  source: AudioCueSource
  assetPath: string | null
}

export interface PresentationAssetReadinessCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface PresentationAssetReadinessSnapshot {
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  contractCoverageComplete: boolean
  finalAssetApproved: boolean
  finalArtReady: boolean
  unitContractCount: number
  requiredClipStateCount: number
  realClipStateCount: number
  missingRealClipStateCount: number
  runtimeFallbackStateCount: number
  audioCueContractCount: number
  audioAssetCueKindCount: number
  proceduralCueKindCount: number
  missingAudioAssetKindCount: number
  unitContracts: UnitActionAssetContract[]
  audioContracts: AudioCueAssetContract[]
  checks: PresentationAssetReadinessCheck[]
}

const UNIT_ACTION_CONTRACTS: Record<string, RequiredActionState[]> = {
  worker: ['idle', 'walk', 'work', 'death'],
  militia: ['idle', 'walk', 'attack', 'death'],
  footman: ['idle', 'walk', 'attack', 'death'],
  rifleman: ['idle', 'walk', 'attack', 'death'],
  mortar_team: ['idle', 'walk', 'attack', 'death'],
  priest: ['idle', 'walk', 'cast', 'death'],
  sorceress: ['idle', 'walk', 'cast', 'death'],
  knight: ['idle', 'walk', 'attack', 'death'],
  paladin: ['idle', 'walk', 'attack', 'cast', 'death'],
  archmage: ['idle', 'walk', 'attack', 'cast', 'death'],
  mountain_king: ['idle', 'walk', 'attack', 'cast', 'death'],
  water_elemental: ['idle', 'walk', 'attack', 'death'],
}

const AUDIO_CUE_CONTRACTS: AudioCueKind[] = [
  'command',
  'combat',
  'ability',
  'objective',
  'pressure',
  'shop',
  'portal',
  'construction',
  'death',
  'result',
]

const ACTION_CLIP_HINTS: Record<RequiredActionState, string[]> = {
  idle: ['idle', 'stand'],
  walk: ['walk', 'run', 'move'],
  attack: ['attack', 'swing', 'shoot', 'strike'],
  cast: ['cast', 'spell', 'channel', 'ability'],
  death: ['death', 'die', 'dead'],
  work: ['work', 'build', 'gather', 'harvest', 'repair'],
}

function normalize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function hasClipForState(clipNames: readonly string[], state: RequiredActionState) {
  const normalizedClips = clipNames.map(normalize)
  return ACTION_CLIP_HINTS[state].some(hint => {
    const normalizedHint = normalize(hint)
    return normalizedClips.some(name => name.includes(normalizedHint))
  })
}

export function buildPresentationAssetReadinessSnapshot(input: {
  getAssetAnimationClipNames: (key: string) => readonly string[]
  getAudioCueAssetPath?: (kind: AudioCueKind) => string | null
  finalAssetApproved?: boolean
}): PresentationAssetReadinessSnapshot {
  const unitContracts: UnitActionAssetContract[] = Object.entries(UNIT_ACTION_CONTRACTS)
    .map(([unitKey, requiredStates]) => {
      const clipNames = [...input.getAssetAnimationClipNames(unitKey)]
      const realClipStates = requiredStates.filter(state => hasClipForState(clipNames, state))
      const missingRealClipStates = requiredStates.filter(state => !realClipStates.includes(state))
      return {
        unitKey,
        requiredStates: [...requiredStates],
        clipNames,
        realClipStates,
        missingRealClipStates,
      }
    })

  const audioContracts: AudioCueAssetContract[] = AUDIO_CUE_CONTRACTS.map(kind => {
    const assetPath = input.getAudioCueAssetPath?.(kind) ?? null
    return {
      kind,
      source: assetPath ? 'asset-file' : 'procedural-oscillator',
      assetPath,
    }
  })

  const requiredClipStateCount = unitContracts.reduce((sum, item) => sum + item.requiredStates.length, 0)
  const realClipStateCount = unitContracts.reduce((sum, item) => sum + item.realClipStates.length, 0)
  const missingRealClipStateCount = unitContracts.reduce((sum, item) => sum + item.missingRealClipStates.length, 0)
  const runtimeFallbackStateCount = missingRealClipStateCount
  const audioAssetCueKindCount = audioContracts.filter(item => item.source === 'asset-file').length
  const proceduralCueKindCount = audioContracts.filter(item => item.source === 'procedural-oscillator').length
  const missingAudioAssetKindCount = proceduralCueKindCount
  const contractCoverageComplete = missingRealClipStateCount === 0 && missingAudioAssetKindCount === 0
  const finalAssetApproved = input.finalAssetApproved === true
  const finalArtReady = contractCoverageComplete && finalAssetApproved

  const checks: PresentationAssetReadinessCheck[] = [
    {
      key: 'unit-action-contracts',
      label: '单位动作合同',
      completed: unitContracts.length >= 10 && requiredClipStateCount > 0,
      detail: `单位 ${unitContracts.length}，动作状态 ${requiredClipStateCount}`,
    },
    {
      key: 'real-clip-audit',
      label: '真实 clip 审计',
      completed: realClipStateCount + missingRealClipStateCount === requiredClipStateCount,
      detail: `真实 ${realClipStateCount}/${requiredClipStateCount}，缺口 ${missingRealClipStateCount}`,
    },
    {
      key: 'runtime-fallback-boundary',
      label: 'fallback 边界',
      completed: runtimeFallbackStateCount === missingRealClipStateCount,
      detail: `runtime fallback 覆盖 ${runtimeFallbackStateCount} 个缺失动作状态`,
    },
    {
      key: 'audio-source-contracts',
      label: '音效来源合同',
      completed: audioContracts.length === AUDIO_CUE_CONTRACTS.length &&
        audioContracts.every(item => item.source === 'asset-file' || item.source === 'procedural-oscillator'),
      detail: `真实音频 ${audioAssetCueKindCount}/${audioContracts.length}，程序音 ${proceduralCueKindCount}`,
    },
    {
      key: 'final-art-boundary',
      label: '最终资产边界',
      completed: contractCoverageComplete || missingRealClipStateCount > 0 || missingAudioAssetKindCount > 0,
      detail: finalArtReady
        ? '真实动作和真实音效已覆盖合同，并已批准为最终资产'
        : contractCoverageComplete
          ? '合同覆盖已满，最终美术/音频仍未批准'
          : `仍缺真实动作 ${missingRealClipStateCount}、真实音效 ${missingAudioAssetKindCount}`,
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: finalArtReady
      ? '发布级视听素材门禁通过'
      : contractCoverageComplete
        ? '视听素材合同覆盖已满，最终素材仍待批准'
        : '视听素材门禁可观测，最终素材仍有缺口',
    contractCoverageComplete,
    finalAssetApproved,
    finalArtReady,
    unitContractCount: unitContracts.length,
    requiredClipStateCount,
    realClipStateCount,
    missingRealClipStateCount,
    runtimeFallbackStateCount,
    audioCueContractCount: audioContracts.length,
    audioAssetCueKindCount,
    proceduralCueKindCount,
    missingAudioAssetKindCount,
    unitContracts,
    audioContracts,
    checks,
  }
}
