<template>
  <!-- 整个页面的容器，使用 Bootstrap 的 container 类来实现响应式布局 -->
  <div class="container">
    <!-- Bootstrap 的行布局类，用于将其子元素排列成一行 -->
    <div class="row">
      <!-- 页面内容的盒子，col-xs-12 表示在超小屏幕设备上占据 12 列（即占满一行） -->
      <div class="box col-xs-12">
        <!-- 页面标题部分 -->
        <div class="title">
          <!-- 标题文字，居中显示 -->
          <h2 class="text-center" style="color: #3498db;">
            <!-- 标题文本 -->
            数字辅导员
          </h2>
        </div>
        <!-- 聊天回复区域 -->
        <div class="answer">
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
            <!-- 功能操作区域的上半部分，包含设置、停止、截图和删除等按钮 -->
            <div class="others">
              <!-- 左侧设置区域 -->
              <div class="left">
                <!-- 设置按钮及其下拉菜单 -->
                <div class="settings common dropup">
                  <!-- 设置按钮，点击后触发下拉菜单显示 -->
                  <a
                    class="dropdown-toggle icon-style"
                    id="dropdownMenu"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    title="设置"
                  >
                    <!-- 设置图标 -->
                    <i class="fa fa-cogs fa-lg" aria-hidden="true"></i>
                  </a>
                  <!-- 下拉菜单内容 -->
                  <div class="dropdown-menu" style="padding: 0" onclick="event.stopPropagation()">
                    <!-- 主题设置项 -->
                    <div class="settings-common">
                      <!-- 主题设置的标题及图标 -->
                      <span
                        ><i class="fa fa fa-linode fa-lg" aria-hidden="true"></i>&nbsp; 主题</span
                      >
                      <!-- 主题选择下拉框 -->
                      <select class="form-control ipt-common theme">
                        <!-- 可选的主题选项 -->
                        <option value="light">light</option>
                        <option value="light-red">light-red</option>
                        <option value="light-green">light-green</option>
                        <option value="light-yellow">light-yellow</option>
                      </select>
                    </div>
                    <!-- API 地址设置项 -->
                    <div class="settings-common">
                      <!-- API 地址设置的标题及图标 -->
                      <span
                        ><i class="fa fa-link fa-lg" aria-hidden="true"></i>&nbsp; api 地址</span
                      >
                      <!-- 输入 API 地址的文本框 -->
                      <input
                        type="text"
                        class="form-control ipt-common api-url"
                        placeholder="可填入中转代理api"
                      />
                    </div>
                    <!-- OpenAI Key 设置项 -->
                    <div class="settings-common">
                      <!-- OpenAI Key 设置的标题及图标 -->
                      <span
                        ><i class="fa fa-key fa-lg" aria-hidden="true"></i>&nbsp; OpenAI Key</span
                      >
                      <!-- 输入 OpenAI Key 的文本框 -->
                      <input
                        type="text"
                        class="form-control ipt-common api-key"
                        placeholder="可填入api key"
                      />
                    </div>
                    <!-- OpenAI 模型选择项 -->
                    <div class="settings-common">
                      <!-- OpenAI 模型选择的标题及图标 -->
                      <span
                        ><i class="fa fa-reddit-alien fa-lg" aria-hidden="true"></i>&nbsp; OpenAI
                        模型</span
                      >
                      <!-- 模型选择下拉框 -->
                      <select class="form-control ipt-common model">
                        <!-- 可选的模型选项 -->
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                        <option value="gpt-4">gpt-4</option>
                        <option value="gpt-4o">gpt-4o</option>
                        <option value="deepseek-reasoner">deepseek-R1</option>
                        <option value="deepseek-chat">deepseek-V3</option>
                      </select>
                    </div>
                    <!-- 记录对话内容设置项 -->
                    <div class="settings-common">
                      <!-- 记录对话内容设置的标题及图标 -->
                      <span
                        ><i class="fa fa-floppy-o fa-lg" aria-hidden="true"></i>&nbsp;
                        记录对话内容，刷新不会消失</span
                      >
                      <!-- 复选框及自定义样式 -->
                      <div class="chck-btn">
                        <input id="chck-1" type="checkbox" />
                        <label for="chck-1" class="check-trail">
                          <div class="check-handler"></div>
                        </label>
                      </div>
                    </div>
                    <!-- 开启连续对话设置项 -->
                    <div class="settings-common">
                      <!-- 开启连续对话设置的标题及图标 -->
                      <span
                        ><i class="fa fa-retweet fa-lg" aria-hidden="true"></i>&nbsp;
                        开启连续对话，加倍消耗tokens</span
                      >
                      <!-- 复选框及自定义样式 -->
                      <div class="chck-btn">
                        <input id="chck-2" type="checkbox" />
                        <label for="chck-2" class="check-trail">
                          <div class="check-handler"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 中间停止响应按钮区域 -->
              <div class="center">
                <!-- 停止响应按钮 -->
                <div class="stop common">
                  <!-- 停止响应按钮链接 -->
                  <a class="icon-style stop-icon" title="停止响应" style="text-decoration: none">
                    <!-- 停止图标及文字 -->
                    <i class="fa fa-stop-circle-o fa-lg" aria-hidden="true"></i> 停止
                  </a>
                </div>
              </div>
              <!-- 右侧截图和删除历史记录按钮区域 -->
              <div class="right">
                <!-- 截图按钮 -->
                <div class="screenshot common">
                  <!-- 截图按钮链接 -->
                  <a class="icon-style" title="截图保存对话">
                    <!-- 截图图标 -->
                    <i class="fa fa-file-image-o fa-lg" aria-hidden="true"></i>
                  </a>
                </div>
                <!-- 删除历史记录按钮 -->
                <div class="delete common">
                  <!-- 删除历史记录按钮链接 -->
                  <a class="icon-style" title="删除历史记录">
                    <!-- 删除图标 -->
                    <i class="fa fa-trash-o fa-lg" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            </div>
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
              <button @click="sendMessage" id="chatBtn" class="btn btn-primary" type="button">
                Go !
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import hljs from 'highlight.js'
import { marked } from 'marked'

// 定义响应式数据，用于存储聊天消息列表
const messages = ref([])
// 定义响应式数据，用于存储用户输入的消息
const inputMessage = ref('')
// 定义响应式数据，用于表示是否正在发送消息
const isSending = ref(false)
// 定义响应式数据，用于引用聊天窗口的 DOM 元素，方便操作滚动等
const chatWindowRef = ref(null)

// 定义响应式数据，存储当前主题，优先从本地存储中获取，若没有则使用默认值 'light'
const theme = ref(localStorage.getItem('theme') || 'light')
// 定义响应式数据，存储当前选择的模型，优先从本地存储中获取，若没有则使用默认值 'default'
const model = ref(localStorage.getItem('model') || 'default')
// 定义响应式数据，存储 API 地址，优先从本地存储中获取，若没有则使用默认值 ''
const apiUrl = ref(localStorage.getItem('apiUrl') || '')
// 定义响应式数据，存储 API Key，优先从本地存储中获取，若没有则使用默认值 ''
const apiKey = ref(localStorage.getItem('apiKey') || '')
// 定义响应式数据，存储是否记录对话内容的状态，优先从本地存储中获取，若没有则使用默认值 false
const archiveSession = ref(localStorage.getItem('archiveSession') === 'true')
// 定义响应式数据，存储是否开启连续对话的状态，优先从本地存储中获取，若没有则使用默认值 true
const continuousDialogue = ref(localStorage.getItem('continuousDialogue') === 'true')

// 初始化 marked 的配置函数
const setupMarked = () => {
  const renderer = new marked.Renderer()
  // 重写 marked 的 list 方法，用于自定义列表的渲染
  renderer.list = function (body, ordered, start) {
    const type = ordered ? 'ol' : 'ul'
    const startAttr = ordered && start ? ` start="${start}"` : ''
    return `<${type}${startAttr}>\n${body}</${type}>\n`
  }
  // 设置 marked 的选项，包括自定义渲染器和代码高亮处理
  marked.setOptions({
    renderer,
    highlight: (code, language) => {
      const validLanguage = hljs.getLanguage(language) ? language : 'javascript'
      return hljs.highlight(code, { language: validLanguage }).value
    },
  })
}

// 转义 HTML 字符串的函数，防止恶意代码注入或错误渲染
const escapeHtml = (html) => {
  const text = document.createTextNode(html)
  const div = document.createElement('div')
  div.appendChild(text)
  return div.innerHTML
}

// 添加用户请求消息到消息列表的函数
const addRequestMessage = (message) => {
    console.log(message)
  messages.value.push({ role: 'user', content: escapeHtml(message) })
  messages.value.push({
    role: 'assistant',
    content: '<span class="loading-icon"><i class="fa fa-spinner fa-pulse fa-2x"></i></span>',
  })
  console.log(messages.value);
  // 调用滚动到聊天窗口底部的函数，确保新消息可见
  scrollToBottom()
}

// 添加响应消息到消息列表的函数，更新最后一条消息的内容
const addResponseMessage = (message) => {
  const lastMessage = messages.value[messages.value.length - 1]
  console.log(lastMessage);
  lastMessage.content = marked.parse(message)
  console.log(lastMessage.content);
  
  // 调用滚动到聊天窗口底部的函数，确保新消息可见
  scrollToBottom()
}

// 添加失败消息到消息列表的函数，更新最后一条消息的内容并移除用户输入消息（如果失败）
const addFailMessage = (message) => {
  const lastMessage = messages.value[messages.value.length - 1]
  lastMessage.content = `<p class="error">${message}</p>`
  messages.value.pop()
  // 调用滚动到聊天窗口底部的函数，确保新消息可见
  scrollToBottom()
}

// 发送消息的函数，处理用户输入并模拟机器人回复
const sendMessage = () => {
  if (inputMessage.value.trim() === '') return
  isSending.value = true
  addRequestMessage(inputMessage.value)

  // 模拟延迟回复
  setTimeout(() => {
    const response = '这是机器人的回答'
    addResponseMessage(response)
    // messages.value.push({ role: 'assistant', content: response })
    console.log(messages.value)

    if (archiveSession.value) {
      localStorage.setItem('session', JSON.stringify(messages.value))
    }
    isSending.value = false
  }, 1000)

  inputMessage.value = ''
}

// 滚动到聊天窗口底部的函数，使用 nextTick 确保 DOM 更新后执行滚动操作
const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindowRef.value) {
      chatWindowRef.value.scrollTop = chatWindowRef.value.scrollHeight
    }
  })
}

// 加载历史会话的函数，从本地存储中读取并设置消息列表
const loadSession = () => {
  if (archiveSession.value) {
    const session = localStorage.getItem('session')
    if (session) {
      messages.value = JSON.parse(session)
    }
  }
}

// 设置事件监听器的函数，包括窗口 resize 事件来调整下拉菜单宽度
const setupEventListeners = () => {
  window.addEventListener('resize', setDropdownWidth)
  setDropdownWidth()
}

// 设置下拉菜单宽度的函数，使其宽度与父元素宽度一致
const setDropdownWidth = () => {
  const othersElement = document.querySelector('.function.others')
  if (othersElement) {
    const width = othersElement.offsetWidth
    document.querySelector('.function.settings.dropdown-menu').style.width = `${width}px`
    window.addEventListener('resize', setDropdownWidth)
  }
}

// 生命周期钩子函数，在组件挂载后执行初始化操作
onMounted(() => {
  setupMarked()
  loadSession()
  nextTick(() => {
    setupEventListeners()
  })

//   渲染历史消息
  messages.value.forEach((message) => {
    if (message.role === 'user') {
      addRequestMessage(message.content)
    } else if (message.role === 'assistant') {
      addResponseMessage(message.content)
    }
  })
})
</script>

<style scoped>
@import url('../../static/css/bootstrap.min.css');
@import url('../../static/font-awesome/css/font-awesome.min.css');
@import url('../../static/css/github-dark-dimmed.min.css');

:root[bg-theme='light'] {
  --bg-color: white;
}

:root[bg-theme='gray'] {
  --bg-color: #42424670;
}

:root[bg-theme='light-red'] {
  --bg-color: #eda8a8;
}

:root[bg-theme='light-blue'] {
  --bg-color: #55609a;
}

:root[bg-theme='light-purple'] {
  --bg-color: #c09ff9;
}

:root[bg-theme='light-green'] {
  --bg-color: #91ecd1;
}

:root[bg-theme='light-yellow'] {
  --bg-color: #e9e097;
}

body {
  background-color: var(--bg-color);
}

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
}

* {
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  width: 100%;
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

.answer {
  width: 100%;
  position: relative;
  height: calc(100vh - 165px);
}

.answer .tips {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.answer .tips h4 {
  color: red;
}

.answer .tips img {
  margin-top: 30px;
  width: 250px;
}

.answer .function {
  padding: 0 15px;
  width: 100%;
  position: absolute;
  bottom: 0px;
}
.answer .others {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  height: 30px;
  margin-bottom: 10px;
}

.answer .others .left,
.right {
  display: flex;
}

.answer .others .center {
  display: none;
}

.answer .others .common {
  width: 30px;
  height: 30px;
  display: flex;
}

.answer .others .common .settings-common {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
}

.answer .others .common .settings-common:hover {
  background-color: rgba(148, 163, 184, 0.2);
}

.answer .others .common .settings-common:last-child {
  border-bottom: 0;
}

.answer .others .common .settings-common .ipt-common {
  width: 60%;
  opacity: 0.8;
}

.answer .others .common .settings-common span {
  color: #3498db;
  cursor: default;
}
.answer .others .common .settings-common a {
  font-size: 14px;
  color: #3498db;
  cursor: pointer;
  text-decoration: none;
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

.check-trail {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  background: rgba(148, 163, 184, 0.4);
  border-radius: 15px;
  transition: all 0.5s ease;
  cursor: pointer;
}

.check-handler {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  background: rgb(148 163 184 / 85%);
  border-radius: 50%;
  transition: all 0.5s ease;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}

.check-handler:before {
  content: '×';
  color: white;
  font-weight: bold;
}

input[type='checkbox']:checked + .check-trail {
  background: #3498dba3;
}
input[type='checkbox']:checked + .check-trail .check-handler {
  margin-left: 26px;
  background: #3498db;
}
input[type='checkbox']:checked + .check-trail .check-handler::before {
  content: '✔';
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
  height: 50px;
  border: 1px solid #3498db;
  box-shadow: 0px 0px 10px 0px rgba(26, 179, 148, 0.2);
}
.answer .ipt textarea {
  resize: none;
  overflow-y: auto;
  border: none;
  box-shadow: none;
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
  border-bottom: 1px dashed #e7eaec;
}

.message-bubble .message-text {
  width: auto;
  max-width: calc(100% - 45px);
  font-size: 18px;
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
}

.message-bubble .request-icon {
  background-image: url(../images/avatar.png);
}

.message-bubble .response-icon {
  background-image: url(../images/chatgpt.png);
}

.message-bubble .response .loading-icon {
  color: #3498db;
}

.answer #chatBtn {
  background-color: #3498db;
  border-color: #3498db;
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