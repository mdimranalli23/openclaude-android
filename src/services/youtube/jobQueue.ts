import type { ShortsJob } from './types.js'

export type QueuedShortsJob = { job: ShortsJob; runAt: number }

export class ShortsJobQueue {
  private readonly jobs: QueuedShortsJob[] = []

  enqueue(job: ShortsJob): void {
    const runAt = job.publishAt ? Date.parse(job.publishAt) : Date.now()
    if (!Number.isFinite(runAt)) throw new Error(`Invalid schedule for job ${job.id}`)
    this.jobs.push({ job, runAt })
    this.jobs.sort((a, b) => a.runAt - b.runAt)
  }

  due(now = Date.now()): ShortsJob[] {
    const ready: ShortsJob[] = []
    while (this.jobs[0]?.runAt <= now) ready.push(this.jobs.shift()!.job)
    return ready
  }

  get size(): number { return this.jobs.length }
}
