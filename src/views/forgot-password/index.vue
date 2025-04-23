<template>
  <div class="p-6 max-w-xl mx-auto bg-white shadow rounded">
    <h2 class="text-xl font-bold mb-4">文档总结工具</h2>

    <input type="file" @change="handleFileChange" accept=".pdf,.docx" class="mb-4" />
    <button
      @click="uploadFile"
      :disabled="!file || loading"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      {{ loading ? '总结中...' : '上传并总结' }}
    </button>

    <div v-if="summary" class="mt-6 bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
      <h3 class="font-semibold mb-2">总结内容：</h3>
      {{ summary }}
    </div>

    <div v-if="error" class="mt-4 text-red-500">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const file = ref(null)
const summary = ref('')
const error = ref('')
const loading = ref(false)

function handleFileChange(event) {
  file.value = event.target.files[0]
  summary.value = ''
  error.value = ''
}

async function uploadFile() {
  if (!file.value) return

  loading.value = true
  summary.value = ''
  error.value = ''

  const formData = new FormData()
  formData.append('file', file.value)

  try {
    const response = await fetch('http://localhost:5000/api/summarize', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (response.ok && data.summary) {
      summary.value = data.summary
    } else {
      error.value = data.error || '发生未知错误'
    }
  } catch (err) {
    error.value = '无法连接服务器'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
input[type='file'] {
  display: block;
}
</style>
