import { describe, expect, test } from 'bun:test'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkCopyrightBeforePublish } from './copyrightGuard.js'
import { createShortsJob } from './shortsPipeline.js'

describe('copyright publish gate', () => {
  test('blocks exact duplicate local media', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'openclaude-copyright-'))
    const file = join(dir, 'clip.mp4')
    await writeFile(file, 'same-content')
    const job = createShortsJob({
      topic: 'topic',
      source: [{ id: 'clip', uri: `file://${file}`, license: 'owned' }],
    })

    const first = await checkCopyrightBeforePublish(job)
    const second = await checkCopyrightBeforePublish(job, {
      knownHashes: new Set(Object.values(first.mediaHashes)),
    })

    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(false)
    expect(second.errors[0]).toContain('exact duplicate')
  })

  test('warns for remote media instead of pretending it was fingerprinted', async () => {
    const job = createShortsJob({
      topic: 'topic',
      source: [{ id: 'remote', uri: 'https://example.test/clip.mp4', license: 'licensed', attribution: 'Creator' }],
    })
    const result = await checkCopyrightBeforePublish(job)
    expect(result.allowed).toBe(true)
    expect(result.warnings[0]).toContain('not fingerprinted locally')
  })
})
