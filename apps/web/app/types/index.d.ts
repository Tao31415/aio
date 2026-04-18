import { createAuthClient } from 'better-auth/vue'

import type { AuthClient } from '~/plugins/auth.plugin'

declare module '#app' {
  interface NuxtApp {
    $auth: AuthClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth: AuthClient
  }
}

// oxlint-disable-next-line unicorn/require-module-specifiers
export {}
