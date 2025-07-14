<script setup>
// 把所有邏輯都移到子元件，讓 Layout 只負責排版
import AdminSidebar from '@/components/Admin/AdminSidebar.vue';
import AdminHeader from '@/components/Admin/AdminHeader.vue';
import AdminFooter from '@/components/Admin/AdminFooter.vue';
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="main-wrapper">
      <AdminHeader />
      <main class="admin-main-content">
        <RouterView />
      </main>
      <AdminFooter />
    </div>
  </div>
</template>



<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: #f4f7f6; /* 內容區的淺灰底色 */
}
.main-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.admin-main-content {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto; /* 讓內容區可以滾動 */
}
</style>