<script setup>
import { ref, onMounted } from 'vue';
import { useStreamStore } from '@/stores/streamStore';
import axios from 'axios';

// 【新增】用於控制分頁的狀態
const activeTab = ref('control'); // 'control' 或 'history'

const streamTitleInput = ref('');
const pastStreams = ref([]);
const error = ref(null);
const loading = ref(false);

const streamStore = useStreamStore();

const fetchHistory = async () => {
  try {
    const response = await axios.get('/api/streaming/history');
    pastStreams.value = response.data;
  } catch (err) {
    console.error("獲取直播歷史失敗:", err);
  }
};

const handleStartStream = async () => {
  if (!streamTitleInput.value.trim()) {
    error.value = '請輸入直播標題！';
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    await streamStore.startStream(streamTitleInput.value);
  } catch (err) {
    error.value = err.response?.data || '開始直播失敗';
  } finally {
    loading.value = false;
  }
};

const handleEndStream = async () => {
  loading.value = true;
  error.value = null;
  try {
    await streamStore.endStream();
    streamTitleInput.value = '';
    await fetchHistory();
  } catch (err) {
    error.value = err.response?.data || '結束直播失敗';
  } finally {
    loading.value = false;
  }
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => alert('已成功複製！'));
};

onMounted(() => {
  streamStore.checkCurrentStream();
  fetchHistory();
});
</script>

<template>
  <div class="container mt-4">
    <!-- 使用 Bootstrap Navs & Tabs 建立分頁 -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'control' }" @click.prevent="activeTab = 'control'" href="#">
          <i class="fas fa-video me-1"></i> 直播控制台
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'history' }" @click.prevent="activeTab = 'history'" href="#">
          <i class="fas fa-history me-1"></i> 過往直播紀錄
        </a>
      </li>
    </ul>

    <!-- 分頁內容 -->
    <div class="tab-content">
      <!-- 直播控制台 & 聊天室分頁 -->
      <div v-if="activeTab === 'control'" class="tab-pane fade show active">
        <div class="row">
          <!-- 左側：直播控制台 -->
          <div class="col-lg-7">
            <div class="card">
              <div class="card-body">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
                <div v-if="streamStore.isLive">
                  <h5 class="card-title">🔴 直播進行中：{{ streamStore.currentStreamTitle }}</h5>
                  <p class="text-muted">請將以下資訊複製到你的直播軟體 (例如 OBS) 中。</p>
                  <div v-if="streamStore.streamInfo" class="credentials-box">
                    <div class="mb-3">
                      <label class="form-label">擷取伺服器</label>
                      <div class="input-group">
                        <input type="text" class="form-control" :value="streamStore.streamInfo.ingestEndpoint" readonly>
                        <button class="btn btn-outline-secondary" @click="copyToClipboard(streamStore.streamInfo.ingestEndpoint)">複製</button>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">串流金鑰</label>
                      <div class="input-group">
                        <input type="password" class="form-control" :value="streamStore.streamInfo.streamKey" readonly>
                        <button class="btn btn-outline-secondary" @click="copyToClipboard(streamStore.streamInfo.streamKey)">複製</button>
                      </div>
                    </div>
                  </div>
                  <button class="btn btn-danger w-100 mt-3" @click="handleEndStream" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm"></span> 結束直播
                  </button>
                </div>
                <div v-else>
                  <h5 class="card-title">準備開始一場新的直播</h5>
                  <div class="mb-3">
                    <label for="streamTitle" class="form-label">直播標題</label>
                    <input type="text" id="streamTitle" class="form-control" v-model="streamTitleInput" placeholder="例如：夏季新品大特賣！">
                  </div>
                  <button class="btn btn-primary w-100" @click="handleStartStream" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm"></span> 開始直播並取得金鑰
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- 右側：聊天室 (預留位置) -->
          <div class="col-lg-5">
            <div class="card">
              <div class="card-header fs-5 fw-bold"><i class="fas fa-comments me-2"></i>聊天室</div>
              <div class="card-body" style="height: 400px;">
                <p class="text-muted text-center mt-5">聊天室功能將在此處顯示</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 過往直播紀錄分頁 -->
      <div v-if="activeTab === 'history'" class="tab-pane fade show active">
        <div class="card">
          <div class="card-body" style="max-height: 600px; overflow-y: auto;">
            <ul v-if="pastStreams.length > 0" class="list-group list-group-flush">
              <li v-for="stream in pastStreams" :key="stream.livestreamId" class="list-group-item">
                <div class="fw-bold">{{ stream.title }}</div>
                <small class="text-muted me-5">
                  開始時間: {{ new Date(stream.startedAt).toLocaleString() }}
                </small>
                <small class="text-muted">
                  結束時於: {{ new Date(stream.endedAt).toLocaleString() }}
                </small>
              </li>
            </ul>
            <p v-else class="text-muted text-center">尚無直播紀錄</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.credentials-box { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 0.5rem; padding: 1.5rem; margin-top: 1rem; }
.card-header { background-color: #f1f3f5; }
/* 讓分頁籤有手型游標 */
.nav-link { cursor: pointer; }
</style>