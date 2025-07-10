<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

    const route = useRoute()
    const productId = route.query.id
    // 控制通知流程
    const showNotification = ref(true)
    const messageIndex = ref(0)

    const messages = [
    '親愛的貓貓們，特殊款泡麵無法更換配料 🍜',
    '自定義泡麵請前往商品列表 👉'
    ]

    const nextMessage = () => {
    if (messageIndex.value < messages.length - 1) {
        messageIndex.value++
    } else {
        showNotification.value = false
    }
}
</script>

<template>
<!-- 通知畫面 -->
  <div v-if="showNotification" class="notification-overlay">
    <div class="card-container" :class="{ flipped: messageIndex === 1 }">
      <div class="card">
        <div class="front face">
          <p class="notification-text">{{ messages[0] }}</p>
          <button class="continue-btn" @click="nextMessage">繼續 ➜</button>
        </div>
        <div class="back face">
          <p class="notification-text">{{ messages[1] }}</p>
          <button class="continue-btn" @click="nextMessage">繼續 ➜</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 正常頁面內容 -->
  <div v-else>
  </div>
</template>

<style lang="css" scoped>
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #fff0fa, #ffe4ec);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

/* 卡片容器：負責翻轉動畫 */
.card-container {
  perspective: 1000px;
  width: 100%;
  max-width: 500px;
  height: 300px;
  
}

/* 卡片翻轉本體 */
.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s;
  border-radius: 25px;
}

.card-container.flipped .card {
  transform: rotateY(180deg);
}

/* 正反面通用樣式 */
.face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff0fa;
  border: 3px dashed #b067b3;
  border-radius: 25px;
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
  padding: 40px;
  text-align: center;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 背面 */
.back {
  transform: rotateY(180deg);
}

.notification-text {
  font-size: 20px;
  font-weight: bold;
  color: #c84cc4;
  margin-bottom: 20px;
}

.continue-btn {
  background-color: #ffb8e2;
  border: none;
  color: white;
  font-weight: bold;
  font-size: 16px;
  padding: 10px 25px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  background-color: #f675c1;
}
</style>