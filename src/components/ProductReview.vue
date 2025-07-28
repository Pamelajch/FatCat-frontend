<script setup>
// ========================================================================
// 區塊 1：Setup & 引入
// 作用：從 Vue 和其他外部套件中，引入這個元件需要用到的所有工具和子元件。
// ========================================================================
import { ref, onMounted, computed,watch } from 'vue'; 
import api from '@/services/jjapi.js';          // 引入我們封裝好的 axios 實例，用於 API 請求
import HelpfulnessVoting from './HelpfulnessVoting.vue'; 
import ReportModal from './ReportModal.vue';       
import { useAuthStore } from '@/stores/auth';      // 引入 Pinia store 來取得使用者登入狀態

// ========================================================================
// 區塊 2：Props
// 作用：定義這個元件可以接收來自父元件的參數。就像函式的參數一樣。
// ========================================================================
const props = defineProps({
  // 這個元件必須由父層（商品單品頁）傳入一個 productId，才能知道要抓取哪個商品的評論
  productId: {
    type: Number,
    required: true
  }
});


// ========================================================================
// 區塊 3：響應式狀態定義
// 作用：定義所有會隨時間或使用者互動而改變的變數。
// ========================================================================
const BACKEND_URL = 'https://localhost:7017'; // 後端網址，主要用於拼接圖片路徑
const reviews = ref([]);           // 用來儲存從 API 獲取的最原始的評論列表
const isLoading = ref(true);       // 控制載入中 spinner 的顯示/隱藏
const error = ref(null);           // 儲存 API 請求失敗時的錯誤訊息
const showReportModal = ref(false);    // 控制檢舉彈窗的顯示/隱藏
const reportingReviewId = ref(null); // 儲存使用者正在檢舉的是哪一則評論的 ID
const authStore = useAuthStore();    // 建立 Auth store 的實例，方便在 template 中使用
const currentSort = ref('default');  // 【排序功能】儲存使用者當前選擇的排序方式
const showImageModal = ref(false);// 【圖片 Modal 功能】新增控制圖片 Modal 的狀態
const selectedImage = ref(null);
const currentPage = ref(1); // 當前頁碼，預設為第 1 頁
const itemsPerPage = 5;   // 每頁顯示 5 筆資料
// ========================================================================
// 區塊 4：計算屬性 (Computed Properties)
// 作用：基於響應式狀態，衍生出新的數據。它有快取機制，只有在依賴的數據變化時才會重新計算，效能極佳。
// ========================================================================

// 計算所有評論的平均分數
const averageRating = computed(() => {
  if (!reviews.value || reviews.value.length === 0) return 0;
  const total = reviews.value.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.value.length).toFixed(1);
});

// 分頁相關的計算屬性
const totalPages = computed(() => {
  // 改為根據「排序後」的陣列長度來計算總頁數
  return Math.ceil(sortedReviews.value.length / itemsPerPage); 
});

const paginatedReviews = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // 改為對「排序後」的陣列進行切割
  return sortedReviews.value.slice(startIndex, endIndex); 
});

// 【排序功能】根據 currentSort 的值，回傳一個排序好的新陣列
const sortedReviews = computed(() => {
  // 建立一個原始評論陣列的「複本」，這樣排序時才不會影響到原始 API 數據
  const sorted = [...reviews.value];

  switch (currentSort.value) {
    case 'rating_desc':
      return sorted.sort((a, b) => b.rating - a.rating); // 評價由高至低
    case 'rating_asc':
      return sorted.sort((a, b) => a.rating - b.rating); // 評價由低至高
    case 'date_desc':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 日期由新至舊
    case 'date_asc':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // 日期由舊至新
    case 'attachments_first':
      // 有圖片的評論優先，(true=1) - (false=0) = 1，所以 b 會排在 a 前面
      return sorted.sort((a, b) => (b.attachments?.length > 0) - (a.attachments?.length > 0));
    default:
      // 'default' 或其他情況，直接回傳原始陣列
      return reviews.value;
  }
});

// 監聽排序選項的變化
watch(currentSort, () => {
  // 當使用者切換排序方式時，自動跳回第一頁
  currentPage.value = 1;
});

// ========================================================================
// 區塊 5：API 呼叫函式
// 作用：定義與後端 API 溝通的非同步函式。
// ========================================================================
const fetchReviews = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    if (isNaN(props.productId)) throw new Error("無效的商品 ID。");
    const response = await api.get(`/public/products/${props.productId}/reviews`);
    reviews.value = response.data; // 將獲取的數據存入 reviews ref
  } catch (err) {
    console.error(`取得商品 ${props.productId} 的評論失敗:`, err);
    error.value = '無法載入評論。';
  } finally {
    isLoading.value = false;
  }
};

// ========================================================================
// 區塊 6：檢舉 Modal 相關方法
// 作用：定義控制 UI 行為的函式。
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
// 區塊 6.5：圖片 Modal 相關方法
// ========================================================================
const getImageUrl = (filePath) => {
  // 如果 filePath 已經是完整的 URL，就直接回傳，否則進行拼接
  if (!filePath) return '';
  return filePath.startsWith('http') ? filePath : `${BACKEND_URL}${filePath}`;
};

const openImageModal = (imagePath) => {
  selectedImage.value = getImageUrl(imagePath);
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  selectedImage.value = null; // 最好在關閉時清除，避免舊圖片殘留
};

// ========================================================================
// 區塊 7：生命週期鉤子 (Lifecycle Hooks)
// 作用：在元件生命週期的特定時間點自動執行的函式。
// ========================================================================
onMounted(() => {
  // onMounted 會在元件第一次被渲染到畫面上時執行一次，是發起初始 API 請求的最佳時機。
  fetchReviews();
});
</script>

<template>
  <div class="review-section my-5">
    
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h3 class="mb-0">顧客評論 ({{ reviews.length }})</h3>
      
      <div class="d-flex align-items-center gap-3">
        <div class="sort-control">
          <label for="review-sort" class="form-label me-2 visually-hidden">排序</label>
          <select id="review-sort" class="form-select form-select-sm" v-model="currentSort">
            <option value="default">預設排序</option>
            <option value="date_desc">最新</option>
            <option value="date_asc">最早</option>
            <option value="rating_desc">評價：由高至低</option>
            <option value="rating_asc">評價：由低至高</option>
            <option value="attachments_first">有圖片優先</option>
          </select>
        </div>

        <div v-if="reviews.length > 0" class="average-rating d-flex align-items-center">
          <strong class="fs-5">{{ averageRating }}</strong>
          <span class="text-muted mx-1">/ 5</span>
          <span class="star filled">★</span>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-warning">{{ error }}</div>
    <div v-if="isLoading" class="text-center py-4"><div class="spinner-border"></div></div>

    <div v-if="!isLoading && reviews.length > 0" class="review-list">
      
      <div v-for="review in paginatedReviews" :key="review.reviewId" class="review-card card mb-3">
        <div class="card-body">
          <div class="review-header d-flex align-items-start mb-2">
            <div class="d-flex align-items-center">
              <img :src="`https://ui-avatars.com/api/?name=${review.userName || '?'}&background=0d6efd&color=fff`" class="rounded-circle me-3" alt="user avatar">
              <div>
                <h6 class="card-title mb-0">{{ review.userName || '匿名使用者' }}</h6>
                <small class="text-muted">{{ new Date(review.createdAt).toLocaleDateString() }}</small>
              </div>
            </div>
            
            <div class="ms-auto text-end">
              <div class="rating-stars mb-2">
                <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= review.rating }">★</span>
              </div>
              <div v-if="authStore.isAuthenticated" class="review-actions d-flex align-items-center gap-2">
                <HelpfulnessVoting :review-id="review.reviewId" :initial-count="review.helpfulnessCount" :initial-user-vote="review.currentUserVote" />
                <button @click="openReportModal(review.reviewId)" class="btn btn-sm btn-link text-danger p-0" title="檢舉此評論">
                  <i class="fas fa-flag"></i> 檢舉
                </button>
              </div>
            </div>
          </div>

          <p class="card-text mt-3">{{ review.comment }}</p>
          
          <div v-if="review.attachments && review.attachments.length > 0" class="attachments mt-2">
            <small class="text-muted d-block mb-2">附件照片：</small>
            <div class="attachment-grid">
              <img 
                v-for="att in review.attachments" 
                :key="att.filePath" 
                :src="getImageUrl(att.filePath)"
                :alt="att.fileName || 'review attachment'"
                class="attachment-thumbnail"
                @click="openImageModal(att.filePath)"
                @error="$event.target.src = '/images/products/default.jpg'"
              />
            </div>
          </div>

          <div v-if="review.response" class="official-response mt-3 p-3">
            <strong>店家回覆：</strong> {{ review.response }}
          </div>
        </div>
      </div>
      <nav v-if="totalPages > 1" class="d-flex justify-content-center mt-4"> 
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="currentPage--">
              <span>&laquo;</span>
            </a>
          </li>
          <li 
            v-for="pageNumber in totalPages" 
            :key="pageNumber" 
            class="page-item" 
            :class="{ active: currentPage === pageNumber }"
          >
            <a class="page-link" href="#" @click.prevent="currentPage = pageNumber">
              {{ pageNumber }}
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="currentPage++">
              <span>&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
    <div v-if="!isLoading && reviews.length === 0" class="text-center text-muted py-4">
      <p>還沒有任何評論，快來搶頭香！</p>
    </div>
    
    <Teleport to="body">
  <div 
    v-if="showImageModal" 
    class="image-modal-overlay" 
    @click="closeImageModal"
  >
    <div class="image-modal-content" @click.stop>
      <i class="fas fa-times image-modal-close" @click="closeImageModal"></i>
      <img 
        :src="selectedImage" 
        alt="預覽圖片" 
        class="modal-image"
      />
    </div>
  </div>
</Teleport>

 <ReportModal v-if="showReportModal" :review-id="reportingReviewId" @close="closeReportModal" />

  </div> </template>



<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.review-section { max-width: 800px; margin-left: auto; margin-right: auto; }
.review-card { border-left: 4px solid #0d6efd; }
.star { color: #e0e0e0; font-size: 1.5rem; } 
.star.filled { color: #ffa600; }
.official-response { background-color: #f6f6f6; border-radius: 5px; border: 1px solid #eee; }
.review-actions .btn-link { text-decoration: none; font-size: 0.8rem; }
.review-actions .btn-link:hover { text-decoration: underline; }
.sort-control { max-width: 180px; }
/* --- 附件縮圖樣式 --- */
.attachment-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* 圖片間距 */
}

.attachment-thumbnail {
  width: 80px; 
  height: 80px; 
  object-fit: cover; 
  cursor: pointer;
  transition: opacity 0.2s ease;
  border-radius: 4px;
  border: 1px solid #dee2e6; /* 沿用 bootstrap img-thumbnail 的邊框色 */
}

.attachment-thumbnail:hover {
  opacity: 0.8;
}

/* --- 圖片 Modal 彈窗樣式 --- */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 15px;
}

.image-modal-content {
  position: relative;
  display: flex;
}

.modal-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.image-modal-close {
  position: absolute;
  top: -15px;
  right: -15px;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
  text-shadow: 0 0 8px rgba(0,0,0,0.8);
}

.image-modal-close:hover {
  transform: scale(1.2);
}

/* 頁碼的按鈕樣式 */
.pagination .page-item.active .page-link {
  background-color: #92559c; 
  border-color: #92559c;
  color: white; 
}
</style>