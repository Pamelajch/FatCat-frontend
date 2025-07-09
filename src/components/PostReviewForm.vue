<script setup>
import { reactive } from 'vue';
import axios from 'axios';

const props = defineProps({
  productId: { type: Number, required: true },
  orderId: { type: Number, required: true } // 假設需要訂單ID來驗證
});

const emit = defineEmits(['review-submitted']);

const API_BASE_URL = 'https://localhost:7017/api';

const newReview = reactive({
  rating: 5,
  comment: '',
  files: []
});

const handleFileChange = (event) => {
  newReview.files = Array.from(event.target.files);
};

const submitReview = async () => {
  const formData = new FormData();
  formData.append('Rating', newReview.rating);
  formData.append('Comment', newReview.comment);
  if (newReview.files.length > 0) {
    for (const file of newReview.files) {
      formData.append('Files', file);
    }
  }

  try {
    // 我們呼叫的是針對特定產品的 POST API
    await axios.post(`${API_BASE_URL}/products/${props.productId}/reviews`, formData);
    alert('感謝您的評論！');
    emit('review-submitted'); // 發送事件，通知父層更新列表
  } catch (err) {
    console.error('提交評論失敗:', err);
    alert('提交評論失敗，請稍後再試。');
  }
};
</script>

<template>
  <div class="add-review-form card mt-5">
    <h5 class="card-header">針對訂單 #{{ orderId }} 發表你的評論</h5>
    <div class="card-body">
      <form @submit.prevent="submitReview">
        <div class="mb-3">
          <label class="form-label">你的評分</label>
          <div class="rating-input">
            <span 
              v-for="star in 5" 
              :key="star" 
              class="star interactive"
              :class="{ 'filled': star <= newReview.rating }"
              @click="newReview.rating = star"
              >★</span>
          </div>
        </div>
        <div class="mb-3">
          <label for="comment" class="form-label">評論內容</label>
          <textarea id="comment" v-model="newReview.comment" class="form-control" rows="4" placeholder="分享你對這個單品的心得..." required></textarea>
        </div>
        <div class="mb-3">
            <label for="reviewFiles" class="form-label">上傳照片 (可選)</label>
            <input class="form-control" type="file" id="reviewFiles" @change="handleFileChange" multiple accept="image/*">
        </div>
        <button type="submit" class="btn btn-warning w-100">提交評論</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.star { color: #e0e0e0; font-size: 1.5rem; } 
.star.filled { color: #ffa600; }
.rating-input .star { font-size: 2rem; cursor: pointer; transition: color 0.2s ease-in-out; }
.rating-input .star:hover { color: #ffd966; }
</style>

