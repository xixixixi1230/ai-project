<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="form-header">
        <h2>用户登录</h2>
        <p>欢迎回来，请登录您的账号</p>
      </div>
      <form @submit.prevent="handleLogin" class="floating-form">
        <div class="input-group">
          <input
            id="username"
            v-model.trim="loginForm.username"
            type="text"
            autocomplete="off"
            @input="validateInput"
            required
          />
          <label for="username">手机号</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input
            id="password"
            v-model.trim="loginForm.password"
            type="password"
            autocomplete="off"
            @input="validateInput"
            required
          />
          <label for="password">密码</label>
          <span class="highlight"></span>
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="submit-btn">
          <span>登录</span>
          <i class="arrow-icon"></i>
        </button>
        <div class="form-footer">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
          <span>&nbsp;&nbsp;| &nbsp;&nbsp;</span>
          <a href="#" @click.prevent="showGuestDialog">游客模式</a>
        </div>
      </form>
      <!-- <button class="login-btn" @click="handleSSOLogin">
        <span>SSO登录</span>
        <i class="arrow-icon"></i>
      </button> -->
    </div>
  </div>

  <!-- Guest School Dialog -->
  <div v-if="showDialog" class="dialog-overlay">
    <div class="dialog-container">
      <div class="dialog-header">
        <h3>请输入学校名称</h3>
        <button class="close-btn" @click="closeDialog">×</button>
      </div>
      <div class="dialog-body">
        <input
          v-model="guestSchool"
          type="text"
          placeholder="请输入学校名称"
          @keyup.enter="confirmGuestLogin"
        />
      </div>
      <div class="dialog-footer">
        <button class="cancel-btn" @click="closeDialog">取消</button>
        <button class="confirm-btn" @click="confirmGuestLogin">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
})

const errorMsg = ref('')
const isFormValid = ref(false)
const loading = ref(false)

const showDialog = ref(false)
const guestSchool = ref('')

// 跳转 SSO
// function handleSSOLogin() {
//   window.location.href = 'https://www.baidu.com' // 修改为实际 SSO 登录 URL
// }

// 登录处理
const handleLogin = async () => {
  if (loading.value) return // 防止重复点击
  // 检查用户名和密码是否为空
  if (!loginForm.username || !loginForm.password) {
    errorMessage('请填写用户名和密码')
    console.log('Error Message:', errorMsg.value)
    return
  }

  // 防止 XSS 攻击
  const xssPattern = /(~|\{|\}|"|'|<|>|\?)/g
  if (xssPattern.test(loginForm.username) || xssPattern.test(loginForm.password)) {
    errorMessage('警告:输入内容包含非法字符')
    return
  }

  // 添加 loading 状态
  loading.value = true
  console.log(loginForm)
  try {
    // 发送登录请求
    const response = await axios.post('http://101.42.141.72:7001/user/login/', {
      phone: loginForm.username,
      password: loginForm.password,
    })

    if (response.data.status === 200) {
      console.log('登录成功')
      // 登录成功，保存 authToken 到 Cookie，设置过期时间为 30 分钟
      const { authToken, userName, userId, email, school, level } = response.data.data
      const expires = new Date(Date.now() + 30 * 60 * 1000).toUTCString() // 30分钟过期
      document.cookie = `authToken=${authToken}; path=/; expires=${expires}`

      // 登录成功后存储用户信息，包含level
      localStorage.setItem('userInfo', JSON.stringify({ userName, userId, email, school, level }))

      // 根据level决定跳转路径
      if (level === 1) {
        router.push('/admin') // 管理员跳转到admin页面
      } else {
        router.push('/home') // 普通用户跳转到home页面
      }
    } else {
      errorMessage(response.data.message) // 登录失败，显示错误信息
      console.log('Error Message:', errorMsg.value)
    }
  } catch (error) {
    console.log('Error Message:', errorMsg.value)

    errorMessage('登录失败，请稍后重试')
  } finally {
    loading.value = false // 重置 loading 状态
    console.log('Error Message:', errorMsg.value)
  }
}

// 错误提示
const errorMessage = (text) => {
  errorMsg.value = text
  setTimeout(() => {
    errorMsg.value = ''
  }, 1000)
}

// 输入验证
const validateInput = () => {
  if (loginForm.username && loginForm.password) {
    isFormValid.value = true
    errorMsg.value = ''
  } else {
    isFormValid.value = false
  }
}

const showGuestDialog = () => {
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  guestSchool.value = ''
}

const confirmGuestLogin = () => {
  if (!guestSchool.value.trim()) {
    errorMessage('请输入学校名称')
    return
  }

  // 设置游客信息
  const guestInfo = {
    userName: '游客',
    userId: '123456',
    email: '',
    school: guestSchool.value.trim(),
    level: 0,
  }

  // 存储游客信息
  localStorage.setItem('userInfo', JSON.stringify(guestInfo))
  localStorage.setItem('conversationId', '0')

  // 关闭对话框
  closeDialog()

  // 跳转到聊天页面
  router.push('/home')
}

onMounted(() => {
  validateInput()
})
</script>

<style scoped>
.login-wrapper {
  min-height: 93.5vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  animation: fadeIn 0.5s ease;
}

.login-container {
  width: 100%;
  max-width: 580px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 40px 80px 40px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transform: translateY(0);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

/* .login-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
} */

.form-header {
  text-align: center;
  margin-bottom: 50px;

  /* animation: slideDown 0.5s ease; */
}

.form-header h2 {
  color: #2c3e50;
  font-size: 42px;
  margin-bottom: 16px;
  font-weight: 700;
  /* background: linear-gradient(45deg, #3498db, #3498db); */
  /* -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; */
}

.form-header p {
  color: #95a5a6;
  font-size: 18px;
  opacity: 0.8;
}

.floating-form .input-group {
  position: relative;
  margin-bottom: 35px;
  animation: slideUp 0.5s ease;
  width: 100%;
}

.input-group input {
  width: 100%;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.input-group input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
  background: white;
}

.input-group label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 8px;
  color: #95a5a6;
  font-size: 16px;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-group input:focus + label,
.input-group input:valid + label {
  top: 0;
  font-size: 14px;
  color: #3498db;
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  /* margin: 20px 15px; */
  margin-left: 15px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: slideUp 0.5s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.submit-btn:hover:before {
  left: 100%;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  color: #95a5a6;
  animation: fadeIn 0.5s ease;
}

.form-footer a {
  color: #3498db;
  text-decoration: none;
  margin-left: 5px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.form-footer a:hover {
  color: #2980b9;
  text-decoration: none;
  transform: translateY(-1px);
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(231, 76, 60, 0.1);
  animation: shake 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@media (max-width: 768px) {
  .login-container {
    max-width: 90%;
    padding: 40px 30px;
  }

  .form-header h2 {
    font-size: 32px;
  }

  .form-header p {
    font-size: 16px;
  }

  .input-group input {
    padding: 16px;
  }

  .submit-btn {
    padding: 16px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
    margin: 10px;
    max-width: 100%;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .form-header p {
    font-size: 14px;
  }

  .input-group input {
    padding: 12px;
    font-size: 14px;
  }

  .input-group label {
    font-size: 14px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 16px;
  }
}

@media (max-width: 320px) {
  .login-container {
    padding: 15px;
  }

  .form-header h2 {
    font-size: 20px;
  }

  .input-group {
    margin-bottom: 20px;
  }
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.dialog-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform-origin: center;
  animation: scaleIn 0.3s ease;
  margin: 20px;
  box-sizing: border-box;
}

.dialog-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: #f5f7fa;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #e4e7ea;
  color: #333;
  transform: rotate(90deg);
}

.dialog-body {
  padding: 24px;
  box-sizing: border-box;
}

.dialog-body input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f8fafc;
  box-sizing: border-box;
}

.dialog-body input:focus {
  border-color: #3498db;
  outline: none;
  background: white;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
}

.dialog-body input::placeholder {
  color: #a0aec0;
}

.dialog-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.confirm-btn {
  background: linear-gradient(to right, #3498db, #2980b9);
  border: none;
  color: white;
}

.cancel-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(41, 128, 185, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 移动端优化 */
@media (max-width: 480px) {
  .dialog-container {
    width: 90%;
    margin: 10px;
    max-width: 95%;
  }

  .dialog-body {
    padding: 16px;
  }

  .dialog-body input {
    padding: 12px 14px;
    font-size: 15px;
  }
}
</style>
<!-- <template>
  <div>
    <h2>登录</h2>
    <input v-model="user.id" placeholder="输入用户 ID" />
    <input v-model="user.school" placeholder="输入学校" />
    <button @click="login">登录</button>
  </div>
</template>

<script>
import { useUserStore } from '@/store/user' // 确保正确引入 Pinia Store

export default {
  data() {
    return {
      user: { id: '', school: '' }, // 存储用户输入的信息
    }
  },
  methods: {
    login() {
      // 用户输入验证
      if (!this.user.id || !this.user.school) {
        alert('请输入用户 ID 和学校')
        return
      }

      // 获取 Pinia Store
      const userStore = useUserStore()

      // 将用户信息存储到 Pinia Store 和 localStorage
      userStore.setUser(this.user)

      // 跳转到聊天界面，传递用户数据作为路由参数
      this.$router.push({
        path: '/forgot-password',
        query: { id: this.user.id, school: this.user.school },
      })
    },
  },
}
</script> -->
