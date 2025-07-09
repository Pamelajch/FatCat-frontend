<script setup>
import { RouterLink, RouterView,useRoute} from 'vue-router'
import { computed,onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'

//獲取目前路由
const route = useRoute()
//計算是否需要隱藏 Header 和 Footer
const shouldhideHeaderFooter = computed(()=>{
  return route.meta.hideHeaderFooter || false
})

//記住user登入資訊
// 獲取auth store
   const authStore = useAuthStore()
      // 在組件掛載時初始化auth狀態
      onMounted(() => {
        authStore.initializeAuth()
   })
</script>

<template>
  <div>
    <HeaderComponent v-if="!shouldhideHeaderFooter"></HeaderComponent>
    <main>
      <RouterView></RouterView>
    </main>
    <FooterComponent v-if="!shouldhideHeaderFooter"></FooterComponent>
  </div>

</template>

<style scoped>

</style>
