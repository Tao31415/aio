<template>
  <div class="h-full flex">
    <!-- 消息列表 -->
    <div class="w-80 border-r flex flex-col bg-card">
      <!-- 搜索框 -->
      <div class="p-4 border-b">
        <div class="relative">
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
            placeholder="搜索消息..."
            class="w-full h-9 pl-9 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
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
              ? 'bg-primary/10'
              : 'hover:bg-accent',
          ]"
        >
          <div class="relative">
            <div
              class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <span class="text-lg font-medium text-primary">
                {{ conversation.user.name.charAt(0) }}
              </span>
            </div>
            <span
              v-if="conversation.online"
              class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="font-medium truncate">
                {{ conversation.user.name }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ conversation.lastMessage.time }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground truncate">
                {{ conversation.lastMessage.content }}
              </p>
              <span
                v-if="conversation.unread > 0"
                class="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center"
              >
                {{ conversation.unread }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天内容 -->
    <div class="flex-1 flex flex-col">
      <template v-if="selectedConversation">
        <!-- 聊天头部 -->
        <div class="h-16 border-b flex items-center justify-between px-6">
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
              <p class="text-xs text-muted-foreground">
                {{ selectedConversation.online ? '在线' : '离线' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="p-2 rounded-lg hover:bg-accent transition-colors">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </button>
            <button class="p-2 rounded-lg hover:bg-accent transition-colors">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button class="p-2 rounded-lg hover:bg-accent transition-colors">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
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
                  : 'bg-muted rounded-bl-md',
              ]"
            >
              <p>{{ message.content }}</p>
              <p
                :class="[
                  'text-xs mt-1',
                  message.fromMe
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground',
                ]"
              >
                {{ message.time }}
              </p>
            </div>
          </div>
        </div>

        <!-- 输入框 -->
        <div class="p-4 border-t">
          <div class="flex items-center gap-3">
            <button class="p-2 rounded-lg hover:bg-accent transition-colors">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            <input
              v-model="newMessage"
              type="text"
              placeholder="输入消息..."
              class="flex-1 h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              @keyup.enter="sendMessage"
            />
            <button class="p-2 rounded-lg hover:bg-accent transition-colors">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button
              @click="sendMessage"
              class="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div
        v-else
        class="flex-1 flex items-center justify-center"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium">选择一个对话</h3>
          <p class="text-muted-foreground mt-1">
            从左侧列表选择一个对话开始聊天
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'default',
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
