<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';

const isLoading = ref(true);
const streamInfo = ref(null);
const error = ref(null);
let player = null;

// 【★ 關鍵修正】調整了整個函式的執行順序
const initializeStream = async () => {
  isLoading.value = true;
  error.value = null;
  let playbackUrl = null; // 暫存播放網址

  try {
    const response = await axios.get('/api/streaming/current');
    
    if (response.data && response.data.playbackUrl) {
      streamInfo.value = response.data;
      playbackUrl = response.data.playbackUrl; // 將網址存起來
    } else {
      streamInfo.value = null;
    }
  } catch (err) {
    console.error("獲取直播資訊失敗:", err);
    error.value = "無法載入直播資訊，請稍後再試。";
  } finally {
    // 先把 loading 狀態結束，讓 Vue 開始去畫 v-if/v-else 的畫面
    isLoading.value = false;
  }

  // 等待 Vue 把畫面畫完
  await nextTick();

  // 如果我們成功取得了播放網址，現在才去設定播放器
  if (playbackUrl) {
    setupPlayer(playbackUrl);
  }
};

// setupPlayer 函式維持不變
const setupPlayer = (playbackUrl) => {
  const IVSPlayer = window.IVSPlayer;
  if (!IVSPlayer || !IVSPlayer.isPlayerSupported) {
    error.value = "您的瀏覽器不支援此直播格式。";
    return;
  }
  
  const { PlayerState, PlayerEventType } = IVSPlayer;
  const videoElement = document.getElementById('video-player');
  if (videoElement) {
    player = IVSPlayer.create();
    player.attachHTMLVideoElement(videoElement);
    player.addEventListener(PlayerState.PLAYING, () => console.log("✅ IVS Player: 狀態 -> 正在播放！"));
    player.addEventListener(PlayerState.ENDED, () => { error.value = "直播已結束。"; });
    player.addEventListener(PlayerEventType.ERROR, (err) => { error.value = `播放時發生錯誤: ${err.message}`; });
    player.load(playbackUrl);
    player.play();
  }
};

// onMounted 和 onUnmounted 維持不變
onMounted(() => {
  initializeStream();
});
onUnmounted(() => {
  if (player) {
    player.delete();
    player = null;
  }
});
</script>


<template>
  <div class="stream-page-container">
    <!-- 載入中畫面 -->
    <div v-if="isLoading" class="status-message">
      <div class="spinner-border text-danger" role="status"></div>
      <p class="mt-3">正在連接直播頻道...</p>
    </div>

    <!-- 錯誤訊息 -->
    <div v-else-if="error" class="status-message">
      <h4>發生錯誤</h4>
      <p>{{ error }}</p>
    </div>

    <!-- 沒有直播時的畫面 -->
    <div v-else-if="!streamInfo" class="status-message">
      <h4>目前沒有直播</h4>
      <p>請稍後再來看看，或關注我們的最新消息！</p>
    </div>

    <!-- 直播主畫面 -->
    <div v-else class="stream-layout">
      <div class="video-container">
        <h3 class="stream-title">{{ streamInfo.title }}</h3>
        <div class="player-wrapper">
          <video id="video-player" playsinline muted controls autoplay></video>
        </div>
      </div>
      <div class="chat-container">
        <div class="chat-header">
          <h5><i class="fas fa-comments me-2"></i>聊天室</h5>
        </div>
        <div class="chat-messages">
          <div class="message">
            <span class="username admin">肥貓小編：</span>
            <span class="content">歡迎來到肥貓直播間！有任何問題都可以提出來喔～</span>
          </div>
           <div class="message">
            <span class="username">路人甲：</span>
            <span class="content">這件衣服好好看！有特價嗎？</span>
          </div>
        </div>
        <div class="chat-input">
          <input type="text" class="form-control" placeholder="說點什麼..." disabled>
          <button class="btn btn-primary" disabled>送出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
.stream-page-container { padding: 2rem; background-color: #f4f6f9; min-height: calc(100vh - 80px); }
.status-message { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 60vh; color: #555; }
.stream-layout { display: flex; gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
.video-container { flex: 3; }
.chat-container { flex: 1; display: flex; flex-direction: column; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden; }
.stream-title { margin-bottom: 1rem; }
.player-wrapper { position: relative; padding-top: 56.25%; background-color: black; border-radius: 8px; overflow: hidden; }
#video-player { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.chat-header { padding: 1rem; border-bottom: 1px solid #e9ecef; background-color: #fafafa; }
.chat-messages { flex-grow: 1; padding: 1rem; overflow-y: auto; }
.message { margin-bottom: 0.75rem; font-size: 0.9rem; }
.username { font-weight: bold; }
.username.admin { color: #0d6efd; }
.chat-input { display: flex; padding: 1rem; border-top: 1px solid #e9ecef; gap: 0.5rem; }
@media (max-width: 992px) { .stream-layout { flex-direction: column; } }
</style>
