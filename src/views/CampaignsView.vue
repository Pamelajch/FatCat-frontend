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

// 取得當前路由資訊
const route = useRoute();

// --- API 呼叫函式 ---
const fetchAllCampaigns = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(API_URL);
    // 我們可以對從後端拿到的資料，在這裡先進行排序
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
  // 檢查網址中是否有 hash (例如 #campaign-5)
  const hash = route.hash;
  if (!hash) return;

  // 使用 nextTick，確保在 DOM 更新完成後才執行滾動操作
  await nextTick();

  // 根據 hash 找到對應的元素
  const element = document.querySelector(hash);
  if (element) {
    // 如果找到了，就平滑地滾動到那個元素的位置
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// --- 生命週期鉤子 ---
onMounted(async () => {
  // 元件掛載後，先取得所有活動資料
  await fetchAllCampaigns();
  // 然後，執行滾動到指定活動的邏輯
  await scrollToCampaign();
});
</script>

<template>
  <div class="campaigns-view-container">
    <main class="container py-5">
      <h1 class="text-center display-4 mb-5 fw-bold">所有活動</h1>

      <!-- 錯誤訊息顯示區 -->
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <!-- 載入中訊息顯示區 -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
      </div>

      <!-- 活動列表 -->
      <div v-if="!isLoading && campaigns.length > 0" class="d-grid gap-4">
        <!-- 
          使用 v-for 遍歷所有活動
          為每一個活動都建立一個兩欄式的卡片
          【關鍵】我們在這裡為每個卡片的外層 div 綁定了 :id
          這樣 scrollToCampaign 函式才能找到它
        -->
        <div 
          v-for="campaign in campaigns" 
          :key="campaign.campaignId" 
          :id="`campaign-${campaign.campaignId}`" 
          class="campaign-card card border-0 shadow-sm"
        >
          <div class="row g-0">
            <!-- 左側欄：活動圖片 -->
            <div class="col-md-5">
              <img 
                :src="`${BACKEND_URL}${campaign.coverImageUrl}`" 
                class="img-fluid rounded-start w-100 h-100" 
                :alt="campaign.title"
                style="object-fit: cover;"
                onerror="this.onerror=null;this.src='https://placehold.co/600x800/6c757d/FFFFFF?text=圖片載入失敗'">
            </div>

            <!-- 右側欄：活動文字內容 -->
            <div class="col-md-7 d-flex flex-column">
              <div class="card-body p-lg-5">
                <h3 class="card-title h2">{{ campaign.title }}</h3>
                <p class="card-text text-muted">
                  <small>活動期間：{{ new Date(campaign.startDate).toLocaleDateString() }} - {{ new Date(campaign.endDate).toLocaleDateString() }}</small>
                </p>
                <p class="card-text mt-3">{{ campaign.content }}</p>
              </div>
              <div class="card-footer bg-transparent border-0 p-lg-5 pt-0">
                <!-- 這個按鈕可以連結到一個更詳細的單獨頁面，如果需要的話 -->
                <a :href="campaign.callToActionUrl || '#'" target="_blank" class="btn btn-outline-primary">前往活動連結</a>
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
.campaign-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.campaign-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
.campaign-card img {
  min-height: 400px;
}
</style>
