import { describe, expect, test } from 'bun:test'
import { createShortsJob } from './shortsPipeline.js'
import { uploadShortsVideo } from './uploader.js'

const job = createShortsJob({
  topic: 'বাংলা প্রযুক্তি খবর',
  source: [{ id: 'owned-1', uri: 'file:///clip.mp4', license: 'owned' }],
  publishAt: '2030-01-01T12:00:00.000Z',
})

describe('YouTube uploader', () => {
  test('uploads scheduled jobs as private and returns the Shorts URL', async () => {
    let request: Request | undefined
    const result = await uploadShortsVideo(job, {
      accessToken: 'oauth-token',
      video: new Uint8Array([1, 2, 3]),
      copyrightCheck: { allowed: true, errors: [], warnings: [], mediaHashes: {} },
      fetchImpl: async (_input, init) => {
        request = new Request(String(_input), init)
        return new Response(JSON.stringify({ id: 'abc123' }), { status: 200 })
      },
    })

    expect(result.url).toBe('https://www.youtube.com/shorts/abc123')
    expect(request?.headers.get('authorization')).toBe('Bearer oauth-token')
    expect(request?.method).toBe('POST')
  })

  test('rejects public scheduling', async () => {
    await expect(
      uploadShortsVideo(job, {
        accessToken: 'oauth-token',
        video: new Uint8Array([1]),
        copyrightCheck: { allowed: true, errors: [], warnings: [], mediaHashes: {} },
        privacyStatus: 'public',
        fetchImpl: async () => new Response('{}', { status: 200 }),
      }),
    ).rejects.toThrow('Scheduled videos must be uploaded as private')
  })
})
