export type TrendCandidate = {
  videoId: string
  title: string
  channelTitle: string
  publishedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  score: number
}

type YouTubeSearchResponse = {
  items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string; publishedAt?: string } }>
}
type YouTubeVideosResponse = {
  items?: Array<{ id?: string; snippet?: { title?: string; channelTitle?: string; publishedAt?: string }; statistics?: { viewCount?: string; likeCount?: string; commentCount?: string } }>
}

export async function discoverYouTubeTrends(options: {
  apiKey: string
  query: string
  regionCode?: string
  maxResults?: number
  fetchImpl?: typeof fetch
}): Promise<TrendCandidate[]> {
  if (!options.apiKey.trim()) throw new Error('YouTube API key is required.')
  if (!options.query.trim()) throw new Error('A trend query is required.')
  const fetcher = options.fetchImpl ?? fetch
  const maxResults = Math.min(Math.max(options.maxResults ?? 10, 1), 50)
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
  searchUrl.search = new URLSearchParams({
    key: options.apiKey,
    part: 'snippet',
    type: 'video',
    order: 'viewCount',
    q: options.query,
    maxResults: String(maxResults),
    ...(options.regionCode ? { regionCode: options.regionCode } : {}),
  }).toString()
  const searchResponse = await fetcher(searchUrl)
  if (!searchResponse.ok) throw new Error(`YouTube trend search failed (${searchResponse.status})`)
  const search = (await searchResponse.json()) as YouTubeSearchResponse
  const ids = (search.items ?? []).map(item => item.id?.videoId).filter(Boolean) as string[]
  if (ids.length === 0) return []

  const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
  statsUrl.search = new URLSearchParams({ key: options.apiKey, part: 'snippet,statistics', id: ids.join(',') }).toString()
  const statsResponse = await fetcher(statsUrl)
  if (!statsResponse.ok) throw new Error(`YouTube trend statistics failed (${statsResponse.status})`)
  const stats = (await statsResponse.json()) as YouTubeVideosResponse
  return (stats.items ?? []).map(item => {
    const views = Number(item.statistics?.viewCount ?? 0)
    const likes = Number(item.statistics?.likeCount ?? 0)
    const comments = Number(item.statistics?.commentCount ?? 0)
    return {
      videoId: item.id ?? '',
      title: item.snippet?.title ?? '',
      channelTitle: item.snippet?.channelTitle ?? '',
      publishedAt: item.snippet?.publishedAt ?? '',
      viewCount: views,
      likeCount: likes,
      commentCount: comments,
      score: views + likes * 20 + comments * 40,
    }
  }).sort((a, b) => b.score - a.score)
}
