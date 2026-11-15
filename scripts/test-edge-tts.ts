import { stat } from 'node:fs/promises'
import { synthesizeWithEdgeTts } from '../src/services/youtube/tts/edge.ts'

const text = process.argv.slice(2).join(' ') || 'এটি একটি বাংলা ভয়েস পরীক্ষা।'
const output = process.env.EDGE_TTS_OUTPUT || 'test-edge-voice.mp3'

await synthesizeWithEdgeTts({
  text,
  outputPath: output,
  voice: process.env.EDGE_TTS_VOICE,
  runner: process.env.EDGE_TTS_RUNNER === 'python' ? 'python' : 'edge-tts',
})

const result = await stat(output)
console.log(`Edge TTS voice test complete: ${output} (${result.size} bytes)`)
