<template>
  <div class="register-wrapper">
    <div class="register-container">
      <div class="form-header">
        <h2>创建账号</h2>
      </div>
      <form @submit.prevent="handleRegister" class="floating-form">
        <div class="input-group">
          <input
            type="text"
            id="username"
            v-model="username"
            required
            :class="{ 'is-invalid': usernameError }"
          />
          <label for="username">用户名</label>
          <p v-if="usernameError" class="error-message">{{ usernameError }}</p>
        </div>
        <div class="input-group">
          <input
            type="tel"
            id="phone"
            v-model="phone"
            required
            :class="{ 'is-invalid': phoneError }"
          />
          <label for="phone">手机号</label>
          <p v-if="phoneError" class="error-message">{{ phoneError }}</p>
        </div>
        <div class="input-group">
          <input
            type="email"
            id="email"
            v-model="email"
            required
            :class="{ 'is-invalid': emailError }"
          />
          <label for="email">邮箱地址</label>
          <p v-if="emailError" class="error-message">{{ emailError }}</p>
        </div>
        <div class="input-group">
          <input
            type="text"
            id="school"
            v-model="school"
            required
            :class="{ 'is-invalid': schoolError }"
          />
          <label for="school">学校</label>
          <p v-if="schoolError" class="error-message">{{ schoolError }}</p>
        </div>
        <div class="input-group">
          <input
            type="password"
            id="password"
            v-model="password"
            required
            minlength="6"
            maxlength="20"
            :class="{ 'is-invalid': passwordError }"
          />
          <label for="password">密码</label>
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        </div>
        <div class="input-group">
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            minlength="6"
            maxlength="20"
            :class="{ 'is-invalid': confirmPasswordError }"
          />
          <label for="confirmPassword">确认密码</label>
          <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>
        </div>
        <button type="submit" class="submit-btn">
          <span>立即注册</span>
        </button>
        <div class="form-footer">
          <span>已有账号？</span>
          <a href="/login">立即登录</a>
        </div>
      </form>
    </div>
    <message-box ref="messageBox"></message-box>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import MessageBox from '@/components/MessageBox.vue'

const username = ref('')
const phone = ref('')
const email = ref('')
const school = ref('')
const password = ref('')
const confirmPassword = ref('')

const usernameError = ref('')
const phoneError = ref('')
const emailError = ref('')
const schoolError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const router = useRouter()

const hasErrors = computed(() => {
  return (
    usernameError.value ||
    phoneError.value ||
    emailError.value ||
    schoolError.value ||
    passwordError.value ||
    confirmPasswordError.value
  )
})

const validateUsername = () => {
  const pattern = /^[a-zA-Z0-9]{3,20}$/
  usernameError.value = !username.value
    ? '用户名不能为空'
    : !pattern.test(username.value)
      ? '用户名只能包含字母和数字，长度为 3 到 20 个字符'
      : ''
}

const validatePhone = () => {
  const pattern = /^1[3-9]\d{9}$/
  phoneError.value = !phone.value
    ? '手机号不能为空'
    : !pattern.test(phone.value)
      ? '请输入有效的手机号'
      : ''
}

const validateEmail = () => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  emailError.value = !email.value
    ? '邮箱地址不能为空'
    : !pattern.test(email.value)
      ? '请输入有效的邮箱地址'
      : ''
}

const validateSchool = () => {
  schoolError.value = !school.value ? '学校不能为空' : ''
}

const validatePassword = () => {
  passwordError.value = !password.value
    ? '密码不能为空'
    : password.value.length < 6 || password.value.length > 20
      ? '密码长度必须为 6 到 20 个字符'
      : ''
}

const validateConfirmPassword = () => {
  confirmPasswordError.value = !confirmPassword.value
    ? '确认密码不能为空'
    : confirmPassword.value !== password.value
      ? '两次输入的密码不一致'
      : ''
}

const handleRegister = async () => {
  console.log('提交注册...')
  validateUsername()
  validatePhone()
  validateEmail()
  validateSchool()
  validatePassword()
  validateConfirmPassword()
  console.log('表单验证完成')

  if (hasErrors.value) return

  try {
    const response = await fetch('http://101.42.141.72:7001/user/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: username.value,
        phone: phone.value,
        email: email.value,
        school: school.value,
        password: password.value,
      }),
    })

    const result = await response.json()
    console.log('result:', result)
    if (result.status === 200) {
      console.log('注册成功:', result.message)
      messageBox.value.show('注册成功，即将跳转到登录页面', 'success')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      console.error('注册失败:', result.message)
      messageBox.value.show(result.message || '注册失败', 'error')
    }
  } catch (error) {
    console.error('注册请求失败:', error)
    messageBox.value.show('注册请求失败，请稍后再试', 'error')
  }
}

const messageBox = ref(null)

watch(username, validateUsername)
watch(phone, validatePhone)
watch(email, validateEmail)
watch(school, validateSchool)
watch(password, () => {
  validatePassword()
  validateConfirmPassword()
})
watch(confirmPassword, validateConfirmPassword)
</script>

<style scoped>
.error-message {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}

.register-wrapper {
  min-height: 93.5vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
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

.floating-form {
  position: relative;
  margin-bottom: 30px;
}

.input-group {
  position: relative;
  margin-bottom: 30px;
  width: 100%;
  max-width: 400px; /* 限制最大宽度为400px */
  margin-left: auto;
  margin-right: auto; /* 确保输入框居中 */
}

.input-group input {
  width: 100%; /* 使输入框占据父容器宽度 */
  box-sizing: border-box; /* 包括padding和border在内的宽度计算 */
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

.verification-group {
  display: flex;
  gap: 10px;
}

.verification-group input {
  flex: 1;
}

.send-code-btn {
  padding: 0 20px;
  background: #e8f5fe;
  color: #3498db;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-code-btn:hover {
  background: #d0e9fd;
}

.submit-btn {
  width: 100%;
  max-width: 400px;
  padding: 15px;
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
  margin-left: auto;
  margin-right: auto;
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

@media (max-width: 480px) {
  .register-container {
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
  .register-container {
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
  .register-container {
    padding: 30px 20px;
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

  .verification-group {
    flex-direction: column;
    gap: 5px;
  }

  .send-code-btn {
    width: 100%;
    padding: 12px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 16px;
  }
}

@media (max-width: 320px) {
  .register-container {
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
