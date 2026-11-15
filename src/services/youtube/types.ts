export type MediaLicense = 'owned' | 'licensed' | 'royalty-free'

export type ShortsSource = {
  id: string
  uri: string
  license: MediaLicense
  attribution?: string
}

export type ShortsJobInput = {
  topic: string
  language?: 'bn' | 'en'
  durationSeconds?: number
  source: ShortsSource[]
  title?: string
  description?: string
  hashtags?: string[]
  publishAt?: string
}

export type ShortsJob = {
  id: string
  topic: string
  language: 'bn' | 'en'
  durationSeconds: number
  aspectRatio: '9:16'
  source: ShortsSource[]
  metadata: {
    title: string
    description: string
    hashtags: string[]
  }
  publishAt?: string
}

export type ShortsValidationError = {
  field: string
  message: string
}
