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
          class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-xl mb-6"
        >
          <svg
            class="h-8 w-8 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
            />
          </svg>
        </div>
        <h1
          class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
        >
          隐私政策
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
              class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold"
            >
              1
            </span>
            概述
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>
              本隐私政策说明了 Admin
              Pro（以下简称"我们"）如何收集、使用、存储和保护您的个人信息。
            </p>
            <p>我们重视您的隐私，并致力于保护您的个人数据安全。</p>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold"
            >
              2
            </span>
            信息收集
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>我们可能收集以下类型的信息：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>账户信息</strong>
                ：姓名、邮箱地址、密码等注册时提供的信息
              </li>
              <li>
                <strong>使用数据</strong>
                ：您使用服务时的操作记录、访问时间、浏览页面等
              </li>
              <li>
                <strong>设备信息</strong>
                ：设备类型、操作系统、浏览器类型、IP 地址等
              </li>
              <li>
                <strong>Cookie 数据</strong>
                ：用于改善用户体验的 Cookie 和类似技术
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold"
            >
              3
            </span>
            信息使用
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>我们使用收集的信息用于：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>提供、维护和改进我们的服务</li>
              <li>处理您的请求和交易</li>
              <li>发送服务通知和更新信息</li>
              <li>分析服务使用情况以改善用户体验</li>
              <li>防止欺诈和保护服务安全</li>
              <li>遵守法律法规要求</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold"
            >
              4
            </span>
            信息共享
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>我们不会出售您的个人信息。我们可能在以下情况下共享您的信息：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>经您同意或按您的指示</li>
              <li>与提供服务的合作伙伴（如云服务提供商）</li>
              <li>为遵守法律要求或响应合法请求</li>
              <li>在企业合并、收购或资产出售的情况下</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold"
            >
              5
            </span>
            数据安全
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>我们采取适当的技术和组织措施来保护您的个人信息，包括：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>使用加密技术保护数据传输</li>
              <li>限制访问个人信息的员工数量</li>
              <li>定期安全审计和漏洞测试</li>
              <li>数据备份和灾难恢复计划</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold"
            >
              6
            </span>
            您的权利
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>您对个人信息享有以下权利：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>访问权</strong>
                ：请求获取我们持有的您的个人信息副本
              </li>
              <li>
                <strong>更正权</strong>
                ：请求更正不准确的个人信息
              </li>
              <li>
                <strong>删除权</strong>
                ：请求删除您的个人信息
              </li>
              <li>
                <strong>限制处理权</strong>
                ：请求限制我们处理您的信息
              </li>
              <li>
                <strong>数据可携权</strong>
                ：请求以可机读格式获取您的数据
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold"
            >
              7
            </span>
            Cookie 政策
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>我们使用 Cookie 和类似技术来：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>记住您的登录状态和偏好设置</li>
              <li>分析服务使用情况</li>
              <li>提供个性化体验</li>
            </ul>
            <p>您可以通过浏览器设置管理 Cookie 偏好。</p>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold"
            >
              8
            </span>
            联系我们
          </h2>
          <div class="text-muted-foreground space-y-3 pl-10">
            <p>如果您对本隐私政策有任何疑问或需要行使您的权利，请联系我们：</p>
            <p>邮箱：privacy@halolight.h7ml.cn</p>
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
  useHead({ title: '隐私政策 - Admin Pro' })
</script>
