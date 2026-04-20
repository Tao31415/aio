<template>
  <div class="h-full flex">
    <!-- 消息列表 -->
    <div class="w-80 border-r border-default flex flex-col bg-elevated">
      <!-- 搜索框 -->
      <div class="p-4 border-b border-default">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="搜索消息..."
          size="md"
          class="w-full"
        />
      </div>

      <!-- 消息列表 -->
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          @click="selectConversation(conversation)"
          :class="[
            'flex items-center gap-3 p-4 cursor-pointer transition-colors',
            selectedConversation?.id === conversation.id
              ? 'bg-accented'
              : 'hover:bg-accented/80',
          ]"
        >
          <div class="relative">
            <div
              class="w-12 h-12 rounded-full bg-accented flex items-center justify-center"
            >
              <span class="text-lg font-medium text-default">
                {{ conversation.user.name.charAt(0) }}
              </span>
            </div>
            <span
              v-if="conversation.online"
              class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-default"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="font-medium truncate">
                {{ conversation.user.name }}
              </span>
              <span class="text-xs text-muted">
                {{ conversation.lastMessage.time }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted truncate">
                {{ conversation.lastMessage.content }}
              </p>
              <UBadge
                v-if="conversation.unread > 0"
                color="primary"
                variant="solid"
                size="xs"
              >
                {{ conversation.unread }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天内容 -->
    <div class="flex-1 flex flex-col">
      <template v-if="selectedConversation">
        <!-- 聊天头部 -->
        <div
          class="h-16 border-b border-default flex items-center justify-between px-6"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <span class="font-medium text-primary">
                {{ selectedConversation.user.name.charAt(0) }}
              </span>
            </div>
            <div>
              <p class="font-medium">{{ selectedConversation.user.name }}</p>
              <div class="mt-1">
                <UBadge
                  :color="selectedConversation.online ? 'success' : 'neutral'"
                  variant="soft"
                  size="xs"
                >
                  {{ selectedConversation.online ? '在线' : '离线' }}
                </UBadge>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-phone"
            />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-video"
            />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-ellipsis"
            />
          </div>
        </div>

        <!-- 消息列表 -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <div
            v-for="message in selectedConversation.messages"
            :key="message.id"
            :class="['flex', message.fromMe ? 'justify-end' : 'justify-start']"
          >
            <div
              :class="[
                'max-w-[70%] px-4 py-2 rounded-2xl',
                message.fromMe
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-accented rounded-bl-md',
              ]"
            >
              <p>{{ message.content }}</p>
              <p
                :class="[
                  'text-xs mt-1',
                  message.fromMe ? 'text-primary-foreground/70' : 'text-muted',
                ]"
              >
                {{ message.time }}
              </p>
            </div>
          </div>
        </div>

        <!-- 输入框 -->
        <div class="p-4 border-t border-default">
          <div class="flex items-center gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-paperclip"
            />
            <UInput
              v-model="newMessage"
              type="text"
              placeholder="输入消息..."
              class="flex-1"
              @keyup.enter="sendMessage"
            />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-smile"
            />
            <UButton
              @click="sendMessage"
              color="primary"
              icon="i-lucide-send"
            >
              发送
            </UButton>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div
        v-else
        class="flex-1 flex items-center justify-center"
      >
        <UCard class="w-full max-w-sm text-center">
          <template #header>
            <div
              class="w-16 h-16 rounded-full bg-accented flex items-center justify-center mx-auto"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-8 text-muted"
              />
            </div>
          </template>
          <h3 class="text-lg font-medium">选择一个对话</h3>
          <p class="text-muted mt-1">从左侧列表选择一个对话开始聊天</p>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    auth: 'user',
  })

  interface Message {
    id: number
    content: string
    time: string
    fromMe: boolean
  }

  interface Conversation {
    id: number
    user: {
      name: string
      avatar?: string
    }
    online: boolean
    unread: number
    lastMessage: {
      content: string
      time: string
    }
    messages: Message[]
  }

  const searchQuery = ref('')
  const newMessage = ref('')
  const selectedConversation = ref<Conversation | null>(null)
  const messagesContainer = ref<HTMLElement | null>(null)

  // 模拟对话数据
  const conversations = ref<Conversation[]>([
    {
      id: 1,
      user: { name: '张三' },
      online: true,
      unread: 2,
      lastMessage: { content: '好的，我稍后确认一下', time: '10:30' },
      messages: [
        {
          id: 1,
          content: '你好，请问项目进度如何？',
          time: '10:00',
          fromMe: false,
        },
        {
          id: 2,
          content: '进度正常，预计下周完成',
          time: '10:05',
          fromMe: true,
        },
        {
          id: 3,
          content: '太好了，有什么需要支持的吗？',
          time: '10:10',
          fromMe: false,
        },
        { id: 4, content: '暂时没有，感谢关心', time: '10:15', fromMe: true },
        {
          id: 5,
          content: '好的，我稍后确认一下',
          time: '10:30',
          fromMe: false,
        },
      ],
    },
    {
      id: 2,
      user: { name: '李四' },
      online: true,
      unread: 0,
      lastMessage: { content: '收到，谢谢！', time: '09:45' },
      messages: [
        { id: 1, content: '文档已经发给你了', time: '09:30', fromMe: true },
        { id: 2, content: '收到，谢谢！', time: '09:45', fromMe: false },
      ],
    },
    {
      id: 3,
      user: { name: '王五' },
      online: false,
      unread: 5,
      lastMessage: { content: '明天开会时间确定了吗？', time: '昨天' },
      messages: [
        {
          id: 1,
          content: '明天开会时间确定了吗？',
          time: '昨天 18:00',
          fromMe: false,
        },
      ],
    },
    {
      id: 4,
      user: { name: '赵六' },
      online: false,
      unread: 0,
      lastMessage: { content: '周末有空吗？', time: '周一' },
      messages: [
        { id: 1, content: '周末有空吗？', time: '周一 14:00', fromMe: false },
        { id: 2, content: '有的，什么事？', time: '周一 14:30', fromMe: true },
      ],
    },
  ])

  const filteredConversations = computed(() => {
    if (!searchQuery.value) return conversations.value
    return conversations.value.filter((c) =>
      c.user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  function selectConversation(conversation: Conversation) {
    selectedConversation.value = conversation
    conversation.unread = 0

    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }

  function sendMessage() {
    if (!newMessage.value.trim() || !selectedConversation.value) return

    const message: Message = {
      id: Date.now(),
      content: newMessage.value,
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      fromMe: true,
    }

    selectedConversation.value.messages.push(message)
    selectedConversation.value.lastMessage = {
      content: newMessage.value,
      time: message.time,
    }

    newMessage.value = ''

    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
</script>
