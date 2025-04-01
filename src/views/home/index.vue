<template>
  <div class="container">
    <!-- 用户头像 -->
    <div class="user-avatar" @click="toggleUserInfo">
      <img src="../../static/images/user.png" alt="User Avatar" />
    </div>
    <!-- 用户信息，位置固定在头像下方 -->
    <div class="user-info" v-if="isUserInfoVisible">
      <div class="popup-content">
        <p><strong>名称:</strong> {{ userInfo.name }}</p>
        <p><strong>ID :</strong> {{ userInfo.id }}</p>
        <p><strong>邮箱:</strong> {{ userInfo.email }}</p>
        <p><strong>学校:</strong> {{ userInfo.schoolName }}</p>
        <button class="logout-btn" @click="logout">退出登录</button>
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
            <div id="chatWindow" ref="chatWindowRef">
              <div v-for="(message, index) in messages" :key="index" class="message-bubble">
                <div
                  :class="
                    message.role === 'user' ? 'request-icon chat-icon' : 'response-icon chat-icon'
                  "
                ></div>
                <div class="message-text">
                  <div v-html="message.content"></div>
                </div>
              </div>
            </div>

            <!-- 加载提示 -->

            <div v-if="isLoading || messages.length === 0" class="loading-message">
              <p v-if="isLoading">正在加载历史对话...</p>
              <p v-else-if="messages.length === 0">暂无历史对话记录，开始和AI助手聊天吧！</p>
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
                  {{ isRequesting ? 'End' : 'Go!' }}
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
  </div>
</template>

<script>
import { marked } from 'marked'
export default {
  data() {
    return {
      isUserInfoVisible: false,
      inputMessage: '',
      reader: null,
      messages: [],
      apiUrl: 'http://127.0.0.1:8080/streamchat',
      apiUrlconversion: 'http://127.0.0.1:8080/conversation',
      isRequesting: false,
      isLoading: false, // 加载历史记录的状态
      abortController: null,
      userInfo: {
        name: '用户',
        id: '5BDeuOIf',
        email: 'user@example.com',
        conversationId: '0',
        schoolName: '南开大学',
        chatId: '',
      },
      dialogs: [],
      selectedDialogIndex: -1,
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('userInfo') // 清除用户信息
      // 清除本地存储的 chatId 和 conversationId
      localStorage.removeItem('chatId')
      localStorage.removeItem('conversationId')
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
      }
      // 读取 chatId 和 conversationId
      const chatId = localStorage.getItem('chatId')
      const conversationId = localStorage.getItem('conversationId')

      if (chatId) this.userInfo.chatId = chatId
      if (conversationId) this.userInfo.conversationId = conversationId
    },

    async loadChatHistory() {
      this.isLoading = true // 开始加载，设置加载状态

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
          this.scrollToBottom()
        } else {
          console.error('没有聊天记录')
        }
      } catch (error) {
        alert('加载聊天记录失败，请稍后再试。')
        console.error('加载聊天记录失败:', error)
      } finally {
        this.isLoading = false // 加载完成，恢复正常状态
      }
    },

    async sendMessage() {
      if (this.isRequesting) {
        console.log('结束对话...')
        this.isRequesting = false
        this.stopChat()
        // this.abortController.abort()
        // this.messages.push({ role: 'system', content: '对话已终止。' })
        // this.scrollToBottom()
        return
      }

      const userMessage = this.inputMessage.trim()
      if (userMessage === '') return

      this.isRequesting = true
      // this.abortController = new AbortController()
      // const signal = this.abortController.signal

      this.messages.push({ role: 'user', content: userMessage })
      this.inputMessage = ''
      this.scrollToBottom()
      let mes = ''
      this.messages.push({ role: 'bot', content: mes })
      this.scrollToBottom()
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // signal: signal,
          body: JSON.stringify({
            userId: this.userInfo.id,
            conversationId: '7485033633959460915',
            schoolName: this.userInfo.schoolName,
            content: userMessage,
          }),
        })
        if (!response.ok) throw new Error(`请求失败，状态码：${response.status}`)

        this.reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          // if (isStopped) {
          //   break // 如果标志位为 true，停止接收数据
          // }
          const { value, done } = await this.reader.read()
          if (done) {
            // document.getElementById('stopButton').disabled = true
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          try {
            const jsonData = JSON.parse(buffer)
            console.log('jsonData', jsonData)
            if (jsonData.type == 'id') {
              this.userInfo.chatId = jsonData.chat_id
              this.userInfo.conversationId = jsonData.conversation_id
              // 存储到 localStorage
              localStorage.setItem('chatId', jsonData.chat_id)
              localStorage.setItem('conversationId', jsonData.conversation_id)
              buffer = ''
              // document.getElementById('stopButton').disabled = false
              continue
            } else if (jsonData.type == 'verbose') {
              console.log('verbose', jsonData.verbose)
              buffer = ''
              continue
            } else if (jsonData.type == 'text') {
              // mes += jsonData.content
              // //
              // this.messages.at(-1).content = mes
              // this.scrollToBottom()
              // buffer = ''
              mes += jsonData.content
              this.messages.at(-1).content = marked(mes) // 渲染 Markdown
              this.scrollToBottom()
              buffer = ''
              continue
            } else {
              console.log(buffer)
            }
          } catch (e) {
            continue
          }
          // this.messages.at(-1).content = mes
          this.scrollToBottom()
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('请求被取消')
        } else {
          console.error('API 请求失败:', error)
          mes = '服务器错误，请稍后再试！'
          this.messages.at(-1).content = mes
        }
      }

      this.isRequesting = false
      this.scrollToBottom()
    },

    async stopChat() {
      console.log('停止对话...')
      const cancelApiUrl = 'http://localhost:8080/cancel' // 你的取消接口地址
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
        // this.isStopped = true // 设置标志位为 true
        // document.getElementById("stopButton").disabled = true;
      } catch (error) {
        console.error('取消请求错误:', error)
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const chatWindow = this.$refs.chatWindowRef
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
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  z-index: 10;
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
  top: 80px;
  right: 20px;
  width: 280px;
  padding: 20px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 20;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popup-content h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.popup-content p {
  margin-bottom: 12px;
  color: #34495e;
  font-size: 14px;
}

.row {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  padding: 0;
  background: white;
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
  width: 80%;
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

.answer #chatWindow {
  width: 100%;
  height: calc(100% - 100px); /* 减去输入框的高度 */
  overflow-y: auto;
  padding: 10px;
}

.message-bubble {
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

.message-bubble .message-text {
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

.message-bubble .message-text p {
  margin: 0;
  line-height: 1.5;
  font-size: 16px !important;
}

.message-bubble .message-text::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 15px;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #f8f9fa;
}

.message-bubble .chat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.message-bubble .request-icon {
  background-image: url(../../static/images/user.png);
}

.message-bubble .response-icon {
  background-image: url(../../static/images/robot.png);
}

.answer #chatBtn {
  align-self: flex-end;
  margin-bottom: 8px;
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 20px;
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.answer #chatBtn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.answer #chatBtn.btn-danger {
  background-color: #e74c3c !important;
  border-color: #e74c3c !important;
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

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}
.message-bubble .message-text .logout-btn:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
}

.loading-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #3498db;
  font-size: 18px;
  font-weight: 500;
}

/* 滚动条美化 */
.answer #chatWindow::-webkit-scrollbar {
  width: 8px;
}

.answer #chatWindow::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.answer #chatWindow::-webkit-scrollbar-thumb {
  background: #3498db;
  border-radius: 4px;
}

.answer #chatWindow::-webkit-scrollbar-thumb:hover {
  background: #2980b9;
}
</style>
