<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 響應式狀態
const streamTitle = ref('');
const isLive = ref(false);
const streamCredentials = ref(null); // 用於儲存串流金鑰等資訊
const error = ref(null);
const loading = ref(false);

// 檢查當前是否有正在進行的直播
const checkCurrentStream = async () => {
  try {
    const response = await axios.get('/api/streaming/current');
    if (response.data) {
      isLive.value = true;
      streamTitle.value = response.data.title;
      // 如果已經在直播，也顯示 OBS 金鑰資訊
      fetchCredentials();
    }
  } catch (err) {
    console.error("檢查當前直播狀態失敗:", err);
  }
};

// 取得 OBS 用的金鑰 (從設定檔讀取，不存入DB)
const fetchCredentials = () => {
    // 這裡我們假設後端/start API會回傳金鑰
    // 如果是已經在直播的狀態，我們可以設計一個新的API來取得金鑰
    // 為了簡化，我們先在 startStream 成功後儲存
};

// 開始直播的函式
const startStream = async () => {
  if (!streamTitle.value.trim()) {
    error.value = '請輸入直播標題！';
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.post('/api/streaming/start', { title: streamTitle.value });
    streamCredentials.value = response.data;
    isLive.value = true;
  } catch (err) {
    error.value = err.response?.data || '開始直播失敗，請稍後再試。';
    console.error("開始直播失敗:", err);
  } finally {
    loading.value = false;
  }
};

// 結束直播的函式
const endStream = async () => {
  loading.value = true;
  error.value = null;
  try {
    await axios.post('/api/streaming/end');
    isLive.value = false;
    streamCredentials.value = null;
    streamTitle.value = ''; // 清空標題
  } catch (err) {
    error.value = err.response?.data || '結束直播失敗，請稍後再試。';
    console.error("結束直播失敗:", err);
  } finally {
    loading.value = false;
  }
};

// 複製到剪貼簿的輔助函式
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('已成功複製！');
  }).catch(err => {
    console.error('複製失敗:', err);
    alert('複製失敗，請手動複製。');
  });
};

// 元件載入時，檢查一次當前直播狀態
onMounted(() => {
    // 為了避免重複呼叫，我們先簡化邏輯
    // checkCurrentStream();
});
</script>

<template>
  <div class="container mt-4">
    <div class="card">
      <div class="card-header fs-5 fw-bold">
        <i class="fas fa-video me-2"></i>直播控制台
      </div>
      <div class="card-body">

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="isLive">
          <h5 class="card-title">🔴 直播進行中：{{ streamTitle }}</h5>
          <p class="text-muted">請將以下資訊複製到你的直播軟體 (例如 OBS) 中。</p>

          <div v-if="streamCredentials" class="credentials-box">
            <div class="mb-3">
              <label class="form-label">擷取伺服器 (Ingest Server)</label>
              <div class="input-group">
                <input type="text" class="form-control" :value="streamCredentials.ingestEndpoint" readonly>
                <button class="btn btn-outline-secondary" @click="copyToClipboard(streamCredentials.ingestEndpoint)">複製</button>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">串流金鑰 (Stream Key)</label>
              <div class="input-group">
                <input type="password" class="form-control" :value="streamCredentials.streamKey" readonly>
                <button class="btn btn-outline-secondary" @click="copyToClipboard(streamCredentials.streamKey)">複製</button>
              </div>
            </div>
          </div>
          
          <button class="btn btn-danger w-100 mt-3" @click="endStream" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            結束直播
          </button>
        </div>

        <div v-else>
          <h5 class="card-title">準備開始一場新的直播</h5>
          <div class="mb-3">
            <label for="streamTitle" class="form-label">直播標題</label>
            <input type="text" id="streamTitle" class="form-control" v-model="streamTitle" placeholder="例如：夏季新品大特賣！">
          </div>
          <button class="btn btn-primary w-100" @click="startStream" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            開始直播並取得金鑰
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.credentials-box {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}
.card-header {
    background-color: #f1f3f5;
}
</style>