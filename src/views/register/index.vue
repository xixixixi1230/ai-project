<template>
  <div class="register-wrapper">
    <div class="register-container">
      <div class="form-header">
        <h2>创建账号</h2>
        <p>开启您的美好旅程</p>
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
          <span class="highlight"></span>
          <p v-if="usernameError" class="error-message">{{ usernameError }}</p>
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
            {{ codeSent? `已发送（${countdown}s）` : '获取验证码' }}
          </button>
          <span class="highlight"></span>
          <p v-if="verificationCodeError" class="error-message">{{ verificationCodeError }}</p>
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
          <span class="highlight"></span>
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
          <span class="highlight"></span>
          <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>
        </div>
        <button type="submit" class="submit-btn" :disabled="hasErrors">
          <span>立即注册</span>
          <i class="arrow-icon"></i>
        </button>
        <div class="form-footer">
          <span>已有账号？</span>
          <a href="/login">立即登录</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted,computed  } from 'vue';
import { useRouter } from 'vue-router'

// 表单数据
const username = ref('');
const email = ref('');
const verificationCode = ref('');
const password = ref('');
const confirmPassword = ref('');

// 错误信息
const usernameError = ref('');
const emailError = ref('');
const verificationCodeError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

// 验证码相关
const isSendingCode = ref(false);
const codeSent = ref(false);
const countdown = ref(60);

const sendCode = async (email) => {
  // 模拟发送验证码请求
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

const router = useRouter();

// 检查是否有错误
const hasErrors = computed(() => {
  return (
    usernameError.value ||
    emailError.value ||
    verificationCodeError.value ||
    passwordError.value ||
    confirmPasswordError.value
  );
});

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

// 邮箱验证规则
const validateEmail = () => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email.value) {
    emailError.value = '邮箱地址不能为空';
  } else if (!pattern.test(email.value)) {
    emailError.value = '请输入有效的邮箱地址';
  } else {
    emailError.value = '';
  }
};

// 验证码验证规则
const validateVerificationCode = () => {
  if (!verificationCode.value) {
    verificationCodeError.value = '验证码不能为空';
  } else if (verificationCode.value.length!== 6) {
    verificationCodeError.value = '验证码长度必须为 6 位';
  } else {
    verificationCodeError.value = '';
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

// 确认密码验证规则
const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = '确认密码不能为空';
  } else if (confirmPassword.value!== password.value) {
    confirmPasswordError.value = '两次输入的密码不一致';
  } else {
    confirmPasswordError.value = '';
  }
};

// 发送验证码
const sendVerificationCode = async () => {
  console.log('Sending verification code to:', email.value)
  validateEmail();
  if (emailError.value) return;

  isSendingCode.value = true;
  try {
    await sendCode(email.value);
    codeSent.value = true;
    const timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(timer);
        codeSent.value = false;
        countdown.value = 60;
      }
    }, 1000);
  } catch (error) {
    emailError.value = '发送验证码失败，请稍后重试';
  } finally {
    isSendingCode.value = false;
  }
};

// 注册处理
const handleRegister = async () => {
  validateUsername();
  validateEmail();
  validateVerificationCode();
  validatePassword();
  validateConfirmPassword();

  if (hasErrors.value) return;

  try {
    // 调用注册 API
    const response = await register(username.value, email.value,verificationCode.value,password.value,confirmPassword.value);
    console.log('注册成功:', response);
    // 跳转到登录
    router.push('/login');
  } catch (error) {
    console.error('注册失败:', error);
    // 可以添加更详细的错误提示
  }
};

// 监听输入变化，实时验证
watch(username, validateUsername);
watch(email, validateEmail);
watch(verificationCode, validateVerificationCode);
watch(password, () => {
  validatePassword();
  validateConfirmPassword();
});
watch(confirmPassword, validateConfirmPassword);
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