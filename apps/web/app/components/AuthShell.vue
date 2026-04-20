<template>
  <div
    class="relative h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
  >
    <!-- 背景网格 -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"
    />

    <!-- 背景光晕 -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br"
        :class="haloColors[0]"
      />
      <div
        class="absolute top-1/3 -right-32 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br"
        :class="haloColors[1]"
      />
      <div
        class="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br"
        :class="haloColors[2]"
      />
    </div>

    <div class="relative flex h-full flex-col lg:flex-row overflow-auto">
      <!-- 左侧装饰区 -->
      <div
        v-if="showLeft"
        class="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <!-- 渐变背景 -->
        <div
          class="absolute inset-0"
          :class="leftGradient"
        />
        <!-- 网格 -->
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"
        />

        <!-- 左侧内容 -->
        <div
          class="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white"
        >
          <!-- Logo -->
          <div class="flex items-center gap-3 mb-12">
            <div
              class="relative h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl"
            >
              <svg
                class="h-7 w-7"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
                />
              </svg>
              <div
                class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"
              />
            </div>
            <div>
              <h2 class="text-2xl font-bold tracking-tight">AIO Admin</h2>
              <p class="text-xs text-white/60">企业级管理系统</p>
            </div>
          </div>

          <!-- 标题和描述 -->
          <h1 class="text-5xl xl:text-6xl font-bold mb-6 leading-tight">
            {{ leftTitle }}
            <span class="inline-block ml-2">{{ leftEmoji }}</span>
          </h1>
          <p class="text-lg text-white/70 max-w-md leading-relaxed mb-12">
            {{ leftDescription }}
          </p>

          <!-- 特性列表 -->
          <div class="space-y-4">
            <div
              v-for="(item, index) in leftFeatures"
              :key="index"
              class="flex items-center gap-3 group"
            >
              <div
                class="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
              >
                {{ item.icon }}
              </div>
              <span class="text-white/90">{{ item.text }}</span>
            </div>
          </div>
        </div>

        <!-- 浮动点 -->
        <div
          v-for="i in 6"
          :key="i"
          class="absolute w-2 h-2 rounded-full bg-white/20"
          :style="{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }"
        />
      </div>

      <!-- 右侧表单区 -->
      <div
        class="flex-1 flex items-center justify-center p-3 sm:p-4 lg:px-10 lg:py-6"
      >
        <div class="w-full max-w-md">
          <!-- 移动端 Logo -->
          <div class="mb-5 lg:hidden text-center">
            <div
              class="inline-flex items-center gap-3 mb-3 px-6 py-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl"
            >
              <svg
                class="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
                />
              </svg>
              <span class="text-xl font-bold text-white">AIO Admin</span>
            </div>
            <p class="text-sm text-muted">{{ mobileSubtitle }}</p>
          </div>

          <!-- 卡片 -->
          <div
            class="border border-muted shadow-2xl backdrop-blur-xl bg-elevated/80 rounded-xl overflow-hidden"
          >
            <!-- 顶部装饰线 -->
            <div
              class="h-1"
              :class="topLineGradient"
            />

            <!-- 表单内容 -->
            <div class="p-6 sm:p-8">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    showLeft?: boolean
    leftGradient?: string
    leftTitle?: string
    leftEmoji?: string
    leftDescription?: string
    leftFeatures?: Array<{ icon: string; text: string }>
    mobileSubtitle?: string
    topLineGradient?: string
    haloColors?: string[]
  }

  withDefaults(defineProps<Props>(), {
    showLeft: true,
    leftGradient:
      'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700',
    leftTitle: '欢迎',
    leftEmoji: '👋',
    leftDescription: '登录您的账户，开始管理您的业务数据和团队协作。',
    leftFeatures: () => [
      { icon: '🚀', text: '快速部署，即刻启动' },
      { icon: '📊', text: '实时数据分析与可视化' },
      { icon: '🔒', text: '企业级安全保障' },
      { icon: '⚡', text: '极致性能体验' },
    ],
    mobileSubtitle: '欢迎回来，请登录您的账户',
    topLineGradient:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600',
    haloColors: () => [
      'from-blue-400/30 to-cyan-400/30',
      'from-indigo-400/30 to-purple-400/30',
      'from-violet-400/20 to-pink-400/20',
    ],
  })
</script>
