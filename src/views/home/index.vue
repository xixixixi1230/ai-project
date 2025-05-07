<template>
  <div class="container">
    <div class="header">
      <h1>数字辅导员</h1>
      <!-- 用户头像 -->
      <div class="user-avatar" @click="toggleUserInfo">
        <img src="/images/user.png" alt="User Avatar" />
      </div>
    </div>

    <!-- 用户信息弹窗 -->
    <div class="user-info" v-if="isUserInfoVisible">
      <div class="popup-content">
        <div v-if="isGuest" class="guest-mode">
          <div class="guest-icon">👋</div>
          <!-- <p class="guest-title">游客模式</p> -->
          <p class="guest-desc">游客模式,登录账号可以保存聊天记录哦</p>
          <button class="login-btn" @click="goToLogin">立即登录</button>
        </div>
        <template v-else>
          <p><strong>名称:</strong> {{ userInfo.name }}</p>
          <p><strong>ID :</strong> {{ userInfo.id }}</p>
          <p><strong>邮箱:</strong> {{ userInfo.email }}</p>
          <p><strong>学校:</strong> {{ userInfo.schoolName }}</p>
          <button class="logout-btn" @click="logout">退出登录</button>
        </template>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="chat-container">
      <div class="chat-messages" ref="chatMessages">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
          <div class="message-header">
            <div class="avatar-wrapper">
              <img
                :src="message.role === 'user' ? '/images/user.png' : '/images/robot.png'"
                :alt="message.role === 'user' ? 'User Avatar' : 'AI Avatar'"
                class="avatar-image"
              />
            </div>
            <span class="role-label">{{ message.role === 'user' ? '用户' : 'AI数字辅导员' }}</span>
          </div>
          <div class="message-content" v-html="message.content"></div>
        </div>
        <div v-if="showEmptyChatMessage" class="empty-chat-message">
          <div class="welcome-title">同学你好！</div>
          <div class="welcome-subtitle">
            我是一位数字辅导员，随时随地为你解决校园生活相关问题，请开始对话吧！
          </div>
        </div>
      </div>

      <!-- 加载提示 -->
      <div v-if="isLoading" class="loading-message">
        <p>正在加载历史对话...</p>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            v-model="inputMessage"
            id="chatInput"
            class="chat-input"
            placeholder="请输入您的问题..."
            rows="1"
          ></textarea>
          <button
            @click="sendMessage"
            class="send-button"
            :class="{ 'is-requesting': isRequesting }"
            :disabled="isLoading"
          >
            <i :class="isRequesting ? 'fa fa-stop' : 'fa fa-paper-plane'"></i>
          </button>
        </div>
      </div>
    </div>
    <message-box ref="messageBox"></message-box>
  </div>
</template>

<script>
import { marked } from 'marked'
import MessageBox from '@/components/MessageBox.vue'

// // 创建自定义渲染器
// const renderer = new marked.Renderer()

// // 修改链接渲染规则，确保链接在新标签页打开
// renderer.link = function (href, title, text) {
//   console.log('Rendering link:', { href, title, text }) // 调试输出，检查传递的参数

//   // 如果 href 是对象，取 href.href
//   if (href && href.href) {
//     href = href.href
//   }

//   // 如果 href 和 text 都有效
//   if (href && text) {
//     return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`
//   }

//   return '' // 如果 href 或 text 无效，返回空字符串
// }
export default {
  components: {
    MessageBox,
  },
  data() {
    return {
      isUserInfoVisible: false,
      inputMessage: '',
      reader: null,
      messages: [],
      //apiUrl: 'http://101.42.141.72:8080/streamchat',
      //apiUrl: '/api/streamchat',
      // apiUrl: 'http://backend:8080/streamchat',
      apiUrl: '/streamchat',
      // apiUrlconversion: 'http://101.42.141.72:8080/conversation',
      //apiUrlconversion: '/api/conversation',
      // apiUrlconversion: 'http://backend:8080/conversation',
      apiUrlconversion: '/conversation',
      apiUrlcancel: '/api/cancel',
      // apiUrlcancel: 'http://backend:8080/cancel',
      isRequesting: false,
      isLoading: false, // 加载历史记录的状态
      showEmptyChatMessage: false, // 新增：控制空聊天提示的显示
      abortController: null,
      isGuest: false, // 新增：是否为游客模式
      userInfo: {
        name: '',
        id: '',
        email: '',
        conversationId: '',
        schoolName: '',
        chatId: '',
      },
      dialogs: [],
      selectedDialogIndex: -1,
    }
  },
  methods: {
    showMessage(message, type = 'info') {
      this.$refs.messageBox.show(message, type)
    },
    logout() {
      localStorage.removeItem('userInfo') // 清除用户信息
      // 清除本地存储的 chatId 和 conversationId
      localStorage.removeItem('chatId')
      localStorage.removeItem('conversationId')
      // 清除游客模式标记
      localStorage.removeItem('isGuestMode')
      this.$router.push('/login') // 跳转到登录页面
    },
    toggleUserInfo() {
      this.isUserInfoVisible = !this.isUserInfoVisible
    },

    loadUserInfo() {
      // 从 localStorage 中读取用户信息
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'))

      // 如果用户信息存在，将其存储到 data 中
      if (storedUserInfo) {
        this.userInfo.name = storedUserInfo.userName
        this.userInfo.id = storedUserInfo.userId
        this.userInfo.email = storedUserInfo.email
        this.userInfo.schoolName = storedUserInfo.school
        // 检查是否为游客模式
        this.isGuest = storedUserInfo.userId === '123456'
      }
      // 读取 chatId 和 conversationId
      const chatId = localStorage.getItem('chatId')
      const conversationId = localStorage.getItem('conversationId')

      if (chatId) this.userInfo.chatId = chatId
      if (conversationId) this.userInfo.conversationId = conversationId
    },

    async loadChatHistory() {
      this.isLoading = true // 开始加载，设置加载状态
      console.log('加载聊天记录...')
      console.log(this.userInfo.id)

      try {
        const response = await fetch(this.apiUrlconversion, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: this.userInfo.id,
          }),
        })

        const data = await response.json()
        console.log('加载聊天记录成功:', data?.data)

        if (data?.code === 200 && Array.isArray(data?.data) && data?.data.length > 0) {
          const chatHistory = []

          // 遍历每个会话
          data.data.forEach((conversation) => {
            // 遍历每个消息
            console.log('conversation:', conversation)
            conversation.messages.forEach((item) => {
              if (item.content) {
                // 仅在消息内容存在时才添加
                chatHistory.push({
                  role: item.role === 'assistant' ? 'bot' : item.role, // 如果是 assistant，就替换成 bot
                  content: marked(item.content), // 转换 Markdown
                })
              }
            })
          })

          this.messages = chatHistory
          this.showEmptyChatMessage = false // 有历史记录时不显示提示
          this.scrollToBottom()
        } else {
          console.error('没有聊天记录')
          console.log(this.showEmptyChatMessage)
          this.showEmptyChatMessage = true // 没有历史记录时显示提示
        }
      } catch (error) {
        this.showMessage('加载聊天记录失败，请稍后再试。', 'error')
        console.error('加载聊天记录失败:', error)
        this.showEmptyChatMessage = true // 加载失败时也显示提示
      } finally {
        this.isLoading = false // 加载完成，恢复正常状态
      }
    },

    async sendMessage() {
      if (this.isRequesting) {
        console.log('结束对话...')
        this.isRequesting = false
        this.stopChat()
        return
      }

      console.log('发送消息...', this.userInfo.conversationId)

      const userMessage = this.inputMessage.trim()
      if (userMessage === '') return

      this.isRequesting = true
      this.messages.push({ role: 'user', content: userMessage })
      this.inputMessage = ''
      // 重置输入框高度
      const textarea = document.getElementById('chatInput')
      if (textarea) {
        textarea.style.height = '1.5rem'
      }
      this.showEmptyChatMessage = false
      this.scrollToBottom()
      let mes = ''
      this.messages.push({ role: 'bot', content: mes })
      this.scrollToBottom()

      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.userInfo.id,
            conversationId: this.userInfo.conversationId,
            schoolName: this.userInfo.schoolName,
            content: userMessage,
          }),
        })

        if (!response.ok) {
          throw new Error(`请求失败，状态码：${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          // 如果响应是JSON格式，直接解析处理
          const jsonData = await response.json()
          if (jsonData.code === 500) {
            throw new Error(jsonData.msg || '服务器错误')
          }
        }

        this.reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { value, done } = await this.reader.read()
          if (done) {
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          console.log('chunk', chunk)
          buffer += chunk
          console.log('buffer', buffer)

          // 按行拆分（后端每条 JSON 后加了 \n）
          let lines = buffer.split('\n')
          buffer = lines.pop() // 最后一段可能是未完成的 JSON，留着下次拼接

          for (let line of lines) {
            // 清理字符串：去除两端空格，去掉末尾单个反斜杠
            line = line.trim().replace(/\\$/, '')
            if (!line) continue
            if (!line.trim()) continue // 忽略空行

            try {
              const jsonData = JSON.parse(line)
              console.log('jsonData', jsonData)

              if (jsonData.code === 500) {
                this.showMessage(jsonData.msg || '服务器错误，请稍后重试', 'error')
                this.messages.pop()
                this.isRequesting = false
                return
              }

              if (jsonData.type === 'id') {
                this.userInfo.chatId = jsonData.chat_id
                this.userInfo.conversationId = jsonData.conversation_id
                localStorage.setItem('chatId', jsonData.chat_id)
                localStorage.setItem('conversationId', jsonData.conversation_id)
              } else if (jsonData.type === 'verbose') {
                console.log('verbose', jsonData.verbose)
              } else if (jsonData.type === 'text') {
                mes += jsonData.content
                this.messages.at(-1).content = marked(mes)
                this.scrollToBottom()
              } else {
                console.log('未知类型', jsonData)
              }
            } catch (e) {
              console.error('JSON 解析失败：', line, e)
            }
          }
          this.scrollToBottom()
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('请求被取消')
        } else {
          console.error('API 请求失败:', error)
          mes = '服务器错误，请稍后再试！'
          this.messages.at(-1).content = mes
          // this.showMessage('服务器错误，请稍后再试！', 'error')
        }
      }

      this.isRequesting = false
      this.scrollToBottom()
    },

    async stopChat() {
      console.log('停止对话...')
      // const cancelApiUrl = 'http://101.42.141.72:8080/cancel' // 你的取消接口地址
      const requestData = {
        chatId: this.userInfo.chatId,
        conversationId: this.userInfo.conversationId,
      }

      try {
        const response = await fetch(this.apiUrlcancel, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        })

        if (!response.ok) throw new Error('取消请求失败')
        console.log('取消请求成功')

        if (this.reader) {
          this.reader.cancel()
        }
      } catch (error) {
        console.error('取消请求错误:', error)
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const chatWindow = this.$refs.chatMessages
        if (chatWindow) {
          chatWindow.scrollTop = chatWindow.scrollHeight
        } else {
          console.warn('chatWindow 为空，无法滚动！')
        }
      })
    },

    handleKeyPress(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.sendMessage()
      }
    },

    adjustTextareaHeight(event) {
      const textarea = event.target
      textarea.style.height = 'auto'
      const height = Math.min(textarea.scrollHeight, 150) // 最大高度150px
      textarea.style.height = height + 'px'
    },

    goToLogin() {
      this.$router.push('/login')
    },

    copyMessage(content) {
      // 创建一个临时文本区域
      const textarea = document.createElement('textarea')
      // 移除HTML标签
      const plainText = content.replace(/<[^>]+>/g, '')
      textarea.value = plainText
      document.body.appendChild(textarea)
      textarea.select()

      try {
        document.execCommand('copy')
        this.showMessage('复制成功！', 'success')
      } catch (err) {
        this.showMessage('复制失败，请手动复制。', 'error')
      }

      document.body.removeChild(textarea)
    },
  },
  mounted() {
    // 页面加载时从 localStorage 获取用户信息
    this.loadUserInfo()
    this.loadChatHistory() // 页面加载时加载历史聊天记录
    const textarea = document.getElementById('chatInput')
    textarea.addEventListener('input', this.adjustTextareaHeight)
    textarea.addEventListener('keydown', this.handleKeyPress)
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  },
  beforeUnmount() {
    const textarea = document.getElementById('chatInput')
    textarea.removeEventListener('input', this.adjustTextareaHeight)
    textarea.removeEventListener('keydown', this.handleKeyPress)
    // 在页面关闭或刷新前取消对话
    this.stopChat()
  },
}
</script>

<style scoped>
@import url('../../static/css/bootstrap.min.css');
@import url('../../static/font-awesome/css/font-awesome.min.css');
@import url('../../static/css/github-dark-dimmed.min.css');

.container {
  height: 100vh;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #f7f7f8;
  border-bottom: 1px solid #e5e5e5;
}

.header h1 {
  font-size: 1.5rem;
  color: #444;
  margin: 0;
  font-weight: 600;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  position: relative;
  background-color: #ffffff;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  background-color: #ffffff;
}

.message {
  padding: 0.8rem 1.5rem 0.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: background-color 0.2s ease;
}

.message:hover {
  background-color: rgba(243, 244, 246, 0.8);
}

/* 确保消息内容在悬停时也能正确显示 */
.message:hover .message-content {
  position: relative;
  z-index: 1;
}

/* 调整消息内容的样式以配合悬停效果 */
.message .message-content {
  width: auto;
  font-size: 20px !important;
  line-height: 1.5;
  padding-left: 32px;
  position: relative;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.message .message-content {
  width: auto;
  font-size: 20px;
  line-height: 1.5;
  padding-left: 32px; /* 头像宽度(24px) + 间距(8px) */
  position: relative;
}

.message .message-content p {
  margin: 0;
  padding: 0;
  line-height: 1.5;
  font-size: 20px;
}

/* 移除多余的样式 */
.message .message-content::before {
  display: none;
}

.avatar-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 3px;
  overflow: hidden;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.role-label {
  font-size: 20px;
  color: #1f2937;
  font-weight: 700;
}

/* .message-content {
  font-size: 20px;
  line-height: 1.75;
  color: #1f2937;
  padding-left: calc(24px + 8px);
  white-space: pre-wrap;
  word-break: break-word;
  margin-top: 2px;
  margin-bottom: 2px;
} */
.message .message-content {
  width: auto;
  max-width: calc(100% - 60px);
  font-size: 20px !important;
  line-height: 1.5;
  margin-left: 15px;
  padding: 12px 16px;
  border-radius: 15px;
  /* background: #f8f9fa;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); */
  position: relative;
}

.message .message-content p {
  margin: 0;
  line-height: 1.5;
  font-size: 16px !important;
}

.message .message-content::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 15px;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #f8f9fa;
}

/* 处理引用和列表的样式 */
.message-content blockquote,
.message-content ul,
.message-content ol {
  margin: 4px 0;
}

/* 处理链接的样式 */
.message-content a {
  color: #2563eb;
  text-decoration: none;
}

.message-content a:hover {
  text-decoration: underline;
}

/* 当消息是机器人回复时，增加一点底部边距 */
/* .message.bot {
  margin-bottom: 0.5rem;
} */

/* 当消息是用户输入时，增加一点顶部边距 */
/* .message.user {
  margin-top: 0.3rem;
} */

/* 输入区域样式 */
.input-container {
  border-top: 1px solid #e5e7eb;
  background-color: #ffffff;
  padding: 1rem;
  position: relative;
}

.input-wrapper {
  max-width: 80%;
  margin: 0 auto;
  background-color: #f3f3f7;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.chat-input {
  flex: 1;
  height: 60px;
  min-height: 60px;
  max-height: 200px;
  padding: 0.5rem;
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1.6;
  color: #374151;
  resize: none;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.chat-input::-webkit-scrollbar {
  width: 6px;
}

.chat-input::-webkit-scrollbar-track {
  background: transparent;
}

.chat-input::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.chat-input::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}

.chat-input:focus {
  outline: none;
}

.chat-input::placeholder {
  color: #9ca3af;
}

.send-button {
  padding: 0.375rem;
  border-radius: 0.375rem;
  background-color: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-button:hover {
  background-color: #1d4ed8;
}

.send-button.is-requesting {
  background-color: #dc2626;
}

.send-button.is-requesting:hover {
  background-color: #b91c1c;
}

/* 空消息提示 */
.empty-chat-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 2rem;
  color: #1f2937;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4));
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  box-sizing: border-box;
}

.welcome-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #2563eb;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 20px;
  color: #4b5563;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* 加载提示 */
.loading-message {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

.loading-message p {
  background-color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #6b7280;
  font-size: 0.9375rem;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 0;
  }

  .message {
    max-width: 95%;
  }

  .header {
    padding: 0.75rem 1rem;
  }

  .input-container {
    padding: 0.75rem 1rem;
  }

  .chat-messages {
    padding: 1rem;
  }

  .message-content {
    padding: 0.875rem 1rem;
  }

  .user-info {
    right: 1rem;
    width: 280px;
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  position: fixed;
  top: 70px;
  right: calc((100% - 1200px) / 2 + 2rem);
  width: 280px;
  background: white;
  border-radius: 0.75rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
}

.popup-content {
  padding: 1.5rem;
}

.guest-mode {
  text-align: center;
}

.guest-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.guest-desc {
  color: #6b7280;
  margin-bottom: 1rem;
}

.login-btn,
.logout-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn {
  background-color: #2563eb;
  color: white;
}

.login-btn:hover {
  background-color: #1d4ed8;
}

.logout-btn {
  background-color: #dc2626;
  color: white;
}

.logout-btn:hover {
  background-color: #b91c1c;
}
</style>
