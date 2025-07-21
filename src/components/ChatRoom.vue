<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';

const props = defineProps({
  roomArn: {
    type: String,
    required: true,
  },
  // 讓管理員可以傳入自己的 userName
  userName: {
    type: String,
    default: '路人甲'
  }
});

const messages = ref([]);
const newMessage = ref('');
const connection = ref(null);
const connectionState = ref('disconnected'); // 'connecting', 'connected', 'disconnected'

// 取得聊天室 Token
const getChatToken = async () => {
    try {
        const response = await axios.post('/api/streaming/chat-token');
        return response.data;
    } catch (error) {
        console.error('取得 Chat Token 失敗:', error);
        return null;
    }
}

// 連接到 IVS Chat
const connectToChat = async () => {
    connectionState.value = 'connecting';
    const token = await getChatToken();

    if (!token) {
        connectionState.value = 'disconnected';
        return;
    }

    const ws = new WebSocket("wss://edge.ivschat.ap-northeast-1.amazonaws.com", token);
    connection.value = ws;

    ws.onopen = () => {
        connectionState.value = 'connected';
        console.log('聊天室連線成功！');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.Type === 'MESSAGE') {
            messages.value.push({
                id: data.Id,
                username: data.Attributes?.username || data.Sender.UserId,
                content: data.Content,
            });
            // 自動滾動到最新訊息
            nextTick(() => {
                const chatBox = document.querySelector('.chat-messages');
                if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;
            });
        }
    };

    ws.onclose = () => {
        connectionState.value = 'disconnected';
        console.log('聊天室連線中斷。');
    };

    ws.onerror = (error) => {
        console.error('聊天室發生錯誤:', error);
        connectionState.value = 'disconnected';
    };
}

// 發送訊息
const sendMessage = () => {
    if (newMessage.value.trim() && connection.value && connectionState.value === 'connected') {
        const message = {
            Action: 'SEND_MESSAGE',
            Content: newMessage.value.trim(),
            Attributes: {
                username: props.userName
            }
        };
        connection.value.send(JSON.stringify(message));
        newMessage.value = '';
    }
}

onMounted(() => {
    connectToChat();
});

onUnmounted(() => {
    if (connection.value) {
        connection.value.close();
    }
});

</script>

<template>
    <div class="chat-wrapper">
        <div class="chat-messages">
            <div v-if="connectionState !== 'connected'" class="status-overlay">
                <div v-if="connectionState === 'connecting'" class="spinner-border spinner-border-sm"></div>
                <div v-if="connectionState === 'disconnected'">連線中斷</div>
            </div>
            <div v-for="msg in messages" :key="msg.id" class="message">
                <span class="username" :class="{ admin: msg.username === '肥貓小編' }">{{ msg.username }}：</span>
                <span class="content">{{ msg.content }}</span>
            </div>
        </div>
        <div class="chat-input">
            <input 
                type="text" 
                class="form-control" 
                placeholder="說點什麼..." 
                v-model="newMessage"
                @keyup.enter="sendMessage"
                :disabled="connectionState !== 'connected'"
            >
            <button 
                class="btn btn-primary" 
                @click="sendMessage"
                :disabled="connectionState !== 'connected' || !newMessage.trim()"
            >送出</button>
        </div>
    </div>
</template>

<style scoped>
/* 這裡的樣式是從 StreamViewer.vue 搬過來並優化的 */
.chat-wrapper { height: 100%; display: flex; flex-direction: column; }
.chat-messages { flex-grow: 1; padding: 1rem; overflow-y: auto; position: relative; }
.status-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); display: flex; justify-content: center; align-items: center; }
.message { margin-bottom: 0.75rem; font-size: 0.9rem; word-wrap: break-word; }
.username { font-weight: bold; }
.username.admin { color: #0d6efd; }
.chat-input { display: flex; padding: 1rem; border-top: 1px solid #e9ecef; gap: 0.5rem; }
</style>
