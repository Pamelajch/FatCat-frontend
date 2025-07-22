<script setup>
    import { useAuthStore } from '../stores/auth'
    import { useRouter } from 'vue-router'
    import { computed } from 'vue'
    import { useCartStore } from '@/stores/cart'
    import CartOffcanvas from '@/components/CartOffcanvas.vue'
    // import * as bootstrap from 'bootstrap'  
    import Swal from 'sweetalert2'
    import {ref,onMounted, watch} from 'vue'
    import api from '@/services/jjapi'
    import { searchAll } from '@/services/searchService.js';

    // 搜尋功能區 -----------------------------------------------------------------
    const searchKeyword = ref('');
    const searchResult = ref(null);
    const searchLoading = ref(false);
    const searchError = ref('');
    const showSearchDropdown = ref(false);

    const doSearch = async () => {
      if (!searchKeyword.value.trim()) {
        searchError.value = '請輸入關鍵字';
        searchResult.value = null;
        showSearchDropdown.value = false;
        return;
      }
      searchError.value = '';
      searchLoading.value = true;
      try {
        const res = await searchAll(searchKeyword.value);
        searchResult.value = res.data;
        showSearchDropdown.value = true;
      } catch (e) {
        searchError.value = '搜尋失敗';
        searchResult.value = null;
        showSearchDropdown.value = false;
      }
      searchLoading.value = false;
    };

    // 點擊外部時關閉下拉
    const closeDropdown = () => {
      showSearchDropdown.value = false;
    };
    // 搜尋功能區end ----------------------------------------------------------
        
    //登入登出功能區------------------------------------------
    // 使用auth store和router
    const authStore = useAuthStore()
    const router = useRouter()

    // 使用Cart store
    const cartStore = useCartStore()

    // 計算屬性：是否已登入
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)

    // 新增：控制開啟購物車 Offcanvas
    function openOffcanvas() {
      const el = document.getElementById('offcanvasExample')
      if (el) {
        const instance = bootstrap.Offcanvas.getOrCreateInstance(el)
        instance.show()
      }
    }
    // 登出處理
    const handleLogout = async () => {
      // 1. 確認對話框
      const result = await Swal.fire({
        title: '確定要登出嗎？',
        text: '登出後需要重新登入才能存取會員功能',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '確定登出',
        cancelButtonText: '取消',
        confirmButtonColor: '#92559c',
        cancelButtonColor: '#6c757d'
      })

      if (!result.isConfirmed) {
        return // 用戶取消登出
      }

      try {
        // 2. 顯示載入中
        Swal.fire({
          title: '登出中...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        // 3. 執行登出
        await authStore.logout()
        
        // 4. 顯示成功提示
        await Swal.fire({
          title: '登出成功！',
          text: '感謝您的使用，期待下次再見！',
          icon: 'success',
          confirmButtonText: '確定',
          confirmButtonColor: '#92559c',
          timer: 3000,
          timerProgressBar: true
        })
        
        // 5. 智能跳轉邏輯
        const currentRoute = router.currentRoute.value
        const authRequiredPages = ['user', 'myorders', 'checkout', 'favorite']
        
        if (authRequiredPages.includes(currentRoute.name)) {
          router.push('/')
        } else {
          window.location.reload()
        }
        
      } catch (error) {
        console.error('登出失敗:', error)
        
        Swal.fire({
          title: '登出失敗',
          text: '請檢查網路連線後再試',
          icon: 'error',
          confirmButtonText: '確定',
          confirmButtonColor: '#dc3545'
        })
      }
    }

    // 處理頭像顯示
    const getUserAvatar = computed(() => {
      if (user.value?.picPath) {
        // 如果 picPath 是相對路徑，加上後端服務器 URL
        if (user.value.picPath.startsWith('/')) {
          return `https://localhost:7017${user.value.picPath}`
        }
        // 如果已經是完整 URL，直接返回
        return user.value.picPath
      }
      // 如果沒有頭像，返回預設圖片
      return '/pingu.png'
    })
    //登入登出功能區 end-------------------------------------
    
    // 通知功能區------------------------------------------
    // 未讀通知數量
    const unreadCount = ref(0)

    async function fetchUnreadCount() {
      const user = localStorage.getItem('user')
      const userId = user ? JSON.parse(user).userId : null
      if (!userId) {
        unreadCount.value = 0
        console.log('無法從localstorage 取得 userId，未讀通知數量設為 0')
        return
      }
      if (!isAuthenticated.value){
        unreadCount.value = 0
        console.log('未登入，未讀通知數量設為 0')
        return
      }
      try {
        const res = await api.get(`/Notifications/User/${userId}`)
        // 統計未讀
        unreadCount.value = res.data.filter(n => !n.isRead).length
        console.log('取得未讀通知數量:', unreadCount.value)
      } catch (error) {
        unreadCount.value = 0
        console.error('取得未讀通知數量失敗:', error)
      }
    }

    // 頁面載入時取得未讀通知數量
    onMounted(() => {
      fetchUnreadCount()
    })
    
    // 如果有登入狀態變化，重新取得未讀數量
    watch(isAuthenticated, (newVal) => {
      if (newVal) {
        fetchUnreadCount()
      } else {
        unreadCount.value = 0
      }
    })

    // 點擊通知按鈕跳轉到通知頁面
    function goToNotification() {
      router.push({ name: 'notification' })
    }
    // 通知功能區 end------------------------------------------
</script>

<template>
<header class="custom-header px-3 py-2">
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <!-- 左側 Logo + 店名 -->
      <RouterLink :to="{name:'home'}" class="d-flex align-items-center gap-2 flex-shrink-0 text-decoration-none">
        <img src="/cat-logo.png" alt="logo" class="logo-img" />
        <img src="/cat-font.png" alt="" style="height: 50px;">
      </RouterLink>

      <!-- 搜尋區塊 -->
    <div class="search-bar position-relative me-3">
      <input
        v-model="searchKeyword"
        @keyup.enter="doSearch"
        @mouseenter="searchResult && (showSearchDropdown = true)"
        class="form-control"
        style="width: 220px; display: inline-block;"
        placeholder="搜尋商品/分類/活動/優惠券..."
      />
      <button class="btn btn-light ms-1" @click="doSearch" style="padding: 0.25rem 0.75rem;">
        <i class="bi bi-search"></i>
      </button>
      <!-- 下拉搜尋結果 -->
      <div
        v-if="showSearchDropdown"
        class="search-dropdown"
        @mouseleave="closeDropdown"

      >
        <div v-if="searchLoading" class="p-2 text-center">載入中...</div>
        <div v-else-if="searchError" class="p-2 text-danger">{{ searchError }}</div>
        <template v-else-if="searchResult">
          <div v-if="searchResult.categories.length">
            <div class="search-title">商品大分類</div>
            <ul>
              <li v-for="c in searchResult.categories" :key="c.productCategoriesId">{{ c.name }}</li>
            </ul>
          </div>
          <div v-if="searchResult.sorts.length">
            <div class="search-title">商品小分類</div>
            <ul>
              <li v-for="s in searchResult.sorts" :key="s.sortId">
                <RouterLink
                  :to="{ name: 'specialnoodle', query: { category: s.name } }"
                  @click="closeDropdown"
               >
                {{ s.name }}
              </RouterLink>
              </li>
            </ul>
          </div>
          <div v-if="searchResult.products.length">
            <div class="search-title">商品</div>
            <ul>
              <li v-for="p in searchResult.products" :key="p.productsId">
              <RouterLink :to="{ name: 'onespecialnoodle', query: { id: p.productsId } }" @click="closeDropdown">
                {{ p.name }} 
              </RouterLink>
              </li>
            </ul>
          </div>
          <div v-if="searchResult.coupons.length">
            <div class="search-title">優惠券</div>
            <ul>
              <li v-for="c in searchResult.coupons" :key="c.couponId">{{ c.couponCode }} - {{ c.description }}</li>
            </ul>
          </div>
          <div v-if="searchResult.campaigns.length">
            <div class="search-title">活動</div>
            <ul>
              <li v-for="c in searchResult.campaigns" :key="c.campaignId">{{ c.title }}</li>
            </ul>
          </div>
          <div v-if="!searchResult.categories.length && !searchResult.sorts.length && !searchResult.products.length && !searchResult.coupons.length && !searchResult.campaigns.length">
            <span class="p-2">查無資料</span>
          </div>
        </template>
      </div>
    </div>

      <!-- 右側按鈕群組 -->
      <div class="d-flex align-items-center gap-3 gap-lg-4">
        <RouterLink :to="{name:'jjtest'}" class="icon-btn" title="UserId"><i>UserId查資料表</i></RouterLink>
        <RouterLink :to="{name:'_reviewtest'}" class="icon-btn" title="通知"><i>rr測試站</i></RouterLink>
        <RouterLink :to="{name:'home'}" class="icon-btn" title="首頁"><i class="bi bi-house-door"></i></RouterLink>
        <RouterLink :to="{name:'productlist'}" class="icon-btn" title="商品"><i class="fa-solid fa-bowl-food"></i></RouterLink>
        <button class="icon-btn" @click="openOffcanvas" title="購物車">
        <i class="fa fa-shopping-cart"></i>
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
          <!-- 下拉選單 -->
          <ul class="dropdown-menu dropdown-menu-end">
            <!-- 根據登入狀態顯示不同的選單項目 -->
            <template v-if="isAuthenticated">
              <li><RouterLink :to="{name:'user'}" class="dropdown-item"><i class="bi bi-person-gear me-2"></i>會員中心</RouterLink></li>
              <li><RouterLink :to="{name:'feedback'}" class="dropdown-item"><i class="bi bi-envelope-arrow-up me-2"></i>進度追蹤</RouterLink></li>
              <li><hr class="dropdown-divider"></li>
              
              <li><button @click="handleLogout" class="dropdown-item" :disabled="authStore.isLoading"><i class="bi bi-box-arrow-right me-2"></i>{{ authStore.isLoading ? '登出中...' : '登出' }}</button></li>
            </template>
            <template v-else>
              <li><RouterLink :to="{name:'login'}" class="dropdown-item"><i class="bi bi-box-arrow-in-right me-2"></i>會員登入</RouterLink></li>
              
            </template>
          </ul>
        </div>
        <!-- 通知按鈕 -->
        <button type="button" class="btn btn-primary position-relative icon-btn"
                @click="goToNotification" title="通知">
          <i class="bi bi-bell"></i>
          <span v-if="unreadCount > 0"
                class="position-absolute top-0 start-100 badge rounded-pill bg-danger" 
                style="transform: translate(-50%,2%);">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
            <span class="visually-hidden">unread messages</span>
          </span>
        </button>
      </div>
    </div>
  </header>
<CartOffcanvas />
</template>

<style lang="css" scoped>
.custom-header {
  background-color: #c286cf; /* 紫色背景 */
  color: white;
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
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
/* 
搜尋功能樣式 */
.search-bar {
  min-width: 220px;
}

.search-dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  width: 350px;
  background: #fff;
  border: 1px solid #c286cf;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: 9999;
  padding: 0.5rem 1rem;
  max-height: 350px;
  overflow-y: auto;
}

.search-title {
  font-weight: bold;
  color: #92559c;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
}
.search-dropdown ul {
  padding-left: 1rem;
  margin-bottom: 0.5rem;
  color: #212529;
}
.search-dropdown li {
  list-style: disc;
  font-size: 0.98rem;
  margin-bottom: 0.15rem;
}

</style>   