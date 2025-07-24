<script setup>
// ========================================================================
// 區塊 1：Setup & 引入
// ========================================================================
import { ref, onMounted, computed } from 'vue';
import api from '@/services/jjapi.js'; 
// 以下兩個元件在此頁面可能不需要，但先保留，以防未來需要
import HelpfulnessVoting from './HelpfulnessVoting.vue';
import ReportModal from './ReportModal.vue';

// ========================================================================
// 區塊 2：Props
// 【核心修正】「我的評論紀錄」頁面不需要從外部接收任何 props，
// 因為它應該自動根據登入狀態去抓取資料。所以我們將整個 defineProps 區塊移除。
// ========================================================================
// const props = defineProps({
//   productId: {
//     type: Number,
//     required: true
//   }
// });

// ========================================================================
// 區塊 3：響應式狀態定義
// ========================================================================
const BACKEND_URL = 'https://localhost:7017';
const reviews = ref([]);
const isLoading = ref(true);
const error = ref(null);
const showReportModal = ref(false); 
const reportingReviewId = ref(null);

// ========================================================================
// 區塊 4：計算屬性
// ========================================================================
const averageRating = computed(() => {
  if (!reviews.value || reviews.value.length === 0) return 0;
  const total = reviews.value.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.value.length).toFixed(1);
});

// ========================================================================
// 區塊 5：API 呼叫函式
// ========================================================================
const fetchMyReviews = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // vvvvvvvvvv 【核心修正】 vvvvvvvvvvvv
    // 我們現在呼叫的是專門用來獲取「我的評論」的後端 API。
    // 這個 API 不需要任何參數，它會自動從你請求附帶的 Token 中解析出 UserId。
    const response = await api.get(`/reviews`);
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    reviews.value = response.data;
  } catch (err) {
    // 增加對 401 未授權錯誤的處理，提供更友善的提示
    if (err.response && err.response.status === 401) {
        error.value = '您需要登入才能查看評論紀錄。';
    } else {
        error.value = '無法載入您的評論紀錄。';
    }
    console.error(`取得我的評論失敗:`, err);
  } finally {
    isLoading.value = false;
  }
};

// ========================================================================
// 區塊 6：檢舉 Modal 相關方法 (可以保留)
// ========================================================================
const openReportModal = (reviewId) => {
  reportingReviewId.value = reviewId;
  showReportModal.value = true;
};
const closeReportModal = () => {
  showReportModal.value = false;
  reportingReviewId.value = null;
};

// ========================================================================
// 區塊 7：生命週期鉤子
// ========================================================================
onMounted(() => {
  fetchMyReviews(); // 呼叫修正後的函式
});
</script>

<template>
  <div class="review-section my-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0">我的評論紀錄 ({{ reviews.length }})</h3>
      <div v-if="reviews.length > 0" class="average-rating">
        <strong>平均評分: {{ averageRating }}</strong> / 5
        <span class="star filled ms-1">★</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-warning">{{ error }}</div>
    <div v-if="isLoading" class="text-center py-4"><div class="spinner-border"></div></div>

    <div v-if="!isLoading && reviews.length > 0" class="review-list">
      <div v-for="review in reviews" :key="review.reviewId" class="review-card card mb-3">
        <div class="card-body">
          <div class="review-header d-flex align-items-start mb-2">
            <div class="flex-grow-1">
              <small class="text-muted">針對商品</small>
              <h6 class="card-title mb-0">{{ review.productName || '商品名稱' }}</h6>
            </div>
            <div class="ms-auto text-end">
              <div class="rating-stars mb-2">
                <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= review.rating }">★</span>
              </div>
              <small class="text-muted">{{ new Date(review.createdAt).toLocaleDateString() }}</small>
            </div>
          </div>
          <p class="card-text mt-3">{{ review.comment }}</p>
          <div v-if="review.attachments && review.attachments.length > 0" class="attachments mt-2">
            </div>
          <div v-if="review.response" class="official-response mt-3 p-3">
            <strong>店家回覆：</strong> {{ review.response }}
          </div>

          <div v-if="!review.status" class="hidden-review-warning mt-3">
            此評論已隱藏！被檢舉原因：{{ review.hiddenReason || '管理員未提供特定原因' }}，有問題請洽客服。
          </div>

        </div>
      </div>
    </div>
    
    <div v-if="!isLoading && reviews.length === 0" class="text-center text-muted py-4">
      <p>您尚未發表任何評論。</p>
    </div>
    
    <ReportModal v-if="showReportModal" :review-id="reportingReviewId" @close="closeReportModal" />
  </div>
</template>

<style scoped>
/* 你的樣式完全不需要修改，可以保持原樣 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.review-section { max-width: 800px; margin-left: auto; margin-right: auto; }
.review-card { border-left: 4px solid #92559c; } /* 改回紫色系，代表「我的」 */
.star { color: #e0e0e0; font-size: 1.5rem; } 
.star.filled { color: #ffa600; }
.attachments img { width: 80px; height: 80px; object-fit: cover; cursor: pointer; transition: transform 0.2s ease; }
.attachments img:hover { transform: scale(1.1); }
.official-response { background-color: #f6f6f6; border-radius: 5px; border: 1px solid #eee; }
.review-actions .btn-link { text-decoration: none; font-size: 0.8rem; }
.review-actions .btn-link:hover { text-decoration: underline; }
.hidden-review-warning {
    background-color: #f8d7da; /* 粉紅底 */
    color: #842029; /* 紅字 */
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    border: 1px solid #f5c2c7;
    font-size: 0.9rem;
}
</style>
