import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useStreamStore = defineStore('stream', () => {
  // --- State ---
  const isLive = ref(false);
  const streamInfo = ref(null); // 儲存 OBS 用的金鑰等資訊
  const currentStreamTitle = ref('');

  // --- Actions ---

  // 檢查當前是否有直播 (給全站使用)
  const checkCurrentStream = async () => {
    try {
      const response = await axios.get('/api/streaming/current');
      if (response.data) {
        isLive.value = true;
        currentStreamTitle.value = response.data.title;
      } else {
        isLive.value = false;
        currentStreamTitle.value = '';
      }
    } catch (error) {
      console.error('檢查直播狀態失敗:', error);
      isLive.value = false;
    }
  };

  // 開始直播 (給管理員用)
  const startStream = async (title) => {
    const response = await axios.post('/api/streaming/start', { title });
    streamInfo.value = response.data; // 儲存 OBS 金鑰
    isLive.value = true;
    currentStreamTitle.value = title;
  };

  // 結束直播 (給管理員用)
  const endStream = async () => {
    await axios.post('/api/streaming/end');
    isLive.value = false;
    streamInfo.value = null;
    currentStreamTitle.value = '';
  };

  return {
    isLive,
    streamInfo,
    currentStreamTitle,
    checkCurrentStream,
    startStream,
    endStream,
  };
});