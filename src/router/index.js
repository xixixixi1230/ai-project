import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/login/index.vue';
import Register from '../views/register/index.vue';
import ForgetPassword from '../views/forgot-password/index.vue'
import Home from "../views/home/index.vue"
import Home1 from '../views/home1/index.vue';

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login
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
        path:'/forgot-password',
        name:'ForgotPassword',
        component:ForgetPassword
    },
    {
        path:'/home',
        name:'Home',
        component:Home
    },
    {
        path:'/home1',
        name:'Home1',
        component:Home1
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
