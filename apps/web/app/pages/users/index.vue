<script setup lang="ts">
  definePageMeta({
    layout: 'dashboard',
    auth: 'user',
  })
  import { h, resolveComponent } from 'vue'

  const toast = useToast()

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
  const selectedUserIds = ref<number[]>([])

  const formData = reactive({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'guest',
  })

  const statusOptions = ['全部状态', '活跃', '未激活', '已禁用']
  const roleOptions = ['全部角色', '管理员', '普通用户', '访客']
  const formRoleOptions = ['管理员', '普通用户', '访客']

  const statusLabelMap = {
    active: '活跃',
    inactive: '未激活',
    banned: '已禁用',
  } as const

  const roleLabelMap = {
    admin: '管理员',
    user: '普通用户',
    guest: '访客',
  } as const

  const statusValueMap = {
    全部状态: '',
    活跃: 'active',
    未激活: 'inactive',
    已禁用: 'banned',
  } as const

  const roleValueMap = {
    全部角色: '',
    管理员: 'admin',
    普通用户: 'user',
    访客: 'guest',
  } as const

  const formRoleValueMap = {
    管理员: 'admin',
    普通用户: 'user',
    访客: 'guest',
  } as const

  const statusFilterSelection = computed({
    get: () =>
      statusFilter.value
        ? statusLabelMap[statusFilter.value as keyof typeof statusLabelMap]
        : '全部状态',
    set: (label: string) => {
      statusFilter.value =
        statusValueMap[label as keyof typeof statusValueMap] || ''
    },
  })

  const roleFilterSelection = computed({
    get: () =>
      roleFilter.value
        ? roleLabelMap[roleFilter.value as keyof typeof roleLabelMap]
        : '全部角色',
    set: (label: string) => {
      roleFilter.value = roleValueMap[label as keyof typeof roleValueMap] || ''
    },
  })

  const formRoleSelection = computed({
    get: () => roleLabelMap[formData.role],
    set: (label: string) => {
      formData.role = formRoleValueMap[label as keyof typeof formRoleValueMap]
    },
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
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalUsers.value / pageSize))
  )
  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return filteredUsers.value.slice(start, end)
  })
  const startRow = computed(() => {
    if (totalUsers.value === 0) return 0
    return (currentPage.value - 1) * pageSize + 1
  })
  const allVisibleSelected = computed(() => {
    return (
      paginatedUsers.value.length > 0 &&
      paginatedUsers.value.every((user) =>
        selectedUserIds.value.includes(user.id)
      )
    )
  })

  const tableColumns = computed(() => {
    const UCheckbox = resolveComponent('UCheckbox')
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')

    return [
      {
        id: 'select',
        header: () =>
          h(UCheckbox, {
            modelValue: allVisibleSelected.value,
            'onUpdate:modelValue': toggleSelectAll,
          }),
        cell: ({ row }: { row: { original: User } }) =>
          h(UCheckbox, {
            modelValue: selectedUserIds.value.includes(row.original.id),
            'onUpdate:modelValue': () => toggleUserSelection(row.original.id),
          }),
      },
      {
        accessorKey: 'name',
        header: '用户',
        cell: ({ row }: { row: { original: User } }) =>
          h('div', { class: 'flex items-center gap-3' }, [
            h(
              'div',
              {
                class:
                  'w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center',
              },
              [
                h(
                  'span',
                  { class: 'text-sm font-medium text-primary' },
                  row.original.name.charAt(0)
                ),
              ]
            ),
            h('div', [
              h('p', { class: 'font-medium' }, row.original.name),
              h('p', { class: 'text-sm text-muted' }, row.original.email),
            ]),
          ]),
      },
      {
        accessorKey: 'role',
        header: '角色',
        cell: ({ row }: { row: { original: User } }) =>
          h(
            UBadge,
            {
              color: getRoleBadgeColor(row.original.role),
              variant: 'soft',
            },
            () => roleLabelMap[row.original.role]
          ),
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }: { row: { original: User } }) =>
          h(
            UBadge,
            {
              color: getStatusBadgeColor(row.original.status),
              variant: 'soft',
            },
            () => statusLabelMap[row.original.status]
          ),
      },
      {
        accessorKey: 'createdAt',
        header: '注册时间',
        cell: ({ row }: { row: { original: User } }) =>
          h('span', { class: 'text-sm text-muted' }, row.original.createdAt),
      },
      {
        accessorKey: 'lastLogin',
        header: '最后登录',
        cell: ({ row }: { row: { original: User } }) =>
          h('span', { class: 'text-sm text-muted' }, row.original.lastLogin),
      },
      {
        id: 'actions',
        header: () => h('div', { class: 'text-right' }, '操作'),
        cell: ({ row }: { row: { original: User } }) =>
          h('div', { class: 'flex items-center justify-end gap-2' }, [
            h(UButton, {
              color: 'neutral',
              variant: 'ghost',
              icon: 'i-lucide-pencil',
              title: '编辑',
              onClick: () => editUser(row.original),
            }),
            h(UButton, {
              color: 'error',
              variant: 'ghost',
              icon: 'i-lucide-trash',
              title: '删除',
              onClick: () => deleteUser(row.original),
            }),
          ]),
      },
    ]
  })

  function getRoleBadgeColor(role: User['role']) {
    const map = {
      admin: 'secondary',
      user: 'primary',
      guest: 'neutral',
    } as const
    return map[role]
  }

  function getStatusBadgeColor(status: User['status']) {
    const map = {
      active: 'success',
      inactive: 'warning',
      banned: 'error',
    } as const
    return map[status]
  }

  function toggleUserSelection(userId: number) {
    const exists = selectedUserIds.value.includes(userId)
    selectedUserIds.value = exists
      ? selectedUserIds.value.filter((id) => id !== userId)
      : [...selectedUserIds.value, userId]
  }

  function toggleSelectAll(checked: boolean | 'indeterminate') {
    if (checked !== true) {
      selectedUserIds.value = selectedUserIds.value.filter(
        (id) => !paginatedUsers.value.some((user) => user.id === id)
      )
      return
    }

    const visibleIds = paginatedUsers.value.map((user) => user.id)
    selectedUserIds.value = Array.from(
      new Set([...selectedUserIds.value, ...visibleIds])
    )
  }

  function resetFormData() {
    formData.name = ''
    formData.email = ''
    formData.role = 'user'
  }

  function openAddModal() {
    editingUser.value = null
    resetFormData()
    showAddModal.value = true
  }

  function closeModal() {
    showAddModal.value = false
    editingUser.value = null
    resetFormData()
  }

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
      selectedUserIds.value = selectedUserIds.value.filter(
        (id) => id !== user.id
      )
      toast.add({ title: '用户已删除', color: 'success' })
    }
  }

  // 提交表单
  function handleSubmit() {
    if (!formData.name || !formData.email) {
      toast.add({ title: '请填写完整信息', color: 'error' })
      return
    }

    if (editingUser.value) {
      const index = users.value.findIndex((u) => u.id === editingUser.value!.id)
      if (index !== -1) {
        const currentUser = users.value[index]
        if (!currentUser) return

        users.value[index] = {
          ...currentUser,
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }
      }
      toast.add({ title: '用户信息已更新', color: 'success' })
    } else {
      users.value.push({
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0] ?? '',
        lastLogin: '-',
      })
      toast.add({ title: '用户已添加', color: 'success' })
    }

    closeModal()
  }

  watch([searchQuery, statusFilter, roleFilter], () => {
    currentPage.value = 1
    selectedUserIds.value = []
  })

  watch(totalPages, (pageCount) => {
    if (currentPage.value > pageCount) {
      currentPage.value = pageCount
    }
  })
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">用户管理</h1>
        <p class="text-muted">管理系统中的所有用户账户</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openAddModal"
      >
        添加用户
      </UButton>
    </div>

    <!-- 搜索和筛选 -->
    <div class="flex flex-col sm:flex-row gap-4">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="搜索用户..."
        class="flex-1"
      />
      <USelect
        v-model="statusFilterSelection"
        :items="statusOptions"
        class="sm:w-40"
      />
      <USelect
        v-model="roleFilterSelection"
        :items="roleOptions"
        class="sm:w-40"
      />
    </div>

    <!-- 用户列表 -->
    <UCard :ui="{ body: 'p-0' }">
      <div class="overflow-x-auto">
        <UTable
          :data="paginatedUsers"
          :columns="tableColumns"
          class="w-full"
        />
      </div>

      <!-- 分页 -->
      <div
        class="flex items-center justify-between px-6 py-4 border-t border-default"
      >
        <p class="text-sm text-muted">
          显示 {{ startRow }} -
          {{ Math.min(currentPage * pageSize, totalUsers) }} /
          {{ totalUsers }} 条
        </p>
        <div class="flex items-center gap-2">
          <UButton
            @click="currentPage--"
            :disabled="currentPage === 1"
            color="neutral"
            variant="outline"
            icon="i-lucide-chevron-left"
          ></UButton>
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <UButton
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            color="neutral"
            variant="outline"
            icon="i-lucide-chevron-right"
          ></UButton>
        </div>
      </div>
    </UCard>

    <!-- 添加/编辑用户弹窗 -->
    <UModal
      v-model:open="showAddModal"
      :title="editingUser ? '编辑用户' : '添加用户'"
    >
      <template #body>
        <UForm
          :state="formData"
          class="space-y-4"
          @submit="handleSubmit"
        >
          <UFormField
            label="用户名"
            name="name"
          >
            <UInput
              v-model="formData.name"
              type="text"
              placeholder="请输入用户名"
            />
          </UFormField>
          <UFormField
            label="邮箱"
            name="email"
          >
            <UInput
              v-model="formData.email"
              type="email"
              placeholder="请输入邮箱"
            />
          </UFormField>
          <UFormField
            label="角色"
            name="role"
          >
            <USelect
              v-model="formRoleSelection"
              :items="formRoleOptions"
              class="w-full"
            />
          </UFormField>
          <div class="flex gap-3 pt-4">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              class="flex-1 justify-center"
              @click="closeModal"
            >
              取消
            </UButton>
            <UButton
              type="submit"
              color="primary"
              class="flex-1 justify-center"
            >
              {{ editingUser ? '保存' : '添加' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
