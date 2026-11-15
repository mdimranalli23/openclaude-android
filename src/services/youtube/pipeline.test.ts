import { expect, test } from 'bun:test'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createShortsJob } from './shortsPipeline.js'
import { publishShorts } from './pipeline.js'

test('runs render, copyright gate, and upload in order', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'openclaude-pipeline-'))
  const input = join(dir, 'input.mp4')
  const output = join(dir, 'output.mp4')
  await writeFile(input, 'media')
  await writeFile(output, 'rendered-media')
  const job = createShortsJob({ topic: 'topic', source: [{ id: 'clip', uri: `file://${input}`, license: 'owned' }] })

  const result = await publishShorts({
    job,
    render: { ffmpegPath: 'true', inputPath: input, outputPath: output },
    copyright: { knownHashes: new Set() },
    upload: { accessToken: 'token', fetchImpl: async () => new Response(JSON.stringify({ id: 'uploaded' })) },
  })
  expect(result.upload.id).toBe('uploaded')
})
