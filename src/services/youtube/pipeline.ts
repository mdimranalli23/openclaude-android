import { readFile } from 'node:fs/promises'
import { checkCopyrightBeforePublish, type CopyrightCheckOptions } from './copyrightGuard.js'
import { renderShorts, type ShortsRenderOptions } from './renderer.js'
import { uploadShortsVideo, type YouTubeUploadOptions, type YouTubeUploadResult } from './uploader.js'
import { synthesizeWithEdgeTts, type EdgeTtsOptions } from './tts/edge.js'
import type { ShortsJob } from './types.js'

export type ShortsPublishPipelineOptions = {
  job: ShortsJob
  render: ShortsRenderOptions
  /** Optional no-key narration. The generated MP3 is mixed into the render. */
  narration?: Omit<EdgeTtsOptions, 'outputPath'> & { outputPath: string }
  copyright?: CopyrightCheckOptions
  upload: Omit<YouTubeUploadOptions, 'video' | 'copyrightCheck'>
}

export type ShortsPublishPipelineResult = {
  job: ShortsJob
  renderedPath: string
  copyrightWarnings: string[]
  upload: YouTubeUploadResult
}

/** Run render, copyright gate, and upload in a fixed safe order. */
export async function publishShorts(
  options: ShortsPublishPipelineOptions,
): Promise<ShortsPublishPipelineResult> {
  let renderOptions = options.render
  if (options.narration) {
    await synthesizeWithEdgeTts(options.narration)
    renderOptions = { ...options.render, audioPath: options.narration.outputPath }
  }
  const renderedPath = await renderShorts(options.job, renderOptions)
  const copyrightCheck = await checkCopyrightBeforePublish(options.job, options.copyright)
  if (!copyrightCheck.allowed) {
    throw new Error(`Publish blocked by copyright gate: ${copyrightCheck.errors.join('; ')}`)
  }
  const video = new Uint8Array(await readFile(renderedPath))
  const upload = await uploadShortsVideo(options.job, {
    ...options.upload,
    video,
    copyrightCheck,
  })
  return {
    job: options.job,
    renderedPath,
    copyrightWarnings: copyrightCheck.warnings,
    upload,
  }
}
