<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';

// 我們不再從 'amazon-ivs-player' import，因為它已由 index.html 引入
// import IVSPlayer from 'amazon-ivs-player';

// 響應式狀態
const isLoading = ref(true);
const streamInfo = ref(null);
const error = ref(null);
let player = null; // 用來存放 IVS Player 的實例

// 獲取當前直播資訊並初始化播放器 (完整版)
const initializeStream = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get('/api/streaming/current');
    
    if (response.data && response.data.playbackUrl) {
      streamInfo.value = response.data;
      await nextTick();
      setupPlayer(response.data.playbackUrl);
    } else {
      streamInfo.value = null;
    }
  } catch (err) {
    console.error("獲取直播資訊失敗:", err);
    error.value = "無法載入直播資訊，請稍後再試。";
  } finally {
    isLoading.value = false;
  }
};

// 設定 IVS 播放器 (包含事件監聽)
const setupPlayer = (playbackUrl) => {
  // 從 window 物件取得由 index.html 載入的 IVSPlayer
  const IVSPlayer = window.IVSPlayer;

  if (!IVSPlayer || !IVSPlayer.isPlayerSupported) {
    console.warn('IVS Player: 瀏覽器不支援。');
    error.value = "您的瀏覽器不支援此直播格式。";
    return;
  }
  
  const { PlayerState, PlayerEventType } = IVSPlayer;
  const videoElement = document.getElementById('video-player');

  if (videoElement) {
    player = IVSPlayer.create();
    player.attachHTMLVideoElement(videoElement);

    // --- 事件監聽開始 ---
    player.addEventListener(PlayerState.PLAYING, () => {
      console.log("IVS Player: 狀態 -> 正在播放！");
    });
    player.addEventListener(PlayerState.ENDED, () => {
      console.log("IVS Player: 狀態 -> 播放結束。");
      error.value = "直播已結束。";
    });
    player.addEventListener(PlayerEventType.ERROR, (err) => {
      console.error("IVS Player 錯誤:", err);
      error.value = `播放時發生錯誤: ${err.code} ${err.message}`;
    });
    // --- 事件監聽結束 ---

    player.load(playbackUrl);
    player.play();
  }
};

// 元件掛載時，開始執行
onMounted(() => {
  initializeStream();
});

// 元件卸載時，銷毀播放器以釋放資源
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
      <!-- 左側：影片播放器 -->
      <div class="video-container">
        <h3 class="stream-title">{{ streamInfo.title }}</h3>
        <div class="player-wrapper">
          <video id="video-player" playsinline muted controls autoplay></video>
        </div>
      </div>

      <!-- 右側：聊天室 (目前為純 UI 佔位) -->
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

.stream-page-container {
  padding: 2rem;
  background-color: #f4f6f9;
  min-height: calc(100vh - 80px); /* 假設你有一個 80px 高的 Navbar */
}

.status-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
  color: #555;
}

.stream-layout {
  display: flex;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.video-container {
  flex: 3;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.stream-title {
  margin-bottom: 1rem;
}

.player-wrapper {
  position: relative;
  padding-top: 56.25%; /* 16:9 */
  background-color: black;
  border-radius: 8px;
  overflow: hidden;
}

#video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #fafafa;
}

.chat-messages {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
}

.message {
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}
.username { font-weight: bold; }
.username.admin { color: #0d6efd; }

.chat-input {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  gap: 0.5rem;
}

@media (max-width: 992px) {
  .stream-layout {
    flex-direction: column;
  }
}
</style>
