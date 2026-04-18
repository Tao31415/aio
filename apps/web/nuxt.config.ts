// https://nuxt.com/docs/api/configuration/nuxt-config

// 导入环境变量校验（必须在最前面，在任何配置使用环境变量之前）
import { validateEnv } from './utils/env.validation'
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
    '@nuxt/fonts',
    '@nuxt/image',
  ],
  devtools: { enabled: true },

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

      // 注册开关配置（默认关闭）
      ENABLE_REGISTRATION: env.NUXT_PUBLIC_ENABLE_REGISTRATION,

      // 应用配置
      appTitle: env.NUXT_PUBLIC_APP_TITLE,
      brandName: env.NUXT_PUBLIC_BRAND_NAME,

      // 分析配置
      gaId: env.NUXT_PUBLIC_GA_ID,
    },
  },
  // 自动导入配置
  imports: {
    dirs: ['composables/**', 'stores/**', 'utils/**'],
  },

  // 组件自动导入
  components: [
    {
      path: '~/components',
      pathPrefix: false,
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
      title: 'Admin Pro',
      meta: [
        { name: 'description', content: 'Halolight 现代化中文后台管理系统' },
        { name: 'keywords', content: 'admin, dashboard, management' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://font.webcache.cn/google/css2?family=Noto+Sans+SC:wght@100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
      script: [
        // Tailwind CSS CDN - 同步加载确保样式生效
        { src: 'https://cdn.tailwindcss.com' },
        // Tailwind 配置
        {
          innerHTML: `tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  border: 'hsl(var(--border))',
                  input: 'hsl(var(--input))',
                  ring: 'hsl(var(--ring))',
                  background: 'hsl(var(--background))',
                  foreground: 'hsl(var(--foreground))',
                  primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                  secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                  destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                  muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                  accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                  popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                  card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                },
                borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
              },
            },
          }`,
        },
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-XMS590XWNN');`,
        },
      ],
      style: [
        {
          innerHTML: `
            :root {
              --background: 0 0% 100%;
              --foreground: 222.2 84% 4.9%;
              --card: 0 0% 100%;
              --card-foreground: 222.2 84% 4.9%;
              --popover: 0 0% 100%;
              --popover-foreground: 222.2 84% 4.9%;
              --primary: 222.2 47.4% 11.2%;
              --primary-foreground: 210 40% 98%;
              --secondary: 210 40% 96.1%;
              --secondary-foreground: 222.2 47.4% 11.2%;
              --muted: 210 40% 96.1%;
              --muted-foreground: 215.4 16.3% 46.9%;
              --accent: 210 40% 96.1%;
              --accent-foreground: 222.2 47.4% 11.2%;
              --destructive: 0 84.2% 60.2%;
              --destructive-foreground: 210 40% 98%;
              --border: 214.3 31.8% 91.4%;
              --input: 214.3 31.8% 91.4%;
              --ring: 222.2 84% 4.9%;
              --radius: 0.5rem;
            }
            .dark {
              --background: 222.2 84% 4.9%;
              --foreground: 210 40% 98%;
              --card: 222.2 84% 4.9%;
              --card-foreground: 210 40% 98%;
              --popover: 222.2 84% 4.9%;
              --popover-foreground: 210 40% 98%;
              --primary: 210 40% 98%;
              --primary-foreground: 222.2 47.4% 11.2%;
              --secondary: 217.2 32.6% 17.5%;
              --secondary-foreground: 210 40% 98%;
              --muted: 217.2 32.6% 17.5%;
              --muted-foreground: 215 20.2% 65.1%;
              --accent: 217.2 32.6% 17.5%;
              --accent-foreground: 210 40% 98%;
              --destructive: 0 62.8% 30.6%;
              --destructive-foreground: 210 40% 98%;
              --border: 217.2 32.6% 17.5%;
              --input: 217.2 32.6% 17.5%;
              --ring: 212.7 26.8% 83.9%;
            }
            * { border-color: hsl(var(--border)); }
            body {
              background-color: hsl(var(--background));
              color: hsl(var(--foreground));
              font-family: 'Inter', system-ui, sans-serif;
            }
          `,
        },
      ],
    },
  },

  // ==================== Nuxt Modules 配置 ====================

  // i18n 配置
  // i18n: {
  //   defaultLocale: 'en',
  //   locales: [
  //     { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
  //     {
  //       code: 'zh-CN',
  //       language: 'zh-CN',
  //       name: '简体中文',
  //       file: 'zh-CN.json',
  //     },
  //     { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
  //     { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
  //   ],
  // },

  // Nuxt UI 配置
  ui: {
    experimental: {
      componentDetection: true,
    },
  },

  // Nuxt Fonts 配置
  fonts: {
    provider: 'local',
  },

  // Nuxt Image 配置
  image: {
    provider: 'ipx',
    quality: 80,
    format: ['webp', 'avif', 'jpeg'],
  },
})
