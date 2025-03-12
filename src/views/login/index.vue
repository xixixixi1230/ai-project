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
            :class="{ 'is-invalid': usernameError }"
          />
          <label for="username">用户名</label>
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
            :class="{ 'is-invalid': passwordError }"
          />
          <label for="password">密码</label>
          <span class="highlight"></span>
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="submit-btn" :disabled="!isFormValid">
          <span>登录</span>
          <i class="arrow-icon"></i>
        </button>
        <div class="form-footer">
          <span>还没有账号？</span>
          <a href="/register">立即注册</a>
          <span>&nbsp;&nbsp;| &nbsp;&nbsp;</span>
          <a href="/forgot-password">忘记密码</a>
        </div>
      </form>
      <button class="login-btn" @click="handleSSOLogin">
          <span>SSO登录</span>
          <i class="arrow-icon"></i>
        </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted,watch } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'

const router = useRouter()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
})

const errorMsg = ref('')
const isFormValid = ref(false)

//跳转sso
function handleSSOLogin(){
  window.location.href="https://www.baidu.com";
}

// 用户名验证规则
const validateUsername = () => {
  const pattern = /^[a-zA-Z0-9]{3,20}$/;
  if (!username.value) {
    usernameError.value = '用户名不能为空';
  } else if (!pattern.test(username.value)) {
    usernameError.value = '用户名只能包含字母和数字，长度为 3 到 20 个字符';
  } else {
    usernameError.value = '';
  }
};

// 密码验证规则
const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '密码不能为空';
  } else if (password.value.length < 6 || password.value.length > 20) {
    passwordError.value = '密码长度必须为 6 到 20 个字符';
  } else {
    passwordError.value = '';
  }
};

// 输入验证
const validateInput = () => {
  // 基本验证
  if (loginForm.username && loginForm.password) {
    isFormValid.value = true
    errorMsg.value = ''
  } else {
    isFormValid.value = false
  }
}

// 登录处理
const handleLogin = async () => {
  // 检查用户名和密码是否为空
  if (!loginForm.username || !loginForm.password) {
    errorMessage('请填写用户名和密码')
    return
  }
  // 防止XSS攻击
  const xssPattern = /(~|\{|\}|"|'|<|>|\?)/g
  if (xssPattern.test(loginForm.username) || xssPattern.test(loginForm.password)) {
    errorMessage('警告:输入内容包含非法字符')
    return
  }

  try {
    // 对输入进行转义处理
    const safeUsername = encodeURIComponent(loginForm.username)
    const safePassword = encodeURIComponent(loginForm.password)
    // 调用登录 API
    const response = await login(loginForm.username, loginForm.password)
    console.log('登录请求:', { username: safeUsername, password: safePassword })

    // 模拟登录成功并设置cookie，设置过期时间为1天
    const expires = new Date(Date.now() + 3600 * 24 * 1000).toUTCString()
    //document.cookie：这是 JavaScript 中用于操作浏览器 cookie 的属性。
    //path=/：这是 cookie 的路径属性，/ 表示该 cookie 对整个网站的所有路径都有效。
    //expires=${expires}：这是 cookie 的过期时间属性
    document.cookie = `authToken=${response.token}; path=/; expires=${expires}`

    // 跳转到主页
    router.push('/home')
  } catch (error) {
    errorMessage('登录失败，请稍后重试')
  }
}

// 错误提示
const errorMessage = (text) => {
  errorMsg.value = text
  setTimeout(() => {
    errorMsg.value = ''
  }, 3000)
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

.login-btn{
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
