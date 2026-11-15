import { access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import type { ShortsJob } from './types.js'

export type ShortsRenderOptions = {
  ffmpegPath?: string
  inputPath: string
  outputPath: string
  audioPath?: string
}

export function buildShortsFfmpegArgs(options: ShortsRenderOptions): string[] {
  const args = [
    '-y',
    '-i', options.inputPath,
    ...(options.audioPath ? ['-i', options.audioPath] : []),
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1',
    '-r', '30',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    ...(options.audioPath
      ? ['-map', '0:v:0', '-map', '1:a:0', '-shortest', '-c:a', 'aac', '-b:a', '128k']
      : ['-an']),
    '-movflags', '+faststart',
    options.outputPath,
  ]
  return args
}

/** Render one licensed/owned source into a YouTube-compatible 9:16 MP4. */
export async function renderShorts(
  _job: ShortsJob,
  options: ShortsRenderOptions,
): Promise<string> {
  await access(options.inputPath)
  const ffmpegPath = options.ffmpegPath ?? 'ffmpeg'
  const args = buildShortsFfmpegArgs(options)

  await new Promise<void>((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    child.stderr.on('data', chunk => {
      stderr += String(chunk)
      if (stderr.length > 4000) stderr = stderr.slice(-4000)
    })
    child.once('error', reject)
    child.once('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`FFmpeg render failed (${code}): ${stderr.trim()}`))
    })
  })

  return options.outputPath
}
