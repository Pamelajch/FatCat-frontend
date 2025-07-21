import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

// 在 store 外定義一個 key，方便管理
const STREAM_INFO_KEY = 'fatcat_stream_info';

export const useStreamStore = defineStore('stream', () => {
  // --- State ---
  
  // 【修改1】從 localStorage 初始化 streamInfo，如果沒有就給 null
  const streamInfo = ref(JSON.parse(localStorage.getItem(STREAM_INFO_KEY) || 'null'));
  
  // isLive 和 currentStreamTitle 的狀態，現在可以從 streamInfo 衍生出來
  const isLive = ref(!!streamInfo.value);
  const currentStreamTitle = ref(streamInfo.value?.title || '');

  // --- Actions ---

  // 檢查當前是否有直播 (給全站使用)
  const checkCurrentStream = async () => {
    try {
      const response = await axios.get('/api/streaming/current');
      if (response.data) {
        isLive.value = true;
        currentStreamTitle.value = response.data.title;
        // 如果 API 說有直播，但我們的 localStorage 沒資料，可以考慮更新
        if (!streamInfo.value) {
            // 這表示可能是另一位管理員開的台，我們只更新標題和狀態
            // 金鑰等資訊此時拿不到，但狀態是正確的
        }
      } else {
        // 如果 API 說沒直播了，我們就清理狀態
        isLive.value = false;
        currentStreamTitle.value = '';
        streamInfo.value = null;
        localStorage.removeItem(STREAM_INFO_KEY);
      }
    } catch (error) {
      console.error('檢查直播狀態失敗:', error);
      isLive.value = false;
    }
  };

  // 開始直播 (給管理員用)
  const startStream = async (title) => {
    const response = await axios.post('/api/streaming/start', { title });
    const newStreamInfo = {
        ...response.data, // 包含 ingestEndpoint 和 streamKey
        title: title
    };
    
    // 【修改2】將收到的 OBS 金鑰和標題，同時存入 ref 和 localStorage
    streamInfo.value = newStreamInfo;
    localStorage.setItem(STREAM_INFO_KEY, JSON.stringify(newStreamInfo));
    
    isLive.value = true;
    currentStreamTitle.value = title;
  };

  // 結束直播 (給管理員用)
  const endStream = async () => {
    await axios.post('/api/streaming/end');
    
    // 【修改3】結束直播時，清理 ref 和 localStorage
    isLive.value = false;
    streamInfo.value = null;
    currentStreamTitle.value = '';
    localStorage.removeItem(STREAM_INFO_KEY);
  };

  // 【新增】一個初始化 Action，在 App.vue 中呼叫
  const initialize = () => {
      const storedInfo = localStorage.getItem(STREAM_INFO_KEY);
      if (storedInfo) {
          const info = JSON.parse(storedInfo);
          streamInfo.value = info;
          currentStreamTitle.value = info.title;
          // 我們可以假設，如果 localStorage 有資料，那直播應該還在進行中
          // 透過 checkCurrentStream 來做最終確認
          isLive.value = true;
          checkCurrentStream();
      }
  };

  return {
    isLive,
    streamInfo,
    currentStreamTitle,
    checkCurrentStream,
    startStream,
    endStream,
    initialize, // 記得匯出
  };
});
