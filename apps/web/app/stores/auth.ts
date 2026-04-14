/**
 * 认证状态管理
 */

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  permissions: string[]
}

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 用户信息
    user: null as User | null,
    // 已登录过的账号列表
    accounts: [] as User[],
    // 当前账号 ID
    activeAccountId: '' as string,
    // 认证令牌
    token: '',
    // 加载状态
    loading: false,
    // 错误信息
    error: '',
  }),

  getters: {
    // 是否已认证
    isAuthenticated: (state) => Boolean(state.token),

    // 用户首字母
    initials: (state) => {
      if (!state.user) return 'HL'
      return state.user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    },

    // 是否有权限
    hasPermission: (state) => (permission: string) => {
      if (!state.user) return false
      if (state.user.permissions.includes('*')) return true
      return state.user.permissions.includes(permission)
    },

    // 是否有任一权限
    hasAnyPermission: (state) => (permissions: string[]) => {
      if (!state.user) return false
      if (state.user.permissions.includes('*')) return true
      return permissions.some((p) => state.user!.permissions.includes(p))
    },

    // 是否有全部权限
    hasAllPermissions: (state) => (permissions: string[]) => {
      if (!state.user) return false
      if (state.user.permissions.includes('*')) return true
      return permissions.every((p) => state.user!.permissions.includes(p))
    },
  },

  actions: {
    // 登录
    async login(payload: LoginPayload) {
      this.loading = true
      this.error = ''

      try {
        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 600))

        // 获取运行时配置
        const config = useRuntimeConfig()
        const demoEmail = config.public.demoEmail
        const demoPassword = config.public.demoPassword

        // 验证演示账号
        if (payload.email !== demoEmail || payload.password !== demoPassword) {
          throw new Error('邮箱或密码错误')
        }

        // 设置用户信息
        const user: User = {
          id: '1',
          name: `${config.public.brandName} Admin`,
          email: payload.email,
          avatar: '',
          role: 'Administrator',
          permissions: ['*'],
        }
        this.user = user
        this.activeAccountId = user.id
        this.token = 'mock-token-' + Date.now()
        this.upsertAccount(user)

        return this.user
      } catch (e) {
        this.error = e instanceof Error ? e.message : '登录失败'
        throw e
      } finally {
        this.loading = false
      }
    },

    // 注册
    async register(payload: RegisterPayload) {
      this.loading = true
      this.error = ''

      try {
        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 800))

        // 验证密码
        if (payload.password !== payload.confirmPassword) {
          throw new Error('两次输入的密码不一致')
        }

        if (payload.password.length < 6) {
          throw new Error('密码长度不能少于6位')
        }

        // 模拟注册成功
        const user: User = {
          id: '2',
          name: payload.name,
          email: payload.email,
          avatar: '',
          role: 'User',
          permissions: ['dashboard:view', 'profile:edit'],
        }
        this.user = user
        this.activeAccountId = user.id
        this.token = 'mock-token-' + Date.now()
        this.upsertAccount(user)

        return this.user
      } catch (e) {
        this.error = e instanceof Error ? e.message : '注册失败'
        throw e
      } finally {
        this.loading = false
      }
    },

    // 登出
    logout() {
      this.user = null
      this.activeAccountId = ''
      this.token = ''
      this.error = ''
    },

    // 清除错误
    clearError() {
      this.error = ''
    },

    // 刷新用户信息
    async refreshUser() {
      if (!this.token) return null

      try {
        // 模拟刷新用户信息
        await new Promise((resolve) => setTimeout(resolve, 200))
        return this.user
      } catch {
        this.logout()
        return null
      }
    },

    // 忘记密码
    async forgotPassword(email: string) {
      this.loading = true
      this.error = ''

      try {
        // 模拟发送重置邮件
        await new Promise((resolve) => setTimeout(resolve, 600))

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          throw new Error('请输入有效的邮箱地址')
        }

        return { success: true, message: '重置链接已发送到您的邮箱' }
      } catch (e) {
        this.error = e instanceof Error ? e.message : '发送失败'
        throw e
      } finally {
        this.loading = false
      }
    },

    // 重置密码
    async resetPassword(
      token: string,
      password: string,
      confirmPassword: string
    ) {
      this.loading = true
      this.error = ''

      try {
        // 模拟重置密码
        await new Promise((resolve) => setTimeout(resolve, 600))

        // 验证密码
        if (password !== confirmPassword) {
          throw new Error('两次输入的密码不一致')
        }

        if (password.length < 6) {
          throw new Error('密码长度不能少于6位')
        }

        return { success: true, message: '密码重置成功' }
      } catch (e) {
        this.error = e instanceof Error ? e.message : '重置失败'
        throw e
      } finally {
        this.loading = false
      }
    },

    // 切换账号
    async switchAccount(id: string) {
      const target = this.accounts.find((a) => a.id === id)
      if (!target) {
        this.error = '账号不存在'
        throw new Error('账号不存在')
      }

      this.user = target
      this.activeAccountId = target.id
      this.token = 'mock-token-' + Date.now()
      this.error = ''
    },

    // 添加或更新账号缓存
    upsertAccount(user: User) {
      const idx = this.accounts.findIndex((a) => a.id === user.id)
      if (idx === -1) {
        this.accounts.push(user)
      } else {
        this.accounts[idx] = user
      }
    },

    // 移除账号
    removeAccount(id: string) {
      this.accounts = this.accounts.filter((a) => a.id !== id)
      if (this.activeAccountId === id) {
        this.logout()
      }
    },

    // 加载账号列表
    async loadAccounts() {
      // 在实际应用中，这里应该从服务器加载
      // 这里仅返回当前缓存的账号列表
      return this.accounts
    },

    // 检查认证状态
    async checkAuth() {
      if (!this.token) {
        this.user = null
        // isAuthenticated is a computed getter, no need to set it
        return
      }

      // 在实际应用中，这里应该验证 token
      // 这里仅检查本地缓存
      if (this.user && this.activeAccountId) {
        return
      }

      // 尝试从 accounts 恢复
      if (this.activeAccountId) {
        const account = this.accounts.find((a) => a.id === this.activeAccountId)
        if (account) {
          this.user = account
        }
      }
    },

    // 社交登录（模拟）
    async socialLogin(provider: 'github' | 'google' | 'wechat') {
      this.loading = true
      this.error = ''

      try {
        // 模拟 OAuth 流程延迟
        await new Promise((resolve) => setTimeout(resolve, 1200))

        // 获取运行时配置
        const config = useRuntimeConfig()

        // 模拟不同提供商的用户信息
        const providerInfo: Record<
          string,
          { name: string; avatar: string; email: string }
        > = {
          github: {
            name: 'GitHub User',
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
            email: 'user@github.com',
          },
          google: {
            name: 'Google User',
            avatar: 'https://lh3.googleusercontent.com/a/default-user',
            email: 'user@gmail.com',
          },
          wechat: {
            name: '微信用户',
            avatar: 'https://thirdwx.qlogo.cn/mmopen/default',
            email: 'user@wechat.com',
          },
        }

        const info = providerInfo[provider]
        const user: User = {
          id: `${provider}-${Date.now()}`,
          name: info.name,
          email: info.email,
          avatar: info.avatar,
          role: 'User',
          permissions: ['dashboard:view', 'profile:edit'],
        }

        this.user = user
        this.activeAccountId = user.id
        this.token = `mock-token-${provider}-${Date.now()}`
        this.upsertAccount(user)

        return this.user
      } catch (e) {
        this.error = e instanceof Error ? e.message : `${provider} 登录失败`
        throw e
      } finally {
        this.loading = false
      }
    },
  },

  persist: {
    key: 'halolight-auth',
    pick: ['user', 'token', 'accounts', 'activeAccountId'],
  },
})
