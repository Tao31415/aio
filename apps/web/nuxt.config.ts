// https://nuxt.com/docs/api/configuration/nuxt-config

// 导入环境变量校验（必须在最前面，在任何配置使用环境变量之前）
import { validateEnv } from './env.validation'
// 在模块加载时自动校验（构建时和运行时）
const env = validateEnv()

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/ui',
    '@nuxt/image',
    'nuxt-echarts',
  ],
  devtools: { enabled: true },

  nitro: {
    preset: 'bun', // 或者 'bun-server'
  },

  sourcemap: false,

  runtimeConfig: {
    public: {
      logLevel: env.NUXT_PUBLIC_LOG_LEVEL,
      env: env.NUXT_PUBLIC_ENV,
      // API 配置
      apiBase: env.NUXT_PUBLIC_API_BASE,
      // Better Auth 基础路径
      authBasePath: env.BETTER_AUTH_BASE_PATH,
      mock: env.NUXT_PUBLIC_MOCK,

      // 演示账号配置
      demoUsername: env.NUXT_PUBLIC_DEMO_USERNAME,
      demoPassword: env.NUXT_PUBLIC_DEMO_PASSWORD,
      showDemoHint: env.NUXT_PUBLIC_SHOW_DEMO_HINT,

      // 应用配置
      appTitle: env.NUXT_PUBLIC_APP_TITLE,
      brandName: env.NUXT_PUBLIC_BRAND_NAME,
    },
  },

  // 组件自动导入
  components: [
    {
      path: '~/components/common',
      pathPrefix: false,
    },
    {
      path: '~/components/dashboard',
      pathPrefix: false,
    },
    {
      path: '~/components/icons',
      pathPrefix: false,
    },
    {
      path: '~/components',
      pathPrefix: false,
    },
    {
      path: '~/components/customers',
      pathPrefix: true,
    },
    {
      path: '~/components/home',
      pathPrefix: true,
    },
    {
      path: '~/components/settings',
      pathPrefix: true,
    },
    {
      path: '~/components/inbox',
      pathPrefix: true,
    },
  ],
  vite: {
    optimizeDeps: {
      include: [
        'pino', // CJS
        'pinia-plugin-persistedstate',
        'mockjs', // CJS
        'better-auth/client',
        'better-auth/client/plugins',
        'zod',
        'date-fns',
        '@unovis/vue',
        '@internationalized/date',
      ],
    },
    server: {
      proxy: {
        '/api': {
          target: env.NUXT_PUBLIC_API_BASE,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
  css: ['~/assets/css/main.css'],
  // 应用头部配置
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'AIO Admin',
      meta: [
        { name: 'description', content: 'Aio 现代化中文后台管理系统' },
        { name: 'keywords', content: 'admin, dashboard, management' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://font.webcache.cn/google/css2?family=Noto+Sans+SC:wght@100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
        },
      ],
      script: [
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-XMS590XWNN');`,
        },
      ],
    },
  },

  // i18n 配置
  // i18n: {
  //   defaultLocale: 'zh-CN',
  //   locales: [
  //     { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
  //     {
  //       code: 'zh-CN',
  //       language: 'zh-CN',
  //       name: '简体中文',
  //       file: 'zh-CN.json',
  //     },
  //   ],
  //   restructureDir: './app/i18n',
  // },

  // Nuxt UI 配置
  ui: {
    fonts: false,
    experimental: {
      componentDetection: true,
    },
  },

  // Nuxt Image 配置
  image: {
    provider: 'ipx',
    quality: 80,
    format: ['webp', 'avif', 'jpeg'],
  },

  // Nuxt ECharts 配置
  echarts: {
    renderer: 'svg',
    charts: ['LineChart', 'BarChart', 'PieChart', 'ScatterChart'],
    components: [
      'GridComponent',
      'TooltipComponent',
      'LegendComponent',
      'TitleComponent',
      'GeoComponent',
    ],
  },
})
