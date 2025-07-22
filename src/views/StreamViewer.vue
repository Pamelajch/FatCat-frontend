<script setup>
// --- 功能區塊：引入函式庫與元件 ---
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';
import ChatRoom from '@/components/ChatRoom.vue';

// --- 功能區塊：元件狀態 (Reactive State) ---
// isLoading 用於顯示「載入中...」的畫面
const isLoading = ref(true);
// streamInfo 用於儲存從後端 API 獲取的直播資訊 (有直播時) 或 null (沒直播時)
const streamInfo = ref(null);
// error 用於顯示錯誤訊息
const error = ref(null);
// player 用於存放 IVS 播放器實例
let player = null;

// --- 功能區塊：核心邏輯 (Core Logic) ---

/**
 * @description 初始化頁面，向後端獲取當前直播狀態
 */
const initializePage = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // 呼叫後端 API，這個 API 在有直播時回傳直播資訊，沒直播時回傳 null
    const response = await axios.get('/api/streaming/current');
    streamInfo.value = response.data;
  } catch (err) {
    console.error("獲取直播資訊失敗:", err);
    error.value = "無法載入直播資訊，請稍後再試。";
  } finally {
    isLoading.value = false;
  }

  // 只有在確定有直播資訊 (streamInfo 不為 null) 且有播放網址時，才去設定播放器
  if (streamInfo.value && streamInfo.value.playbackUrl) {
    // nextTick 確保 Vue 已經將 <video> 標籤渲染到畫面上
    await nextTick();
    setupPlayer(streamInfo.value.playbackUrl);
  }
};

/**
 * @description 設定並啟動 IVS 影片播放器
 * @param {string} playbackUrl - 直播播放網址
 */
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
    player.addEventListener(PlayerState.ENDED, () => {
        streamInfo.value = null; // 直播自然結束時，也清空資訊
        error.value = "直播已結束。";
    });
    player.addEventListener(PlayerEventType.ERROR, (err) => {
        console.error("IVS Player Error:", err);
        // 只有在真的有直播時，才顯示播放錯誤。避免沒有 OBS 推流時的 404 錯誤干擾使用者。
        if (streamInfo.value) {
            error.value = `播放時發生錯誤: ${err.message}`;
        }
    });
    player.load(playbackUrl);
    player.play();
  }
};

/**
 * @description 根據 localStorage 決定使用者顯示名稱的函式
 * @returns {string} - 要顯示的使用者名稱
 */
const getUserDisplayName = () => {
  try {
    // 您的截圖顯示 user 的 key 是 'user'
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData && userData.userId) {
        // 如果有登入，回傳「肥貓會員:ID」
        return `肥貓會員:${userData.userId}`;
      }
    }
  } catch (e) {
    console.error("解析使用者資訊失敗:", e);
  }
  // 如果 localStorage 沒資料、解析失敗、或沒有 userId，就回傳「路過的喵」
  return '路過的喵';
};

// --- 功能區塊：生命週期鉤子 (Lifecycle Hooks) ---

// onMounted: 當元件被掛載到畫面上時執行
onMounted(() => {
  initializePage();
});

// onUnmounted: 當元件從畫面上移除時執行
onUnmounted(() => {
  // 清理播放器資源，避免記憶體洩漏
  if (player) {
    player.delete();
    player = null;
  }
});
</script>

<template>
  <div class="stream-page-container">
    <!-- 功能區塊：狀態顯示 (載入中 / 錯誤) -->
    <div v-if="isLoading" class="status-message">
      <div class="spinner-border text-danger" role="status"></div>
      <p class="mt-3">正在連接直播頻道...</p>
    </div>
    <div v-else-if="error" class="status-message">
      <h4>發生錯誤</h4>
      <p>{{ error }}</p>
    </div>

    <!-- 功能區塊：沒有直播時的畫面 -->
    <div v-else-if="!streamInfo" class="status-message">
      <h4>目前沒有直播</h4>
      <p>請稍後再來看看，或關注我們的最新消息！</p>
    </div>

    <!-- 功能區塊：直播中的主畫面 -->
    <div v-else class="stream-layout">
      <!-- 左側：影片播放器區塊 -->
      <div class="video-container">
        <h3 class="stream-title">{{ streamInfo.title }}</h3>
        <div class="player-wrapper">
          <video id="video-player" playsinline muted controls autoplay></video>
        </div>
      </div>

      <!-- 右側：聊天室區塊 -->
      <div class="chat-container">
        <div class="chat-header">
          <h5><i class="fas fa-comments me-2"></i>聊天室</h5>
        </div>

        <!--
          只有在直播資訊中包含聊天室 ARN 時，才會載入 ChatRoom 元件。
          同時，把動態決定的使用者名稱 :user-name="getUserDisplayName()" 傳遞進去。
        -->
        <ChatRoom
          v-if="streamInfo.chatRoomArn"
          :room-arn="streamInfo.chatRoomArn"
          :user-name="getUserDisplayName()"
        />

        <div v-else class="d-flex justify-content-center align-items-center h-100 text-muted">
          聊天室無法載入
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 您的 style 區塊完全不用修改，可以直接沿用 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.stream-page-container {
  padding: 2rem;
  background-color: #f4f6f9;
  min-height: calc(100vh - 80px);
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.stream-title {
  margin-bottom: 1rem;
}

.player-wrapper {
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
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

@media (max-width: 992px) {
  .stream-layout {
    flex-direction: column;
  }
}
</style>
