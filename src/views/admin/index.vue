<template>
  <div class="admin-container">
    <div class="admin-header">
      <h2 class="title">数据库文件管理</h2>
      <div class="user-info">
        <span class="school-name">{{ userInfo.schoolName }} 管理员</span>
        <button class="logout-btn" @click="logout">退出登录</button>
      </div>
    </div>

    <div class="file-management">
      <!-- 文件上传区域 -->
      <div class="upload-section">
        <h3>上传数据库文件</h3>
        <div
          class="upload-box"
          @click="triggerFileInput"
          @drop.prevent="handleDrop"
          @dragover.prevent
          @dragenter.prevent="handleDragEnter"
          @dragleave.prevent="handleDragLeave"
          :class="{ dragging: isDragging }"
        >
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            accept=".pdf,.txt"
            style="display: none"
            multiple
          />
          <div class="upload-content">
            <i class="fa fa-cloud-upload"></i>
            <p class="upload-text">
              点击或拖拽文件到此处上传，最多上传10个文件，每个文件不超过100MB，PDF最多500页
            </p>
            <p class="file-types">支持的文件类型: .pdf，.txt</p>
          </div>
        </div>

        <!-- 选中的文件列表 -->
        <div v-if="selectedFiles.length > 0" class="selected-files">
          <ul class="selected-file-list">
            <li v-for="(file, index) in selectedFiles" :key="index" class="selected-file-item">
              <i :class="getFileIconClass(file.name.split('.').pop())" style="font-size: 16px"></i>
              <span class="selected-file-name">{{ file.name }}</span>
              <span class="selected-file-remove" @click.stop="removeFile(index)" title="删除文件">
                <i class="fa fa-times"></i>
              </span>
            </li>
          </ul>
          <div class="upload-actions">
            <button class="upload-btn" @click="startUpload" :disabled="isUploading">
              {{ isUploading ? '上传中...' : '开始上传' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="file-list-section">
        <h3 class="section-title">数据库文件列表</h3>
        <div class="table-container">
          <table class="file-table">
            <thead>
              <tr>
                <th class="filename-column">文件名</th>
                <th class="type-column">类型</th>
                <th class="status-column">状态</th>
                <th class="actions-column">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="file in fileList" :key="file.document_id">
                <td class="filename-cell">
                  <div class="filename-wrapper">
                    <span class="file-icon" :class="getFileIconClass(file.type)"></span>
                    <span class="filename-text" :title="file.name">{{ file.name }}</span>
                  </div>
                </td>
                <td class="type-column">
                  <span class="type-text">{{ file.type.toUpperCase() }}</span>
                </td>
                <td class="status-column">
                  <span
                    class="status-badge"
                    :class="{
                      'status-normal': file.status === 1,
                      'status-abnormal': file.status !== 1,
                    }"
                  >
                    {{ file.status === 1 ? '正常' : '异常' }}
                  </span>
                </td>
                <td class="actions-column">
                  <div class="actions-wrapper">
                    <a :href="file.web_url" target="_blank" class="action-btn btn-download">
                      查看
                    </a>
                    <button class="action-btn btn-delete" @click="deleteFile(file)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页控件 -->
        <div class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <button class="page-btn" @click="changePage(1)" :class="{ active: currentPage === 1 }">
            1
          </button>
          <span v-if="showLeftEllipsis">...</span>
          <button
            v-for="page in middlePages"
            :key="page"
            class="page-btn"
            @click="changePage(page)"
            :class="{ active: currentPage === page }"
          >
            {{ page }}
          </button>
          <span v-if="showRightEllipsis">...</span>
          <button
            v-if="totalPages > 1"
            class="page-btn"
            @click="changePage(totalPages)"
            :class="{ active: currentPage === totalPages }"
          >
            {{ totalPages }}
          </button>
          <button
            class="page-btn"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
          >
            下一页
          </button>
          <div class="page-jump">
            <span class="jump-text">前往</span>
            <input
              type="number"
              v-model.number="jumpPage"
              class="page-input"
              min="1"
              :max="totalPages"
              @keyup.enter="handleJumpPage"
            />
            <span class="jump-text">页</span>
            <button class="jump-btn" @click="handleJumpPage">确定</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加自定义确认弹窗 -->
    <div class="confirm-modal" v-if="showConfirmModal">
      <div class="confirm-modal-content">
        <div class="confirm-modal-header">
          <h3>{{ confirmTitle }}</h3>
        </div>
        <div class="confirm-modal-body">
          {{ confirmMessage }}
        </div>
        <div class="confirm-modal-footer">
          <button class="btn-cancel" @click="cancelDelete">取消</button>
          <button class="btn-confirm" @click="confirmDelete">确定</button>
        </div>
      </div>
    </div>

    <!-- 消息提示弹窗 -->
    <div class="message-modal" v-if="messageInfo.show">
      <div class="message-modal-content" :class="'message-type-' + messageInfo.type">
        <div class="message-icon">
          <i class="fa" :class="getMessageIcon()"></i>
        </div>
        <div class="message-text">{{ messageInfo.message }}</div>
        <button class="message-close" @click="closeMessage">确定</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPage',
  data() {
    return {
      userInfo: {
        schoolName: '南开大学',
        id: '',
      },
      fileList: [],
      currentPage: 1,
      pageSize: 8,
      apiUrl: 'http://101.42.141.72:8080',
      isDragging: false,
      jumpPage: 1,
      totalPages: 1,
      selectedFiles: [],
      isUploading: false,
      showConfirmModal: false,
      confirmTitle: '',
      confirmMessage: '',
      fileToDelete: null,
      messageInfo: {
        show: false,
        message: '',
        type: 'success', // success, error, warning, info
      },
    }
  },
  computed: {
    middlePages() {
      const pages = []
      const current = this.currentPage
      const total = this.totalPages

      if (total <= 7) {
        for (let i = 2; i < total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 2; i <= 5; i++) {
            pages.push(i)
          }
        } else if (current >= total - 3) {
          for (let i = total - 4; i < total; i++) {
            pages.push(i)
          }
        } else {
          for (let i = current - 2; i <= current + 2; i++) {
            pages.push(i)
          }
        }
      }
      return pages
    },
    showLeftEllipsis() {
      return this.totalPages > 7 && this.currentPage > 4
    },
    showRightEllipsis() {
      return this.totalPages > 7 && this.currentPage < this.totalPages - 3
    },
  },
  methods: {
    loadUserInfo() {
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'))
      if (storedUserInfo) {
        this.userInfo.schoolName = storedUserInfo.school
        this.userInfo.id = storedUserInfo.userId
      }
    },
    logout() {
      localStorage.removeItem('userInfo')
      this.$router.push('/login')
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      if (this.selectedFiles.length + files.length > 10) {
        this.showMessage('一次最多选择 10 个文件', 'warning')
        return
      }
      this.selectedFiles.push(...files)
      this.$refs.fileInput.value = ''
    },
    handleDrop(event) {
      event.preventDefault()
      const files = Array.from(event.dataTransfer.files)
      if (this.selectedFiles.length + files.length > 10) {
        this.showMessage('一次最多选择 10 个文件', 'warning')
        return
      }
      this.selectedFiles.push(...files)
      this.isDragging = false
    },
    removeFile(index) {
      this.selectedFiles.splice(index, 1)
    },
    async startUpload() {
      if (this.selectedFiles.length === 0) return

      if (this.selectedFiles.length > 10) {
        this.showMessage('一次最多上传10个文件', 'warning')
        return
      }

      this.isUploading = true
      const fileDataArray = []
      let processedFiles = 0

      const checkAndSend = (files, fileDataArray) => {
        if (processedFiles === files.length) {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', 'http://101.42.141.72:8080/upload', true)
          xhr.setRequestHeader('Content-Type', 'application/json')
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                try {
                  const response = JSON.parse(xhr.responseText)
                  if (response.code === 200) {
                    this.showMessage('文件上传成功', 'success')
                    this.selectedFiles = []
                    this.loadFiles()
                  } else {
                    this.showMessage(response.msg || '上传失败', 'error')
                  }
                } catch (e) {
                  this.showMessage('解析响应失败: ' + xhr.responseText, 'error')
                }
              } else {
                this.showMessage('上传失败，状态码: ' + xhr.status, 'error')
              }
              this.isUploading = false
            }
          }

          const data = {
            dataset_id: '7481705395134087218',
            data: fileDataArray,
          }
          const jsonData = JSON.stringify(data)
          xhr.send(jsonData)
          return true
        }
        return false
      }

      try {
        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          const reader = new FileReader()

          reader.onload = (e) => {
            const base64Data = e.target.result.split(',')[1]
            fileDataArray.push({
              name: file.name,
              source_info: {
                file_base64: base64Data,
                file_type: file.name.split('.').pop(),
              },
            })

            processedFiles++
            checkAndSend(this.selectedFiles, fileDataArray)
          }

          reader.onerror = () => {
            this.showMessage(`读取文件 ${file.name} 失败`, 'error')
            processedFiles++
            checkAndSend(this.selectedFiles, fileDataArray)
          }

          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('上传错误:', error)
        this.showMessage('文件上传失败，请重试', 'error')
        this.isUploading = false
      }
    },
    async loadFiles() {
      try {
        const response = await fetch(`${this.apiUrl}/load`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            schoolName: this.userInfo.schoolName,
            page: this.currentPage,
            size: this.pageSize,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.code === 200) {
            this.fileList = data.data.documents
            console.log(data.data.total)
            this.totalPages = Math.ceil(data.data.total / this.pageSize)
          } else {
            throw new Error(data.msg || '加载失败')
          }
        }
      } catch (error) {
        console.error('加载文件列表失败:', error)
        this.showMessage('加载文件列表失败，请重试', 'error')
      }
    },
    async changePage(newPage) {
      if (newPage < 1) return
      this.currentPage = newPage
      await this.loadFiles()
    },
    async downloadFile(file) {
      try {
        const response = await fetch(`${this.apiUrl}/download/${file.id}`)
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = file.name
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      } catch (error) {
        console.error('下载失败:', error)
        this.showMessage('文件下载失败，请重试', 'error')
      }
    },
    deleteFile(file) {
      this.showConfirmModal = true
      this.confirmTitle = '确认删除'
      this.confirmMessage = `确定要删除文件 "${file.name}" 吗？`
      this.fileToDelete = file
    },
    async confirmDelete() {
      if (!this.fileToDelete) return

      try {
        const response = await fetch(`${this.apiUrl}/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_ids: [this.fileToDelete.document_id],
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.code === 200) {
            this.showMessage('文件删除成功', 'success')
            this.loadFiles()
          } else {
            this.showMessage(data.msg || '删除失败', 'error')
          }
        }
      } catch (error) {
        console.error('删除错误:', error)
        this.showMessage('文件删除失败，请重试', 'error')
      } finally {
        this.closeConfirmModal()
      }
    },
    cancelDelete() {
      this.closeConfirmModal()
    },
    closeConfirmModal() {
      this.showConfirmModal = false
      this.fileToDelete = null
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString()
    },
    handleDragEnter() {
      this.isDragging = true
    },
    handleDragLeave() {
      this.isDragging = false
    },
    getFileIconClass(type) {
      const iconMap = {
        pdf: 'fa fa-file-pdf-o',
        txt: 'fa fa-file-text-o',
        doc: 'fa fa-file-word-o',
        docx: 'fa fa-file-word-o',
      }
      return iconMap[type.toLowerCase()] || 'fa fa-file-o'
    },
    handleJumpPage() {
      if (this.jumpPage && this.jumpPage >= 1 && this.jumpPage <= this.totalPages) {
        this.changePage(this.jumpPage)
      } else {
        this.showMessage('请输入有效的页码', 'warning')
        this.jumpPage = this.currentPage
      }
    },
    showMessage(message, type = 'success') {
      this.messageInfo = {
        show: true,
        message,
        type,
      }

      setTimeout(() => {
        this.closeMessage()
      }, 3000)
    },
    closeMessage() {
      this.messageInfo.show = false
    },
    getMessageIcon() {
      const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle',
      }
      return iconMap[this.messageInfo.type] || 'fa-info-circle'
    },
  },
  mounted() {
    this.loadUserInfo()
    this.loadFiles()
  },
}
</script>

<style scoped>
.admin-container {
  padding: 24px;
  overflow: auto;
  max-width: 1200px;
  margin: 0 auto;
  height: auto;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.title {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.school-name {
  color: #606266;
  margin-right: 20px;
  font-size: 15px;
}

.logout-btn {
  background-color: #f56c6c;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.logout-btn:hover {
  background-color: #e74c3c;
}

.file-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow: visible;
}

.upload-section {
  background: white;
  height: auto;
  min-height: 100px;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.upload-box {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
  background-color: #fafafa;
}

.upload-box.dragging {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.upload-box:hover {
  border-color: #409eff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.selected-files {
  margin-top: 16px;
  width: 100%;
}

.selected-file-list {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.selected-file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
  position: relative;
}

.selected-file-name {
  flex: 1;
  margin-left: 8px;
  color: #606266;
  font-size: 14px;
}

.selected-file-remove {
  color: #f56c6c;
  cursor: pointer;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ffeeee;
  border: 1px solid #ffcccc;
  transition: all 0.2s;
}

.selected-file-remove:hover {
  background-color: #ff6b6b;
}

.selected-file-remove .fa-times {
  color: #f56c6c;
  font-size: 14px;
}

.selected-file-remove:hover .fa-times {
  color: white;
}

.upload-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.upload-btn {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  font-size: 14px;
  background-color: #409eff;
  color: white;
}

.upload-btn:hover {
  background-color: #66b1ff;
}

.upload-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.file-list-section {
  background: white;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  flex: 1;
  height: auto;
  /* min-height: 500px !important; */
}

.table-container {
  flex: 1;
  overflow: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  min-height: 500px !important;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.filename-column {
  width: 50%;
  text-align: left !important;
}

.type-column {
  width: 15%;
  text-align: center;
}

.type-text {
  display: inline-block;
  padding: 2px 0;
}

.status-column {
  width: 15%;
  text-align: center;
}

.actions-column {
  width: 220px;
  text-align: center;
}

.file-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  text-align: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  white-space: nowrap;
}

.file-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

.filename-cell {
  max-width: 0;
  padding-right: 24px;
}

.filename-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.filename-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  font-size: 14px;
}

.file-icon {
  flex-shrink: 0;
  color: #909399;
  width: 20px;
}

.actions-wrapper {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: nowrap;
}

.action-btn {
  padding: 6px 0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  text-decoration: none;
  white-space: nowrap;
  width: 80px;
  text-align: center;
  font-weight: normal;
  line-height: 1;
}

.btn-download {
  background-color: #409eff;
  color: white;
}

.btn-download:hover {
  background-color: #66b1ff;
}

.btn-delete {
  background-color: #ff6b6b;
  color: white;
}

.btn-delete:hover {
  background-color: #ff8585;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 14px;
  background-color: #67c23a;
  color: white;
  min-width: 48px;
  text-align: center;
}

.status-badge.status-normal {
  background-color: #67c23a;
}

.status-badge.status-abnormal {
  background-color: #f56c6c;
}

.file-table td.type-column,
.file-table td.status-column {
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  gap: 8px;
  padding: 16px 0;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 4px;
  border: 1px solid #dcdfe6;
  background-color: white;
  color: #606266;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  color: #409eff;
  border-color: #409eff;
}

.page-btn:disabled {
  background-color: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
}

.page-btn.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.page-jump {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.jump-text {
  color: #606266;
  font-size: 14px;
  margin: 0 8px;
}

.page-input {
  width: 50px;
  height: 32px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  padding: 0 4px;
}

.page-input:focus {
  border-color: #409eff;
  outline: none;
}

.jump-btn {
  margin-left: 8px;
  padding: 0 12px;
  height: 32px;
  border: 1px solid #dcdfe6;
  background-color: white;
  color: #606266;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.jump-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

h3 {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.section-title {
  text-align: center;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

/* 确认弹窗样式 */
.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.confirm-modal-content {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: modal-in 0.3s ease;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.confirm-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.confirm-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.confirm-modal-body {
  padding: 20px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.confirm-modal-footer {
  padding: 10px 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-cancel:hover {
  background-color: #e6e6e6;
}

.btn-confirm {
  background-color: #f56c6c;
  color: white;
}

.btn-confirm:hover {
  background-color: #ff8585;
}

/* 消息提示弹窗样式 */
.message-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.3);
}

.message-modal-content {
  background-color: white;
  border-radius: 8px;
  width: 350px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: message-in 0.3s ease;
  position: relative;
}

@keyframes message-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-icon {
  margin-bottom: 16px;
  font-size: 48px;
}

.message-type-success .message-icon {
  color: #67c23a;
}

.message-type-error .message-icon {
  color: #f56c6c;
}

.message-type-warning .message-icon {
  color: #e6a23c;
}

.message-type-info .message-icon {
  color: #409eff;
}

.message-text {
  font-size: 16px;
  color: #303133;
  margin-bottom: 20px;
  line-height: 1.5;
}

.message-close {
  padding: 8px 24px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.message-close:hover {
  background-color: #66b1ff;
}
</style>
