<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
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

// --- 👇👇👇【已補上】檢舉功能的完整狀態 👇👇👇 ---
const reportModal = ref(null); // 用於控制 Bootstrap Modal 的實例
const reportReasons = ref([]); // 儲存從後端取回的檢舉原因列表
const isFetchingReasons = ref(false); // 追蹤是否正在讀取原因
const currentReport = reactive({ // 儲存當前正在處理的檢舉資料
  reviewId: null,
  reasonTypeId: '',
  reasonComment: ''
});
// --- 補上結束 ---


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
    // 在拿到資料後，為每一則評論加上一個本地的投票狀態，方便 UI 互動
    reviews.value = response.data.map(review => ({
      ...review,
      currentUserVote: null // null: 未投票, true: 有幫助, false: 沒幫助
    }));
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

const submitReview = async () => {
  const formData = new FormData();
  formData.append('Rating', newReview.rating);
  formData.append('Comment', newReview.comment);
  
  if (newReview.files.length > 0) {
    for (const file of newReview.files) {
      formData.append('Files', file);
    }
  }

  try {
    await axios.post(`${API_BASE_URL}/products/${props.productId}/reviews`, formData);
    alert('評論已成功送出！');
    
    newReview.rating = 5;
    newReview.comment = '';
    newReview.files = [];
    document.getElementById('reviewFiles').value = '';
    
    fetchReviews();

  } catch (err) {
    console.error('提交評論失敗:', err);
    alert('提交評論失敗，請稍後再試。');
  }
};

// --- 👇👇👇【已補上】檢舉與投票的完整函式 👇👇👇 ---

const voteForReview = async (review, voteType) => {
  if (review.currentUserVote === voteType) return;

  try {
    const previousVote = review.currentUserVote;
    review.currentUserVote = voteType;

    if (voteType === true) {
      review.helpfulnessCount++;
    } else {
      if (previousVote === true) {
        review.helpfulnessCount--;
      }
    }
    
    await axios.post(`${API_BASE_URL}/reviews/${review.reviewId}/helpfulness`, {
      isHelpful: voteType
    });

  } catch (err) {
    console.error('投票失敗:', err);
    alert('投票失敗，請稍後再試。');
  }
};

const fetchReportReasons = async () => {
  if (reportReasons.value.length > 0) return;
  isFetchingReasons.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/reviews/report-reasons`);
    reportReasons.value = response.data;
  } catch (err) {
    console.error('取得檢舉原因失敗:', err);
    alert('無法載入檢舉原因，請稍後再試。');
  } finally {
    isFetchingReasons.value = false;
  }
};

const openReportModal = (reviewId) => {
  currentReport.reviewId = reviewId;
  currentReport.reasonTypeId = '';
  currentReport.reasonComment = '';
  fetchReportReasons();
  const modal = new bootstrap.Modal(reportModal.value);
  modal.show();
};

const submitReport = async () => {
  if (!currentReport.reasonTypeId) {
    alert('請選擇一個檢舉原因。');
    return;
  }
  try {
    const payload = {
      reasonTypeId: currentReport.reasonTypeId,
      reasonComment: currentReport.reasonComment
    };
    await axios.post(`${API_BASE_URL}/reviews/${currentReport.reviewId}/report`, payload);
    const modal = bootstrap.Modal.getInstance(reportModal.value);
    modal.hide();
    alert('感謝您的檢舉，我們將會盡快處理。');
  } catch (err) {
    console.error('提交檢舉失敗:', err);
    alert('提交失敗，請稍後再試。');
  }
};
// --- 補上結束 ---

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
              <div class="review-actions d-flex align-items-center">
                 <div class="helpfulness-voting">
                    <button @click="voteForReview(review, true)" class="btn btn-sm" :class="review.currentUserVote === true ? 'btn-success' : 'btn-outline-secondary'">
                      <i class="fas fa-thumbs-up"></i> ({{ review.helpfulnessCount }})
                    </button>
                    <button @click="voteForReview(review, false)" class="btn btn-sm ms-2" :class="review.currentUserVote === false ? 'btn-danger' : 'btn-outline-secondary'">
                      <i class="fas fa-thumbs-down"></i>
                    </button>
                  </div>
                <button @click="openReportModal(review.reviewId)" class="btn btn-sm btn-link text-danger p-0 ms-3" title="檢舉此評論">
                  <i class="fas fa-flag"></i>
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

  <!-- 檢舉 Modal -->
  <div class="modal fade" id="reportModal" tabindex="-1" ref="reportModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">檢舉不當評論</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="isFetchingReasons" class="text-center">
            <div class="spinner-border spinner-border-sm"></div>
          </div>
          <form v-else @submit.prevent="submitReport">
            <div class="mb-3">
              <label for="reportReason" class="form-label">請選擇檢舉原因：</label>
              <select class="form-select" id="reportReason" v-model="currentReport.reasonTypeId" required>
                <option disabled value="">請選擇...</option>
                <option v-for="reason in reportReasons" :key="reason.reasonTypeId" :value="reason.reasonTypeId">
                  {{ reason.reasonName }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="reportComment" class="form-label">補充說明 (可選填)：</label>
              <textarea class="form-control" id="reportComment" rows="3" v-model="currentReport.reasonComment"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
          <button type="button" class="btn btn-danger" @click="submitReport">送出檢舉</button>
        </div>
      </div>
    </div>
  </div>
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
