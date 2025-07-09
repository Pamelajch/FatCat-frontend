<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import HelpfulnessVoting from './HelpfulnessVoting.vue';
import axios from 'axios';

// --- Props ---
const props = defineProps({
  productId: {
    type: Number,
    required: true
  }
});

// --- 響應式狀態定義 ---
const API_BASE_URL = 'https://localhost:7017/api';
const BACKEND_URL = 'https://localhost:7017';

const reviews = ref([]);
const isLoading = ref(true);
const error = ref(null);

// 新評論的表單資料
const newReview = reactive({
  rating: 5,
  comment: '',
  files: [] // 用來儲存使用者選擇的檔案
});



// --- 計算屬性 ---
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
    const response = await axios.get(`${API_BASE_URL}/products/${props.productId}/reviews`);
    // 直接使用後端回傳的資料，因為後端已經幫我們算好 currentUserVote 了
    reviews.value = response.data; // <--- 
  } catch (err) {
    console.error(`取得商品 ${props.productId} 的評論失敗:`, err);
    error.value = '無法載入評論。';
  } finally {
    isLoading.value = false;
  }
};

const handleFileChange = (event) => {
  newReview.files = Array.from(event.target.files);
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
          <div class="review-header d-flex align-items-start mb-2">
            <!-- 使用者資訊 -->
            <div class="d-flex align-items-center">
              <img :src="`https://ui-avatars.com/api/?name=${review.userName || '?'}&background=92559c&color=fff`" class="rounded-circle me-3" alt="user avatar">
              <div>
                <h6 class="card-title mb-0">{{ review.userName || '匿名使用者' }}</h6>
                <small class="text-muted">{{ new Date(review.createdAt).toLocaleDateString() }}</small>
              </div>
            </div>
            
            <div class="ms-auto text-end">
              <!-- 星星評分 -->
              <div class="rating-stars mb-2">
                <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= review.rating }">★</span>
              </div>
              <!-- 互動按鈕區 -->
              <div class="review-actions d-flex align-items-center gap-2">
                 <!-- 嵌入有用 沒用 -->
                <HelpfulnessVoting
                  :review-id="review.reviewId"
                  :initial-count="review.helpfulnessCount"
                  :initial-user-vote="review.currentUserVote"  
                />
                <button @click="openReportModal(review.reviewId)" class="btn btn-sm btn-link text-danger p-0" title="檢舉此評論">
                <i class="fas fa-flag"></i> 檢舉
                </button>
              </div>
            </div>
          </div>

          <p class="card-text mt-3">{{ review.comment }}</p>
          
          <div v-if="review.attachments && review.attachments.length > 0" class="attachments mt-2">
            <a v-for="att in review.attachments" :key="att.filePath" :href="`${BACKEND_URL}${att.filePath}`" target="_blank" title="點擊放大">
              <img :src="`${BACKEND_URL}${att.filePath}`" class="img-thumbnail me-2" alt="review attachment">
            </a>
          </div>

          <div v-if="review.response" class="official-response mt-3 p-3">
            <strong>店家回覆：</strong> {{ review.response }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!isLoading && reviews.length === 0" class="text-center text-muted py-4">
      <p>還沒有任何評論，快來搶頭香！</p>
    </div>

    
  </div>

  <!-- 👇 6. 在這裡使用你的新元件 -->
  <!-- 
    - v-if="showReportModal": 根據狀態決定是否顯示
    - :reviewId="reportingReviewId": 把要檢舉的 ID 傳給子元件
    - @close="closeReportModal": 監聽子元件發出的 'close' 事件
  -->
  <ReportModal 
    v-if="showReportModal" 
    :review-id="reportingReviewId"
    @close="closeReportModal" 
  />

  
</template>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.review-section { max-width: 800px; margin-left: auto; margin-right: auto; }
.review-card { border-left: 4px solid #d3a2da; }
.star { color: #e0e0e0; font-size: 1.5rem; } 
.star.filled { color: #ffa600; }
.attachments img { width: 80px; height: 80px; object-fit: cover; cursor: pointer; transition: transform 0.2s ease; }
.attachments img:hover { transform: scale(1.1); }
.official-response { background-color: #f6f6f6; border-radius: 5px; border: 1px solid #eee; }
.helpfulness-voting .btn { font-size: 0.8rem; padding: 0.2rem 0.5rem; }
.review-actions .btn-link { text-decoration: none; font-size: 0.8rem; }
.review-actions .btn-link:hover { text-decoration: underline; }
.rating-input .star { font-size: 2rem; cursor: pointer; transition: color 0.2s ease-in-out; }
.rating-input .star:hover { color: #ffd966; }
</style>
