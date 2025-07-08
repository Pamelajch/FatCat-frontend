<script setup>
    import LoginForm from '../components/LoginForm.vue'
</script>

<template>
<div class="login-page">
    <div class="container-fluid vh-100">
      <div class="row h-100">
        <!-- 左側 - 登入表單 -->
        <div class="col-md-6 col-lg-5 d-flex align-items-center justify-content-center">
          <div class="login-form-container w-100" style="max-width: 400px;">
            <!-- Logo 和標題 -->
            <div class="text-center mb-4">
              <img src="/cat-logo.png" alt="Fat Cat Logo" class="mb-3" style="height: 60px;">
              <h2 class="h3 mb-3 fw-bold login-title">歡迎回來</h2>
              <p class="login-subtitle">請登入您的帳戶</p>
            </div>

            <!-- 登入表單組件 -->
            <LoginForm></LoginForm>

            <!-- 註冊連結 -->
            <div class="text-center mt-4">
              <p class="register-text">
                還沒有帳戶？ 
                <router-link to="/register" class="register-link">
                  立即註冊
                </router-link>
              </p>
            </div>
          </div>
        </div>
         <!-- 右側 - 背景圖片 -->
        <div class="col-md-6 col-lg-7 d-none d-md-block">
          <div class="login-bg h-100 d-flex align-items-center justify-content-center">
            <div class="text-center text-white">
              <h1 class="display-4 fw-bold mb-4">Fat Cat 購物商城</h1>
              <p class="lead">發現最好的商品，享受最棒的購物體驗</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
/* 色系定義 - 使用組件內變數 */
.login-page {
  --deep-purple: #92559c;
  --light-purple: #d3a2da;
  --light-yellow: #ffd689;
  --orange-yellow: #ffa600;
  --deep-gray: #686868;
  --light-gray: #f6f6f6;
  
  background: linear-gradient(135deg, var(--light-purple) 0%, var(--light-gray) 100%);
}

.login-form-container {
  padding: 2rem;
  background: var(--light-gray);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--deep-gray);
}

.login-title {
  color: var(--deep-purple);
}

.login-subtitle {
  color: var(--deep-gray);
}

.register-text {
  color: var(--deep-gray);
}

.register-link {
  color: var(--deep-purple);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: var(--orange-yellow);
}

.login-bg {
  background: linear-gradient(135deg, var(--deep-purple) 0%, var(--light-purple) 50%, var(--light-yellow) 100%);
  position: relative;
}

.login-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
}

.login-bg > div {
  position: relative;
  z-index: 1;
}

/* 響應式設計 */
@media (max-width: 767.98px) {
  .login-form-container {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>