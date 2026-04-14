// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  modules: ['@pinia/nuxt', '@vueuse/nuxt'],
  devtools: { enabled: true },

  runtimeConfig: {
    // 服务端私有配置
    apiSecret: process.env.API_SECRET,
    // 客户端公开配置
    public: {
      LOG_LEVEL: process.env.NUXT_PUBLIC_LOG_LEVEL ?? 'info',
      env: process.env.NUXT_PUBLIC_ENV ?? 'local',
      // API 配置
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      mock: process.env.NUXT_PUBLIC_MOCK === 'true',

      // 演示账号配置
      demoEmail:
        process.env.NUXT_PUBLIC_DEMO_EMAIL || 'admin@halolight.h7ml.cn',
      demoPassword: process.env.NUXT_PUBLIC_DEMO_PASSWORD || '123456',
      showDemoHint: process.env.NUXT_PUBLIC_SHOW_DEMO_HINT !== 'false',

      // 注册开关配置（默认关闭）
      ENABLE_REGISTRATION:
        process.env.NUXT_PUBLIC_ENABLE_REGISTRATION || 'false',

      // 应用配置
      appTitle: process.env.NUXT_PUBLIC_APP_TITLE || 'Admin Pro',
      brandName: process.env.NUXT_PUBLIC_BRAND_NAME || 'Halolight',

      // 分析配置
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
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
      ],
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.NUXT_API_BACKEND_URL || 'http://localhost:3000',
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
        // 51.la 统计
        {
          id: 'LA_COLLECT',
          src: '//sdk.51.la/js-sdk-pro.min.js?id=L1NaKSoU1jvMh9mE&ck=L1NaKSoU1jvMh9mE&autoTrack=true&hashMode=true&screenRecord=true',
        },
        // Google Analytics
        {
          async: true,
          src: 'https://www.googletagmanager.com/gtag/js?id=G-XMS590XWNN',
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
})
