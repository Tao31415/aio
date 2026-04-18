<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">用户管理</h1>
        <p class="text-muted-foreground">管理系统中的所有用户账户</p>
      </div>
      <button
        @click="showAddModal = true"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        添加用户
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索用户..."
          class="w-full h-10 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <select
        v-model="statusFilter"
        class="h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">全部状态</option>
        <option value="active">活跃</option>
        <option value="inactive">未激活</option>
        <option value="banned">已禁用</option>
      </select>
      <select
        v-model="roleFilter"
        class="h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">全部角色</option>
        <option value="admin">管理员</option>
        <option value="user">普通用户</option>
        <option value="guest">访客</option>
      </select>
    </div>

    <!-- 用户列表 -->
    <div class="bg-card rounded-xl border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/50">
            <tr>
              <th class="text-left px-6 py-3 text-sm font-medium">
                <input
                  type="checkbox"
                  class="rounded"
                />
              </th>
              <th class="text-left px-6 py-3 text-sm font-medium">用户</th>
              <th class="text-left px-6 py-3 text-sm font-medium">角色</th>
              <th class="text-left px-6 py-3 text-sm font-medium">状态</th>
              <th class="text-left px-6 py-3 text-sm font-medium">注册时间</th>
              <th class="text-left px-6 py-3 text-sm font-medium">最后登录</th>
              <th class="text-right px-6 py-3 text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-muted/50 transition-colors"
            >
              <td class="px-6 py-4">
                <input
                  type="checkbox"
                  class="rounded"
                />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <span class="text-sm font-medium text-primary">
                      {{ user.name.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium">{{ user.name }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ user.email }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="{
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400':
                      user.role === 'admin',
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400':
                      user.role === 'user',
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400':
                      user.role === 'guest',
                  }"
                >
                  {{
                    { admin: '管理员', user: '用户', guest: '访客' }[user.role]
                  }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="{
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                      user.status === 'active',
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400':
                      user.status === 'inactive',
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                      user.status === 'banned',
                  }"
                >
                  {{
                    { active: '活跃', inactive: '未激活', banned: '已禁用' }[
                      user.status
                    ]
                  }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-muted-foreground">
                {{ user.createdAt }}
              </td>
              <td class="px-6 py-4 text-sm text-muted-foreground">
                {{ user.lastLogin }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editUser(user)"
                    class="p-2 rounded-lg hover:bg-accent transition-colors"
                    title="编辑"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="deleteUser(user)"
                    class="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    title="删除"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-6 py-4 border-t">
        <p class="text-sm text-muted-foreground">
          显示 {{ (currentPage - 1) * pageSize + 1 }} -
          {{ Math.min(currentPage * pageSize, totalUsers) }} /
          {{ totalUsers }} 条
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑用户弹窗 -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-background/80 backdrop-blur-sm"
          @click="showAddModal = false"
        />
        <div
          class="relative bg-card rounded-xl border shadow-lg w-full max-w-md p-6 m-4"
        >
          <h2 class="text-xl font-semibold mb-4">
            {{ editingUser ? '编辑用户' : '添加用户' }}
          </h2>
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4"
          >
            <div class="space-y-2">
              <label class="text-sm font-medium">用户名</label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="请输入用户名"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">邮箱</label>
              <input
                v-model="formData.email"
                type="email"
                placeholder="请输入邮箱"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">角色</label>
              <select
                v-model="formData.role"
                class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
                <option value="guest">访客</option>
              </select>
            </div>
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="showAddModal = false"
                class="flex-1 h-10 rounded-lg border hover:bg-accent transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {{ editingUser ? '保存' : '添加' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'default',
  })

  const { showToast } = useMyToast()

  interface User {
    id: number
    name: string
    email: string
    role: 'admin' | 'user' | 'guest'
    status: 'active' | 'inactive' | 'banned'
    createdAt: string
    lastLogin: string
  }

  // 状态
  const searchQuery = ref('')
  const statusFilter = ref('')
  const roleFilter = ref('')
  const currentPage = ref(1)
  const pageSize = 10
  const showAddModal = ref(false)
  const editingUser = ref<User | null>(null)

  const formData = reactive({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'guest',
  })

  // 模拟用户数据
  const users = ref<User[]>([
    {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-15',
      lastLogin: '2024-03-20 14:30',
    },
    {
      id: 2,
      name: '李四',
      email: 'lisi@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2024-02-10',
      lastLogin: '2024-03-19 09:15',
    },
    {
      id: 3,
      name: '王五',
      email: 'wangwu@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: '2024-02-20',
      lastLogin: '2024-03-01 16:45',
    },
    {
      id: 4,
      name: '赵六',
      email: 'zhaoliu@example.com',
      role: 'guest',
      status: 'active',
      createdAt: '2024-03-01',
      lastLogin: '2024-03-20 11:20',
    },
    {
      id: 5,
      name: '钱七',
      email: 'qianqi@example.com',
      role: 'user',
      status: 'banned',
      createdAt: '2024-03-05',
      lastLogin: '2024-03-10 08:00',
    },
    {
      id: 6,
      name: '孙八',
      email: 'sunba@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2024-03-08',
      lastLogin: '2024-03-20 17:30',
    },
    {
      id: 7,
      name: '周九',
      email: 'zhoujiu@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-03-10',
      lastLogin: '2024-03-20 10:00',
    },
    {
      id: 8,
      name: '吴十',
      email: 'wushi@example.com',
      role: 'guest',
      status: 'inactive',
      createdAt: '2024-03-12',
      lastLogin: '2024-03-15 14:20',
    },
  ])

  // 筛选后的用户
  const filteredUsers = computed(() => {
    return users.value.filter((user) => {
      const matchSearch =
        !searchQuery.value ||
        user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchStatus =
        !statusFilter.value || user.status === statusFilter.value
      const matchRole = !roleFilter.value || user.role === roleFilter.value
      return matchSearch && matchStatus && matchRole
    })
  })

  const totalUsers = computed(() => filteredUsers.value.length)
  const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize))

  // 编辑用户
  function editUser(user: User) {
    editingUser.value = user
    formData.name = user.name
    formData.email = user.email
    formData.role = user.role
    showAddModal.value = true
  }

  // 删除用户
  function deleteUser(user: User) {
    if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
      users.value = users.value.filter((u) => u.id !== user.id)
      showToast('用户已删除', 'success')
    }
  }

  // 提交表单
  function handleSubmit() {
    if (!formData.name || !formData.email) {
      showToast('请填写完整信息', 'error')
      return
    }

    if (editingUser.value) {
      const index = users.value.findIndex((u) => u.id === editingUser.value!.id)
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }
      }
      showToast('用户信息已更新', 'success')
    } else {
      users.value.push({
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: '-',
      })
      showToast('用户已添加', 'success')
    }

    showAddModal.value = false
    editingUser.value = null
    formData.name = ''
    formData.email = ''
    formData.role = 'user'
  }
</script>
