<script setup>
import { ref } from 'vue';
import axios from 'axios';

// --- Props & Emits ---
const props = defineProps({
  reviewId: { type: Number, required: true },
  initialCount: { type: Number, default: 0 },
  
  // --- 👇👇👇【控制顏色的關鍵 #1】 ---
  // 這裡必須定義 initialUserVote，它像一個插座，準備接收來自父層的「投票記憶」
  initialUserVote: { type: Boolean, default: null } 
});

const emit = defineEmits(['vote-updated']);

// --- 狀態定義 ---
const API_BASE_URL = 'https://localhost:7017/api';
const helpfulnessCount = ref(props.initialCount);
const isLoading = ref(false);

// --- 👇👇👇【控制顏色的關鍵 #2】 ---
// 這裡必須用 props.initialUserVote 來初始化狀態。
// 它說：「我的初始顏色狀態，由父層傳進來的插頭決定！」
// 如果收到 true，讚按鈕就是綠色；如果收到 false，倒讚按鈕就是紅色。
const currentUserVote = ref(props.initialUserVote); 

const vote = async (voteType) => {
  if (isLoading.value || currentUserVote.value === voteType) {
    return;
  }
  
  isLoading.value = true;
  const previousVote = currentUserVote.value;

  if (voteType === true) {
    helpfulnessCount.value++;
  } else {
    if (previousVote === true) {
      helpfulnessCount.value--;
    }
  }
  currentUserVote.value = voteType;
  
  try {
    const response = await axios.post(`${API_BASE_URL}/reviews/${props.reviewId}/helpfulness`, {
      isHelpful: voteType
    });
    
    if (response.data && typeof response.data.newCount === 'number') {
        helpfulnessCount.value = response.data.newCount;
    }
    
    emit('vote-updated', { 
        reviewId: props.reviewId, 
        newCount: helpfulnessCount.value,
        newUserVote: currentUserVote.value
    });

  } catch (err) {
    console.error('投票失敗:', err);
    alert('投票失敗，請稍後再試。');
    currentUserVote.value = previousVote;
     if (voteType === true) {
        helpfulnessCount.value--;
    } else {
        if (previousVote === true) {
            helpfulnessCount.value++;
        }
    }
  } finally {
      isLoading.value = false;
  }
};
</script>

<template>
  <div class="helpfulness-voting ">
    <button @click="vote(true)" class="btn btn-sm" :class="currentUserVote === true ? 'btn-success' : 'btn-outline-secondary'">
      <i class="fas fa-thumbs-up"></i> 讚 ({{ helpfulnessCount }})
    </button>
    <button @click="vote(false)" class="btn btn-sm ms-2" :class="currentUserVote === false ? 'btn-danger' : 'btn-outline-secondary'">
      <i class="fas fa-thumbs-down"></i>
    </button>
  </div>
</template>

<style scoped>
.helpfulness-voting .btn {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
}
</style>
