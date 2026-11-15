import { describe, expect, test } from 'bun:test'
import { createShortsJob, validateShortsJob } from './shortsPipeline.js'

const source = {
  id: 'clip-1',
  uri: 'file:///tmp/clip.mp4',
  license: 'licensed' as const,
  attribution: 'Example creator',
}

describe('Shorts pipeline core', () => {
  test('creates a Bengali 9:16 job with normalized metadata', () => {
    const job = createShortsJob({
      topic: '  আজকের টেক খবর  ',
      source: [source],
      hashtags: ['#Tech', 'Tech', 'বাংলা খবর'],
    })

    expect(job.language).toBe('bn')
    expect(job.aspectRatio).toBe('9:16')
    expect(job.topic).toBe('আজকের টেক খবর')
    expect(job.metadata.hashtags).toEqual(['Tech', 'বাংলাখবর'])
  })

  test('rejects media without a usable license boundary', () => {
    const errors = validateShortsJob({
      topic: 'topic',
      source: [{ id: 'x', uri: 'https://example.test/video.mp4', license: 'licensed' }],
    })

    expect(errors.some(error => error.field === 'source[0].attribution')).toBe(true)
  })

  test('rejects invalid duration and empty source list', () => {
    const errors = validateShortsJob({ topic: 'topic', durationSeconds: 181, source: [] })
    expect(errors.map(error => error.field)).toEqual(['durationSeconds', 'source'])
  })
})
