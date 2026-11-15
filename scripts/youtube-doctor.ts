const checks: Array<{ name: string; ok: boolean; detail: string }> = []

const required = (name: string, value: string | undefined) => {
  checks.push({ name, ok: Boolean(value?.trim()), detail: value?.trim() ? 'configured' : 'missing' })
}

required('YOUTUBE_DATA_API_KEY', process.env.YOUTUBE_DATA_API_KEY)
required('YOUTUBE_OAUTH_ACCESS_TOKEN', process.env.YOUTUBE_OAUTH_ACCESS_TOKEN)
required('SHORTS_AI_API_KEY', process.env.SHORTS_AI_API_KEY)

try {
  const output = await Bun.$`ffmpeg -version`.text()
  checks.push({ name: 'ffmpeg', ok: output.startsWith('ffmpeg'), detail: output.split('\n')[0] ?? 'installed' })
} catch {
  checks.push({ name: 'ffmpeg', ok: false, detail: 'missing from PATH' })
}

for (const check of checks) console.log(`${check.ok ? 'OK ' : 'ERR'} ${check.name}: ${check.detail}`)
if (checks.some(check => !check.ok)) process.exit(1)
