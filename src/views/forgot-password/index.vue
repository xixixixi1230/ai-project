<template>
  <div class="reset-password-wrapper">
    <div class="reset-password-container">
      <div class="form-header">
        <h2>重置密码</h2>
        <p>请按照提示重置您的密码</p>
      </div>
      <form @submit.prevent="handleResetPassword" class="floating-form">
        <div class="input-group">
          <input
            type="email"
            id="email"
            v-model="email"
            required
            :class="{ 'is-invalid': emailError }"
          />
          <label for="email">邮箱地址</label>
          <span class="highlight"></span>
          <p v-if="emailError" class="error-message">{{ emailError }}</p>
        </div>
        <div class="input-group verification-group">
          <input
            type="text"
            id="verificationCode"
            v-model="verificationCode"
            required
            maxlength="6"
            :class="{ 'is-invalid': verificationCodeError }"
          />
          <label for="verificationCode">验证码</label>
          <button
            type="button"
            @click="sendVerificationCode"
            class="send-code-btn"
            :disabled="isSendingCode || codeSent"
          >
            {{ codeSent ? `已发送（${countdown}s）` : '获取验证码' }}
          </button>
          <span class="highlight"></span>
          <p v-if="verificationCodeError" class="error-message">{{ verificationCodeError }}</p>
        </div>
        <div class="input-group">
          <input
            type="password"
            id="newPassword"
            v-model="newPassword"
            required
            minlength="6"
            maxlength="20"
            :class="{ 'is-invalid': newPasswordError }"
          />
          <label for="newPassword">新密码</label>
          <span class="highlight"></span>
          <p v-if="newPasswordError" class="error-message">{{ newPasswordError }}</p>
        </div>
        <div class="input-group">
          <input
            type="password"
            id="confirmNewPassword"
            v-model="confirmNewPassword"
            required
            minlength="6"
            maxlength="20"
            :class="{ 'is-invalid': confirmNewPasswordError }"
          />
          <label for="confirmNewPassword">确认新密码</label>
          <span class="highlight"></span>
          <p v-if="confirmNewPasswordError" class="error-message">{{ confirmNewPasswordError }}</p>
        </div>
        <button type="submit" class="submit-btn" :disabled="hasErrors">
          <span>重置密码</span>
          <i class="arrow-icon"></i>
        </button>
        <div class="form-footer">
          <span>想起密码了？</span>
          <a href="/login">立即登录</a>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
// 这里需要替换为你实际的 API 导入
//   import { sendResetCode, resetPassword } from '@/api/auth';

const router = useRouter()

// 表单数据
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')

// 错误信息
const emailError = ref('')
const verificationCodeError = ref('')
const newPasswordError = ref('')
const confirmNewPasswordError = ref('')

// 验证码相关
const isSendingCode = ref(false)
const codeSent = ref(false)
const countdown = ref(60)

// 检查是否有错误
const hasErrors = computed(() => {
  return (
    emailError.value ||
    verificationCodeError.value ||
    newPasswordError.value ||
    confirmNewPasswordError.value
  )
})

// 邮箱验证规则
const validateEmail = () => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!email.value) {
    emailError.value = '邮箱地址不能为空'
  } else if (!pattern.test(email.value)) {
    emailError.value = '请输入有效的邮箱地址'
  } else {
    emailError.value = ''
  }
}

// 验证码验证规则
const validateVerificationCode = () => {
  if (!verificationCode.value) {
    verificationCodeError.value = '验证码不能为空'
  } else if (verificationCode.value.length !== 6) {
    verificationCodeError.value = '验证码长度必须为 6 位'
  } else {
    verificationCodeError.value = ''
  }
}

// 新密码验证规则
const validateNewPassword = () => {
  if (!newPassword.value) {
    newPasswordError.value = '新密码不能为空'
  } else if (newPassword.value.length < 6 || newPassword.value.length > 20) {
    newPasswordError.value = '新密码长度必须为 6 到 20 个字符'
  } else {
    newPasswordError.value = ''
  }
}

// 确认新密码验证规则
const validateConfirmNewPassword = () => {
  if (!confirmNewPassword.value) {
    confirmNewPasswordError.value = '确认新密码不能为空'
  } else if (confirmNewPassword.value !== newPassword.value) {
    confirmNewPasswordError.value = '两次输入的新密码不一致'
  } else {
    confirmNewPasswordError.value = ''
  }
}

// 发送验证码
const sendVerificationCode = async () => {
  validateEmail()
  if (emailError.value) return

  isSendingCode.value = true
  try {
    //   await sendResetCode(email.value);
    codeSent.value = true
    const timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--
      } else {
        clearInterval(timer)
        codeSent.value = false
        countdown.value = 60
      }
    }, 1000)
  } catch (error) {
    emailError.value = '发送验证码失败，请稍后重试'
  } finally {
    isSendingCode.value = false
  }
}

// 重置密码处理
const handleResetPassword = async () => {
  validateEmail()
  validateVerificationCode()
  validateNewPassword()
  validateConfirmNewPassword()

  if (hasErrors.value) return

  try {
    // 调用重置密码 API
    //   await resetPassword(email.value, verificationCode.value, newPassword.value);
    console.log('密码重置成功')
    // 跳转到登录页面
    router.push('/login')
  } catch (error) {
    console.error('密码重置失败:', error)
    // 可以添加更详细的错误提示
  }
}

// 监听输入变化，实时验证
watch(email, validateEmail)
watch(verificationCode, validateVerificationCode)
watch(newPassword, () => {
  validateNewPassword()
  validateConfirmNewPassword()
})
watch(confirmNewPassword, validateConfirmNewPassword)
</script>
<style scoped>
.reset-password-wrapper {
  min-height: 93.5vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.reset-password-container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 20px;
  padding: 40px;
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
  color: red;
  font-size: 12px;
  margin-top: 5px;
}

.is-invalid {
  border-color: red !important;
}

@media (max-width: 480px) {
  .reset-password-container {
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
  .reset-password-container {
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
  .reset-password-container {
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
  .reset-password-container {
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

<!-- <script>
import { useUserStore } from '@/store/user'

export default {
  data() {
    return {
      userStore: useUserStore(),
    }
  },
  created() {
    // 假设从路由参数或其他地方获取用户 ID
    const userId = this.$route.query.id || 'defaultUserId' // 使用实际的 userId

    if (!this.userStore.id) {
      this.userStore.loadUser(userId) // 加载用户数据
    }
  },
  methods: {
    logout() {
      this.userStore.logout() // 调用 logout 清除数据
      this.$router.push('/login') // 跳转到登录页
    },
  },
}
</script>

<template>
  <div>
    <h2>欢迎来到聊天界面</h2>
    <p>用户 ID: {{ userStore.id }}</p>
    <p>学校: {{ userStore.school }}</p>
    <button @click="logout">退出登录</button>
  </div>
</template> -->
