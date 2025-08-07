<script setup>
// --- 功能區塊：引入函式庫與元件 ---
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';
import ChatRoom from '@/components/ChatRoom.vue';
import { HubConnectionBuilder } from '@microsoft/signalr'; // SignalR

// --- 功能區塊：元件狀態 (Reactive State) ---
const isLoading = ref(true);
const streamInfo = ref(null);
const error = ref(null);
let player = null;
const connection = ref(null);
const featuredProduct = ref(null);

// --- 【「主打商品」功能新增的函式】 ---
const setupSignalRConnection = () => {
  const hubUrl = "https://localhost:7017/chatHub";

  // 【修改處】確保 accessTokenFactory 正確地從 localStorage 獲取 token
  connection.value = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      // 由於路由守衛已確保此頁面為登入狀態，這裡一定能取到 token
      accessTokenFactory: () => localStorage.getItem('token') 
    })
    .withAutomaticReconnect()
    .build();

  // 監聽來自伺服器的廣播
  connection.value.on("ReceiveFeaturedProduct", (product) => {
    console.log("收到主打商品:", product);
    featuredProduct.value = product;
  });

  connection.value.on("ReceiveClearProduct", () => {
    console.log("收到清除商品指令");
    featuredProduct.value = null;
  });

  // 開始連線
  connection.value.start()
    .then(() => {
      console.log('✅ SignalR 已連接 (使用者)');
      connection.value.invoke('JoinAsUser');
    })
    .catch(err => {
      console.error('SignalR 連線失敗: ', err)
      // 可以選擇性地顯示一個更友善的錯誤提示
      error.value = "無法連接到即時互動功能。"
    });
};

// --- 功能區塊：核心邏輯 (Core Logic) ---
const initializePage = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get('/api/streaming/current');
    streamInfo.value = response.data;
  } catch (err) {
    console.error("獲取直播資訊失敗:", err);
    error.value = "無法載入直播資訊，請稍後再試。";
  } finally {
    isLoading.value = false;
  }

  if (streamInfo.value && streamInfo.value.playbackUrl) {
    await nextTick();
    setupPlayer(streamInfo.value.playbackUrl);
    // 只有在直播存在時才連線 SignalR
    setupSignalRConnection(); 
  }
};

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
      streamInfo.value = null;
      error.value = "直播已結束。";
    });
    player.addEventListener(PlayerEventType.ERROR, (err) => {
      console.error("IVS Player Error:", err);
      if (streamInfo.value) {
        error.value = `播放時發生錯誤: ${err.message}`;
      }
    });
    player.load(playbackUrl);
    player.play();
  }
};

const getUserDisplayName = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData && userData.userId) {
        return `肥貓會員:${userData.userId}`;
      }
    }
  } catch (e) {
    console.error("解析使用者資訊失敗:", e);
  }
  return '路過的喵';
};

// --- 功能區塊：生命週期鉤子 (Lifecycle Hooks) ---
onMounted(() => {
  initializePage();
});

onUnmounted(() => {
  if (player) {
    player.delete();
    player = null;
  }
  if (connection.value) {
    connection.value.stop();
  }
});
</script>

<template>
  <div class="stream-page-container">
    
    <div v-if="isLoading" class="status-message">
      <div class="spinner-border text-danger" role="status"></div>
      <p class="mt-3">正在連接直播頻道...</p>
    </div>
    <div v-else-if="error" class="status-message">
      <h4>發生錯誤</h4>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="!streamInfo" class="status-message">
      <h4>目前沒有直播</h4>
      <p>請稍後再來看看，或關注我們的最新消息！</p>
    </div>

    <div v-else class="stream-layout">

      <div class="stream-content-left">
        
        <div class="video-container">
          <h3 class="stream-title">{{ streamInfo.title }}</h3>
          <div class="player-wrapper">
            <video id="video-player" playsinline muted controls autoplay></video>
          </div>
        </div>

        <div class="featured-product-container">
          <transition name="fade" mode="out-in">
            <div v-if="featuredProduct" :key="featuredProduct.id" class="featured-product-card promo-style">
              <div class="promo-badge">🔥 現正主打商品!!</div>
              <img :src="`https://localhost:7017/ProductImages/${featuredProduct.imageUrl}`" class="product-thumb" alt="商品圖片">
              <p class="product-name">{{ featuredProduct.name }}</p>
              <a :href="`/OneSpecialNoodle?id=${featuredProduct.id}`" target="_blank" rel="noopener noreferrer" class="btn-details">
                詳情
              </a>
            </div>
            <div v-else class="featured-product-placeholder">
              <i class="fas fa-shopping-bag placeholder-icon"></i>
              <p>主播稍後會推薦商品，敬請期待！</p>
            </div>
          </transition>
        </div>
      </div>

      <div class="chat-container">
        <div class="chat-header">
          <h5><i class="fas fa-comments me-2"></i>聊天室</h5>
        </div>
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
/* 原有樣式 */
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
  align-items: flex-start;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-width: 300px;
  align-self: stretch;
}

.stream-title {
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.player-wrapper {
  position: relative;
  padding-top: 56.25%;
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

/* 主打商品區塊樣式 */
.stream-content-left {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.featured-product-container {
  height: 122px;
}

.featured-product-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #e9ecef;
  border-radius: 8px;
  color: #6c757d;
  border: 2px dashed #ced4da;
}

.placeholder-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.featured-product-card {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  height: 100%;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.promo-style {
  color: white;
  background: linear-gradient(135deg, #ff7e5f, #feb47b);
  border: 2px solid #ff7e5f;
  box-shadow: 0 5px 20px rgba(254, 180, 123, 0.5);
  animation: pulse-bg 2s infinite;
}

@keyframes pulse-bg {
  0% {
    box-shadow: 0 5px 20px rgba(254, 180, 123, 0.4);
  }
  50% {
    box-shadow: 0 5px 30px rgba(255, 126, 95, 0.7);
  }
  100% {
    box-shadow: 0 5px 20px rgba(254, 180, 123, 0.4);
  }
}

.promo-badge {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #ff4d4d;
  color: white;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 8px 0 8px 0;
  z-index: 2;
}

.product-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  border: 2px solid white;
}

.product-name {
  font-weight: bold;
  font-size: 1.5rem;
  margin: 0;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.btn-details {
  background-color: white;
  color: #ff7e5f;
  text-decoration: none;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  transition: all 0.2s;
  display: inline-block;
  border: 1px solid white;
  flex-shrink: 0;
}

.btn-details:hover {
  background-color: #fff5f2;
  transform: scale(1.05);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- RWD for Tablets & Phones (螢幕寬度 < 992px) --- */
@media (max-width: 992px) {
  /* 主佈局改為上下堆疊 */
  .stream-layout {
    flex-direction: column;
  }
  
  /* 【★★★ 關鍵修正 ★★★】 */
  /* 讓左側內容區塊在堆疊後，寬度也佔滿 100% */
  .stream-content-left {
    width: 100%;
  }

  /* 縮小頁面邊距 */
  .stream-page-container {
    padding: 1rem;
  }

  /* 為聊天室設定合適高度 */
  .chat-container {
    width: 100%;
    height: 70vh;
    max-height: 550px;
    min-width: unset;
  }

  /* 縮小直播標題字體 */
  .stream-title {
    font-size: 1.5rem;
  }
}

/* --- RWD for Smaller Phones (螢幕寬度 < 576px) --- */
@media (max-width: 576px) {
  /* 主打商品區塊改為垂直堆疊，並置中 */
  .featured-product-card {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
    padding: 1.5rem 1rem;
  }

  /* 主打商品區塊高度改為自動 */
  .featured-product-container {
    height: auto;
    min-height: 122px;
  }

  /* 縮小主打商品名稱字體 */
  .product-name {
    font-size: 1.2rem;
  }
  
  /* 讓詳情按鈕寬度更合理 */
  .btn-details {
    width: 80%;
  }
}
</style>