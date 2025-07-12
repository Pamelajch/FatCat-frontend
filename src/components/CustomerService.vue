<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as signalR from '@microsoft/signalr';

const isOpen = ref(false);
const isConnected = ref(false);
const hasNewMessage = ref(false);
const messages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);
const userId = ref(new URLSearchParams(window.location.search).get('userId') || `user_${Date.now().toString().slice(-6)}`);

let connection = null;

const initConnection = async () => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:7017/chatHub')
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on('ReceiveMessage', (messageData) => {
    // 後端傳來的 messageData 是 { adminId, message, timestamp, type }
    // 將收到的時間字串轉換為 Date 物件
    const receivedTime = new Date(messageData.timestamp);

    // 推進本地 messages 陣列前，確保格式統一
    messages.value.push({
      id: Date.now(),
      message: messageData.message,
      timestamp: receivedTime.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      type: messageData.type
    });
    
    if (!isOpen.value) {
      hasNewMessage.value = true;
    }
    
    scrollToBottom();
  });

  connection.onclose(() => { isConnected.value = false; });
  connection.onreconnecting(() => { isConnected.value = false; });
  connection.onreconnected(async () => { 
    isConnected.value = true;
    if (connection) await connection.invoke('JoinAsUser', userId.value);
  });

  try {
    await connection.start();
    isConnected.value = true;
    await connection.invoke('JoinAsUser', userId.value);
  } catch (err) {
    console.error('SignalR 連線失敗:', err);
    isConnected.value = false;
    setTimeout(initConnection, 5000);
  }
};

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    hasNewMessage.value = false;
    scrollToBottom();
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !isConnected.value) return;

  // 自己發送的訊息，也統一使用小寫 key
  const messageData = {
    id: Date.now(),
    message: newMessage.value,
    timestamp: new Date().toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    type: 'user'
  };
  messages.value.push(messageData);
  
  try {
    await connection.invoke('SendMessageToAdmin', userId.value, newMessage.value);
    newMessage.value = '';
    scrollToBottom();
  } catch (err) {
    console.error('發送訊息失敗:', err);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

onMounted(() => { initConnection(); });
onUnmounted(() => { if (connection) { connection.stop(); } });
</script>

<template>
  <div class="customer-service">
    <button
      v-if="!isOpen"
      class="cs-button"
      @click="toggleChat"
      aria-label="聯絡客服"
    >
      <span v-if="hasNewMessage" class="notification-dot"></span>
    </button>

    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <h3>肥貓客服</h3>
        <button @click="toggleChat" class="close-btn" aria-label="關閉視窗">×</button>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message"
          :class="{ 'admin-message': message.type === 'admin', 'user-message': message.type === 'user' }"
        >
          <div class="message-content">
            <p>{{ message.message }}</p>
            <span class="timestamp">{{ message.timestamp }}</span>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          placeholder="輸入訊息..."
          :disabled="!isConnected"
        >
        <button @click="sendMessage" :disabled="!isConnected || !newMessage.trim()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      
      <div class="connection-status" :class="{ 'connected': isConnected }">
        {{ isConnected ? '已連線' : '連線中...' }}
      </div>
    </div>
  </div>
</template>




<style scoped>
/* --- 配色定義 --- */
:root {
  --primary-purple: #7B52A1; /* 主要紫色 */
  --light-purple: #E8DAEF;   /* 淺紫色 */
  --accent-yellow: #e0cd89;  /* 鵝黃色 (選了一個更柔和的鵝黃) */
  --dark-gray: #4A4A4A;      /* 深灰色 */
  --light-gray: #aea7a7;     /* 淺灰色背景 */
  --text-light: #FFFFFF;
  --text-dark: #333333;
}

.customer-service {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 1000;
  font-family: 'Microsoft JhengHei', 'Segoe UI', sans-serif;
}

/* --- 客服按鈕 --- */
.cs-button {
  /* [加大] 將尺寸從 75px 增加到 85px */
  width: 85px; 
  height: 85px;
  background-color: var(--primary-purple);
  background-image: url('public/customer1.png');
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  border: 4px solid rgb(244, 245, 208); /* 邊框也加粗一點點以搭配新尺寸 */
  cursor: pointer;
  box-shadow: 0 5px P15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.cs-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.notification-dot {
  position: absolute;
  top: 5px; /* 調整位置以適應較大的按鈕 */
  right: 5px;
  width: 18px;
  height: 18px;
  background-color: #FF4757;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* --- 聊天視窗 --- */
.chat-window {
  width: 370px;
  height: 550px;
  background: rgb(255, 255, 255); /* 視窗底色設為白色 */
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #ddd;
}

.chat-header {
  background: #cca6ef;
  color: #22211d;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* 防止頭部被壓縮 */
}

.chat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 28px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.close-btn:hover {
  opacity: 1;
}

.chat-messages {
  /* [修正] 加上鵝黃色背景，解決透明問題 */
  background-color: var(--accent-yellow); 
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  display: flex;
  margin-bottom: 15px;
}

.message-content {
  padding: 12px 18px;
  border-radius: 20px;
  max-width: 85%;
  word-wrap: break-word;
}

/* 使用者發送的訊息 (紫色) */
.user-message {
  justify-content: flex-end;
}
.user-message .message-content {
  background: #5A3D75;
  color: white;
  border-bottom-right-radius: 5px;
}

/* 管理員回覆的訊息 (淺紫色) */
.admin-message {
  justify-content: flex-start;
}
.admin-message .message-content {
  background: #E8DAEF;
  color: #333333;
  border: 1px solid #D6C1E3;
  border-bottom-left-radius: 5px;
}

.message-content p {
  margin: 0 0 5px 0;
}

.timestamp {
  font-size: 11px;
  opacity: 0.9;
  text-align: right;
  display: block;
}

/* --- 輸入區域 --- */
.chat-input {
  display: flex;
  padding: 15px;
  background: white;
  border-top: 1px solid #eee;
  flex-shrink: 0; /* 防止輸入區被壓縮 */
}

.chat-input input {
  flex: 1;
  border: 2px solid #3b3636;
  border-radius: 25px;
  padding: 10px 18px;
  outline: none;
  margin-right: 10px;
  transition: border-color 0.3s;
}
.chat-input input:focus {
  border-color: var(--primary-purple);
}

.chat-input button {
  background: var(--primary-purple);
  color: rgb(78, 8, 63);
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.chat-input button:hover:not(:disabled) {
  background: #5A3D75; /* 加深的紫色 */
}
.chat-input button:active:not(:disabled) {
  transform: scale(0.9);
}

.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.connection-status {
  padding: 5px 15px;
  text-align: center;
  font-size: 12px;
  background: var(--dark-gray);
  color: white;
  font-weight: 500;
  flex-shrink: 0;
}

.connection-status.connected {
  background: var(--primary-purple);
}
</style>