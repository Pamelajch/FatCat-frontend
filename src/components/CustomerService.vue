<script setup>
// --- 區塊作用：引入所有需要的工具 ---
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import * as signalR from '@microsoft/signalr';


// --- 區塊作用：1. 核心狀態定義 (State) ---
// 這裡集中管理所有會變動的狀態資料
const isOpen = ref(false);
const isConnected = ref(false);
const hasNewMessage = ref(false);
const currentView = ref('main_menu');
const messages = ref([]);
const newMessage = ref('');
const userId = ref(new URLSearchParams(window.location.search).get('userId') || `user_${Date.now().toString().slice(-6)}`);
const messagesContainer = ref(null);
let connection = null;


// --- 區塊作用：2. 計算屬性 (Computed) ---
// 根據現有狀態，動態計算出新的值

// 動態計算聊天視窗標題
const headerText = computed(() => {
  if (currentView.value === 'live_chat') {
    return '與肥貓客服對話中';
  }
  return '肥貓客服';
});

// 計算當前 FAQ 主題，方便模板使用
const currentFaqTopic = computed(() => currentView.value.replace('faq_', ''));


// --- 區塊作用：3. 狀態監聽與持久化 (Watchers & Persistence) ---
// 使用 watch 監控特定狀態的變化，並執行對應的副作用 (如此處的儲存)

// 【功能】監控 messages 陣列和 isOpen 狀態，只要有變化就自動存到 sessionStorage
watch([messages, isOpen], ([newMessages, newIsOpen]) => {
  if (currentView.value === 'live_chat') {
    sessionStorage.setItem('chatMessages', JSON.stringify(newMessages));
  }
  sessionStorage.setItem('chatIsOpen', newIsOpen);
}, { deep: true });


// --- 區塊作用：4. SignalR 核心方法 (SignalR Core Methods) ---
// 封裝所有與 SignalR 伺服器互動的邏輯

// 初始化 SignalR 連線
const initConnection = async () => {
  if (connection) return; // 防止重複連線

  connection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:7017/chatHub', {
      accessTokenFactory: () => localStorage.getItem('token')
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // 監聽來自伺服器的 'ReceiveMessage' 事件
  connection.on('ReceiveMessage', (messageData) => {
    const receivedTime = new Date(messageData.timestamp);
    messages.value.push({
      id: Date.now(),
      message: messageData.message,
      timestamp: receivedTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: messageData.type
    });
    
    if (!isOpen.value) { hasNewMessage.value = true; }
    scrollToBottom();
  });

  // 處理各種連線狀態
  connection.onclose(() => { isConnected.value = false; });
  connection.onreconnecting(() => { isConnected.value = false; });
  connection.onreconnected(async () => { 
    isConnected.value = true;
    if (connection) await connection.invoke('JoinAsUser');
  });

  // 嘗試啟動連線
  try {
    await connection.start();
    isConnected.value = true;
    await connection.invoke('JoinAsUser');
  } catch (err) {
    console.error('SignalR 連線失敗:', err);
    isConnected.value = false;
  }
};

// 使用者發送訊息
const sendMessage = async () => {
  if (!newMessage.value.trim() || !isConnected.value) return;
  const messageData = {
    id: Date.now(),
    message: newMessage.value,
    timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
    type: 'user'
  };
  messages.value.push(messageData);
  try {
    await connection.invoke('SendMessageToAdmin', newMessage.value);
    newMessage.value = '';
    scrollToBottom();
  } catch (err) {
    console.error('發送訊息失敗:', err);
  }
};


// --- 區塊作用：5. UI 畫面控制方法 (UI View Control) ---
// 這些函式只負責改變介面的顯示狀態

const showFaq = (topic) => { currentView.value = `faq_${topic}`; };
const showMainMenu = () => { currentView.value = 'main_menu'; };
const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    if (currentView.value !== 'live_chat') { showMainMenu(); }
    hasNewMessage.value = false;
    scrollToBottom();
  }
};

const startLiveChat = () => {
  currentView.value = 'live_chat';
  sessionStorage.setItem('chatState', 'live_chat');
  initConnection();
};
const leaveLiveChat = () => {
  if (connection) {
    connection.stop();
    connection = null;
  }
  isConnected.value = false;
  messages.value = [];
  sessionStorage.removeItem('chatState');
  sessionStorage.removeItem('chatMessages');
  sessionStorage.removeItem('chatIsOpen');
  showMainMenu();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};


// --- 區塊作用：6. Vue 生命週期鉤子 (Lifecycle Hooks) ---
// 在元件生命週期的特定時間點自動執行的程式碼

onMounted(() => {
  // 【功能】刷新後恢復對話狀態
  const savedState = sessionStorage.getItem('chatState');
  const savedIsOpen = sessionStorage.getItem('chatIsOpen') === 'true';

  // 恢復視窗開關狀態
  isOpen.value = savedIsOpen;

  if (savedState === 'live_chat') {
    messages.value = JSON.parse(sessionStorage.getItem('chatMessages')) || [];
    currentView.value = 'live_chat';
    initConnection();
  }
});

onUnmounted(() => {
  // 【功能】離開頁面時，中斷連線
  if (connection) {
    connection.stop();
  }
});


// --- 區塊作用：7. FAQ 靜態資料 ---
// 將固定的文字內容放在這裡，方便管理
const faqData = {
  account: {
    title: '帳號相關問題',
    items: [ { q: '如何修改我的密碼？', a: '請點擊頭像進入會員中心，選擇「修改密碼」即可進行變更喵。' }, { q: '收不到手機驗證碼怎麼辦？', a: '請確認手機號碼是否正確，或稍後再試。如果問題持續，請直接「聯繫客服」讓我們為您處理。' }, { q: '忘記帳號了怎麼辦？', a: '您可以嘗試使用註冊時的 Email 作為帳號登入，或點擊登入頁面的「忘記密碼」功能喵。' } ]
  },
  delivery: {
    title: '商品配送問題',
    items: [ { q: '下單後多久會出貨？', a: '客製化泡麵需要精心製作，我們會在您下單後的 3-5 個工作天內為您出貨喵。' }, { q: '如何修改配送地址？', a: '在訂單狀態變為「已出貨」之前，您都可以在「訂單查詢」中修改地址。如果訂單已出貨，請「聯繫客服」。' }, { q: '可以指定到貨時間嗎？', a: '目前我們提供「不指定」、「上午」、「下午」三個時段，您可以在結帳時選擇，但無法指定精確時間點喔。' } ]
  },
  product: {
    title: '商品相關問題',
    items: [ { q: '收到的商品有瑕疵怎麼辦？', a: '非常抱歉！請立即拍照並「聯繫客服」，我們會立刻為您安排換貨或退款事宜。' }, { q: '我可以客製化哪些配料？', a: '我們提供多種麵體、湯頭、配料與辣度選擇，所有可客製化的項目都在商品頁面上有詳細說明喔！' }, { q: '為什麼我的優惠券不能使用？', a: '請確認優惠券是否符合使用規則（如低消金額、適用商品），以及是否在有效期限內。若仍有問題，歡迎「聯繫客服」喵。' } ]
  }
};
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
        <h3>{{ headerText }}</h3>
        <div>
           <button @click="toggleChat" class="close-btn" aria-label="關閉視窗">×</button>
        </div>
      </div>
      
      <div v-if="currentView === 'main_menu'" class="menu-view">
        <div class="greeting-message">
          <p>需要什麼幫助喵？</p>
        </div>
        <div class="menu-options">
          <button @click="showFaq('account')" class="menu-button">帳號問題</button>
          <button @click="showFaq('delivery')" class="menu-button">配送問題</button>
          <button @click="showFaq('product')" class="menu-button">商品問題</button>
          <button @click="startLiveChat" class="menu-button primary">聯繫客服</button>
        </div>
      </div>

      <div v-else-if="currentView.startsWith('faq_')" class="faq-view">
        <div class="faq-content">
          <h4>{{ faqData[currentFaqTopic].title }}</h4>
          <ul>
            <li v-for="(item, index) in faqData[currentFaqTopic].items" :key="index">
              <strong>{{ item.q }}</strong>
              <p>{{ item.a }}</p>
            </li>
          </ul>
        </div>
        <div class="faq-footer">
          <button @click="showMainMenu" class="menu-button secondary">返回上一層</button>
        </div>
      </div>
      
      <div v-else-if="currentView === 'live_chat'" class="live-chat-view">
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

        <div class="chat-footer">
            <button v-if="isConnected" @click="leaveLiveChat" class="leave-btn-footer">
              離開對話
            </button>
        </div>
        
        <div class="connection-status" :class="{ 'connected': isConnected }">
          {{ isConnected ? '已連線真人客服' : '連線中...' }}
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
/* --- 配色定義 --- */
:root {
  --primary-purple: #7B52A1;
  --light-purple: #E8DAEF;
  --accent-yellow: #e0cd89;
  --dark-gray: #4A4A4A;
  --light-gray: #aea7a7;
  --text-light: #FFFFFF;
  --text-dark: #333333;
}
/* --- 主體與按鈕 --- */
.customer-service {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 1000;
  font-family: 'Microsoft JhengHei', 'Segoe UI', sans-serif;
}
.cs-button {
  width: 85px; 
  height: 85px;
  background-color: var(--primary-purple);
  background-image: url('/customer1.png');
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  border: 4px solid rgb(244, 245, 208);
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
}
.cs-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
.notification-dot {
  position: absolute;
  top: 5px;
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
  background: white;
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
  flex-shrink: 0;
}
.chat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
  padding: 0;
  line-height: 1;
}
.close-btn:hover {
  opacity: 1;
}
/* --- 選單與FAQ畫面 --- */
.menu-view, .faq-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8f9fa;
}
.greeting-message {
  text-align: center;
  padding: 20px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-purple, #7B52A1);
}
.menu-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.menu-button {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.menu-button:hover {
  background-color: #f0f0f0;
  border-color: #ccc;
}
.menu-button.primary {
  background-color: var(--primary-purple, #7B52A1);
  color: white;
  border-color: var(--primary-purple, #7B52A1);
  font-weight: bold;
}
.menu-button.primary:hover {
  background-color: #5A3D75;
}
.menu-button.secondary {
  background: #6c757d;
  color: white;
  text-align: center;
  font-weight: bold;
}
.faq-view {
  overflow: hidden;
}
.faq-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}
.faq-content h4 {
  color: var(--primary-purple, #7B52A1);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--light-purple, #E8DAEF);
}
.faq-content ul {
  list-style: none;
  padding: 0;
}
.faq-content li {
  margin-bottom: 20px;
}
.faq-content li strong {
  display: block;
  margin-bottom: 5px;
  color: var(--dark-gray, #4A4A4A);
}
.faq-content li p {
  margin: 0;
  color: #6c757d;
  line-height: 1.6;
}
.faq-footer {
  padding-top: 15px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}
/* --- 真人客服對話畫面 --- */
.live-chat-view {
  display: flex;
  flex-direction: column;
  flex: 1; /*  讓這個整個聊天畫面區塊，填滿 chat-window 中除了 header 以外的所有剩餘空間 */
  overflow: hidden; /*  防止這個容器自己產生不必要的捲軸 */
}
.chat-messages {
  flex: 1; /* 在 .live-chat-view 內部，讓訊息區塊佔滿所有剩餘空間 */
  overflow-y: auto; /*  只有這個訊息區塊，在內容超出時可以垂直捲動 */
  padding: 20px;
  background-color: var(--accent-yellow, #ffffff); 
}
.message { display: flex; margin-bottom: 15px; }
.message-content { padding: 12px 18px; border-radius: 20px; max-width: 85%; word-wrap: break-word; }
.user-message { justify-content: flex-end; }
.user-message .message-content { background: #5A3D75; color: white; border-bottom-right-radius: 5px; }
.admin-message { justify-content: flex-start; }
.admin-message .message-content { background: #E8DAEF; color: #333333; border: 1px solid #D6C1E3; border-bottom-left-radius: 5px; }
.message-content p { margin: 0 0 5px 0; }
.timestamp { font-size: 11px; opacity: 0.9; text-align: right; display: block; }
.chat-input { display: flex; padding: 15px; background: white; border-top: 1px solid #eee; flex-shrink: 0; }
.chat-input input { flex: 1; border: 2px solid #3b3636; border-radius: 25px; padding: 10px 18px; outline: none; margin-right: 10px; transition: border-color 0.3s; }
.chat-input input:focus { border-color: var(--primary-purple); }
.chat-input button { background: var(--primary-purple); color: rgb(230, 164, 164); border: none; border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.chat-input button:hover:not(:disabled) { background: #5A3D75; }
.chat-input button:active:not(:disabled) { transform: scale(0.9); }
.chat-input button:disabled { background: #ccc; cursor: not-allowed; }
.chat-footer {
  padding: 10px;
  text-align: center;
  background: white;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}
.leave-btn-footer {
  background: none;
  border: 1px solid #6c757d;
  color: #6c757d;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.leave-btn-footer:hover {
  background: #6c757d;
  color: white;
}
.connection-status { padding: 5px 15px; text-align: center; font-size: 12px; background: var(--dark-gray); color: rgb(60, 57, 57); font-weight: 500; flex-shrink: 0; }
.connection-status.connected { background: #efcbec }
</style>