<script setup>
import { ref, onMounted, onUnmounted, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuthStore } from '@/stores/adminauth';

const router = useRouter();
const adminAuthStore = useAdminAuthStore();
const currentTime = ref('');
let timer = null;
const isDropdownOpen = ref(false);
const adminInfo = ref(null);

// 注入側邊欄切換函數和狀態
const toggleSidebar = inject('toggleSidebar');
const isSidebarCollapsed = inject('isSidebarCollapsed', ref(false));

const welcomeMessage = computed(() => {
  if (adminInfo.value && adminInfo.value.name) {
    return ` ${adminInfo.value.name}，您好`;
  }
  return '管理員，您好';
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const logout = async () => {
  await adminAuthStore.logout();
  router.push('/admin/login');
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
};

onMounted(() => {
  const storedAdmin = localStorage.getItem('adminUser');
  if (storedAdmin) {
    adminInfo.value = JSON.parse(storedAdmin);
  }
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <header class="admin-header">
    <div class="header-left">
      <button class="sidebar-toggle-btn" @click="toggleSidebar">
        <i class="bi" :class="isSidebarCollapsed ? 'bi-arrow-right' : 'bi-list'"></i>
      </button>
      <div class="search-bar">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="搜尋功能...">
      </div>
    </div>
    <div class="header-right">
      <span class="user-info">{{ welcomeMessage }}</span>
      <div class="divider"></div>
      <span class="date-time">{{ currentTime }}</span>
      <div class="divider"></div>
      <div class="icon-group">
        <i class="bi bi-bell-fill"></i>
        
        <div class="profile-section">
          <i class="bi bi-person-circle" @click="toggleDropdown"></i>
          
          <div v-if="isDropdownOpen" class="profile-dropdown">
            <button @click="logout" class="dropdown-item logout-btn">登出</button>
          </div>
        </div>

      </div>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  height: 70px;
  background-color: #515050;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  flex-shrink: 0;
}
.header-left, .header-right, .search-bar, .icon-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.sidebar-toggle-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #f6f7f7;
  transition: transform 0.3s ease;
}

.sidebar-toggle-btn:hover {
  transform: scale(1.1);
}

.sidebar-toggle-btn i {
  transition: transform 0.3s ease;
}
.search-bar {
  background-color: #f8f9fa;
  border-radius: 20px;
  padding: 0.5rem 1rem;
}
.search-bar i { color: #6c757d; }
.search-bar input {
  border: none;
  background: none;
  outline: none;
  padding-left: 0.5rem;
}
.user-info, .date-time {
    font-size: 0.9rem;
    color: #ffffff;
}
.divider {
  width: 1px;
  height: 20px;
  background-color: #dee2e6;
}
.icon-group i {
  font-size: 1.2rem;
  cursor: pointer;
  color: #ffffff;
}

/* --- 下拉選單樣式 --- */
.profile-section {
  position: relative;
}
.profile-dropdown {
  position: absolute;
  top: 150%; 
  right: 0;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
  border: 1px solid #dee2e6;
  width: 180px;
  z-index: 100;
  padding: 0.5rem 0;
}
.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1.25rem;
  text-align: left;
  color: #212529;
  text-decoration: none;
  background: none;
  border: none;
  font-size: 1rem;
}
.dropdown-item:hover {
  background-color: #f8f9fa;
}
.dropdown-divider {
  height: 1px;
  margin: 0.5rem 0;
  overflow: hidden;
  background-color: #e9ecef;
}
.logout-btn {
  color: #dc3545;
}
.logout-btn:hover {
  color: white;
  background-color: #dc3545;
}
</style>