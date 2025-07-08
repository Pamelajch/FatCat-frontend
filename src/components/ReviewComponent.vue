<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- Props ---
// 這個元件接收一個來自父層的 productId
const props = defineProps({
  productId: {
    type: Number,
    required: true
  }
});

// --- 響應式狀態定義 ---
const API_URL = `https://localhost:7017/api/products/${props.productId}/reviews`;
const BACKEND_URL = 'https://localhost:7017';

const reviews = ref([]);
const isLoading = ref(true);
const error = ref(null);

// 新評論的表單資料
const newReview = ref({
  rating: 5,
  comment: '',
  files: []
});

// --- 計算屬性 (Computed Properties) ---
// 計算平均評分和總評論數
const averageRating = computed(() => {
  if (!reviews.value || reviews.value.length === 0) return 0;
  const total = reviews.value.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.value.length).toFixed(1);
});

// --- API 呼叫函式 ---
const fetchReviews = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(API_URL);
    reviews.value = response.data;
  } catch (err) {
    console.error(`取得商品 ${props.productId} 的評論失敗:`, err);
    error.value = '無法載入評論。';
  } finally {
    isLoading.value = false;
  }
};

// 提交新評論
const submitReview = async () => {
  // 之後在這裡加入呼叫 POST API 的邏輯
  alert(`提交評論：\n評分: ${newReview.value.rating}\n內容: ${newReview.value.comment}`);
  // 成功後清空表單
  newReview.value.rating = 5;
  newReview.value.comment = '';
};

// --- 生命週期鉤子 ---
onMounted(() => {
  fetchReviews();
});

</script>

<template>
  <div class="review-section my-5">
    <!-- 標題和平均評分 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0">顧客評論 ({{ reviews.length }})</h3>
      <div v-if="reviews.length > 0" class="average-rating">
        <strong>{{ averageRating }}</strong> / 5
        <span class="star filled ms-1">★</span>
      </div>
    </div>

    <!-- 錯誤或載入中訊息 -->
    <div v-if="error" class="alert alert-warning">{{ error }}</div>
    <div v-if="isLoading" class="text-center py-4"><div class="spinner-border"></div></div>

    <!-- 評論列表 -->
    <div v-if="!isLoading && reviews.length > 0" class="review-list">
      <div v-for="review in reviews" :key="review.reviewId" class="review-card card mb-3">
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <!-- 使用者頭像 (暫用預設圖) -->
            <img :src="`https://ui-avatars.com/api/?name=${review.userName || '?'}&background=92559c&color=fff`" class="rounded-circle me-3" alt="user avatar">
            <div>
              <h6 class="card-title mb-0">{{ review.userName || '匿名使用者' }}</h6>
              <small class="text-muted">{{ new Date(review.createdAt).toLocaleDateString() }}</small>
            </div>
            <div class="ms-auto">
              <!-- 星星評分 -->
              <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= review.rating }">★</span>
            </div>
          </div>
          <p class="card-text">{{ review.comment }}</p>
          
          <!-- 👇👇👇【這就是我們新增的區塊】👇👇👇 -->
          <!-- 附件圖片 -->
          <div v-if="review.attachments && review.attachments.length > 0" class="attachments mt-2">
            <!-- 用 v-for 遍歷所有附件 -->
            <a v-for="att in review.attachments" :key="att.filePath" :href="`${BACKEND_URL}${att.filePath}`" target="_blank" title="點擊放大">
              <!-- 組合出完整的圖片 URL -->
              <img :src="`${BACKEND_URL}${att.filePath}`" class="img-thumbnail me-2" alt="review attachment">
            </a>
          </div>

          <!-- 官方回覆 -->
          <div v-if="review.response" class="official-response mt-3 p-3">
            <strong>店家回覆：</strong> {{ review.response }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 沒有評論時的訊息 -->
    <div v-if="!isLoading && reviews.length === 0" class="text-center text-muted py-4">
      <p>還沒有任何評論，快來搶頭香！</p>
    </div>

    <!-- 發表評論表單 (之後可以根據登入狀態顯示) -->
    <div class="add-review-form card mt-4">
      <div class="card-header">發表你的評論</div>
      <div class="card-body">
        <form @submit.prevent="submitReview">
          <div class="mb-3">
            <label class="form-label">你的評分</label>
            <div>
              <!-- 簡單的星星評分選擇 -->
            </div>
          </div>
          <div class="mb-3">
            <label for="comment" class="form-label">評論內容</label>
            <textarea id="comment" v-model="newReview.comment" class="form-control" rows="3" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">提交評論</button>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
.review-section { max-width: 800px; margin-left: auto; margin-right: auto; }
.review-card { border-left: 4px solid #d3a2da; }
.star { color: #e0e0e0; font-size: 1.2rem; }
.star.filled { color: #ffa600; }
/* 附件圖片的樣式 */
.attachments img { 
  width: 80px; 
  height: 80px; 
  object-fit: cover; /* 確保圖片不變形 */
  cursor: pointer;
  transition: transform 0.2s ease;
}
.attachments img:hover {
  transform: scale(1.1); /* 滑鼠移過時放大一點 */
}
.official-response { background-color: #f6f6f6; border-radius: 5px; border: 1px solid #eee; }
</style>
