import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    school: ''
  }),
  actions: {
    setUser(user) {
      this.id = user.id;
      this.school = user.school;
      // 使用 sessionStorage 或 localStorage 存储用户数据
      localStorage.setItem(`user_${user.id}`, JSON.stringify(user)); // 存储不同用户的数据
    },
    loadUser(userId) {
      const storedUser = JSON.parse(localStorage.getItem(`user_${userId}`));
      if (storedUser) {
        this.id = storedUser.id;
        this.school = storedUser.school;
      } else {
        console.warn(`User with id ${userId} not found in localStorage.`);
      }
    },
    logout() {
      if (this.id) {
        localStorage.removeItem(`user_${this.id}`); // 移除当前用户数据
      }
      this.id = null;
      this.school = '';
    }
  }
});
