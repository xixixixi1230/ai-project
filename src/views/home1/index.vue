<template>
  <!-- 整个页面的容器，使用 Bootstrap 的 container 类来实现响应式布局 -->
  <div class="container">
    <!-- 用户头像 -->
    <div class="user-avatar" @click="toggleUserInfo">
      <img src="../../static/images/user.png" alt="User Avatar" />
    </div>
    <!-- 用户信息，位置固定在头像下方 -->
    <div class="user-info" v-if="isUserInfoVisible">
      <div class="popup-content">
        <!-- <h4>用户信息:</h4> -->
        <p><strong>ID:</strong> {{ userInfo.id }}</p>
        <p><strong>邮箱:</strong> {{ userInfo.email }}</p>
        <p><strong>学校:</strong> {{ userInfo.schoolName }}</p>
      </div>
    </div>

    <!-- Bootstrap 的行布局类，用于将其子元素排列成一行 -->
    <div class="row">
      <!-- 页面内容的盒子，col-xs-12 表示在超小屏幕设备上占据 12 列（即占满一行） -->
      <div class="box">
        <!-- 页面标题部分 -->
        <div class="title">
          <!-- 标题文字，居中显示 -->
          <h2 class="text-center" style="color: #3498db">
            <!-- 标题文本 -->
            数字辅导员
          </h2>
        </div>
        <!-- 聊天回复区域 -->
        <div class="answer">
          <div class="tips">
            <h4 class="text-center">欢迎使用AI思政聊天平台</h4>
          </div>
          <!-- 聊天窗口，用于显示聊天消息，通过 ref 绑定到 chatWindowRef 以便在脚本中操作 -->
          <div id="chatWindow" ref="chatWindowRef">
            <!-- 循环渲染消息 -->
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
          <!-- 功能操作区域，包含设置、输入框等功能 -->
          <div class="function">
            <!-- 输入区域，包含输入框和发送按钮 -->
            <div class="ipt">
              <!-- 输入框所在列 -->
              <div class="col-xs-12">
                <!-- 输入框，使用 v-model 双向绑定到 inputMessage 变量 -->
                <textarea
                  v-model="inputMessage"
                  id="chatInput"
                  class="form-control"
                  rows="1"
                ></textarea>
              </div>
              <!-- 发送按钮，点击触发 sendMessage 方法 -->
              <!-- <button @click="sendMessage" id="chatBtn" class="btn btn-primary" type="button">
                  Go !
                </button> -->
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
          <p class="lead text-center">祝你大学生活欢乐愉快！</p>
          <p class="lead text-center">
            <a href="https://cs.nankai.edu.cn/" target="_blank"
              ><i class="fa fa-link fa-lg" aria-hidden="true"></i>&nbsp; 联系我们</a
            >
          </p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isUserInfoVisible: false, // 控制用户信息弹窗的显示与隐藏
      inputMessage: '', // 用户输入的消息
      // messages: [], // 存储聊天记录
      messages: JSON.parse(localStorage.getItem('chatMessages')) || [], // 读取存储的聊天记录
      apiUrl: 'http://127.0.0.1:8080/chat', // 你的 API 地址
      isRequesting: false, // 控制 Go 按钮状态
      abortController: null, // 用来取消请求
      userInfo: {
        id: '123456', // 用户ID
        email: 'user@example.com', // 用户邮箱
        conversationId: localStorage.getItem('conversationId') || '0', // 读取对话ID
        schoolName: '南开大学', // 学校名称
      },
    }
  },
  methods: {
    // 切换用户信息弹窗的显示与隐藏
    toggleUserInfo() {
      this.isUserInfoVisible = !this.isUserInfoVisible
    },
    async sendMessage() {
      // **如果 isRequesting 为 true，表示正在对话，点击按钮直接结束**
      if (this.isRequesting) {
        console.log('结束对话...')
        this.isRequesting = false // 结束对话
        this.abortController.abort() // 取消当前请求
        this.messages.push({ role: 'system', content: '对话已终止。' })
        this.updateLocalStorage() // 更新存储
        // 滚动到底部

        this.scrollToBottom()
        return
      }

      const userMessage = this.inputMessage.trim()
      if (userMessage === '') return

      // **1️⃣ 变为对话状态，按钮变红**
      this.isRequesting = true
      this.abortController = new AbortController() // 新建一个控制器
      const signal = this.abortController.signal // 获取 signal

      this.messages.push({ role: 'user', content: userMessage })
      this.inputMessage = '' // 清空输入框
      this.updateLocalStorage() // 更新存储
      // 滚动到底部
      this.scrollToBottom()

      try {
        // **2️⃣ 发送请求到 API，加入 signal 来处理取消**
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: signal, // 使用 signal
          body: JSON.stringify({
            userId: this.userInfo.id,
            conversationId: this.userInfo.conversationId,
            schoolName: this.userInfo.schoolName,
            content: userMessage,
          }),
        })

        if (!response.ok) throw new Error(`请求失败，状态码：${response.status}`)

        const data = await response.json()
        console.log(data)
        const answer = data?.data?.answer || 'AI 没有返回消息'
        this.userInfo.conversationId = data?.data?.conversationId
        this.messages.push({ role: 'bot', content: answer })
        this.updateLocalStorage() // 更新存储
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('请求被取消')
        } else {
          console.error('API 请求失败:', error)
          this.messages.push({ role: 'bot', content: '服务器错误，请稍后再试！' })
          this.updateLocalStorage() // 更新存储
        }
      }

      // **3️⃣ 结束对话状态，按钮变回蓝色**
      this.isRequesting = false
      // 滚动到底部
      this.scrollToBottom()
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const chatWindow = this.$refs.chatWindowRef
        chatWindow.scrollTop = chatWindow.scrollHeight
      })
    },
    // 监听回车键发送消息
    handleKeyPress(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault() // 防止换行
        this.sendMessage()
      }
    },
    updateLocalStorage() {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages))
      localStorage.setItem('conversationId', this.userInfo.conversationId)
    },
  },
  mounted() {
    // 恢复对话ID
    this.userInfo.conversationId = localStorage.getItem('conversationId') || '0'
    // 绑定回车键事件
    document.getElementById('chatInput').addEventListener('keydown', this.handleKeyPress)
  },
  beforeUnmount() {
    // 解绑回车键事件，防止内存泄漏
    document.getElementById('chatInput').removeEventListener('keydown', this.handleKeyPress)
  },
  beforeDestroy() {
    // // 清理事件监听器
    // document.removeEventListener('click', this.closeUserInfo);
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
/*   
  @media screen and (max-width: 768px) {
    .container {
      width: 100% !important;
    }
    .answer {
      height: calc(100vh - 145px) !important;
    }
    .answer .others .common .settings-common span {
      font-size: 85%;
    }
    .foot p:first-child {
      font-size: 14px !important;
    }
    .foot p a {
      font-size: 13px !important;
    }
  }
  
  @media screen and (min-width: 1200px) {
    .container {
      width: 970px !important;
    }
  }
  
  @media screen and (min-width: 768px) {
    #chatWindow::-webkit-scrollbar {
      width: 3px;
    }
  
    #chatWindow::-webkit-scrollbar-track {
      background-color: #f1f1f1;
    }
  
    #chatWindow::-webkit-scrollbar-thumb {
      background-color: #888;
      border-radius: 4px;
    }
  } */

* {
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  width: 100%;
  background-color: #f7f7f7; /* 设置为浅灰色背景 */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影效果以增强层次感 */
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

.copy-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #686666;
  color: #e2dfea;
  cursor: pointer;
}

.title {
  width: 100%;
}

.title h2 {
  margin-bottom: 20px;
  color: #4aa593;
}

/* 用户头像样式 */
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
  cursor: pointer; /* 鼠标悬停时显示为可点击 */
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 用户头像样式 */
.user-avatar {
  position: fixed;
  top: 30px;
  right: 50px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  z-index: 10;
  border: 3px solid #3498db;
  padding: 2px;
  cursor: pointer; /* 鼠标悬停时显示为可点击 */
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 用户信息弹窗样式 */
.user-info {
  position: fixed;
  top: 80px; /* 将位置调整到头像下方 */
  right: 20px; /* 用户信息位置和头像保持一致 */
  width: 250px;
  padding: 15px;
  background-color: white;
  border: 2px solid #3498db;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 20;
  cursor: pointer; /* 弹窗可点击，点击时关闭 */
}

.popup-content h4 {
  margin-bottom: 10px;
}

.popup-content p {
  margin-bottom: 8px;
}

/* 为 .row 元素添加阴影边界 */
.row {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 水平偏移 0，垂直偏移 4px，模糊半径 8px，颜色为半透明黑色 */
  border-radius: 10px; /* 可选，圆角效果 */
  padding: 10px; /* 可选，确保内容不会贴着边框 */
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

/* 按钮样式 */
.chck-btn {
  display: flex;
  justify-content: center;
  width: 60px;
  height: 34px;
}

/* Hide the input */
input[type='checkbox'] {
  position: absolute;
  opacity: 0;
  z-index: -1;
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

.answer .others .center .stop {
  border: 1px solid rgba(241, 41, 11, 0.8);
  border-radius: 5px;
  opacity: 0.8;
  width: 60px;
  background-color: rgba(179, 46, 26, 0.1);
  overflow: hidden;
}

.answer .others .center .stop .stop-icon {
  width: 100%;
  color: red;
  opacity: 0.8;
}

.answer .others .center .stop .stop-icon:hover {
  background-color: rgb(214, 168, 168, 0.2);
}

.answer .others .right .screenshot {
  margin-right: 10px;
}

.answer .others .icon-style {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  color: #3498db;
  cursor: pointer;
}

.answer .others .icon-style:hover {
  background-color: rgba(26, 179, 148, 0.1);
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
  align-items: center; /* 确保消息的图标和文本垂直居中 */
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

.message-bubble .response ol,
ul {
  padding-left: 2em;
}

/* 错误信息样式 */
.message-bubble .message-text p.error {
  color: red;
  height: auto;
  display: block;
  white-space: normal;
  word-break: break-all;
}

.message-bubble .chat-icon {
  width: 30px;
  height: 30px;
  border-radius: 3px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-size: contain; /* 确保图标按比例缩放 */
}

.message-bubble .request-icon {
  background-image: url(../../static/images/user.png);
}

.message-bubble .response-icon {
  background-image: url(../../static/images/robot.png);
}

.message-bubble .response .loading-icon {
  color: #3498db;
}

.answer #chatBtn {
  background-color: #3498db;
  border-color: #3498db;
}
/* 只有在 `btn-danger` 类存在时才会变红 */
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
  font-size: 14px;
  color: #3498db;
  text-decoration: none;
}

.dropdown-menu {
  border: 0 !important;
}
</style>
