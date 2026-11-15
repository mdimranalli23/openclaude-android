import { randomUUID } from 'node:crypto'
import type {
  ShortsJob,
  ShortsJobInput,
  ShortsValidationError,
} from './types.js'

const MAX_TITLE_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 5000

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function buildTitle(input: ShortsJobInput): string {
  const title = cleanText(input.title ?? input.topic)
  return title.slice(0, MAX_TITLE_LENGTH)
}

function buildDescription(input: ShortsJobInput): string {
  const description = cleanText(input.description ?? `${input.topic} — বাংলা Shorts`)
  return description.slice(0, MAX_DESCRIPTION_LENGTH)
}

function buildHashtags(input: ShortsJobInput): string[] {
  const tags = input.hashtags ?? []
  const normalized = tags
    .map(tag => tag.trim().replace(/^#/, '').replace(/\s+/g, ''))
    .filter(Boolean)
  return [...new Set(normalized)].slice(0, 15)
}

/**
 * Validate and normalize a Shorts job before rendering or uploading.
 *
 * This deliberately rejects unlicensed media. It is a safety boundary for
 * callers; it does not attempt to determine ownership from a URL.
 */
export function validateShortsJob(input: ShortsJobInput): ShortsValidationError[] {
  const errors: ShortsValidationError[] = []
  const topic = cleanText(input.topic)
  const duration = input.durationSeconds ?? 45

  if (!topic) errors.push({ field: 'topic', message: 'A topic is required.' })
  if (!Number.isInteger(duration) || duration < 1 || duration > 180) {
    errors.push({
      field: 'durationSeconds',
      message: 'Duration must be an integer between 1 and 180 seconds.',
    })
  }
  if (input.source.length === 0) {
    errors.push({ field: 'source', message: 'At least one media source is required.' })
  }
  input.source.forEach((source, index) => {
    if (!source.id.trim()) errors.push({ field: `source[${index}].id`, message: 'Source id is required.' })
    if (!source.uri.trim()) errors.push({ field: `source[${index}].uri`, message: 'Source URI is required.' })
    if (!['owned', 'licensed', 'royalty-free'].includes(source.license)) {
      errors.push({ field: `source[${index}].license`, message: 'Media must be owned, licensed, or royalty-free.' })
    }
    if (source.license !== 'owned' && !source.attribution?.trim()) {
      errors.push({ field: `source[${index}].attribution`, message: 'Attribution is required for non-owned media.' })
    }
  })
  if (input.publishAt && Number.isNaN(Date.parse(input.publishAt))) {
    errors.push({ field: 'publishAt', message: 'publishAt must be a valid ISO date.' })
  }
  return errors
}

export function createShortsJob(input: ShortsJobInput): ShortsJob {
  const errors = validateShortsJob(input)
  if (errors.length > 0) {
    throw new Error(`Invalid Shorts job: ${errors.map(error => `${error.field}: ${error.message}`).join(' ')}`)
  }

  return {
    id: randomUUID(),
    topic: cleanText(input.topic),
    language: input.language ?? 'bn',
    durationSeconds: input.durationSeconds ?? 45,
    aspectRatio: '9:16',
    source: input.source,
    metadata: {
      title: buildTitle(input),
      description: buildDescription(input),
      hashtags: buildHashtags(input),
    },
    ...(input.publishAt ? { publishAt: new Date(input.publishAt).toISOString() } : {}),
  }
}
