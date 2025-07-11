<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'

// 狀態：是否正在載入
const isLoading = ref(true)

onMounted(() => {
  // 模擬loading 過程，可以替換成實際 API 完成後再關掉
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})
</script>

<template>
  <div>
    <!--Loading 畫面 -->
    <div v-if="isLoading" class="loading-overlay">
      <img src="/loading.gif" alt="Loading" class="loading-img" />
    </div>

    <!--內容畫面 -->
    <div v-else>
      <HeaderComponent />
      <main>
        <RouterView />
      </main>
      <FooterComponent />
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #FF7F61; /* 或改成 #f6f0fa 淡紫色 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-img {
  width: 700px; /* 調整gif大小 */
}
</style>
