<script setup>
    
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
        <RouterLink :to="{name:'home'}" class="icon-btn" title="首頁"><i class="bi bi-house-door"></i></RouterLink>
        <RouterLink :to="{name:'cart'}" class="icon-btn" title="購物車"><i class="bi bi-cart"></i></RouterLink>
        <RouterLink :to="{name:'favorite'}" class="icon-btn" title="我的最愛"><i class="bi bi-heart-fill"></i></RouterLink>

        <!-- 會員中心下拉選單 -->
        <div class="dropdown">
          <button class="icon-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="會員中心">
            <i class="bi bi-person-circle"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><RouterLink :to="{name:'login'}" class="dropdown-item"><i class="bi bi-box-arrow-in-right me-2"></i>登入</RouterLink></li>
            <li><RouterLink :to="{name:'user'}" class="dropdown-item"><i class="bi bi-person-gear me-2"></i>會員中心</RouterLink></li>
          </ul>
        </div>

        <RouterLink :to="{name:'notification'}" class="icon-btn" title="通知"><i class="bi bi-bell"></i></RouterLink>
      </div>
    </div>
  </header>
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
</style> 