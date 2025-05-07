<template>
  <div v-if="visible" class="message-box-overlay">
    <div class="message-box">
      <div class="message-box-content">
        <div class="message-box-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="message-box-text">{{ message }}</div>
      </div>
      <div v-if="type !== 'success'" class="message-box-footer">
        <button @click="close" class="message-box-btn">确定</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageBox',
  data() {
    return {
      visible: false,
      message: '',
      type: 'info',
    }
  },
  computed: {
    iconClass() {
      return {
        fa: true,
        'fa-info-circle': this.type === 'info',
        'fa-exclamation-circle': this.type === 'warning',
        'fa-check-circle': this.type === 'success',
        'fa-times-circle': this.type === 'error',
      }
    },
  },
  methods: {
    show(message, type = 'info') {
      this.message = message
      this.type = type
      this.visible = true

      // Auto close for success messages after 1.5 seconds
      if (type === 'success') {
        setTimeout(() => {
          this.close()
        }, 1500)
      }
    },
    close() {
      this.visible = false
    },
  },
}
</script>

<style scoped>
.message-box-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.message-box {
  background-color: white;
  border-radius: 12px;
  width: 380px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease;
}

.message-box-content {
  padding: 30px;
  text-align: center;
}

.message-box-icon {
  font-size: 56px;
  margin-bottom: 20px;
}

.message-box-icon .fa-info-circle {
  color: #3498db;
}

.message-box-icon .fa-exclamation-circle {
  color: #f39c12;
}

.message-box-icon .fa-check-circle {
  color: #2ecc71;
}

.message-box-icon .fa-times-circle {
  color: #e74c3c;
}

.message-box-text {
  font-size: 20px;
  color: #333;
  line-height: 1.6;
  font-weight: 500;
}

.message-box-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  text-align: right;
}

.message-box-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 32px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.message-box-btn:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
