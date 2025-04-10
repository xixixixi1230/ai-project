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
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgetPassword
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    // meta: { requiresAuth: true }
  },
  {
    path: '/home1',
    name: 'Home1',
    component: Home1,
    // meta: { requiresAuth: true } // 需要登录
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    // meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// **全局前置守卫：检查用户是否已登录**
router.beforeEach((to, from, next) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  
  if (to.meta.requiresAuth && !userInfo) {
    next('/login')
  } else if (to.meta.requiresAdmin && userInfo && !userInfo.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
