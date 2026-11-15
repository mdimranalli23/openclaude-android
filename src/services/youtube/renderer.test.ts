import { describe, expect, test } from 'bun:test'
import { buildShortsFfmpegArgs } from './renderer.js'

describe('Shorts renderer', () => {
  test('builds a vertical H.264 command', () => {
    const args = buildShortsFfmpegArgs({
      inputPath: '/tmp/input.mp4',
      outputPath: '/tmp/output.mp4',
    })
    expect(args).toContain('scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1')
    expect(args).toContain('libx264')
    expect(args).toContain('yuv420p')
    expect(args.at(-1)).toBe('/tmp/output.mp4')
  })

  test('mixes optional voiceover and ends with the shortest stream', () => {
    const args = buildShortsFfmpegArgs({
      inputPath: '/tmp/input.mp4',
      audioPath: '/tmp/voice.m4a',
      outputPath: '/tmp/output.mp4',
    })
    expect(args).toContain('-shortest')
    expect(args).toContain('1:a:0')
  })
})
