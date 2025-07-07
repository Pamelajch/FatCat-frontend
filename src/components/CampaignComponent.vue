<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// --- 響應式狀態定義 ---

// 後端公開 API 的網址
const API_URL = 'https://localhost:7017/api/Campaigns'; 
// 後端伺服器的基礎網址，用來組合圖片路徑
const BACKEND_URL = 'https://localhost:7017'; // ⚠️ 請再次確認你的後端連接埠

const campaigns = ref([]);
const isLoading = ref(true);
const error = ref(null);

// --- API 呼叫函式 ---

// 取得公開的活動列表
const fetchCampaigns = async () => {
  try {
    const response = await axios.get(API_URL);
    campaigns.value = response.data;
  } catch (err) {
    console.error('取得公開活動失敗:', err);
    error.value = '無法載入活動資訊，請稍後再試。';
  } finally {
    isLoading.value = false;
  }
};

// --- 生命週期鉤子 ---

// 當元件第一次被掛載到畫面上時，自動執行一次 fetchCampaigns
onMounted(() => {
  fetchCampaigns();
});
</script>

<template>
  <!-- 元件的根容器，使用自訂的紫黃色主題 -->
  <div class="campaign-container container-fluid py-5">
    <div class="container">
      <!-- 標題區塊 -->
      <h2 class="text-center mb-5 display-5 fw-bold text-black">熱門活動</h2>

      <!-- 錯誤訊息顯示區 -->
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <!-- 載入中訊息顯示區 -->
      <div v-if="isLoading" class="text-center">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
      </div>

      <!-- 
        輪播圖主體
        - data-bs-ride="carousel": 啟用自動播放
        - data-bs-interval="2000": 設定每 2 秒切換一次
      -->
      <div v-if="!isLoading && campaigns.length > 0" id="campaignCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
        
        <!-- 輪播圖內容 -->
        <div class="carousel-inner">
          <div 
            v-for="(campaign, index) in campaigns" 
            :key="campaign.campaignId"
            class="carousel-item" 
            :class="{ active: index === 0 }">
            
            <!-- 每一張投影片都是一個兩欄式的卡片 -->
            <div class="campaign-slide-card card border-0">
              <div class="row g-0 align-items-center">
                
                <!-- 左側欄：活動圖片 -->
                <div class="col-lg-5">
                  <img 
                    :src="`${BACKEND_URL}${campaign.coverImageUrl}`" 
                    class="d-block w-100" 
                    :alt="campaign.title"
                    onerror="this.onerror=null;this.src='https://placehold.co/600x800/333/FFFFFF?text=圖片載入失敗'">
                </div>

                <!-- 右側欄：活動文字內容 -->
                <div class="col-lg-7">
                  <div class="card-body p-5">
                    <h3 class="card-title display-4 fw-bolder mb-3">{{ campaign.title }}</h3>
                    <p class="card-text text-muted mb-4">
                      活動期間：{{ new Date(campaign.startDate).toLocaleDateString() }} - {{ new Date(campaign.endDate).toLocaleDateString() }}
                    </p>
                    <p class="card-text fs-5 mb-5">{{ campaign.content }}</p>
                    <router-link :to="`/campaigns/${campaign.campaignId}`" class="btn btn-warning btn-lg fw-bold px-5 py-3">
                      查看詳情
                    </router-link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- 上一張/下一張 控制按鈕 -->
        <button class="carousel-control-prev" type="button" :data-bs-target="'#campaignCarousel'" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">上一張</span>
        </button>
        <button class="carousel-control-next" type="button" :data-bs-target="'#campaignCarousel'" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">下一張</span>
        </button>
      </div>

      <!-- 沒有活動時顯示的訊息 -->
      <div v-if="!isLoading && campaigns.length === 0 && !error" class="text-center text-white-50 py-5">
        <p class="fs-4">目前沒有任何進行中的活動。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 定義主題顏色 */
:root {
  --theme-purple: #4a148c; /* 深紫色 */
  --theme-yellow: #ffc107; /* 亮黃色 */
}

/* 整體容器背景，使用深紫色漸層 */
.campaign-container {
  background: linear-gradient(135deg, #daa8e3 0%, #f3e3f4 100%);
  border-radius: 20px;
}

/* 輪播項目卡片樣式 */
.campaign-slide-card {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  overflow: hidden; /* 確保圓角能正確顯示 */
  min-height: 550px;
}

/* 圖片樣式，確保能完整顯示直式海報 */
.campaign-slide-card img {
  width: 100%;
  height: 550px;
  object-fit: contain; /* 👈 關鍵！完整顯示圖片，不裁切 */
  background-color: #f8f9fa; /* 給圖片一個淺色底，避免透明背景的圖不好看 */
}

/* 卡片標題使用較深的紫色 */
.card-title {
  color: #311B92;
}

/* 按鈕樣式，使用主題黃色 */
.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
  transition: all 0.3s ease;
}

.btn-warning:hover {
  background-color: #ffca2c;
  border-color: #ffca2c;
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
}

/* 👇👇👇【這就是我們新增的修改】👇👇👇
  輪播控制按鈕的樣式
*/
.carousel-control-prev,
.carousel-control-next {
  /* 讓按鈕的寬度變窄，不要佔滿整個側面 */
  width: 5%; 
}

/* 讓箭頭圖示本身更精緻 */
.carousel-control-prev-icon,
.carousel-control-next-icon {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 1.5rem;
  background-size: 50% 50%;
  transition: background-color 0.3s ease;
}

/* 滑鼠移過時，讓箭頭背景變深 */
.carousel-control-prev:hover .carousel-control-prev-icon,
.carousel-control-next:hover .carousel-control-next-icon {
    background-color: rgba(0, 0, 0, 0.8);
}
</style>
