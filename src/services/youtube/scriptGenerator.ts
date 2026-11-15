export type ShortsScript = {
  hook: string
  narration: string
  scenes: Array<{ visual: string; caption: string }>
  callToAction: string
}

export async function generateBengaliShortsScript(options: {
  topic: string
  apiKey: string
  baseUrl?: string
  model?: string
  fetchImpl?: typeof fetch
}): Promise<ShortsScript> {
  if (!options.topic.trim()) throw new Error('A topic is required.')
  if (!options.apiKey.trim()) throw new Error('An AI API key is required.')
  const response = await (options.fetchImpl ?? fetch)(`${options.baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${options.apiKey}` },
    body: JSON.stringify({
      model: options.model ?? 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: 'বাংলায় 45 সেকেন্ডের মৌলিক YouTube Shorts script JSON হিসেবে তৈরি করো: hook, narration, scenes[{visual,caption}], callToAction। অন্যের ভিডিও কপি করার নির্দেশ দেবে না।' }, { role: 'user', content: options.topic }],
    }),
  })
  if (!response.ok) throw new Error(`Script generation failed (${response.status})`)
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error('AI returned an empty script.')
  const script = JSON.parse(content) as ShortsScript
  if (!script.hook || !script.narration || !Array.isArray(script.scenes) || !script.callToAction) {
    throw new Error('AI returned an invalid Shorts script.')
  }
  return script
}
