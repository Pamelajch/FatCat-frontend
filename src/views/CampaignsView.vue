<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

// --- 響應式狀態定義 ---
const API_URL = 'https://localhost:7017/api/Campaigns'; 
const BACKEND_URL = 'https://localhost:7017'; // ⚠️ 請再次確認你的後端連接埠

const campaigns = ref([]);
const isLoading = ref(true);
const error = ref(null);

const route = useRoute();

// --- API 呼叫函式 ---
const fetchAllCampaigns = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(API_URL);
    campaigns.value = response.data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  } catch (err) {
    console.error('取得所有活動失敗:', err);
    error.value = '無法載入活動資訊，請稍後再試。';
  } finally {
    isLoading.value = false;
  }
};

// --- 滾動函式 ---
const scrollToCampaign = async () => {
  const hash = route.hash;
  if (!hash) return;

  await nextTick();

  const element = document.querySelector(hash);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// --- 生命週期鉤子 ---
onMounted(async () => {
  await fetchAllCampaigns();
  await scrollToCampaign();
});
</script>

<template>
  <!-- 元件的根容器，套用新的日式條紋背景 -->
  <div class="campaigns-view-container">
    <main class="container py-5">
      <!-- 標題區塊，加上了日式雲朵裝飾 -->
      <div class="title-container text-center mb-5">
        <h1 class="display-4 fw-bold page-title">所有活動</h1>
      </div>

      <!-- 錯誤訊息顯示區 -->
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <!-- 載入中訊息顯示區 -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border theme-spinner" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
      </div>

      <!-- 活動列表 -->
      <div v-if="!isLoading && campaigns.length > 0" class="d-grid gap-5">
        <div 
          v-for="campaign in campaigns" 
          :key="campaign.campaignId" 
          :id="`campaign-${campaign.campaignId}`" 
          class="campaign-card card"
        >
          <div class="row g-0">
            <!-- 左側欄：活動圖片 -->
            <div class="col-lg-5 image-container">
              <img 
                :src="`${BACKEND_URL}${campaign.coverImageUrl}`" 
                class="img-fluid" 
                :alt="campaign.title"
                onerror="this.onerror=null;this.src='https://placehold.co/600x800/686868/FFFFFF?text=圖片載入失敗'">
            </div>

            <!-- 右側欄：活動文字內容 -->
            <div class="col-lg-7 d-flex flex-column">
              <div class="card-body p-5">
                <h3 class="card-title display-6 fw-bold mb-3">{{ campaign.title }}</h3>
                <p class="card-text text-muted mb-4">
                  <small>活動期間：{{ new Date(campaign.startDate).toLocaleDateString() }} - {{ new Date(campaign.endDate).toLocaleDateString() }}</small>
                </p>
                <p class="card-text fs-5 lh-lg">{{ campaign.content }}</p>
              </div>
              <div class="card-footer p-5 pt-0">
                <a v-if="campaign.callToActionUrl" :href="campaign.callToActionUrl" target="_blank" class="btn btn-theme-action btn-lg">
                  前往活動連結
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 沒有活動時顯示的訊息 -->
      <div v-if="!isLoading && campaigns.length === 0 && !error" class="text-center text-muted py-5">
        <p class="fs-4">目前沒有任何活動。</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 日式條紋背景
  使用 repeating-linear-gradient 創造斜向的條紋效果
  顏色使用淡紫色 (#d3a2da) 和一個更淺的紫色 (#e9d6ec) 來搭配
*/
.campaigns-view-container {
  background-color: #d3a2da;
  background-image: repeating-linear-gradient(
    45deg,
    #d3a2da,
    #d3a2da 25px,
    #e9d6ec 25px,
    #e9d6ec 50px
  );
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 4rem;
}

/* 頁面大標題樣式，加上類似日式家紋的背景 */
.page-title {
  color: #92559c; /* 深紫色 */
  background-color: rgba(255, 255, 255, 0.8);
  padding: 1rem 2rem;
  border-radius: 10px;
  display: inline-block;
  border: 3px solid #92559c;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  backdrop-filter: blur(5px);
}

/* 載入中 spinner 的顏色 */
.theme-spinner {
  color: #92559c;
}

/* 活動卡片樣式 */
.campaign-card {
  background-color: #f6f6f6; /* 淺灰白色 */
  border: 2px solid #686868; /* 深灰色邊框 */
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.campaign-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 16px 35px rgba(0,0,0,0.2);
}

/* 圖片容器，加上一個內陰影增加立體感 */
.image-container {
  padding: 1rem;
  background-color: #fff;
}
.campaign-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

/* 卡片標題使用深紫色 */
.campaign-card .card-title {
  color: #92559c;
}

/* 卡片內文使用深灰色 */
.campaign-card .card-text {
  color: #686868;
}

/* 卡片底部 footer 的樣式 */
.campaign-card .card-footer {
  background: none;
  border: none;
}

/* 自訂按鈕樣式，使用橘黃色，並加上圖示 */
.btn-theme-action {
  background-color: #ffa600; /* 橘黃色 */
  color: white;
  font-weight: bold;
  border: 2px solid rgba(0,0,0,0.1);
  padding: 0.75rem 2rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-theme-action:hover {
  background-color: #ffd689; /* 淡黃色 */
  color: #686868; /* 深灰色 */
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}
</style>
