<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/jjapi.js';

const credentials = reactive({
  email: '',
  password: ''
});
const isLoading = ref(false);
const error = ref(null);
const router = useRouter();

const handleLogin = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.post('/admin/login', credentials);

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('admin', JSON.stringify(response.data.admin)); 

    // 👇👇👇【已刪除這裡的 removeItem】👇👇👇

    router.push('/admin/dashboard');

  } catch (err) {
    error.value = '登入失敗，請檢查您的帳號密碼。';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};
</script>
<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="text-center mb-4">肥貓管理者後台</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control" id="email" v-model="credentials.email" required>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">密碼</label>
          <input type="password" class="form-control" id="password" v-model="credentials.password" required>
        </div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>



<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
</style>