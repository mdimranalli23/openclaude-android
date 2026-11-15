import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import type { ShortsJob } from './types.js'

export type CopyrightCheckResult = {
  allowed: boolean
  errors: string[]
  warnings: string[]
  mediaHashes: Record<string, string>
}

export type CopyrightCheckOptions = {
  /** Hashes of media already used by published or queued videos. */
  knownHashes?: ReadonlySet<string>
  /** Require explicit attribution for licensed and royalty-free media. */
  requireAttribution?: boolean
}

function isLocalFile(uri: string): boolean {
  return uri.startsWith('file://')
}

function localPath(uri: string): string {
  return decodeURIComponent(uri.slice('file://'.length))
}

/** Compute a stable SHA-256 hash for local media before it enters the queue. */
export async function hashMedia(uri: string): Promise<string | null> {
  if (!isLocalFile(uri)) return null
  const bytes = await readFile(localPath(uri))
  return createHash('sha256').update(bytes).digest('hex')
}

/**
 * Final publish gate. It checks declared rights and exact duplicate media.
 * It cannot determine ownership from a URL or guarantee that YouTube will not
 * issue a Content ID claim; callers should still retain license evidence.
 */
export async function checkCopyrightBeforePublish(
  job: ShortsJob,
  options: CopyrightCheckOptions = {},
): Promise<CopyrightCheckResult> {
  const errors: string[] = []
  const warnings: string[] = []
  const mediaHashes: Record<string, string> = {}
  const requireAttribution = options.requireAttribution ?? true

  for (const source of job.source) {
    if (source.license !== 'owned' && requireAttribution && !source.attribution?.trim()) {
      errors.push(`${source.id}: attribution is required for ${source.license} media`)
    }

    try {
      const hash = await hashMedia(source.uri)
      if (!hash) {
        warnings.push(`${source.id}: remote media was not fingerprinted locally`)
        continue
      }
      mediaHashes[source.id] = hash
      if (options.knownHashes?.has(hash)) {
        errors.push(`${source.id}: exact duplicate media is already queued or published`)
      }
    } catch {
      errors.push(`${source.id}: media could not be read for copyright verification`)
    }
  }

  return { allowed: errors.length === 0, errors, warnings, mediaHashes }
}
