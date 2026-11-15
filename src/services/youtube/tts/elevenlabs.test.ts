import { expect, test } from 'bun:test'
import { synthesizeBengaliNarration } from './elevenlabs.js'

test('calls ElevenLabs with the configured male voice id', async () => {
  let request: Request | undefined
  const audio = await synthesizeBengaliNarration({
    apiKey: 'secret',
    voiceId: 'yBaXvGi8AgNwOlM8apDk',
    text: 'একটি ছোট গল্প।',
    fetchImpl: async (input, init) => {
      request = new Request(String(input), init)
      return new Response(new Uint8Array([1, 2, 3]), { status: 200 })
    },
  })
  expect(request?.headers.get('xi-api-key')).toBe('secret')
  expect(request?.url).toContain('yBaXvGi8AgNwOlM8apDk')
  expect(audio).toEqual(new Uint8Array([1, 2, 3]))
})
