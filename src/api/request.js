// 封装axios请求
import axios from 'axios'

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://127.0.0.1:8080', // Java 后端的地址
  timeout: 5000, // 请求超时时间
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前可以做一些处理，比如添加 token
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 对响应数据做一些处理
    return response.data
  },
  (error) => {
    // 对响应错误做一些处理
    return Promise.reject(error)
  }
)

export default instance