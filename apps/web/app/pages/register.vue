<template>
  <AuthShell
    left-gradient="bg-gradient-to-br from-purple-600 via-fuchsia-600 to-indigo-600"
    left-title="创建账户"
    left-emoji="✨"
    left-description="加入我们，开始体验强大的后台管理功能，提升您的工作效率。"
    mobile-subtitle="创建账户，开始您的旅程"
    :left-features="[
      { icon: '🎁', text: '完全免费的基础功能' },
      { icon: '📊', text: '实时数据分析和报告' },
      { icon: '👥', text: '团队协作和权限管理' },
      { icon: '💬', text: '7x24 小时技术支持' },
    ]"
    :halo-colors="[
      'from-purple-400/30 to-pink-400/30',
      'from-fuchsia-400/25 to-amber-400/25',
      'from-indigo-400/20 to-cyan-400/20',
    ]"
  >
    <div class="space-y-4">
      <div class="text-center">
        <h1
          class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          创建账户
        </h1>
        <p class="text-sm text-muted-foreground mt-2">填写以下信息完成注册</p>
      </div>

      <!-- 注册已关闭状态 -->
      <div
        v-if="!registrationEnabled"
        class="space-y-6 py-6"
      >
        <!-- 主要图标和标题 -->
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="relative">
            <div
              class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30"
            >
              <svg
                class="h-10 w-10 text-amber-600 dark:text-amber-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect
                  width="18"
                  height="11"
                  x="3"
                  y="11"
                  rx="2"
                />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div
              class="absolute -inset-2 rounded-full border-2 border-dashed border-amber-300/50 dark:border-amber-700/50 animate-spin-slow"
            />
          </div>

          <div class="space-y-2 text-center">
            <h3 class="text-xl font-semibold text-foreground sm:text-2xl">
              注册已关闭
            </h3>
            <p class="max-w-sm text-sm text-muted-foreground">
              系统管理员已暂时关闭新用户注册功能
            </p>
          </div>
        </div>

        <!-- 信息卡片 -->
        <div class="space-y-3">
          <div
            class="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/50 p-4 backdrop-blur-sm transition-colors hover:border-primary/20 hover:bg-muted/80"
          >
            <div
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"
            >
              <svg
                class="h-4 w-4 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect
                  width="20"
                  height="16"
                  x="2"
                  y="4"
                  rx="2"
                />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium text-foreground">联系管理员</p>
              <p class="text-xs text-muted-foreground">
                如需创建账号，请通过邮件联系系统管理员
              </p>
            </div>
          </div>

          <div
            class="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/50 p-4 backdrop-blur-sm transition-colors hover:border-primary/20 hover:bg-muted/80"
          >
            <div
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30"
            >
              <svg
                class="h-4 w-4 text-purple-600 dark:text-purple-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                />
              </svg>
            </div>
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium text-foreground">已有账号？</p>
              <p class="text-xs text-muted-foreground">
                如果您已有账号，请直接登录使用系统功能
              </p>
            </div>
          </div>
        </div>

        <!-- 装饰性分隔线 -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border/50" />
          </div>
          <div class="relative flex justify-center">
            <span class="bg-card px-4 text-xs text-muted-foreground">
              感谢您的理解
            </span>
          </div>
        </div>

        <!-- 返回登录按钮 -->
        <div class="space-y-3">
          <NuxtLink
            to="/login"
            class="block w-full"
          >
            <button
              class="w-full h-11 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              ← 返回登录
            </button>
          </NuxtLink>
          <p class="text-center text-xs text-muted-foreground">
            使用现有账号登录系统
          </p>
        </div>
      </div>

      <!-- 社交注册（开启状态） -->
      <div
        v-if="registrationEnabled"
        class="grid grid-cols-3 gap-2 sm:gap-3"
      >
        <a
          :href="SOCIAL_LINKS.github"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full h-11 sm:h-12 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center group relative"
          :title="'使用 GitHub 注册'"
        >
          <svg
            class="h-5 w-5 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
        </a>
        <a
          :href="SOCIAL_LINKS.google"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full h-11 sm:h-12 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center group relative"
          :title="'使用 Google 注册'"
        >
          <svg
            class="h-5 w-5 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </a>
        <a
          :href="SOCIAL_LINKS.wechat"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full h-11 sm:h-12 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center group relative"
          :title="'使用微信注册'"
        >
          <svg
            class="h-5 w-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.036 2.96c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.983.97-.983zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.983.97-.983z"
            />
          </svg>
        </a>
      </div>

      <!-- 分隔线 -->
      <div
        v-if="registrationEnabled"
        class="relative py-3"
      >
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border/50" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-card px-3 text-muted-foreground font-medium">
            或使用邮箱注册
          </span>
        </div>
      </div>

      <!-- 注册表单（开启状态） -->
      <form
        v-else
        @submit.prevent="handleSubmit"
        class="space-y-3"
      >
        <div
          v-if="auth.error || localError"
          class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          {{ auth.error || localError }}
        </div>

        <div class="space-y-2">
          <label class="text-xs font-medium text-muted-foreground">
            您的姓名
          </label>
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle
                cx="12"
                cy="7"
                r="4"
              />
            </svg>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full pl-10 pr-3 py-2.5 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="张三"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-medium text-muted-foreground">
            邮箱地址
          </label>
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect
                width="20"
                height="16"
                x="2"
                y="4"
                rx="2"
              />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full pl-10 pr-3 py-2.5 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-medium text-muted-foreground">
            设置密码
          </label>
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect
                width="18"
                height="11"
                x="3"
                y="11"
                rx="2"
              />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full pl-10 pr-10 py-2.5 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <svg
                v-if="!showPassword"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />
              </svg>
              <svg
                v-else
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
                />
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                <path
                  d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
                />
                <path d="m2 2 20 20" />
              </svg>
            </button>
          </div>
          <div
            v-if="form.password"
            class="space-y-2"
          >
            <div class="flex gap-1">
              <div
                v-for="level in 4"
                :key="level"
                class="h-1.5 flex-1 rounded-full transition-colors"
                :class="getStrengthColor(level)"
              />
            </div>
            <div class="grid grid-cols-2 gap-1">
              <div
                v-for="rule in passwordRules"
                :key="rule.label"
                class="flex items-center gap-1 text-xs"
                :class="
                  rule.test(form.password)
                    ? 'text-green-500'
                    : 'text-muted-foreground'
                "
              >
                <svg
                  v-if="rule.test(form.password)"
                  class="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <svg
                  v-else
                  class="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                {{ rule.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-medium text-muted-foreground">
            确认密码
          </label>
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect
                width="18"
                height="11"
                x="3"
                y="11"
                rx="2"
              />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="w-full pl-10 pr-10 py-2.5 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <svg
                v-if="!showConfirmPassword"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />
              </svg>
              <svg
                v-else
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
                />
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                <path
                  d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
                />
                <path d="m2 2 20 20" />
              </svg>
            </button>
          </div>
        </div>

        <label class="flex items-start gap-2 cursor-pointer group text-xs">
          <input
            v-model="form.agree"
            type="checkbox"
            required
            class="rounded border-gray-300 mt-0.5 w-4 h-4 text-primary focus:ring-primary"
          />
          <span
            class="text-muted-foreground group-hover:text-foreground transition-colors"
          >
            我已阅读并同意
            <NuxtLink
              to="/terms"
              class="text-primary hover:text-primary/80 font-medium"
            >
              服务条款
            </NuxtLink>
            和
            <NuxtLink
              to="/privacy"
              class="text-primary hover:text-primary/80 font-medium"
            >
              隐私政策
            </NuxtLink>
          </span>
        </label>

        <button
          type="submit"
          :disabled="auth.loading"
          class="w-full h-11 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="auth.loading"
            class="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>{{ auth.loading ? '注册中...' : '创建账户' }}</span>
          <span v-if="!auth.loading">→</span>
        </button>
      </form>

      <div
        v-if="registrationEnabled"
        class="text-center text-sm"
      >
        <span class="text-muted-foreground">已有账户？</span>
        <NuxtLink
          to="/login"
          class="text-primary hover:text-primary/80 font-semibold ml-1"
        >
          立即登录
        </NuxtLink>
      </div>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'auth' })

  const auth = useAuthStore()
  const router = useRouter()
  const toast = useToast()
  const config = useRuntimeConfig()

  // 社交注册链接
  const SOCIAL_LINKS = {
    github: 'https://github.com/halolight/halolight-nuxt',
    google: 'https://halolight-docs.h7ml.cn',
    wechat: 'https://github.com/halolight',
  }

  // 读取注册开关环境变量，默认关闭
  const registrationEnabled = computed(
    () => config.public.ENABLE_REGISTRATION === 'true'
  )

  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const localError = ref('')
  const form = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  })

  const passwordRules = [
    { label: '至少8个字符', test: (p: string) => p.length >= 8 },
    { label: '包含大写字母', test: (p: string) => /[A-Z]/.test(p) },
    { label: '包含小写字母', test: (p: string) => /[a-z]/.test(p) },
    { label: '包含数字', test: (p: string) => /\d/.test(p) },
  ]

  const passwordStrength = computed(
    () => passwordRules.filter((rule) => rule.test(form.password)).length
  )

  function getStrengthColor(level: number) {
    if (passwordStrength.value >= level) {
      if (passwordStrength.value <= 1) return 'bg-red-500'
      if (passwordStrength.value <= 2) return 'bg-orange-500'
      if (passwordStrength.value <= 3) return 'bg-yellow-500'
      return 'bg-green-500'
    }
    return 'bg-muted'
  }

  async function handleSubmit() {
    localError.value = ''
    if (!form.name || !form.email || !form.password) {
      localError.value = '请填写所有必填字段'
      return
    }
    if (form.password !== form.confirmPassword) {
      localError.value = '两次密码输入不一致'
      return
    }
    if (passwordStrength.value < 3) {
      localError.value = '密码强度不足'
      return
    }
    if (!form.agree) {
      localError.value = '请同意服务条款和隐私政策'
      return
    }
    try {
      await auth.register(form)
      toast.success('注册成功')
      await router.push('/dashboard')
    } catch {
      // 错误已在 store 中处理
    }
  }

  onMounted(() => {
    auth.clearError()
  })
</script>
