import { expect, test } from 'bun:test'
import { ShortsJobQueue } from './jobQueue.js'
import { createShortsJob } from './shortsPipeline.js'

test('returns scheduled jobs only when due', () => {
  const queue = new ShortsJobQueue()
  const job = createShortsJob({ topic: 'topic', source: [{ id: 'x', uri: 'file:///x', license: 'owned' }], publishAt: '2030-01-01T00:00:00.000Z' })
  queue.enqueue(job)
  expect(queue.due(Date.parse('2029-12-31T23:59:59.000Z'))).toHaveLength(0)
  expect(queue.due(Date.parse('2030-01-01T00:00:00.000Z'))).toHaveLength(1)
})
