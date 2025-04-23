import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login/index.vue'
import Register from '../views/register/index.vue'
import ForgetPassword from '../views/forgot-password/index.vue'
import Home from '../views/home/index.vue'
import Home1 from '../views/home1/index.vue'
import Admin from '../views/admin/index.vue'

const routes = [
  {
    path: '/',
    redirect: '/login' // 默认跳转到登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录 - AI思政助手' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册 - AI思政助手' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgetPassword,
    meta: { title: '找回密码 - AI思政助手' }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { 
      requiresAuth: true, 
      allowGuest: true,
      title: 'AI思政助手 - 聊天'
    }
  },
  {
    path: '/home1',
    name: 'Home1',
    component: Home1,
    meta: { title: 'AI思政助手' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { 
      requiresAuth: true, 
      requiresAdmin: true,
      title: '管理后台 - AI思政助手'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// **全局前置守卫：检查用户是否已登录**
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  
  // 检查是否需要身份验证
  if (to.meta.requiresAuth) {
    // 如果没有用户信息，且不是游客可访问的页面，跳转到登录
    if (!userInfo && !to.meta.allowGuest) {
      next('/login')
      return
    }
    
    // 如果是游客可访问的页面
    if (to.meta.allowGuest) {
      // 如果没有用户信息
      if (!userInfo) {
        // 检查是否是通过游客模式进入
        const isGuestMode = localStorage.getItem('isGuestMode')
        if (!isGuestMode) {
          next('/login')
          return
        }
      }
    }
  }
  
  // 需要管理员权限的页面
  if (to.meta.requiresAdmin) {
    if (!userInfo) {
      // 如果未登录，直接跳转到登录页
      next('/login')
      return
    }
    if (userInfo.level !== 1) {
      // 如果已登录但不是管理员，跳转到首页
      next('/home')
      return
    }
  }
  
  next()
})

export default router
