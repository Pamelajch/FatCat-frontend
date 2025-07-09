<script setup>
    import { useAuthStore } from '../stores/auth'
    import { useRouter } from 'vue-router'
    import { computed } from 'vue'

    //登入登出功能區------------------------------------------
    // 使用auth store和router
    const authStore = useAuthStore()
    const router = useRouter()

    // 計算屬性：是否已登入
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)

    // 登出處理
    const handleLogout = async () => {
      try {
        await authStore.logout()
        // 跳轉到首頁
        router.push('/')
      } catch (error) {
        console.error('登出失敗:', error)
      }
    }

    // 處理頭像顯示
    const getUserAvatar = computed(() => {
      if (user.value?.picPath) {
        return user.value.picPath
      }
      return null
    })
    //登入登出功能區 end-------------------------------------
</script>

<template>
<header class="custom-header px-3 py-2">
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <!-- 左側 Logo + 店名 -->
      <div class="d-flex align-items-center gap-2 flex-shrink-0">
        <img src="/cat-logo.png" alt="logo" class="logo-img" />
        <img src="/cat-font.png" alt="" style="height: 50px;">
      </div>

      <!-- 右側按鈕群組 -->
      <div class="d-flex align-items-center gap-3 gap-lg-4">
        <RouterLink :to="{name:'_reviewtest'}" class="icon-btn" title="通知"><i>rr測試站</i></RouterLink>
        <RouterLink :to="{name:'home'}" class="icon-btn" title="首頁"><i class="bi bi-house-door"></i></RouterLink>
        <button class="icon-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample" title="購物車">
          <i class="bi bi-cart"></i>
        </button>
        <RouterLink :to="{name:'favorite'}" class="icon-btn" title="我的最愛"><i class="bi bi-heart-fill"></i></RouterLink>

        <!-- 會員中心下拉選單 -->
        <div class="dropdown">
          <button class="icon-btn dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="會員中心">
            <!-- 根據登入狀態顯示不同的圖示和文字 -->
            <template v-if="isAuthenticated">
              <!-- 如果有頭像則顯示頭像，否則顯示預設圖示 -->
              <img v-if="getUserAvatar" :src="getUserAvatar" alt="會員頭像" class="user-avatar" />
              <i v-else class="bi bi-person-circle"></i>
              <span class="user-greeting d-none d-lg-inline">{{ user.name }}您好</span>
            </template>
            <template v-else>
              <i class="bi bi-person-circle"></i>
              <span class="d-none d-lg-inline"></span>
            </template>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <!-- 根據登入狀態顯示不同的選單項目 -->
            <template v-if="isAuthenticated">
              <li><RouterLink :to="{name:'user'}" class="dropdown-item"><i class="bi bi-person-gear me-2"></i>會員中心</RouterLink></li>
              <li><hr class="dropdown-divider"></li>
              <li><button @click="handleLogout" class="dropdown-item" :disabled="authStore.isLoading"><i class="bi bi-box-arrow-right me-2"></i>{{ authStore.isLoading ? '登出中...' : '登出' }}</button></li>
            </template>
            <template v-else>
              <li><RouterLink :to="{name:'login'}" class="dropdown-item"><i class="bi bi-box-arrow-in-right me-2"></i>會員登入</RouterLink></li>
              <li><RouterLink :to="{name:'user'}" class="dropdown-item"><i class="bi bi-person-gear me-2"></i>會員中心</RouterLink></li>
            </template>
          </ul>
        </div>

        <RouterLink :to="{name:'notification'}" class="icon-btn" title="通知"><i class="bi bi-bell"></i></RouterLink>
      </div>
    </div>
  </header>
   <!-- Offcanvas Start -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasExampleLabel">購物車</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <div>目前尚無資料</div>
    <router-link to="/" class="btn custom-header btn-space">前往購物</router-link>
    <router-link to="/cart" class="btn custom-header">立刻結帳</router-link>
  </div>
</div>
<!-- Offcanvas End -->
</template>

<style lang="css" scoped>
.custom-header {
  background-color: #c286cf; /* 紫色背景 */
  color: white;
}

/* Logo 大小 */
.logo-img {
  height: 48px;
}

/* 店名字型樣式 */
.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  font-family: 'Comic Sans MS', 'Noto Sans TC', sans-serif;
  white-space: nowrap; /* 防止文字換行 */
}

.icon-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.4rem;
  transition: color 0.3s ease;
}

.icon-btn:hover {
  color: #ffe0f0;
}

.btn-space {
  margin-right: 10px; /* 可以依需求微調距離 */
}

/* 下拉選單樣式 */
.dropdown-menu {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  color: #212529;
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  transition: background-color 0.15s ease-in-out;
}

.dropdown-item:hover {
  background-color: #e9ecef;
  color: #212529;
  text-decoration: none;
}

.dropdown-item i {
  width: 1rem;
}

/* 響應式調整 */
@media (max-width: 992px) {
  .logo-text {
    font-size: 1.3rem; /* 在中等螢幕時稍微縮小字體 */
  }
}

@media (max-width: 768px) {
  .logo-text {
    font-size: 1.2rem; /* 在小螢幕時再縮小字體 */
  }
  
  .icon-btn {
    font-size: 1.2rem; /* 手機時縮小圖標 */
  }
  
  .logo-img {
    height: 40px; /* 手機時縮小 logo */
  }
}

@media (max-width: 576px) {
  .logo-text {
    font-size: 1.1rem; /* 超小螢幕時進一步縮小 */
  }
  
  .icon-btn {
    font-size: 1.1rem;
  }
}

/* 登入登出css設定 */
/* 使用者頭像樣式 */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

/* 使用者歡迎文字 */
.user-greeting {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

/* 修改 dropdown-item 樣式以支援 button */
.dropdown-item {
  color: #212529;
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  transition: background-color 0.15s ease-in-out;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item:disabled {
  opacity: 0.6;
  pointer-events: none;
}

.dropdown-divider {
  height: 0;
  margin: 0.5rem 0;
  overflow: hidden;
  border-top: 1px solid #dee2e6;
}

/* 響應式調整 */
@media (max-width: 992px) {
  .user-greeting {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .user-avatar {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 576px) {
  .user-avatar {
    width: 24px;
    height: 24px;
  }
}
</style> 