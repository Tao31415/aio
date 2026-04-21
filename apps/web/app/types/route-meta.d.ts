declare module 'vue-router' {
  interface RouteMeta {
    auth?: 'user' | 'guest'
    title?: string
    icon?: string
  }
}
