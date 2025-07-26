<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHome = () => {
  router.push('/home')
}
</script>

<template>
  <div class="intro-wrapper">
    <h1>歡迎來到「泡！你的泡麵」✨</h1>
    <p>這是一段測試文字，等一下會跳轉到正式首頁</p>
    <button @click="goToHome">➡ 前往首頁</button>
  </div>
</template>

<style scoped>
.intro-wrapper {
  min-height: 100vh;
  background: url('/opensky.png') no-repeat center center;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  gap: 1rem;
}

button {
  padding: 10px 20px;
  font-size: 1.1rem;
  background-color: #7c4dff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}
button:hover {
  background-color: #9575cd;
}
</style>