<script setup>
import { ref, onMounted, onBeforeUnmount,watch } from 'vue' // 加入watch by JJ
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

// ====== 警語輪播文字 ======
const warningMessages = [
  '親愛的貓貓們請注意',
  '由於特殊款泡麵無法更換配料',
  '請留意過敏食材',
  '如有疑問請洽肥貓客服',
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

// ====== 商品資料 ======
const productDetail = ref(null)
const images = ref([])
const quantity = ref(1)

const fetchProductDetail = async () => {
  const productId = route.query.id // 取得路由中的商品ID by JJ
  try {
    const res = await fetch(`https://localhost:7017/api/Products/Details/${productId}`)
    const data = await res.json()
    productDetail.value = data
    images.value = [data.imageUrl] // 只有一張主圖

    // 商品規格先用寫死的
    productSpecs.value = [
      { label: '口味', value: '貓貓專用香氣' },
      { label: '內容量', value: '150g ± 5%' },
      { label: '保存期限', value: '6 個月' },
      { label: '產地', value: '台灣' },
      { label: '過敏原', value: '含愛心與貓毛' }
    ]

    // 推薦商品寫死
    recommendedProducts.value = [
      { id: 73, name: '如果我是宋朝人', image: '/ProductImages/如果我是宋朝人.jpg', price: 99 },
      { id: 74, name: '如果我是埃及豔后', image: '/ProductImages/如果我是埃及豔后.jpg', price: 119 }
    ]
  } catch (err) {
    console.error('取得商品資料失敗', err)
  }
}

// 輪播控制
const currentImageIndex = ref(0)
const direction = ref('next')

const showPrev = () => {
  if (currentImageIndex.value > 0) {
    direction.value = 'prev'
    currentImageIndex.value--
  }
}

const showNext = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    direction.value = 'next'
    currentImageIndex.value++
  }
}

// 商品規格與推薦商品（先寫死）
const productSpecs = ref([])
const recommendedProducts = ref([])

onMounted(fetchProductDetail) 
watch(()=> route.query.id, fetchProductDetail) // 當路由變更時，重新載入商品資料 by JJ

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
        <transition :name="direction" mode="out-in">
          <img
            :key="images[currentImageIndex]"
            :src="images[currentImageIndex]"
            class="product-image"
            alt="泡麵圖片"
          />
        </transition>
        <button class="nav-btn right" @click="showNext" :disabled="currentImageIndex === images.length - 1">›</button>
      </div>
      <!-- 給r謙放使用者評論的地方 -->
      <div>
        <!-- r謙放這裡面 -->
      </div>
      <!-- 資訊 -->
      <div class="info-box">
        <h1 class="product-name">{{ productDetail?.name }}</h1>
        <p class="product-price">NT$ {{ productDetail?.price }}</p>
        <p class="product-description">{{ productDetail?.description }}</p>
        <p class="product-stock">剩餘庫存：{{ productDetail?.stock }} 碗</p>
        <p class="product-category">分類：{{ productDetail?.categoryName }} > {{ productDetail?.sortName }}</p>
        <p class="product-status">狀態：{{ productDetail?.statusText }}</p>
        <!-- 商品規格 -->
        <div class="product-specs-form">
          <h3 class="spec-title">商品規格</h3>
          <div class="spec-grid">
            <div
            class="spec-row"
            v-for="(item, index) in productSpecs"
            :key="index"
            >
              <label class="spec-label">{{ item.label }}</label>
              <div class="spec-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
        <!-- 數量選擇器 -->
        <div class="quantity-box">
          <label for="qty">數量：</label>
          <input id="qty" type="number" v-model="quantity" min="1" />
        </div>
        <div class="button-group">
          <button class="cart-btn">加入購物車</button> <!-- !!!!!!!給仔瑋的!!!!!!! -->
          <button class="favorite-btn">加入最愛</button> <!-- !!!!!!!給r謙的!!!!!!! -->
        </div>
      </div>
    </div>

    <!-- 警語 -->
    <div class="warning-text">
    <transition name="slide-up" mode="out-in">
    <p :key="currentWarning">{{ warningMessages[currentWarning] }}</p>
    </transition>
    </div>
    <!-- 推薦商品 -->
    <div class="recommendation-section">
      <h3>你可能也會喜歡 🍜</h3>
      <div class="recommendation-list">
        <div class="recommend-card" v-for="item in recommendedProducts" :key="item.id">
          <img :src="item.image" :alt="item.name" />
          <p class="name">{{ item.name }}</p>
          <p class="price">NT$ {{ item.price }}</p>
        </div>
      </div>
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

/* 滑動動畫（下一張） */
.next-enter-active, .next-leave-active,
.prev-enter-active, .prev-leave-active {
  transition: all 0.5s ease;
  position: absolute;
}
.next-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.next-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* 滑動動畫（上一張） */
.prev-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.prev-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 容器確保滑動不爆版 */
.image-slider {
  position: relative;
  overflow: hidden;
}
.product-image {
  position: relative;
  z-index: 1;
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

/* 商品規格 */
.product-specs {
  margin-top: 20px;
}
.product-specs ul {
  padding-left: 20px;
}
.product-specs li {
  margin-bottom: 5px;
  font-size: 16px;
}

/* 商品規格 - 表單樣式 */
.product-specs-form {
  margin-top: 30px;
  padding: 25px 30px;
  background-color: #fff0f9;
  border: 2px dashed #e2a8d7;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(220, 160, 210, 0.15);
}

.spec-title {
  font-size: 22px;
  font-weight: bold;
  color: #b046a6;
  margin-bottom: 20px;
  border-bottom: 2px solid #f5c5ea;
  padding-bottom: 8px;
}

.spec-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.spec-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 15px;
  background-color: #ffeaf6;
  border-radius: 12px;
  transition: background-color 0.3s ease;
}

.spec-row:hover {
  background-color: #fdd4ee;
}

.spec-label {
  font-weight: bold;
  color: #a343a2;
  width: 120px;
  flex-shrink: 0;
}

.spec-value {
  color: #444;
  flex-grow: 1;
  text-align: right;
}

/* 數量選擇器 */
.quantity-box {
  margin-top: 15px;
  font-size: 16px;
}
.quantity-box input {
  width: 60px;
  margin-left: 10px;
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

/* 推薦商品區塊 */
.recommendation-section {
  margin-top: 80px;
}
.recommendation-section h3 {
  font-size: 24px;
  color: #a43f96;
  text-align: center;
  margin-bottom: 20px;
}
.recommendation-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
}
.recommend-card {
  width: 200px;
  background-color: #fff0f8;
  padding: 15px;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s ease;
}
.recommend-card:hover {
  transform: translateY(-5px);
}
.recommend-card img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 10px;
}
.recommend-card .name {
  font-weight: bold;
  color: #cc3c9b;
}
.recommend-card .price {
  color: #888;
  margin-top: 5px;
}
</style>