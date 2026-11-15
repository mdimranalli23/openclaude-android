import { spawn } from 'node:child_process'

export type EdgeTtsOptions = {
  text: string
  outputPath: string
  voice?: string
  runner?: 'edge-tts' | 'python'
}

/** Generate narration with Microsoft's Edge TTS service. No API key is required. */
export async function synthesizeWithEdgeTts(options: EdgeTtsOptions): Promise<void> {
  const text = options.text.trim()
  if (!text) throw new Error('Narration text is required.')
  if (!options.outputPath.trim()) throw new Error('An output path is required.')

  const voice = options.voice?.trim() || process.env.EDGE_TTS_VOICE || 'bn-BD-NabanitaNeural'
  const runner = options.runner ?? 'edge-tts'
  const command = runner === 'python' ? 'python' : 'edge-tts'
  const args = runner === 'python'
    ? ['-m', 'edge_tts', '--voice', voice, '--text', text, '--write-media', options.outputPath]
    : ['--voice', voice, '--text', text, '--write-media', options.outputPath]

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    child.stderr.on('data', chunk => { stderr += String(chunk) })
    child.on('error', error => reject(new Error(`Edge TTS could not start: ${error.message}`)))
    child.on('close', code => {
      if (code === 0) return resolve()
      reject(new Error(`Edge TTS failed (${code ?? 'unknown'}): ${stderr.trim().slice(0, 500)}`))
    })
  })
}
