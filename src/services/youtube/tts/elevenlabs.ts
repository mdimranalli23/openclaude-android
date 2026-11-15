export type ElevenLabsTtsOptions = {
  apiKey: string
  voiceId: string
  text: string
  modelId?: string
  outputFormat?: string
  fetchImpl?: typeof fetch
}

/** Generate narration audio with ElevenLabs. The API key must come from a server environment. */
export async function synthesizeBengaliNarration(
  options: ElevenLabsTtsOptions,
): Promise<Uint8Array> {
  const apiKey = options.apiKey.trim()
  const voiceId = options.voiceId.trim()
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is required.')
  if (!voiceId) throw new Error('An ElevenLabs voice ID is required.')
  if (!options.text.trim()) throw new Error('Narration text is required.')

  const response = await (options.fetchImpl ?? fetch)(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(options.outputFormat ?? 'mp3_44100_128')}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({
        text: options.text,
        model_id: options.modelId ?? 'eleven_multilingual_v2',
      }),
    },
  )
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${body.slice(0, 300)}`)
  }
  return new Uint8Array(await response.arrayBuffer())
}
