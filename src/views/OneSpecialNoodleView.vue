<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const productId = route.query.id

// ====== 通知流程 ======
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

// ====== 輪播圖片滑動功能 ======
const images = ref([
  '/fakenoodle.jpg',
  '/pingu.png',
  '/cat-logo.png'
])

const currentImageIndex = ref(0)

const showPrev = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const showNext = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++
  }
}

// ====== 警語輪播文字 ======
const warningMessages = [
  '親愛的貓貓們請注意',
  '由於特殊款泡麵無法更換配料',
  '請留意過敏食材',
  '肥貓麵舖感謝您 🐾'
]
const currentWarning = ref(0)
let warningInterval

onMounted(() => {
  warningInterval = setInterval(() => {
    currentWarning.value = (currentWarning.value + 1) % warningMessages.length
  }, 2000)
})
onBeforeUnmount(() => {
  clearInterval(warningInterval)
})
</script>

<template>
  <!-- 通知畫面 -->
  <div v-if="showNotification" class="notification-overlay">
    <div class="card-container" :class="{ flipped: messageIndex === 1 }">
      <div class="card">
        <div class="face front">
          <p class="notification-text">{{ messages[0] }}</p>
          <button class="continue-btn" @click="nextMessage">繼續 ➜</button>
        </div>
        <div class="face back">
          <p class="notification-text">{{ messages[1] }}</p>
          <button class="continue-btn" @click="nextMessage">進入 ➜</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 正常內容 -->
  <div v-else class="special-noodle-container">
    <div class="content-box">
      <!-- 圖片 -->
      <div class="image-slider">
        <button class="nav-btn left" @click="showPrev" :disabled="currentImageIndex === 0">‹</button>
        <img :src="images[currentImageIndex]" class="product-image" alt="泡麵圖片" />
        <button class="nav-btn right" @click="showNext" :disabled="currentImageIndex === images.length - 1">›</button>
      </div>

      <!-- 資訊 -->
      <div class="info-box">
        <h1 class="product-name">天降龍蝦泡麵</h1>
        <p class="product-price">NT$ 199</p>
        <p class="product-description">濃厚海味拉麵，搭配整隻龍蝦，彷彿置身深海的溫柔擁抱 🦞🌊</p>
        <p class="product-stock">剩餘庫存：12 碗</p>
        <div class="button-group">
          <button class="cart-btn">加入購物車</button>
          <button class="favorite-btn">加入最愛</button>
        </div>
      </div>
    </div>

    <!-- 警語 -->
    <div class="warning-text">
  <transition name="slide-up" mode="out-in">
    <p :key="currentWarning">{{ warningMessages[currentWarning] }}</p>
  </transition>
</div>
  </div>
</template>

<style lang="css" scoped>
/* 通知樣式 */
.notification-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: linear-gradient(135deg, #fff0fa, #ffe4ec);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}

.card-container {
  width: 100%; max-width: 500px; height: 300px;
  perspective: 1000px;
}

.card {
  width: 100%; height: 100%;border-radius: 25px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s;
}

.card-container.flipped .card {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  width: 100%; height: 100%;
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
}

/* 整個頁面容器 */
.special-noodle-container {
  padding: 40px 5vw;
  background-color: #fff5fc;
  min-height: 100vh;
}

/* 左右結構容器 */
.content-box {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
  align-items: flex-start;
}

/* 圖片區域（單張顯示 + 按鈕） */
.image-slider {
  flex: 1;
  min-width: 800px;
  max-width: 1000px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 圖片本體 */
.product-image {
  height: 500px;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0,0,0,0.15);
  user-select: none;
}

/* 左右切換按鈕 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 184, 226, 0.7);
  border: none;
  font-size: 36px;
  font-weight: bold;
  color: white;
  width: 40px;
  height: 60px;
  border-radius: 10px;
  cursor: pointer;
  z-index: 1;
}
.nav-btn.left {
  left: 0;
}
.nav-btn.right {
  right: 0;
}
.nav-btn:disabled {
  background-color: rgba(200, 200, 200, 0.5);
  cursor: not-allowed;
}

/* 右側商品資訊 */
.info-box {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-name {
  font-size: 32px;
  font-weight: bold;
  color: #ab3fa2;
}

.product-price {
  font-size: 24px;
  color: #d94ca0;
}

.product-description {
  font-size: 18px;
  color: #333;
}

.product-stock {
  font-size: 16px;
  color: #777;
}

/* 兩顆按鈕 */
.button-group {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

/* 共用按鈕樣式 */
.cart-btn,
.favorite-btn {
  padding: 10px 20px;            /* 更小一點 */
  font-size: 15px;               /* 字體也縮一點 */
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 加入購物車：更亮更濃的漸層 */
.cart-btn {
  background: linear-gradient(135deg, #ff84b7, #ff2f85);
  color: white;
}
.cart-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 18px rgba(255, 47, 133, 0.4);
}

/* 加入最愛：紫粉交界，對比更明顯 */
.favorite-btn {
  background: linear-gradient(135deg, #ffc1ea, #d266c2);
  color: white;
}
.favorite-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 18px rgba(210, 102, 194, 0.4);
}

.warning-text {
  margin-top: 60px;
  padding: 30px;
  background-color: #fff0f5;
  border-left: 6px solid #d94ca0;
  border-radius: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 24px;
  color: #9b376e;
  animation: fadeIn 0.5s ease;
}

/* 警語輪播動畫 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>