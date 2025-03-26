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
            <div class="tips">
              <h4 class="text-center">欢迎使用AI思政聊天平台</h4>
            </div>
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
                  type="button"
                >
                  {{ isRequesting ? 'End' : 'Go!' }}
                </button>
              </div>
            </div>
          </div>
          <footer class="foot" style="margin-top: 20px">
            <!-- <p class="lead text-center">祝你大学生活欢乐愉快！</p> -->
            <p class="lead text-center">
              <a href="https://cs.nankai.edu.cn/" target="_blank"
                ><i class="fa fa-link fa-lg" aria-hidden="true"></i>&nbsp; 联系我们</a
              >
            </p>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isUserInfoVisible: false,
      inputMessage: '',
      messages: [],
      apiUrl: 'http://127.0.0.1:8080/chat',
      apiUrlconversion: 'http://127.0.0.1:8080/conversation',
      isRequesting: false,
      abortController: null,
      userInfo: {
        name: '用户',
        id: '123456',
        email: 'user@example.com',
        // conversationId: '0',
        schoolName: '南开大学',
      },
      dialogs: [],
      selectedDialogIndex: -1,
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('userInfo') // 清除用户信息
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
    },

    // 从 localStorage 中加载用户信息
    async loadChatHistory() {
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
                  content: item.content, // 消息内容
                })
              }
            })
          })

          this.messages = chatHistory
        } else {
          console.error('没有找到有效的聊天记录数据')
        }
      } catch (error) {
        console.error('加载聊天记录失败:', error)
      }
    },

    async sendMessage() {
      if (this.isRequesting) {
        console.log('结束对话...')
        this.isRequesting = false
        this.abortController.abort()
        this.messages.push({ role: 'system', content: '对话已终止。' })
        this.scrollToBottom()
        return
      }

      const userMessage = this.inputMessage.trim()
      if (userMessage === '') return

      this.isRequesting = true
      this.abortController = new AbortController()
      const signal = this.abortController.signal

      this.messages.push({ role: 'user', content: userMessage })
      this.inputMessage = ''
      this.scrollToBottom()
      // 如果是第一个消息，创建对话并命名
      // if (this.messages.length === 1) {
      //   console.log('1111111')
      //   this.createDialog(userMessage)
      // }

      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: signal,
          body: JSON.stringify({
            userId: this.userInfo.id,
            // conversationId: this.userInfo.conversationId,
            schoolName: this.userInfo.schoolName,
            content: userMessage,
          }),
        })

        if (!response.ok) throw new Error(`请求失败，状态码：${response.status}`)

        const data = await response.json()
        const answer = data?.data?.answer || 'AI 没有返回消息'
        this.userInfo.conversationId = data?.data?.conversationId
        const sourse = data?.data?.verbose[0]?.meta?.document?.name || '无'

        // 检查 sourse 是否不是 '无'，如果是，则拼接 answer 和 sourse
        const messageContent = sourse !== '无' ? `${answer} 主要来源：${sourse}` : answer

        console.log(messageContent)
        this.messages.push({ role: 'bot', content: messageContent })
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('请求被取消')
        } else {
          console.error('API 请求失败:', error)
          this.messages.push({ role: 'bot', content: '服务器错误，请稍后再试！' })
        }
      }

      this.isRequesting = false
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatWindow = this.$refs.chatWindowRef
        chatWindow.scrollTop = chatWindow.scrollHeight
      })
    },
    handleKeyPress(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.sendMessage()
      }
    },
  },
  mounted() {
    // 页面加载时从 localStorage 获取用户信息
    this.loadUserInfo()
    this.loadChatHistory() // 页面加载时加载历史聊天记录
    document.getElementById('chatInput').addEventListener('keydown', this.handleKeyPress)
  },
  beforeUnmount() {
    document.getElementById('chatInput').removeEventListener('keydown', this.handleKeyPress)
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
  background-color: #f7f7f7;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.form-control {
  border-color: #3498db !important;
  padding: 6px 6px !important;
}

pre {
  position: relative;
  color: #adbac7;
  background: #2b2a2a;
}

.title {
  width: 100%;
}

.title h2 {
  margin-bottom: 20px;
  color: #4aa593;
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
  width: 250px;
  padding: 15px;
  background-color: white;
  border: 2px solid #3498db;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 20;
  cursor: pointer;
}

.popup-content h4 {
  margin-bottom: 10px;
}

.popup-content p {
  margin-bottom: 8px;
}

.row {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 10px;
}

.answer {
  width: 100%;
  position: relative;
  height: calc(100vh - 165px);
}

.answer .function {
  padding: 0 15px;
  width: 100%;
  position: absolute;
  bottom: 0px;
}

.answer .tips {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.answer .tips h4 {
  color: rgb(0, 132, 255);
}

.answer .ipt {
  display: flex;
  align-items: center;
  padding-right: 15px;
  border-radius: 10px;
  height: 70px;
  border: 1px solid #3498db;
  box-shadow: 0px 0px 10px 0px rgba(26, 179, 148, 0.2);
}

.answer .ipt textarea {
  resize: none;
  overflow-y: auto;
  border: none;
  box-shadow: none;
  font-size: 24px;
}

.answer .ipt textarea:focus {
  border: none !important;
  box-shadow: none !important;
}

.answer #chatWindow {
  width: 100%;
  max-height: calc(100% - 100px);
  height: auto;
  overflow-y: auto;
}

.message-bubble {
  padding: 5px;
  margin: 10px;
  display: flex;
  align-items: flex-start;
  align-items: center;
  border-bottom: 1px dashed #e7eaec;
}

.message-bubble .message-text {
  width: auto;
  max-width: calc(100% - 45px);
  font-size: 24px;
  margin-left: 15px;
  word-break: break-all;
}

.message-bubble .message-text p {
  white-space: pre-wrap;
}

.message-bubble .chat-icon {
  width: 30px;
  height: 30px;
  border-radius: 3px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-size: contain;
}

.message-bubble .request-icon {
  background-image: url(../../static/images/user.png);
}

.message-bubble .response-icon {
  background-image: url(../../static/images/robot.png);
}

.answer #chatBtn {
  background-color: #3498db;
  border-color: #3498db;
}

.answer #chatBtn.btn-danger {
  background-color: red !important;
  border-color: red !important;
}

.answer #chatBtn:focus {
  outline: 5px auto #3498db !important;
}

.foot p:first-child {
  margin-bottom: 10px;
  opacity: 0.9;
}

.foot p:nth-child(2) {
  margin-bottom: 0;
}

.foot p a {
  margin-right: 10px;
  font-weight: 400;
  font-size: 18px;
  color: #3498db;
  text-decoration: none;
}

.dropdown-menu {
  border: 0 !important;
}

/* 新增样式 */
.container {
  display: flex;
  width: 90%; /* 确保容器占满全宽 */
  justify-content: flex-start; /* 水平左对齐 */
}

.sidebar {
  left: 20px; /* 靠近左侧 */
  width: 15%; /* 占据屏幕宽度的20% */
  background-color: #f8f9fa;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: relative; /* 确保子元素的定位相对于sidebar */
}

.sidebar h3 {
  margin-bottom: 20px;
  text-align: center;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
}

.sidebar li {
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px; /* 设置固定高度 */
}

.sidebar li:hover {
  background-color: #e9ecef;
}

.sidebar li.active {
  background-color: #e9ecef; /* 暗灰色 */
  color: black;
}

.sidebar li button {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sidebar li button:hover {
  background-color: #c82333;
}

.sidebar .new-dialog-item {
  padding: 0; /* 移除内边距 */
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px; /* 设置固定高度 */
  width: 100%; /* 确保宽度占满整个li */
}

.sidebar .new-dialog-item button {
  display: block; /* 设置为块级元素 */
  width: 100%; /* 占满整个li */
  height: 100%; /* 占满整个li */
  padding: 0; /* 取消内边距 */
  background-color: transparent; /* 取消背景颜色 */
  border: none; /* 取消边框 */
  color: #3498db; /* 设置文字颜色 */
  cursor: pointer;
  transition: color 0.3s; /* 添加颜色过渡效果 */
  font-size: 20px;
  text-align: center; /* 文字居中 */
}

.sidebar .new-dialog-item button:hover {
  background-color: #e9ecef;
}

.sidebar .new-dialog-item:active {
  background-color: #e9ecef; /* 暗灰色 */
}

/* 删除按钮样式 */
.sidebar .delete-button {
  background-color: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 20px;
  transition: color 0.3s;
}

.sidebar .delete-button:hover {
  color: #c82333;
}

.main-content {
  flex: 1; /* 占据剩余的宽度 */
  padding: 20px;
  margin-left: 20px; /* 确保与sidebar有一定的间距 */
}

.main-content .row {
  width: 100%;
  height: 100%;
}

.main-content .box {
  width: 100%;
  height: 100%;
}
.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>
