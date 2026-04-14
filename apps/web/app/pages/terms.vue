<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
  >
    <div class="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <!-- 返回链接 -->
      <NuxtLink
        to="/login"
        class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 group"
      >
        <svg
          class="h-4 w-4 group-hover:-translate-x-1 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        返回登录
      </NuxtLink>

      <!-- 标题 -->
      <div class="text-center mb-12">
        <div
          class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl mb-6"
        >
          <svg
            class="h-8 w-8 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
        </div>
        <h1
          class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4"
        >
          服务条款
        </h1>
        <p class="text-muted-foreground">
          最后更新：{{ new Date().toLocaleDateString('zh-CN') }}
        </p>
      </div>

      <!-- 内容 -->
      <div
        class="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-6 sm:p-10 space-y-8"
      >
        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold"
            >
              1
            </span>
            服务说明
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>
              欢迎使用 Admin Pro（以下简称"本服务"）。本服务由 Halolight
              团队提供，是一款企业级后台管理系统。
            </p>
            <p>
              使用本服务即表示您同意遵守本服务条款。如果您不同意这些条款，请勿使用本服务。
            </p>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold"
            >
              2
            </span>
            用户账户
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>
              您需要注册账户才能使用本服务的全部功能。注册时，您必须提供准确、完整的信息。
            </p>
            <p>
              您有责任保护您的账户安全，包括密码的保密性。如发现任何未经授权使用您账户的情况，请立即通知我们。
            </p>
            <p>您不得将账户转让或出借给他人使用。</p>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold"
            >
              3
            </span>
            使用规范
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>使用本服务时，您同意：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>遵守所有适用的法律法规</li>
              <li>不进行任何可能损害本服务或其他用户的行为</li>
              <li>不上传或传播任何违法、有害或侵权的内容</li>
              <li>不尝试未经授权访问本服务的任何部分</li>
              <li>不使用自动化工具大量采集数据</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold"
            >
              4
            </span>
            知识产权
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>
              本服务及其所有内容，包括但不限于文本、图形、标志、图标、图像、音频、视频和软件，均受版权法和其他知识产权法的保护。
            </p>
            <p>
              未经我们明确书面许可，您不得复制、修改、分发或以其他方式使用这些内容。
            </p>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold"
            >
              5
            </span>
            免责声明
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>
              本服务按"原样"提供，不提供任何明示或暗示的保证。我们不保证服务的不间断性、安全性或无错误性。
            </p>
            <p>
              在法律允许的最大范围内，我们不对因使用或无法使用本服务而导致的任何损失承担责任。
            </p>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold"
            >
              6
            </span>
            条款修改
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>
              我们保留随时修改本服务条款的权利。修改后的条款将在本页面发布，并注明最后更新日期。
            </p>
            <p>继续使用本服务即表示您接受修改后的条款。</p>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold"
            >
              7
            </span>
            联系我们
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>如果您对本服务条款有任何疑问，请通过以下方式联系我们：</p>
            <p>邮箱：support@halolight.h7ml.cn</p>
          </div>
        </section>
      </div>

      <!-- 底部 -->
      <div class="text-center mt-8 text-sm text-muted-foreground">
        &copy; {{ new Date().getFullYear() }} Halolight. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({ layout: false })
  useHead({ title: '服务条款 - Admin Pro' })
</script>
