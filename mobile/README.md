# OpenClaude Shorts Android wrapper

This is the mobile UI scaffold for the Shorts editor. It is intentionally free
of API keys; TTS and FFmpeg must run in a trusted local/backend process.

To turn it into an Android project after installing Capacitor dependencies:

```bash
cd mobile
npm install
npx cap add android
npx cap sync android
```

The current screen is a safe UI scaffold. Native file picking, the Edge TTS
bridge, FFmpeg rendering, and YouTube OAuth are separate integration steps.
