<script setup lang="ts">
  type FormError = { name: string; message: string }
  type FormSubmitEvent<T> = { data: T }

  definePageMeta({ layout: false })

  const state = reactive({
    username: '',
    password: '',
    remember: false,
  })

  const showPassword = ref(false)
  const isLoading = ref(false)

  function validate(s: typeof state): FormError[] {
    const errors: FormError[] = []
    if (!s.username)
      errors.push({ name: 'username', message: 'Username is required' })
    if (!s.password)
      errors.push({ name: 'password', message: 'Password is required' })
    return errors
  }

  async function onSubmit(_event: FormSubmitEvent<typeof state>) {
    isLoading.value = true
    await new Promise((resolve) => setTimeout(resolve, 1200))
    isLoading.value = false
  }
</script>

<template>
  <div
    class="flex min-h-dvh"
    style="background: #f0f9ff"
  >
    <!-- ── Left decorative panel ── -->
    <aside
      class="relative hidden lg:flex lg:w-[42%] flex-col justify-between overflow-hidden px-14 py-12"
      style="
        background: linear-gradient(
          148deg,
          #1d6fe8 0%,
          #1e40af 48%,
          #1a35a4 100%
        );
      "
      aria-hidden="true"
    >
      <!-- Decorative blobs -->
      <div
        class="pointer-events-none absolute -top-40 -right-28 size-[480px] rounded-full"
        style="
          background: radial-gradient(circle, #93c5fd, transparent 70%);
          opacity: 0.18;
        "
      />
      <div
        class="pointer-events-none absolute -bottom-16 -left-20 size-80 rounded-full"
        style="
          background: radial-gradient(circle, #bfdbfe, transparent 70%);
          opacity: 0.15;
        "
      />
      <div
        class="pointer-events-none absolute top-[40%] right-8 size-48 rounded-full"
        style="
          background: radial-gradient(circle, #e0f2fe, transparent 70%);
          opacity: 0.1;
        "
      />

      <!-- Brand -->
      <div class="relative z-10">
        <div
          class="mb-7 flex size-12 items-center justify-center rounded-xl"
          style="background: rgba(255, 255, 255, 0.18)"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
          >
            <path
              d="M5 14C5 9.03 9.03 5 14 5s9 4.03 9 9"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M8 19.5C9.4 17 11.5 15.8 14 15.8s4.6 1.2 6 3.7"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle
              cx="14"
              cy="14"
              r="2.5"
              fill="white"
            />
          </svg>
        </div>

        <h1
          class="mb-2 text-4xl font-bold text-white"
          style="letter-spacing: -0.03em; line-height: 1.15"
        >
          AIO Admin
        </h1>
        <p
          class="mb-10 text-base font-normal"
          style="color: rgba(255, 255, 255, 0.72)"
        >
          Enterprise Management Platform
        </p>

        <ul class="flex flex-col gap-4">
          <li
            v-for="feat in [
              'Unified data dashboard',
              'Role-based access control',
              'Real-time monitoring & alerts',
            ]"
            :key="feat"
            class="flex items-center gap-3 text-[15px]"
            style="color: rgba(255, 255, 255, 0.88)"
          >
            <svg
              class="size-4 shrink-0"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="rgba(255,255,255,.45)"
                stroke-width="1.2"
              />
              <path
                d="M5 8l2 2 4-4"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ feat }}
          </li>
        </ul>
      </div>

      <footer
        class="relative z-10 pl-4"
        style="border-left: 2px solid rgba(255, 255, 255, 0.22)"
      >
        <p
          class="text-sm italic leading-relaxed"
          style="color: rgba(255, 255, 255, 0.45)"
        >
          "Clarity in complexity — built for the teams who run everything."
        </p>
      </footer>
    </aside>

    <!-- ── Right form panel ── -->
    <main
      class="flex flex-1 items-center justify-center bg-white px-6 py-10 lg:bg-transparent"
    >
      <div class="w-full max-w-[420px]">
        <!-- Mobile brand mark -->
        <div
          class="mb-6 flex size-11 items-center justify-center rounded-xl lg:hidden"
          style="background: linear-gradient(135deg, #3b82f6, #1d4ed8)"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 28 28"
            fill="none"
          >
            <path
              d="M5 14C5 9.03 9.03 5 14 5s9 4.03 9 9"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M8 19.5C9.4 17 11.5 15.8 14 15.8s4.6 1.2 6 3.7"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle
              cx="14"
              cy="14"
              r="2.5"
              fill="white"
            />
          </svg>
        </div>

        <!-- Heading -->
        <div class="mb-9">
          <h2
            class="text-[1.875rem] font-bold text-slate-900"
            style="letter-spacing: -0.025em; line-height: 1.2"
          >
            Welcome back
          </h2>
          <p class="mt-2 text-[15px] text-slate-500">
            Sign in to your account to continue
          </p>
        </div>

        <!-- Form -->
        <UForm
          :validate="validate"
          :state="state"
          class="flex flex-col gap-5"
          @submit="onSubmit"
        >
          <!-- Username -->
          <UFormField
            label="Username"
            name="username"
            required
          >
            <UInput
              v-model="state.username"
              placeholder="Enter your username"
              icon="i-lucide-user"
              size="xl"
              class="w-full"
              autocomplete="username"
              :disabled="isLoading"
              :ui="{
                base: 'h-[50px] rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20 hover:border-sky-200 transition-colors',
                leading: 'text-slate-400',
              }"
            />
          </UFormField>

          <!-- Password -->
          <UFormField
            label="Password"
            name="password"
            required
          >
            <div class="relative w-full">
              <UInput
                v-model="state.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                icon="i-lucide-lock"
                size="xl"
                class="w-full"
                autocomplete="current-password"
                :disabled="isLoading"
                :ui="{
                  base: 'h-[50px] rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20 hover:border-sky-200 transition-colors pr-10',
                  leading: 'text-slate-400',
                }"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-md p-1 text-slate-400 transition-colors hover:text-sky-500 focus:outline-none"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  class="size-[17px]"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="2.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                </svg>
                <svg
                  v-else
                  class="size-[17px]"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M3 3l14 14M8.5 8.74A2.5 2.5 0 0012.26 12.5M6.34 6.34C4.5 7.56 3 10 3 10s3 6 7 6a7.3 7.3 0 004.66-1.66M9.88 4.12C9.92 4.08 9.96 4.04 10 4c4 0 7 6 7 6a13.5 13.5 0 01-1.67 2.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </UFormField>

          <!-- Remember me -->
          <div class="flex items-center gap-2.5">
            <button
              type="button"
              role="checkbox"
              :aria-checked="state.remember"
              :disabled="isLoading"
              class="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              :style="
                state.remember
                  ? 'background:#3b82f6;border-color:#3b82f6'
                  : 'background:#fff;border-color:#cbd5e1'
              "
              @click="state.remember = !state.remember"
            >
              <svg
                v-if="state.remember"
                class="size-3"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2.5 6l2.5 2.5 4.5-5"
                  stroke="white"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <span
              class="text-sm text-slate-600 select-none cursor-pointer"
              @click="state.remember = !state.remember"
            >
              Remember me
            </span>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="isLoading || !state.username || !state.password"
            class="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 enabled:shadow-[0_2px_14px_rgba(59,130,246,.38)] enabled:hover:shadow-[0_4px_22px_rgba(59,130,246,.48)] enabled:hover:-translate-y-px enabled:active:translate-y-0"
            :style="
              isLoading || !state.username || !state.password
                ? 'background:linear-gradient(135deg,#3b82f6,#1d4ed8);opacity:.5'
                : 'background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)'
            "
          >
            <template v-if="!isLoading">
              Sign In
              <svg
                class="size-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </template>
            <template v-else>
              <svg
                class="size-4 animate-spin"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10 3a7 7 0 017 7"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Signing in…
            </template>
          </button>
        </UForm>

        <!-- Footer note -->
        <p
          class="mt-6 flex items-center justify-center gap-1.5 text-center text-[13px] text-slate-400"
        >
          <svg
            class="size-3.5 shrink-0"
            viewBox="0 0 16 16"
            fill="none"
          >
            <rect
              x="2"
              y="7"
              width="12"
              height="8"
              rx="2"
              stroke="currentColor"
              stroke-width="1.3"
            />
            <path
              d="M5 7V5a3 3 0 016 0v2"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
            />
          </svg>
          Protected by enterprise-grade security &amp; encryption
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
  /* Hide browser-native password reveal icons (Edge / Chrome) */
  :deep(input[type='password']::-ms-reveal),
  :deep(input[type='password']::-ms-clear) {
    display: none;
  }
  :deep(input::-webkit-credentials-auto-fill-button),
  :deep(input::-webkit-password-toggle-button) {
    display: none !important;
  }
</style>
