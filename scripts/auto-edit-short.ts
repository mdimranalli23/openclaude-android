import { renderShorts } from '../src/services/youtube/renderer.ts'
import type { ShortsJob } from '../src/services/youtube/types.ts'

const [inputPath = 'input.mp4', audioPath = 'narration.mp3', outputPath = 'output-short.mp4'] = process.argv.slice(2)

const job: ShortsJob = {
  id: 'local-auto-edit',
  topic: 'Local short video',
  language: 'bn',
  durationSeconds: 60,
  aspectRatio: '9:16',
  source: [{ id: 'local-input', uri: inputPath, license: 'owned' }],
  metadata: { title: 'Local short video', description: '', hashtags: [] },
}

await renderShorts(job, { inputPath, audioPath, outputPath })
console.log(`Auto edit complete: ${outputPath}`)
