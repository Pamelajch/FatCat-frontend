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
        <button class="icon-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample" title="購物車">
          <i class="bi bi-cart"></i>
        </button>
        <RouterLink :to="{name:'favorite'}" class="icon-btn" title="我的最愛"><i class="bi bi-heart-fill"></i></RouterLink>
        <RouterLink :to="{name:'user'}" class="icon-btn" title="會員中心"><i class="bi bi-person-circle"></i></RouterLink>
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