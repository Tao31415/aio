// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      LOG_LEVEL: process.env.NUXT_PUBLIC_LOG_LEVEL ?? 'info',
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3000',
      env: process.env.NUXT_PUBLIC_ENV ?? 'local',
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        'pino', // CJS
      ],
    },
  },
})
