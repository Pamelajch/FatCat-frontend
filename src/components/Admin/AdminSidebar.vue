<script setup>
import { ref } from 'vue';

const openCollapseId = ref(null); // null 代表全部收合
const navItems = ref([
  { type: 'link', text: '主頁', path: '/admin/dashboard', icon: 'bi bi-grid-1x2-fill' },

  { 
    type: 'group', 
    id: 'A',
    text: '會員管理', 
    icon: 'bi bi-people-fill', 
    children: [
      { text: '會員列表', path: '/admin/members' },
    ]
  },
  { 
    type: 'group', 
    id: 'B', 
    text: '訂單管理', 
    icon: 'bi bi-receipt-cutoff',
    children: [ 
      { text: '訂單總覽', path: '/admin/orders' },
      { text: '物流管理', path: '/admin/shipping' },      
    ]
  },
  { 
    type: 'group', 
    id: 'C',
    text: '商品管理', 
    icon: 'bi bi-box-seam', 
    children: [
      { text: '全站商品列表', path: '/admin/products' },
      { text: '賣場設置', path: '/admin/store-setup' },
    ]
  },  
  { 
    type: 'group',
    id: 'D', 
    text: '服務管理', 
    icon: 'bi bi-headset', 
    children: [      
      { text: '線上客服', path: '/admin/customer-service' },
      { text: '消費申訴處理', path: '/admin/complaints' },
      { text: '評論核查', path: '/admin/reviews' },
    ]
  },
  { 
    type: 'group',
    id: 'E', 
    text: '活動管理', 
    icon: 'bi bi-megaphone-fill', 
    children: [      
      { text: '優惠管理', path: '/admin/coupons' },
      { text: '直播設置', path: '/admin/stream' },
    ]
  },
  { 
    type: 'group',
    id: 'F', 
    text: '系統設置', 
    icon: 'bi bi-gear-fill',
    children: [      
      { text: '分析報表', path: '/admin/analysis' },
      { text: '管理者設定', path: '/admin/settings' },
      { text: '系統通知', path: '/admin/notifications' },
    ]
  },
]);

const beforeEnter = (el) => {
  el.style.height = '0';
};
const enter = (el) => {
  el.style.height = el.scrollHeight + 'px';
};
const leave = (el) => {
  el.style.height = '0';
};


const toggleCollapse = (itemId) => {
  if (openCollapseId.value === itemId) {
    openCollapseId.value = null;
  } else {
    openCollapseId.value = itemId;
  }
};


</script>

<template>
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <a href="/admin/dashboard" class="logo">肥貓後台</a>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <template v-for="(item, index) in navItems" :key="index">
          
          <li v-if="item.type === 'link'">
            <RouterLink :to="item.path" class="nav-link">
              <i :class="item.icon"></i>
              <span>{{ item.text }}</span>
            </RouterLink>
          </li>

          <li v-if="item.type === 'group'">
            <a 
              class="nav-link collapsible-link" 
              href="#"
              role="button"
              @click.prevent="toggleCollapse(item.id)"
              :class="{ 'collapsed': openCollapseId !== item.id }"
            >
              <i :class="item.icon"></i>
              <span>{{ item.text }}</span>
              <i class="bi bi-chevron-down ms-auto arrow-icon"></i>
            </a>
            
            <Transition
              name="slide"
              @before-enter="beforeEnter"
              @enter="enter"
              @leave="leave"
            >
              <div v-show="openCollapseId === item.id" class="submenu-wrapper">
                <ul class="submenu">
                  <li v-for="child in item.children" :key="child.path">
                    <RouterLink :to="child.path" class="nav-link sub-link">
                      <span>{{ child.text }}</span>
                    </RouterLink>
                  </li>
                </ul>
              </div>
            </Transition>

          </li>
        </template>
      </ul>
    </nav>
  </aside>
</template>


<style scoped>
.admin-sidebar {
  width: 280px;
  background-color: #582b5e;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}
.sidebar-nav {
  flex-grow: 1;
  padding-top: 1rem;
}
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #e0e0e0;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
  font-size: 1.1rem;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
}
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.nav-link i {
  margin-right: 1rem;
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}
.collapsible-link {
  cursor: pointer;
  justify-content: space-between;
}
.arrow-icon {
  transition: transform 0.3s ease;
  font-size: 0.8rem !important;
}
.collapsible-link:not(.collapsed) .arrow-icon {
  transform: rotate(180deg);
}
.nav-link.router-link-exact-active {
  background-color: #f3e3f4;
  color: #582b5e;
  font-weight: bold;
}
li:has(.submenu .router-link-exact-active) > .nav-link.collapsible-link {
  background-color: #7f2395;
  color: white;
  font-weight: bold;
}
.submenu-wrapper {
  overflow: hidden;
}
.submenu {
  padding-left: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
}
.submenu .nav-link {
  font-size: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 2.8rem;
}
.submenu .nav-link.router-link-exact-active {
  background-color: #e8daef !important;
  color: #582b5e !important;
}
.slide-enter-active,
.slide-leave-active {
  transition: height 0.35s ease-out;
}

</style>