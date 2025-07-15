<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/jjapi.js'; // 👈 確保只匯入 api

// --- Props & Emits ---
const props = defineProps({
  reviewId: {
    type: Number,
    required: true
  }
});
const emit = defineEmits(['close']);

// --- 狀態定義 ---
const reportReasons = ref([]);
const isFetchingReasons = ref(false);
const currentReport = reactive({
  reasonTypeId: '',
  reasonComment: ''
});

// --- API 呼叫 ---
const fetchReportReasons = async () => {
  if (reportReasons.value.length > 0) return;
  isFetchingReasons.value = true;
  try {
    const response = await api.get(`/reviews/report-reasons`);
    reportReasons.value = response.data;
  } catch (err) {
    console.error('取得檢舉原因失敗:', err);
    alert('無法載入檢舉原因，請稍後再試。');
  } finally {
    isFetchingReasons.value = false;
  }
};

const submitReport = async () => {
  if (!currentReport.reasonTypeId) {
    alert('請選擇一個檢舉原因。');
    return;
  }
  try {
    const payload = {
      reasonTypeId: parseInt(currentReport.reasonTypeId),
      reasonComment: currentReport.reasonComment
    };
    
    // 👇👇👇【主要修改點】改用 api 實例發送請求 👇👇👇
    await api.post(`/reviews/${props.reviewId}/report`, payload);
    
    alert('感謝您的檢舉，我們將會盡快處理。');
    emit('close');
  } catch (err) {
    console.error('提交檢舉失敗:', err);
    alert('提交失敗，請稍後再試。');
  }
};

// --- 生命週期鉤子 ---
onMounted(() => {
  fetchReportReasons();
});
</script>

<template>
  <!-- 這是一個半透明的背景遮罩 -->
  <div class="modal-backdrop show"></div>
  <!-- 這是 Modal 的主體 -->
  <div class="modal show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">檢舉評論 (ID: {{ reviewId }})</h5>
          <button type="button" class="btn-close" @click="emit('close')"></button>
        </div>
        <div class="modal-body">
          <div v-if="isFetchingReasons" class="text-center">
            <div class="spinner-border spinner-border-sm"></div>
          </div>
          <form v-else @submit.prevent="submitReport">
            <div class="mb-3">
              <label for="reportReason" class="form-label">請選擇檢舉原因：</label>
              <select class="form-select" id="reportReason" v-model="currentReport.reasonTypeId" required>
                <option disabled value="">請選擇...</option>
                <option v-for="reason in reportReasons" :key="reason.reasonTypeId" :value="reason.reasonTypeId">
                  {{ reason.reasonName }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="reportComment" class="form-label">補充說明 (可選填)：</label>
              <textarea class="form-control" id="reportComment" rows="3" v-model="currentReport.reasonComment"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="emit('close')">取消</button>
          <button type="button" class="btn btn-danger" @click="submitReport">送出檢舉</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 讓 Modal 顯示在畫面中央 */
.modal {
  background-color: rgba(0,0,0,0.5);
}
</style>
