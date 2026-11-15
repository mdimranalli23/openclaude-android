import { expect, test } from 'bun:test'
import { discoverYouTubeTrends } from './trends.js'

test('discovers and scores YouTube trends using official API endpoints', async () => {
  const result = await discoverYouTubeTrends({
    apiKey: 'key', query: 'technology', fetchImpl: async input => {
      const url = String(input)
      if (url.includes('/search')) return new Response(JSON.stringify({ items: [{ id: { videoId: 'v1' } }] }))
      return new Response(JSON.stringify({ items: [{ id: 'v1', snippet: { title: 'Trend' }, statistics: { viewCount: '10', likeCount: '2', commentCount: '1' } }] }))
    },
  })
  expect(result[0]?.score).toBe(90)
})
