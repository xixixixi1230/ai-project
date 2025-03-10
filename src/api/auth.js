// 登录相关的api请求
import request from '../api/request'

// 登录接口
export const login = (username, password) => {
    return request({
      url: '/api/login', // Java 后端的登录接口路径
      method: 'POST',
      data: {
        username,
        password,
      },
    })
}

// 注册接口
export const register = (username, email,verificationCode,password,confirmPassword) => {
    return request({
      url: '/api/register', // Java 后端的登录接口路径
      method: 'POST',
      data: {
        username,
        email,
        verificationCode,
        password,
        confirmPassword
      },
    })
}