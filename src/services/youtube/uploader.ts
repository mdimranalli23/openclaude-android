import type { ShortsJob } from './types.js'
import type { CopyrightCheckResult } from './copyrightGuard.js'

export type YouTubePrivacyStatus = 'private' | 'unlisted' | 'public'

export type YouTubeUploadOptions = {
  accessToken: string
  video: Uint8Array
  copyrightCheck: CopyrightCheckResult
  privacyStatus?: YouTubePrivacyStatus
  fetchImpl?: typeof fetch
}

export type YouTubeUploadResult = {
  id: string
  url: string
}

const UPLOAD_ENDPOINT =
  'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart'

function requireToken(token: string): string {
  const value = token.trim()
  if (!value) throw new Error('A YouTube OAuth access token is required.')
  return value
}

/**
 * Upload a rendered Shorts file through YouTube Data API v3.
 * The caller owns OAuth refresh and should pass a current access token.
 */
export async function uploadShortsVideo(
  job: ShortsJob,
  options: YouTubeUploadOptions,
): Promise<YouTubeUploadResult> {
  const token = requireToken(options.accessToken)
  if (options.video.byteLength === 0) throw new Error('The rendered video is empty.')
  if (!options.copyrightCheck.allowed) {
    throw new Error(`Copyright check failed: ${options.copyrightCheck.errors.join('; ')}`)
  }

  const privacyStatus = options.privacyStatus ?? 'private'
  if (job.publishAt && privacyStatus === 'public') {
    throw new Error('Scheduled videos must be uploaded as private.')
  }

  const metadata = {
    snippet: {
      title: job.metadata.title,
      description: job.metadata.description,
      tags: job.metadata.hashtags,
      categoryId: '22',
    },
    status: {
      privacyStatus,
      ...(job.publishAt ? { publishAt: job.publishAt } : {}),
      selfDeclaredMadeForKids: false,
    },
  }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('video', new Blob([options.video], { type: 'video/mp4' }))

  const response = await (options.fetchImpl ?? fetch)(UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`YouTube upload failed (${response.status}): ${body.slice(0, 500)}`)
  }

  const payload = (await response.json()) as { id?: string }
  if (!payload.id) throw new Error('YouTube returned no video id.')
  return { id: payload.id, url: `https://www.youtube.com/shorts/${payload.id}` }
}
