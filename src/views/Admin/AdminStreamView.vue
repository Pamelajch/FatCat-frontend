<script setup>
import { ref, onMounted } from 'vue';
import { useStreamStore } from '@/stores/streamStore';
import axios from 'axios';
import ChatRoom from '@/components/ChatRoom.vue';

const activeTab = ref('control');
const streamTitleInput = ref('');
const pastStreams = ref([]);
const error = ref(null);
const loading = ref(false);
const streamStore = useStreamStore();

// --- 功能區塊：API 呼叫 ---
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
  
  // 【★ 新增功能 ★】開始新直播前，清除舊的聊天紀錄
  sessionStorage.removeItem('fatcat_chat_history');

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

// --- 功能區塊：生命週期鉤子 ---
onMounted(() => {
  streamStore.checkCurrentStream();
  fetchHistory();
});

</script>

<template>
  <div class="container mt-4">
    <div class="tab-content">
      <div v-if="activeTab === 'control'" class="tab-pane fade show active">
        <div class="row">
          
          <div class="col-lg-7">
            <div class="card">
              <div class="card-body">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>

                <div v-if="streamStore.isLive">
                  <h5 class="card-title">🔴 直播進行中：{{ streamStore.currentStreamTitle }}</h5>
                  <p class="text-muted">以下為串流資訊：</p>
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

          <div class="col-lg-5">
            <div class="card">
              <div class="card-header fs-5 fw-bold"><i class="fas fa-comments me-2"></i>聊天室</div>
              <div class="card-body p-0" style="height: 400px;">
                <ChatRoom 
                  v-if="streamStore.isLive && streamStore.streamInfo?.chatRoomArn" 
                  :room-arn="streamStore.streamInfo.chatRoomArn"
                  user-name="肥貓小編"
                />
                <div v-else class="d-flex justify-content-center align-items-center h-100 text-muted">
                  直播開始後，聊天室將會啟用
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  </div>
</template>

<style scoped>
.credentials-box { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 0.5rem; padding: 1.5rem; margin-top: 1rem; }
.card-header { background-color: #f1f3f5; }
.nav-link { cursor: pointer; }
</style>