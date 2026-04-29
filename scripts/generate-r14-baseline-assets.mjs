import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

class NodeFileReader {
  result = null
  onloadend = null

  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer()
    this.onloadend?.()
  }

  async readAsDataURL(blob) {
    const bytes = Buffer.from(await blob.arrayBuffer())
    this.result = `data:${blob.type || 'application/octet-stream'};base64,${bytes.toString('base64')}`
    this.onloadend?.()
  }
}

globalThis.FileReader = NodeFileReader

const ROOT = process.cwd()
const UNIT_DIR = path.join(ROOT, 'public/assets/models/units')
const AUDIO_DIR = path.join(ROOT, 'public/assets/audio/cues')

const UNIT_CLIP_BATCH = {
  worker: ['Idle', 'Walk', 'Work', 'Death'],
  militia: ['Idle', 'Walk', 'Attack', 'Death'],
  footman: ['Idle', 'Walk', 'Attack', 'Death'],
  rifleman: ['Idle', 'Walk', 'Attack', 'Death'],
  mortar_team: ['Idle', 'Walk', 'Attack', 'Death'],
  priest: ['Idle', 'Walk', 'Cast', 'Death'],
  sorceress: ['Idle', 'Walk', 'Cast', 'Death'],
  knight: ['Idle', 'Walk', 'Attack', 'Death'],
  paladin: ['Idle', 'Walk', 'Attack', 'Cast', 'Death'],
  archmage: ['Idle', 'Walk', 'Attack', 'Cast', 'Death'],
  mountain_king: ['Idle', 'Walk', 'Attack', 'Cast', 'Death'],
  water_elemental: ['Idle', 'Walk', 'Attack', 'Death'],
}

const AUDIO_BATCH = {
  command: { duration: 0.12, tones: [520, 740], gain: 0.34 },
  combat: { duration: 0.14, tones: [180, 360, 520], gain: 0.38 },
  ability: { duration: 0.26, tones: [440, 660, 880], gain: 0.3 },
  objective: { duration: 0.24, tones: [660, 880, 1100], gain: 0.28 },
  pressure: { duration: 0.3, tones: [260, 220, 180], gain: 0.38 },
  shop: { duration: 0.18, tones: [520, 640, 760], gain: 0.3 },
  portal: { duration: 0.42, tones: [360, 720, 1080, 720], gain: 0.32 },
  construction: { duration: 0.22, tones: [320, 640, 960], gain: 0.32 },
  death: { duration: 0.34, tones: [180, 120, 80], gain: 0.42 },
  result: { duration: 0.46, tones: [420, 560, 700, 840], gain: 0.3 },
}

function q(rx, ry, rz) {
  return new THREE.Quaternion()
    .setFromEuler(new THREE.Euler(rx, ry, rz))
    .toArray()
}

function positionValues(base, offsets) {
  return offsets.flatMap(([x, y, z]) => [
    base.x + x,
    base.y + y,
    base.z + z,
  ])
}

function scaleValues(base, offsets) {
  return offsets.flatMap(([x, y, z]) => [
    base.x * x,
    base.y * y,
    base.z * z,
  ])
}

function clipForState(target, state) {
  const name = target.name
  const pos = target.position
  const scale = target.scale
  if (state === 'Idle') {
    return new THREE.AnimationClip('Idle', 1.2, [
      new THREE.VectorKeyframeTrack(`${name}.position`, [0, 0.6, 1.2], positionValues(pos, [[0, 0, 0], [0, 0.018, 0], [0, 0, 0]])),
      new THREE.VectorKeyframeTrack(`${name}.scale`, [0, 0.6, 1.2], scaleValues(scale, [[1, 1, 1], [1.012, 1.018, 1.012], [1, 1, 1]])),
    ])
  }
  if (state === 'Walk') {
    return new THREE.AnimationClip('Walk', 0.62, [
      new THREE.VectorKeyframeTrack(`${name}.position`, [0, 0.16, 0.31, 0.47, 0.62], positionValues(pos, [[0, 0, 0], [0, 0.055, 0.025], [0, 0, 0], [0, 0.055, -0.025], [0, 0, 0]])),
      new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, [0, 0.16, 0.31, 0.47, 0.62], [
        ...q(0, 0, 0),
        ...q(0, 0, 0.07),
        ...q(0, 0, 0),
        ...q(0, 0, -0.07),
        ...q(0, 0, 0),
      ]),
    ])
  }
  if (state === 'Attack') {
    return new THREE.AnimationClip('Attack', 0.48, [
      new THREE.VectorKeyframeTrack(`${name}.position`, [0, 0.12, 0.24, 0.48], positionValues(pos, [[0, 0, 0], [0, 0.025, -0.08], [0, 0.04, 0.13], [0, 0, 0]])),
      new THREE.VectorKeyframeTrack(`${name}.scale`, [0, 0.12, 0.24, 0.48], scaleValues(scale, [[1, 1, 1], [0.98, 1.02, 0.98], [1.08, 0.98, 1.04], [1, 1, 1]])),
    ])
  }
  if (state === 'Cast') {
    return new THREE.AnimationClip('Cast', 0.84, [
      new THREE.VectorKeyframeTrack(`${name}.position`, [0, 0.22, 0.48, 0.84], positionValues(pos, [[0, 0, 0], [0, 0.08, 0], [0, 0.035, 0], [0, 0, 0]])),
      new THREE.VectorKeyframeTrack(`${name}.scale`, [0, 0.22, 0.48, 0.84], scaleValues(scale, [[1, 1, 1], [1.08, 1.08, 1.08], [0.98, 1.03, 0.98], [1, 1, 1]])),
    ])
  }
  if (state === 'Work') {
    return new THREE.AnimationClip('Work', 0.56, [
      new THREE.VectorKeyframeTrack(`${name}.position`, [0, 0.18, 0.32, 0.56], positionValues(pos, [[0, 0, 0], [0, 0.035, -0.09], [0, 0.02, 0.07], [0, 0, 0]])),
      new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, [0, 0.18, 0.32, 0.56], [
        ...q(0, 0, 0),
        ...q(0.08, 0, 0.08),
        ...q(-0.04, 0, -0.05),
        ...q(0, 0, 0),
      ]),
    ])
  }
  if (state === 'Death') {
    return new THREE.AnimationClip('Death', 0.92, [
      new THREE.VectorKeyframeTrack(`${name}.position`, [0, 0.34, 0.92], positionValues(pos, [[0, 0, 0], [0, -0.05, 0.03], [0, -0.12, 0.08]])),
      new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, [0, 0.34, 0.92], [
        ...q(0, 0, 0),
        ...q(0.26, 0, 0.22),
        ...q(1.12, 0, 0.68),
      ]),
      new THREE.VectorKeyframeTrack(`${name}.scale`, [0, 0.92], scaleValues(scale, [[1, 1, 1], [0.96, 0.96, 0.96]])),
    ])
  }
  throw new Error(`Unknown state ${state}`)
}

function mergeClips(existing, generated) {
  const byName = new Map()
  for (const clip of existing) byName.set(clip.name, clip)
  for (const clip of generated) byName.set(clip.name, clip)
  return [...byName.values()]
}

async function writeUnitClips() {
  const loader = new GLTFLoader()
  const exporter = new GLTFExporter()
  const summaries = []
  for (const [unitKey, states] of Object.entries(UNIT_CLIP_BATCH)) {
    const file = path.join(UNIT_DIR, `${unitKey}.glb`)
    const bytes = await readFile(file)
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    const gltf = await new Promise((resolve, reject) => loader.parse(arrayBuffer, '', resolve, reject))
    const target = gltf.scene.children[0] ?? gltf.scene
    if (!target.name) target.name = `${unitKey}-presentation-root`
    const generatedClips = states.map(state => clipForState(target, state))
    const animations = mergeClips(gltf.animations, generatedClips)
    const output = await new Promise((resolve, reject) => {
      exporter.parse(gltf.scene, resolve, reject, { binary: true, animations })
    })
    await writeFile(file, Buffer.from(output))
    summaries.push(`${unitKey}:${animations.map(clip => clip.name).join(',')}`)
  }
  return summaries
}

function envelope(t, duration) {
  const attack = Math.min(1, t / 0.018)
  const release = Math.max(0, 1 - t / duration)
  return attack * release * release
}

function sampleCue(spec, t) {
  const phase = t / spec.duration
  let value = 0
  for (let i = 0; i < spec.tones.length; i++) {
    const start = spec.tones[i]
    const end = spec.tones[Math.min(i + 1, spec.tones.length - 1)]
    const freq = start + (end - start) * phase
    value += Math.sin(2 * Math.PI * freq * t) / spec.tones.length
  }
  return value * envelope(t, spec.duration) * spec.gain
}

function wavBuffer(samples, sampleRate) {
  const dataBytes = samples.length * 2
  const buffer = Buffer.alloc(44 + dataBytes)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataBytes, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataBytes, 40)
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2)
  }
  return buffer
}

async function writeAudioCues() {
  await mkdir(AUDIO_DIR, { recursive: true })
  const sampleRate = 44100
  const summaries = []
  for (const [kind, spec] of Object.entries(AUDIO_BATCH)) {
    const count = Math.ceil(spec.duration * sampleRate)
    const samples = new Float32Array(count)
    for (let i = 0; i < count; i++) samples[i] = sampleCue(spec, i / sampleRate)
    const file = path.join(AUDIO_DIR, `${kind}.wav`)
    await writeFile(file, wavBuffer(samples, sampleRate))
    summaries.push(`${kind}:${count}`)
  }
  return summaries
}

const unitSummaries = await writeUnitClips()
const audioSummaries = await writeAudioCues()
console.log(`Generated R14 unit clips: ${unitSummaries.join(' | ')}`)
console.log(`Generated R14 audio cues: ${audioSummaries.join(' | ')}`)
