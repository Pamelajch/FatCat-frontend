<script setup>
    import { ref, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '../stores/auth'

    // 路由和狀態管理
    const router = useRouter()
    const authStore = useAuthStore()

    // 表單數據
    const loginForm = ref({
    email: '',
    password: '',
    rememberMe: false
    })

    // 狀態
    const showPassword = ref(false)
    const errorMessage = ref('')
    const emailError = ref('')
    const passwordError = ref('')

    // 計算屬性
    const isLoading = computed(() => authStore.isLoading)
    const isFormValid = computed(() => {
    return loginForm.value.email && 
            loginForm.value.password && 
            !emailError.value && 
            !passwordError.value
    })

    // 方法
    const togglePassword = () => {
    showPassword.value = !showPassword.value
    }

    const validateForm = () => {
    emailError.value = ''
    passwordError.value = ''
    errorMessage.value = ''

    // 驗證 Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!loginForm.value.email) {
        emailError.value = '請輸入電子郵件'
        return false
    } else if (!emailPattern.test(loginForm.value.email)) {
        emailError.value = '請輸入有效的電子郵件格式'
        return false
    }

    // 驗證密碼
    if (!loginForm.value.password) {
        passwordError.value = '請輸入密碼'
        return false
    } else if (loginForm.value.password.length < 3) {
        passwordError.value = '密碼至少需要3個字元'
        return false
    }

    return true
    }

    const handleLogin = async () => {
    // 清除之前的錯誤
    errorMessage.value = ''
    
    // 驗證表單
    if (!validateForm()) {
        return
    }

    try {
        // 呼叫登入
        const result = await authStore.login({
        email: loginForm.value.email,
        password: loginForm.value.password
        })

        if (result.success) {
        // 登入成功，跳轉到首頁
        router.push('/')
        } else {
        // 登入失敗，顯示錯誤訊息
        errorMessage.value = result.message || '登入失敗'
        }
    } catch (error) {
        errorMessage.value = '網路錯誤，請稍後再試'
    }
    }
    // 清除錯誤訊息
    const clearErrors = () => {
    emailError.value = ''
    passwordError.value = ''
    errorMessage.value = ''
    }
</script>

<template>
  <form @submit.prevent="handleLogin" class="login-form">
    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-circle me-2"></i>
      {{ errorMessage }}
    </div>

    <!-- Email 輸入 -->
    <div class="mb-3">
      <label for="email" class="form-label">電子郵件</label>
      <div class="input-group">
        <span class="input-group-text">
          <i class="bi bi-envelope"></i>
        </span>
        <input
          id="email"
          v-model="loginForm.email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': emailError }"
          placeholder="請輸入您的電子郵件"
          required
          :disabled="isLoading"
        >
      </div>
      <div v-if="emailError" class="invalid-feedback">
        {{ emailError }}
      </div>
    </div>

    <!-- 密碼輸入 -->
    <div class="mb-3">
      <label for="password" class="form-label">密碼</label>
      <div class="input-group">
        <span class="input-group-text">
          <i class="bi bi-lock"></i>
        </span>
        <input
          id="password"
          v-model="loginForm.password"
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          :class="{ 'is-invalid': passwordError }"
          placeholder="請輸入您的密碼"
          required
          :disabled="isLoading"
        >
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="togglePassword"
          :disabled="isLoading"
        >
          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
        </button>
      </div>
      <div v-if="passwordError" class="invalid-feedback">
        {{ passwordError }}
      </div>
    </div>

     <!-- 記住我 -->
    <div class="mb-3 form-check">
      <input
        id="rememberMe"
        v-model="loginForm.rememberMe"
        type="checkbox"
        class="form-check-input"
        :disabled="isLoading"
      >
      <label for="rememberMe" class="form-check-label">
        記住我
      </label>
    </div>

    <!-- 登入按鈕 -->
    <button
      type="submit"
      class="btn btn-primary w-100 mb-3"
      :disabled="isLoading || !isFormValid"
    >
      <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">載入中...</span>
      </span>
      <i v-else class="bi bi-box-arrow-in-right me-2"></i>
      {{ isLoading ? '登入中...' : '登入' }}
    </button>

    <!-- 忘記密碼 -->
    <div class="text-center">
      <a href="#" class="text-muted text-decoration-none small">
        忘記密碼？
      </a>
    </div>
  </form>

</template>

<style lang="css" scoped>
    .login-form {
    width: 100%;
    }

    .input-group-text {
    background-color: #f8f9fa;
    border-right: none;
    }

    .form-control {
    border-left: none;
    }

    .form-control:focus {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .btn-primary {
    padding: 0.75rem 1rem;
    font-weight: 500;
    }

    .spinner-border-sm {
    width: 1rem;
    height: 1rem;
    }
    /* 響應式調整 */
    @media (max-width: 576px) {
    .login-form {
        padding: 0;
    }
    }
</style>