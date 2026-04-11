// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3000',
      env: process.env.NUXT_PUBLIC_ENV ?? 'unknown',
    },
  },
  // build: {
  //   transpile: ['@aio/utils'],
  // },
  // // vite: {
  // //   resolve: {
  // //     alias: {
  // //       '@aio/utils': path.resolve(
  // //         __dirname,
  // //         '../../packages/utils/src/index.ts'
  // //       ),
  // //     },
  // //   },
  // //   optimizeDeps: {
  // //     exclude: ['@aio/utils'],
  // //   },
  // // },
})
