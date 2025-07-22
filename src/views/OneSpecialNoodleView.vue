<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import ProductReview from '@/components/ProductReview.vue'
import api from '@/services/jjapi.js'; // 【rr：引入 api 實例】
import { useAuthStore } from '@/stores/auth'; // 【rr：引入 Pinia Auth Store】

const route = useRoute()
const productId = route.query.id
const authStore = useAuthStore(); // by rr

// ====== 通知流程 ======
// ====== 通知流程：卡牌版 ======
const currentStep = ref(0)

const nextStep = () => {
  if (currentStep.value === 0) {
    const card = document.querySelector('.card-image')
    if (card) {
      card.classList.add('drop')
    }
    setTimeout(() => {
      currentStep.value = 1
    }, 600)
  } else if (currentStep.value === 1) {
    currentStep.value = 2
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

// 【rr：加入收藏的函式】
const addToFavorites = async () => {
  // 型別轉換
  const numericProductId = Number(productId);

  if (!numericProductId) {
    alert('無效的商品 ID，無法加入收藏。');
    return;
  }
  
  if (!authStore.isAuthenticated) {
    alert('請先登入會員，才能將商品加入收藏！');
    return;
  }
  try {
    const response = await api.post('/favorites', { 
      productId: numericProductId // <--- 使用轉換後的數字 ID
    });
    
    alert(response.data.message || '操作成功！');
    
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.response?.data || '加入收藏失敗，請稍後再試。';
    alert(errorMessage);
    console.error(`將商品 #${numericProductId} 加入收藏失敗:`, err);
  }
};
// 【rr：加入收藏 結束】


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

onMounted(() => {
  fetchProductDetail()
})
</script>

<template>
<!-- 通知畫面 -->
<div v-if="currentStep < 2" class="notification-wrapper">
  <div class="card-stage">
    <!-- 第一張卡牌 -->
    <div v-if="currentStep === 0" class="first-card-wrapper">
      <img
        src="/message-card.png"
        alt="提示卡片"
        class="card-image glow"
      />
      <div class="card-message">
        <p>親愛的貓貓們，特殊款泡麵無法更換配料 🍜</p>
      </div>
    </div>

    <!-- 第二張卡牌 -->
    <transition name="fade-rise">
      <div v-if="currentStep === 1" class="second-card-wrapper">
        <img
          src="/message-card1.png"
          alt="提示卡片2"
          class="card-image glow"
        />
        <div class="card-message">
          <p>自定義泡麵請前往商品列表 👉</p>
        </div>
      </div>
    </transition>

    <!-- 按鈕 -->
    <button class="next-btn" @click="nextStep">
      {{ currentStep === 0 ? '繼續 ➜' : '進入 ➜' }}
    </button>
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
          <button 
            v-if="authStore.isAuthenticated" 
            class="favorite-btn" 
            @click="addToFavorites">
            加入最愛
          </button> <!-- !!!!!!!給r謙的!!!!!!!  RRR已完成-->
        </div>
      </div>
    </div>

    <!-- 警語 -->
    <div class="warning-text">
    <transition name="slide-up" mode="out-in">
    <p :key="currentWarning">{{ warningMessages[currentWarning] }}</p>
    </transition>
    </div>
    <!-- 商品評論區（rr已做好 🐱）--> 
    <div class="review-section">
      <h3>⭐ 貓貓們的評論區</h3>
      <div class="review-box"> 
        <!-- RRRRRRRRRR 評論區 -->
        <ProductReview :product-id="route.query.id" />
      </div>
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
/* ===== 通知樣式（魔法卡牌版） ===== */
.notification-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #fff0fa, #ffe4ec);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.card-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 卡牌圖片樣式 */
.card-image {
  width: 360px;
  height: auto;
  transition: transform 0.5s ease, opacity 0.5s ease;
  z-index: 1;
  border-radius: 20px;
}

/* 掉落動畫 */
.card-image.drop {
  transform: translateY(100vh);
  opacity: 0;
}

/* 第二張卡牌浮現動畫 */
.fade-rise-enter-active {
  transition: all 0.6s ease;
}
.fade-rise-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

/* 光暈特效 */
.glow {
  animation: glowPulse 2s infinite alternate;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

@keyframes glowPulse {
  from {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  }
  to {
    box-shadow: 0 0 35px rgba(255, 255, 255, 0.8);
  }
}

/* 第二張卡牌包裝 */
.second-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 留言文字區塊 */
.card-message {
  margin-top: 20px;
  text-align: center;
  animation: fadeIn 1s ease-in-out;
  color: #b03b97;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 0 6px rgba(255, 180, 255, 0.6);
}

.card-message p {
  margin: 8px 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下一步按鈕 */
.next-btn {
  margin-top: 20px;
  background-color: #ffb8e2;
  border: none;
  color: white;
  font-weight: bold;
  font-size: 16px;
  padding: 10px 25px;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 120, 200, 0.3);
  transition: all 0.3s ease;
}
.next-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(255, 120, 200, 0.5);
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

/* rr評論區的簡單小樣式 */
.review-section {
  margin-top: 80px;
  text-align: center;
}

.review-section h3 {
  font-size: 24px;
  color: #a43f96;
  margin-bottom: 20px;
}

.review-box {
  margin: 0 auto;
  max-width: 700px;
  min-height: 120px;
  padding: 30px;
  background: rgba(255, 240, 250, 0.5);
  border-radius: 20px;
  border: 2px dashed #dba6d6;
  box-shadow: 0 4px 10px rgba(200, 100, 160, 0.1);
  backdrop-filter: blur(5px);
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