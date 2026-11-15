# YouTube Shorts automation setup

The code supports this pipeline:

`trend search → Bengali script → licensed media → FFmpeg 9:16 render → copyright gate → YouTube upload`

## 1. Install runtime dependencies

```bash
npm install -g bun
sudo apt-get install ffmpeg
bun install
```

## 2. Create API credentials

- In Google Cloud Console, enable **YouTube Data API v3** and create an API key for trend search.
- Create an OAuth client for YouTube upload with the `youtube.upload` scope.
- Create an AI provider key for script generation.

Do not commit any of these values. Put them in the shell environment or a local `.env` file ignored by git:

```bash
export YOUTUBE_DATA_API_KEY='...'
export YOUTUBE_OAUTH_ACCESS_TOKEN='...'
export SHORTS_AI_API_KEY='...'
export SHORTS_AI_BASE_URL='https://api.openai.com/v1'
export SHORTS_AI_MODEL='gpt-4o-mini'
```

Run the local check:

```bash
bun run scripts/youtube-doctor.ts
```

## 3. Content requirements

Only use footage that is owned, licensed, or explicitly royalty-free. Keep the license URL/receipt and attribution with every source. The publish gate blocks missing attribution and exact duplicate local media; it cannot prove ownership of a remote URL or guarantee that YouTube will never make a Content ID claim.

## 4. Upload requirements

The uploader requires a current OAuth access token. A production app must implement refresh-token storage and OAuth consent in its Android/server UI. Scheduled videos must remain private until YouTube publishes them.

## 5. Android limitation

This repository contains the OpenClaude runtime but no native Android Gradle project or signing credentials. The Shorts services can run in the runtime/server; an APK dashboard requires the Android project, package name, signing key, and OAuth redirect configuration.
