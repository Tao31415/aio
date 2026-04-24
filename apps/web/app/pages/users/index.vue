<script setup lang="ts">
  import { APP_ROUTE_MAP } from '~/utils/route-config'
  import type { UserProfile } from '~/types'
  import { useAuthAdmin } from '~/composables/auth/useAuthAdmin'
  import { useAuthStore } from '~/stores/auth.store'

  definePageMeta({
    title: APP_ROUTE_MAP['/users']!.title,
    icon: APP_ROUTE_MAP['/users']!.icon,
    layout: 'dashboard',
    auth: 'user',
  })
  import { h, resolveComponent } from 'vue'

  const toast = useToast()
  const authAdmin = useAuthAdmin()
  const authStore = useAuthStore()
  const currentUserId = computed(() => authStore.user?.id)

  const searchQuery = ref('')
  const statusFilter = ref('')
  const roleFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const showAddModal = ref(false)
  const editingUser = ref<UserProfile | null>(null)
  const selectedUserIds = ref<string[]>([])
  const isLoading = ref(false)
  const totalUsers = ref(0)

  const formData = reactive({
    username: '',
    displayUsername: '',
    password: '',
    role: 'user' as 'admin' | 'user',
  })

  const statusOptions = ['全部状态', '正常', '禁用']
  const roleOptions = ['全部角色', '管理员', '普通用户']
  const formRoleOptions = ['管理员', '普通用户']

  const statusLabelMap = {
    false: '正常',
    true: '禁用',
  } as const

  const roleLabelMap = {
    admin: '管理员',
    user: '普通用户',
  } as const

  const statusValueMap = {
    全部状态: '',
    正常: 'false',
    已禁用: 'true',
  } as const

  const roleValueMap = {
    全部角色: '',
    管理员: 'admin',
    普通用户: 'user',
  } as const

  const formRoleValueMap = {
    管理员: 'admin',
    普通用户: 'user',
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

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalUsers.value / pageSize.value))
  )
  const startRow = computed(() => {
    if (totalUsers.value === 0) return 0
    return (currentPage.value - 1) * pageSize.value + 1
  })

  async function fetchUsers() {
    isLoading.value = true
    try {
      const hasStatusFilter = !!statusFilter.value

      const result = await authAdmin.listUsers({
        searchField: hasStatusFilter ? undefined : ('name' as const),
        searchValue: hasStatusFilter
          ? undefined
          : searchQuery.value || undefined,
        searchOperator: 'contains',
        sortBy: 'updatedAt',
        sortDirection: 'desc',
        limit: pageSize.value,
        offset: (currentPage.value - 1) * pageSize.value,
        filterField: hasStatusFilter ? 'banned' : undefined,
        filterValue: hasStatusFilter
          ? statusFilter.value === 'true'
          : undefined,
        filterOperator: hasStatusFilter ? 'eq' : undefined,
      })

      // 客户端过滤
      let userList: UserProfile[] = result.users ?? []

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        userList = userList.filter(
          (user) =>
            user.username.toLowerCase().includes(q) ||
            (user.displayUsername?.toLowerCase().includes(q) ?? false)
        )
      }

      if (roleFilter.value) {
        userList = userList.filter((user) => user.role === roleFilter.value)
      }

      userListData.value = userList
      totalUsers.value = result.total
    } catch (error) {
      toast.add({
        title: '加载用户列表失败',
        description: String(error),
        color: 'error',
      })
    } finally {
      isLoading.value = false
    }
  }

  const userListData = ref<UserProfile[]>([])

  const allVisibleSelected = computed(() => {
    return (
      userListData.value.length > 0 &&
      userListData.value.every((user) =>
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
        cell: ({ row }: { row: { original: UserProfile } }) =>
          h(UCheckbox, {
            modelValue: selectedUserIds.value.includes(row.original.id),
            'onUpdate:modelValue': () => toggleUserSelection(row.original.id),
          }),
      },
      {
        accessorKey: 'displayUsername',
        header: '用户',
        cell: ({ row }: { row: { original: UserProfile } }) =>
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
                  (
                    row.original.displayUsername || row.original.username
                  ).charAt(0)
                ),
              ]
            ),
            h('div', { class: 'min-w-0' }, [
              h(
                'p',
                { class: 'font-medium truncate' },
                row.original.displayUsername || row.original.username
              ),
              h(
                'p',
                { class: 'text-sm text-muted truncate' },
                '@' + row.original.username
              ),
            ]),
          ]),
      },
      {
        accessorKey: 'role',
        header: '角色',
        cell: ({ row }: { row: { original: UserProfile } }) =>
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
        accessorKey: 'banned',
        header: () => h('div', { class: 'flex justify-center' }, '状态'),
        cell: ({ row }: { row: { original: UserProfile } }) =>
          h('div', { class: 'flex justify-center' }, [
            h(
              UBadge,
              {
                color: getStatusBadgeColor(row.original.banned),
                variant: 'soft',
              },
              () =>
                statusLabelMap[
                  String(row.original.banned) as keyof typeof statusLabelMap
                ]
            ),
          ]),
      },
      {
        accessorKey: 'createdAt',
        header: '注册时间',
        cell: ({ row }: { row: { original: UserProfile } }) => {
          const date = new Date(row.original.createdAt)
          return h(
            'span',
            { class: 'text-sm text-muted' },
            date.toLocaleDateString('zh-CN')
          )
        },
      },
      {
        id: 'actions',
        header: () => h('div', { class: 'text-right' }, '操作'),
        cell: ({ row }: { row: { original: UserProfile } }) => {
          const isCurrentUser = row.original.id === currentUserId.value
          return h('div', { class: 'flex items-center justify-end gap-2' }, [
            h(UButton, {
              color: 'neutral',
              variant: 'ghost',
              icon: 'i-lucide-pencil',
              title: isCurrentUser ? '不能编辑当前用户' : '编辑',
              disabled: isCurrentUser,
              onClick: () => editUser(row.original),
            }),
            h(UButton, {
              color: row.original.banned ? 'success' : 'warning',
              variant: 'ghost',
              icon: row.original.banned
                ? 'i-lucide-user-check'
                : 'i-lucide-ban',
              title: isCurrentUser
                ? '不能操作当前用户'
                : row.original.banned
                  ? '解封'
                  : '封禁',
              disabled: isCurrentUser,
              onClick: () => toggleBanUser(row.original),
            }),
            h(UButton, {
              color: 'error',
              variant: 'ghost',
              icon: 'i-lucide-trash',
              title: isCurrentUser ? '不能删除当前用户' : '删除',
              disabled: isCurrentUser,
              onClick: () => deleteUser(row.original),
            }),
          ])
        },
      },
    ].map((col) => {
      // Set default widths for columns
      if (col.id === 'select') {
        return { ...col, style: { width: '60px' } }
      }
      if (col.accessorKey === 'displayUsername') {
        return { ...col, style: { minWidth: '200px' } }
      }
      if (col.accessorKey === 'role') {
        return { ...col, style: { width: '100px' } }
      }
      if (col.accessorKey === 'banned') {
        return { ...col, style: { width: '100px' } }
      }
      if (col.accessorKey === 'createdAt') {
        return { ...col, style: { width: '120px' } }
      }
      if (col.id === 'actions') {
        return { ...col, style: { width: '150px' } }
      }
      return col
    })
  })

  function getRoleBadgeColor(role: UserProfile['role']) {
    const map = {
      admin: 'secondary',
      user: 'primary',
    } as const
    return map[role]
  }

  function getStatusBadgeColor(banned: boolean) {
    const map = {
      false: 'success',
      true: 'error',
    } as const
    return map[String(banned) as keyof typeof map]
  }

  function toggleUserSelection(userId: string) {
    const exists = selectedUserIds.value.includes(userId)
    selectedUserIds.value = exists
      ? selectedUserIds.value.filter((id) => id !== userId)
      : [...selectedUserIds.value, userId]
  }

  function toggleSelectAll(checked: boolean | 'indeterminate') {
    if (checked !== true) {
      selectedUserIds.value = selectedUserIds.value.filter(
        (id) => !userListData.value.some((user) => user.id === id)
      )
      return
    }

    const visibleIds = userListData.value.map((user) => user.id)
    selectedUserIds.value = Array.from(
      new Set([...selectedUserIds.value, ...visibleIds])
    )
  }

  function resetFormData() {
    formData.username = ''
    formData.displayUsername = ''
    formData.password = ''
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

  async function editUser(user: UserProfile) {
    editingUser.value = user
    formData.username = user.username
    formData.displayUsername = user.displayUsername ?? ''
    formData.password = ''
    formData.role = user.role
    await nextTick()
    showAddModal.value = true
  }

  async function toggleBanUser(user: UserProfile) {
    const isBanning = !user.banned
    const index = userListData.value.findIndex((u) => u.id === user.id)

    try {
      if (isBanning) {
        await authAdmin.banUser({ userId: user.id })
      } else {
        await authAdmin.unbanUser(user.id)
      }

      // 客户端更新用户状态
      if (index !== -1) {
        userListData.value[index] = {
          ...userListData.value[index],
          banned: isBanning,
          updatedAt: new Date().toISOString(),
        }
      }

      toast.add({
        title: `用户 "${user.displayUsername || user.username}" 已${isBanning ? '封禁' : '解封'}`,
        color: isBanning ? 'warning' : 'success',
      })
    } catch (error) {
      toast.add({
        title: '操作失败',
        description: String(error),
        color: 'error',
      })
    }
  }

  async function deleteUser(user: UserProfile) {
    if (
      confirm(
        `确定要删除用户 "${user.displayUsername || user.username}" 吗？此操作不可恢复。`
      )
    ) {
      try {
        await authAdmin.deleteUser(user.id)

        // 从列表中移除
        const index = userListData.value.findIndex((u) => u.id === user.id)
        if (index !== -1) {
          userListData.value.splice(index, 1)
        }
        selectedUserIds.value = selectedUserIds.value.filter(
          (id) => id !== user.id
        )
        totalUsers.value--

        toast.add({ title: '用户已删除', color: 'success' })
      } catch (error) {
        toast.add({
          title: '删除失败',
          description: String(error),
          color: 'error',
        })
      }
    }
  }

  async function handleSubmit() {
    if (!formData.username || !formData.displayUsername) {
      toast.add({ title: '请填写完整信息', color: 'error' })
      return
    }

    if (!editingUser.value && !formData.password) {
      toast.add({ title: '请输入密码', color: 'error' })
      return
    }

    try {
      if (editingUser.value) {
        const updateData: { displayUsername?: string; name?: string } = {}
        if (
          formData.displayUsername !== (editingUser.value.displayUsername ?? '')
        ) {
          updateData.displayUsername = formData.displayUsername
          updateData.name = formData.displayUsername
        }

        if (Object.keys(updateData).length > 0) {
          await authAdmin.updateUser({
            userId: editingUser.value.id,
            data: updateData,
          })
        }

        if (formData.password) {
          await authAdmin.setUserPassword({
            userId: editingUser.value.id,
            newPassword: formData.password,
          })
        }

        if (formData.role !== editingUser.value.role) {
          await authAdmin.setUserRole({
            userId: editingUser.value.id,
            role: formData.role,
          })
        }

        // 客户端更新用户数据
        const index = userListData.value.findIndex(
          (u) => u.id === editingUser.value!.id
        )
        if (index !== -1) {
          userListData.value[index] = {
            ...userListData.value[index],
            displayUsername: formData.displayUsername,
            role: formData.role,
            updatedAt: new Date().toISOString(),
          }
        }

        toast.add({ title: '用户信息已更新', color: 'success' })
      } else {
        if (!formData.password) {
          toast.add({ title: '请填写密码', color: 'error' })
          return
        }

        const newUser = await authAdmin.createUser({
          password: formData.password,
          name: formData.displayUsername,
          username: formData.username,
          role: formData.role,
        })

        // 将新用户添加到列表最前面
        if (newUser) {
          userListData.value.unshift(newUser)
          totalUsers.value++
        }

        toast.add({ title: '用户已添加', color: 'success' })
      }

      closeModal()
    } catch (error) {
      toast.add({
        title: editingUser.value ? '更新失败' : '创建失败',
        description: String(error),
        color: 'error',
      })
    }
  }

  watch([searchQuery, statusFilter, roleFilter], () => {
    currentPage.value = 1
    selectedUserIds.value = []
    fetchUsers()
  })

  watch(totalPages, (pageCount) => {
    if (currentPage.value > pageCount) {
      currentPage.value = pageCount
    }
  })

  watch(currentPage, () => {
    fetchUsers()
  })

  onMounted(() => {
    fetchUsers()
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
        @keyup.enter="fetchUsers"
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
          :data="userListData"
          :columns="tableColumns"
          :loading="isLoading"
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
            name="username"
          >
            <UInput
              v-model="formData.username"
              type="text"
              placeholder="请输入用户名"
              :disabled="!!editingUser"
              autocomplete="off"
            />
          </UFormField>
          <UFormField
            label="昵称"
            name="displayUsername"
          >
            <UInput
              v-model="formData.displayUsername"
              type="text"
              placeholder="请输入昵称"
            />
          </UFormField>
          <UFormField
            v-if="!editingUser"
            label="密码"
            name="password"
          >
            <UInput
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              autocomplete="new-password"
            />
          </UFormField>
          <UFormField
            v-if="editingUser"
            label="新密码"
            name="newPassword"
          >
            <UInput
              v-model="formData.password"
              type="password"
              placeholder="留空则不修改密码"
              autocomplete="new-password"
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
