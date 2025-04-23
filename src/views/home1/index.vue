<template>
  <div class="container">
    <!-- 用户头像 -->
    <div class="user-avatar" @click="toggleUserInfo">
      <img src="../../static/images/user.png" alt="User Avatar" />
    </div>
    <!-- 用户信息，位置固定在头像下方 -->
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

    <!-- 左侧菜单栏 -->

    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="row">
        <div class="box">
          <div class="title">
            <h2 class="text-center" style="color: #3498db">数字辅导员</h2>
          </div>
          <div class="answer">
            <!-- <div class="tips">
              <h4 class="text-center">欢迎使用AI思政聊天平台</h4>
            </div> -->
            <div class="chat-messages" ref="chatMessages">
              <div
                v-for="(message, index) in messages"
                :key="index"
                :class="['message', message.role]"
              >
                <div
                  :class="[message.role === 'user' ? 'request-icon' : 'response-icon', 'chat-icon']"
                ></div>
                <div class="message-content" v-html="message.content"></div>
              </div>
              <div v-if="showEmptyChatMessage" class="empty-chat-message">
                同学你好！我是一位数字辅导员，随时随地为你解决校园生活相关问题，请开始对话吧！
              </div>
            </div>

            <!-- 加载提示 -->

            <div v-if="isLoading" class="loading-message">
              <p v-if="isLoading">正在加载历史对话...</p>
              <!-- <p v-else-if="messages.length === 0">暂无历史对话记录，开始和AI助手聊天吧！</p> -->
            </div>

            <div class="function">
              <div class="ipt">
                <div class="col-xs-12">
                  <textarea
                    v-model="inputMessage"
                    id="chatInput"
                    class="form-control"
                    rows="1"
                  ></textarea>
                </div>
                <button
                  @click="sendMessage"
                  id="chatBtn"
                  :class="isRequesting ? 'btn btn-danger' : 'btn btn-primary'"
                  :disabled="isLoading"
                  type="button"
                >
                  <i :class="isRequesting ? '' : 'fa fa-paper-plane'"></i>
                </button>
              </div>
            </div>
          </div>
          <!-- <footer class="foot" style="margin-top: 20px">
            <p class="lead text-center">祝你大学生活欢乐愉快！</p>
            <p class="lead text-center">
              <a href="https://cs.nankai.edu.cn/" target="_blank"
                ><i class="fa fa-link fa-lg" aria-hidden="true"></i>&nbsp; 联系我们</a
              >
            </p>
          </footer> -->
        </div>
      </div>
    </div>
    <message-box ref="messageBox"></message-box>
  </div>
</template>

<script>
import { marked } from 'marked'
import MessageBox from '@/components/MessageBox.vue'

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
      apiUrl: 'http://101.42.141.72:8080/streamchat',
      apiUrlconversion: 'http://101.42.141.72:8080/conversation',
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
            conversation.message.forEach((item) => {
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
      this.showEmptyChatMessage = false // 用户开始对话后隐藏提示
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
          buffer += chunk
          try {
            const jsonData = JSON.parse(buffer)
            console.log('jsonData', jsonData)
            if (jsonData.code === 500) {
              // 处理错误响应
              this.showMessage(jsonData.msg || '服务器错误，请稍后重试', 'error')
              this.messages.pop() // 移除最后一条等待回复的消息
              buffer = ''
              this.isRequesting = false
              return
            }

            if (jsonData.type == 'id') {
              this.userInfo.chatId = jsonData.chat_id
              this.userInfo.conversationId = jsonData.conversation_id
              localStorage.setItem('chatId', jsonData.chat_id)
              localStorage.setItem('conversationId', jsonData.conversation_id)
              buffer = ''
              continue
            } else if (jsonData.type == 'verbose') {
              console.log('verbose', jsonData.verbose)
              buffer = ''
              continue
            } else if (jsonData.type == 'text') {
              mes += jsonData.content
              this.messages.at(-1).content = marked(mes)
              this.scrollToBottom()
              buffer = ''
              continue
            } else {
              console.log(buffer)
            }
          } catch (e) {
            continue
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
      const cancelApiUrl = 'http://101.42.141.72:8080/cancel' // 你的取消接口地址
      const requestData = {
        chatId: this.userInfo.chatId,
        conversationId: this.userInfo.conversationId,
      }

      try {
        const response = await fetch(cancelApiUrl, {
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

body {
  background-color: var(--bg-color);
}

html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.container {
  height: 100%;
  width: 70%;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0 auto;
}

.form-control {
  border-color: #e0e0e0 !important;
  padding: 12px !important;
  border-radius: 20px !important;
  transition: all 0.3s ease;
  background-color: white !important;
}

.form-control:focus {
  border-color: #3498db !important;
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.15) !important;
}

.title {
  width: 100%;
  padding: 20px 0;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 10px 10px 0 0;
  margin-bottom: 20px;
}

.title h2 {
  margin: 0;
  color: #010101 !important;
  font-size: 24px;
  font-weight: 600;
  text-shadow: none;
}

.user-avatar {
  position: fixed;
  top: 30px;
  right: 30px; /* 固定靠右距离 */
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  z-index: 9999;
  border: 3px solid #3498db;
  padding: 2px;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  position: fixed;
  top: 120px;
  right: 30px; /* 固定靠右距离 */
  width: 280px;
  padding: 0;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.popup-content {
  padding: 25px;
  border-radius: 20px;
  background: white;
  position: relative;
}

.popup-content p {
  margin: 10px 0;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 12px;
  color: #2c3e50;
  font-size: 16px;
  display: flex;
  align-items: center;
  word-break: break-all; /* 添加文字换行 */
}

.popup-content p strong {
  color: #7f8c8d;
  margin-right: 12px;
  font-weight: 500;
  min-width: 60px; /* 增加标签宽度 */
  flex-shrink: 0; /* 防止标签缩小 */
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 12px 0;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 15px;
}

.logout-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.2);
}

.guest-mode {
  text-align: center;
  padding: 25px;
}

.guest-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.guest-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.guest-desc {
  font-size: 20px;
  color: #7f8c8d;
  margin-bottom: 20px;
}

.login-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 12px 0;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(52, 152, 219, 0.2);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
  background: linear-gradient(135deg, #2980b9, #2573a7);
}

.row {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-radius: 15px;
  padding: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin: 20px;
}

.answer {
  width: 100%;
  position: relative;
  height: 90vh; /* 设置为视口高度的90%，留出一些空间给标题 */
  padding: 20px;
}

.answer .function {
  padding: 0;
  width: 100%;
  position: absolute;
  bottom: 20px;
  display: flex;
  justify-content: center;
}

.answer .tips {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.answer .tips h4 {
  color: #3498db;
  font-size: 18px;
  font-weight: 500;
}

.answer .ipt {
  display: flex;
  align-items: flex-start;
  padding: 10px 20px;
  border-radius: 15px;
  min-height: 50px;
  max-height: 200px;
  background: white;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.answer .ipt:focus-within {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.answer .ipt .col-xs-12 {
  flex: 1;
  margin-right: 10px;
}

.answer .ipt textarea {
  resize: none;
  overflow-y: auto;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  font-size: 20px !important;
  padding: 8px;
  width: 100%;
  min-height: 24px;
  max-height: 150px;
  line-height: 1.5;
  color: #333;
  background: transparent !important;
}

.answer .ipt textarea:focus {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.answer .ipt textarea::placeholder {
  color: #95a5a6;
}

.answer .chat-messages {
  width: 100%;
  height: calc(100% - 100px); /* 减去输入框的高度 */
  overflow-y: auto;
  padding: 10px;
}

.message {
  padding: 15px;
  margin: 15px 0;
  display: flex;
  align-items: flex-start;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message .message-content {
  width: auto;
  max-width: calc(100% - 60px);
  font-size: 20px !important;
  line-height: 1.5;
  margin-left: 15px;
  padding: 12px 16px;
  border-radius: 15px;
  background: #f8f9fa;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
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

.message .chat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.message .request-icon {
  background-image: url(../../static/images/user.png);
}

.message .response-icon {
  background-image: url(../../static/images/robot.png);
}

.answer #chatBtn {
  align-self: flex-end;
  margin-bottom: 8px;
  width: 40px;
  height: 40px;
  font-size: 14px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none !important;
}

.answer #chatBtn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.answer #chatBtn.btn-danger {
  background-color: #e74c3c !important;
  border: none !important;
  position: relative;
  outline: none !important;
}

.answer #chatBtn.btn-danger:focus {
  outline: none !important;
  box-shadow: none !important;
}

.answer #chatBtn.btn-danger::before {
  content: '';
  width: 12px;
  height: 12px;
  background-color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.answer #chatBtn.btn-danger:hover {
  background-color: #c0392b !important;
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
}

.foot {
  padding: 20px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 0 0 15px 15px;
}

.foot p a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.foot p a:hover {
  color: #2980b9;
}

.loading-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #3498db;
  font-size: 30px;
  font-weight: 500;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

/* 滚动条美化 */
.answer .chat-messages::-webkit-scrollbar {
  width: 8px;
}

.answer .chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.answer .chat-messages::-webkit-scrollbar-thumb {
  background: #3498db;
  border-radius: 4px;
}

.answer .chat-messages::-webkit-scrollbar-thumb:hover {
  background: #2980b9;
}

.empty-chat-message {
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
  height: 100%; /* Take full height of the container */
  color: #3498db; /* Blue color */
  font-size: 35px; /* Adjusted font size */
  /* margin-top: 20px; Removed margin */
}

/* Add media query for smaller screens */
@media screen and (max-width: 1200px) {
  .container {
    width: 85%; /* Increase container width on smaller screens */
  }

  .user-avatar {
    right: max(20px, calc((100% - 85%) / 2 - 70px)); /* Adjust position for new container width */
  }

  .user-info {
    right: max(20px, calc((100% - 85%) / 2 - 70px)); /* Match user-avatar position */
  }
}

@media screen and (max-width: 768px) {
  .container {
    width: 80%;
  }

  .user-avatar {
    right: 20px; /* 移动端稍微减小右侧距离 */
  }

  .user-info {
    top: 100px;
    right: 20px; /* 移动端稍微减小右侧距离 */
    width: 260px;
  }

  .popup-content p {
    font-size: 14px; /* 移动端字体稍小 */
    padding: 8px 12px;
  }

  .popup-content p strong {
    min-width: 50px; /* 移动端减小标签宽度 */
  }
}
</style>
