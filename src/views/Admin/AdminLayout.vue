<template>
  <div class="admin-layout">
    <header class="admin-header">
      <h3>肥貓管理後台</h3>
      <nav>
        <RouterLink to="/admin/chat" class="nav-link">客服系統</RouterLink>
        </nav>
      <button @click="logout" class="btn btn-sm btn-outline-light">登出</button>
    </header>
    <main class="admin-main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  router.push('/admin/login');
};
</script>

<style scoped>
.admin-layout { display: flex; flex-direction: column; height: 100vh; }
.admin-header {
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  background-color: #343a40;
  color: white;
  flex-shrink: 0;
  height: 60px;
}
.admin-header h3 { margin: 0; font-size: 1.2rem; }
.admin-header nav { margin: 0 auto; }
.nav-link { color: #ccc; text-decoration: none; padding: 0 1rem; }
.nav-link.router-link-active { color: white; font-weight: bold; }
.admin-main-content { flex-grow: 1; overflow: auto; }
</style>