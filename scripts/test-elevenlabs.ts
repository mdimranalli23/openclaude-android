import { writeFile } from 'node:fs/promises'
import { synthesizeBengaliNarration } from '../src/services/youtube/tts/elevenlabs.ts'

const apiKey = process.env.ELEVENLABS_API_KEY
const voiceId = process.env.ELEVENLABS_VOICE_ID ?? 'yBaXvGi8AgNwOlM8apDk'

if (!apiKey) {
  console.error('ELEVENLABS_API_KEY is missing. Put it in .env or export it first.')
  process.exit(1)
}

const audio = await synthesizeBengaliNarration({
  apiKey,
  voiceId,
  text: 'একটি ছোট্ট গ্রামের গল্প। সততা ও ভালো কাজ সবসময় মানুষের জীবনে আলো নিয়ে আসে।',
})
await writeFile('test-voice.mp3', audio)
console.log(`Voice test complete: test-voice.mp3 (${audio.byteLength} bytes)`)
