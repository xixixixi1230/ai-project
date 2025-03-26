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
          <a href="/register">立即注册</a>
          <!-- <span>&nbsp;&nbsp;| &nbsp;&nbsp;</span>
          <a href="/forgot-password">忘记密码</a> -->
        </div>
      </form>
      <!-- <button class="login-btn" @click="handleSSOLogin">
        <span>SSO登录</span>
        <i class="arrow-icon"></i>
      </button> -->
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
    const response = await axios.post('https://38cr3ii47631.vicp.fun/user/login/', {
      phone: loginForm.username,
      password: loginForm.password,
    })

    if (response.data.status === 200) {
      console.log('登录成功')
      // 登录成功，保存 authToken 到 Cookie，设置过期时间为 30 分钟
      const { authToken, userName, userId, email, school } = response.data.data
      const expires = new Date(Date.now() + 30 * 60 * 1000).toUTCString() // 30分钟过期
      document.cookie = `authToken=${authToken}; path=/; expires=${expires}`

      // 登录成功后存储用户信息
      localStorage.setItem('userInfo', JSON.stringify({ userName, userId, email, school }))

      // 跳转到主页
      router.push('/home')
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
}

.login-container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  padding-right: 80px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  color: #2c3e50;
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 700;
}

.form-header p {
  color: #95a5a6;
  font-size: 16px;
}

.floating-form .input-group {
  position: relative;
  margin-bottom: 30px;
}

.input-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: transparent;
}

.input-group label {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 5px;
  color: #95a5a6;
  font-size: 16px;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-group input:focus,
.input-group input:valid {
  border-color: #3498db;
}

.input-group input:focus + label,
.input-group input:valid + label {
  top: 0;
  font-size: 14px;
  color: #3498db;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  margin-left: 15px;
  background: linear-gradient(to right, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-btn {
  width: 100%;
  padding: 15px;
  margin-left: 15px;
  margin-top: 20px;
  background: linear-gradient(to right, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.arrow-icon {
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(-45deg);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #95a5a6;
}

.form-footer a {
  color: #3498db;
  text-decoration: none;
  margin-left: 5px;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
  display: block;
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .input-group input {
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .login-container {
    max-width: 400px;
    padding: 30px;
  }

  .form-header h2 {
    font-size: 28px;
  }

  .form-header p {
    font-size: 14px;
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
