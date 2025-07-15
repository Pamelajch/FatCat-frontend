<script setup>
// --- 區塊 1：Setup & 引入 ---
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';

// --- 區塊 2：響應式狀態 (Reactive State) ---
const reports = ref([]);
const selectedReport = ref(null);
const isLoading = ref(true);
const error = ref(null);
const filterStatus = ref(null);

const statusOptions = [
  { id: null, name: '所有狀態' },
  { id: 0, name: '待處理' },
  { id: 1, name: '成立 (評論已隱藏)' },
  { id: 2, name: '不成立 (評論保留)' },
];

// --- 區塊 3：Toast 通知相關狀態與方法 ---
const isProcessing = ref(false); // 僅用於「單一審核操作」的處理狀態
const toast = reactive({
  show: false,
  message: '',
  type: 'success',
});

const showToast = (message, type = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

// --- 區塊 4：計算屬性 (Computed Properties) ---
const selectedStatusName = computed(() => {
    const found = statusOptions.find(opt => opt.id === filterStatus.value);
    return found ? found.name : '所有';
});

// --- 區塊 5：主要方法 (Methods) ---

const fetchReports = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams();
    if (filterStatus.value !== null) {
        params.append('statusId', filterStatus.value);
    }
    const response = await axios.get(`/api/ReviewReports/admin-view?${params.toString()}`);
    reports.value = response.data;
  } catch (err) {
    console.error("Failed to fetch reports:", err);
    error.value = "無法載入檢舉資料，請稍後再試。";
  } finally {
    isLoading.value = false;
  }
};

const selectReport = (report) => {
  selectedReport.value = report;
};

const closeDetailView = () => {
  selectedReport.value = null;
};

// ========================================================================
// vvvvvvvvvvvv 【處理審核的核心邏輯，包含完整註解】 vvvvvvvvvvvv
// ========================================================================
/**
 * @description 處理審核操作（通過/駁回），並呼叫後端 API
 * @param {number} reportId - 要處理的檢舉 ID
 * @param {number} newStatusId - 新的狀態 ID (1=成立, 2=不成立)
 */
const processReport = async (reportId, newStatusId) => {
    // 1. 防止在處理中時重複點擊
    if (isProcessing.value) return;

    // 2. 彈出確認對話框，如果使用者按取消則中止
    if (!confirm(`確定要將此案件狀態更改嗎?`)) return;

    // 3. 從 localStorage 獲取當前登入的管理員資訊
    const storedAdmin = localStorage.getItem('admin');
    const adminInfo = storedAdmin ? JSON.parse(storedAdmin) : null;
    
    // 4. 驗證管理員資訊是否存在且完整
    if (!adminInfo || !adminInfo.adminId) {
        showToast('錯誤：找不到管理員登入資訊，請重新登入。', 'error');
        return;
    }
    const currentAdminId = adminInfo.adminId;

    // 5. 開始處理，進入處理中狀態 (按鈕會被禁用)
    isProcessing.value = true;

    try {
        // 6. 準備要發送到後端的資料 (Payload)
        const payload = {
            NewStatusId: newStatusId,
            AdminId: currentAdminId,
        };
        
        // 7. 呼叫後端 API，更新資料庫
        await axios.put(`/api/ReviewReports/${reportId}/status`, payload);
        
        // 8. 顯示成功的 Toast 通知
        showToast('操作成功！', 'success');

        // 9. 優化體驗：刷新後保持視窗開啟，並更新內容
        const reportIdToKeepOpen = selectedReport.value.reportId;
        await fetchReports();
        const updatedReport = reports.value.find(r => r.reportId === reportIdToKeepOpen);
        selectedReport.value = updatedReport || null;

    } catch (err) {
        // 10. 如果發生錯誤，顯示失敗的 Toast 通知
        const errorMessage = err.response?.data || "發生未知錯誤";
        showToast(`操作失敗：${errorMessage}`, 'error');
        console.error("Failed to process report:", err);
    } finally {
        // 11. 無論成功或失敗，最後都結束處理中狀態
        isProcessing.value = false;
    }
};
// ========================================================================
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// --- 區塊 6：生命週期鉤子 (Lifecycle Hooks) ---
onMounted(() => {
  fetchReports();
});
</script>

<template>
  <div class="report-management">

    <transition name="toast">
        <div v-if="toast.show" class="toast-notification" :class="toast.type">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <svg v-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{{ toast.message }}</span>
        </div>
    </transition>
    
    <header class="page-header">
      <h3>評論檢舉管理</h3>
      <div class="filters">
        <label for="status-filter">篩選狀態：</label>
        <select id="status-filter" v-model="filterStatus" @change="fetchReports">
          <option v-for="status in statusOptions" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
      </div>
    </header>

    <div v-if="isLoading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="content-layout">

      <div class="report-list">
        <h4>{{ selectedStatusName }} 案件列表 ({{ reports.length }} 筆)</h4>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>檢舉理由</th>
              <th>被檢舉評論 (預覽)</th>
              <th>檢舉人</th>
              <th>檢舉時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reports.length === 0">
              <td colspan="6">沒有符合條件的案件</td>
            </tr>
            <tr v-for="report in reports" :key="report.reportId" @click="selectReport(report)" :class="{ 'selected': selectedReport && selectedReport.reportId === report.reportId }">
              <td>{{ report.reportId }}</td>
              <td>{{ report.reasonName }}</td>
              <td class="preview-text">{{ report.reviewContent }}</td>
              <td>{{ report.reporterUserName }}</td>
              <td>{{ new Date(report.createdAt).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '-') }}</td>
              <td>
                <button @click.stop="selectReport(report)">查看詳情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="selectedReport" class="report-detail">
        <div class="detail-header">
            <h3>案件詳情 (ID: {{ selectedReport.reportId }})</h3>
            <button class="close-btn" @click="closeDetailView">×</button>
        </div>

        <div class="detail-content">
          <div class="detail-item">
            <strong>檢舉時間:</strong>
            <p>{{ new Date(selectedReport.createdAt).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '-') }}</p>
          </div>
          <div class="detail-item">
            <strong>檢舉人:</strong>
            <p>{{ selectedReport.reporterUserName }} (ID: {{ selectedReport.userId }})</p>
          </div>
          <div class="detail-item">
            <strong>檢舉理由:</strong>
            <p>{{ selectedReport.reasonName }}</p>
          </div>
          <div class="detail-item">
            <strong>檢舉人附註:</strong>
            <p class="comment-box">{{ selectedReport.reasonComment || '（無）' }}</p>
          </div>
          <hr>
          <div class="detail-item">
            <strong>被檢舉的評論全文 (Review ID: {{ selectedReport.reviewId }}):</strong>
            <p class="comment-box review-content">{{ selectedReport.reviewContent }}</p>
          </div>
          <hr>
          <div v-if="selectedReport.adminId" class="detail-item">
            <strong>處理狀態:</strong>
            <p>{{ selectedReport.statusName }}</p>
            <strong>處理時間:</strong>
            <p>{{ new Date(selectedReport.processedAt).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '-') }}</p>
            <strong>處理管理員:</strong>
            <p>{{ selectedReport.adminUserName || 'N/A' }}</p>
          </div>
        </div>

        <div class="detail-actions">
            <button class="btn-approve" @click="processReport(selectedReport.reportId, 1)" :disabled="isProcessing">
                {{ isProcessing ? '處理中...' : '審核通過 (成立)' }}
            </button>
            <button class="btn-reject" @click="processReport(selectedReport.reportId, 2)" :disabled="isProcessing">
                {{ isProcessing ? '處理中...' : '駁回檢舉 (不成立)' }}
            </button>
        </div>
      </div>
      
      <div v-else class="placeholder">
        點擊左側列表中的案件以查看詳細資訊。
      </div>

    </div>
  </div>
</template>



<style lang="css" scoped>

.report-management {
  padding: 20px;
  font-family: 'Microsoft JhengHei', sans-serif;
}

/* --- 頁首與篩選器 --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h3 {
    margin: 0;
}

/* --- 主佈局 --- */
.content-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  height: calc(100vh - 200px); /* 可根據你的頁面 header/footer 高度微調 */
}

/* --- 左側列表 --- */
.report-list {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto; /* 讓列表在過長時可以滾動 */
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border-bottom: 1px solid #ddd;
  padding: 12px 8px;
  text-align: left;
}
thead {
  background-color: #f2f2f2;
}
tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}
tbody tr:hover {
  background-color: #f5f5f5;
}
tbody tr.selected {
    background-color: #e0e8f0;
}
.preview-text {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* --- 右側詳情面板 --- */
.report-detail, .placeholder {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  display: flex; /* 使用 Flexbox 進行佈局 */
  flex-direction: column; /* 垂直排列 */
  overflow: hidden; /* 【關鍵】讓此容器本身不要出現滾動條 */
}
.placeholder {
    align-items: center;
    justify-content: center;
    color: #888;
}
.detail-header {
    flex-shrink: 0; /* Header 不收縮 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
    margin-bottom: 10px;
}
.detail-header h3 {
    margin: 0;
}
.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
}
.detail-content {
    flex-grow: 1; /* 【關鍵】讓內容區塊自動填滿剩餘空間 */
    overflow-y: auto; /* 【關鍵】只讓內容區塊在需要時出現滾動條 */
    padding-right: 10px; /* 避免滾動條跟內容黏在一起 */
}
.detail-item {
    margin-bottom: 15px;
}
.detail-item strong {
    display: block;
    margin-bottom: 5px;
    color: #333;
}
.detail-item p {
    margin: 0;
    color: #666;
}
.comment-box {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    padding: 10px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-word;
}
.review-content {
    background-color: #fffbe6;
}

/* --- 審核按鈕區塊 --- */
.detail-actions {
  flex-shrink: 0; /* 按鈕區塊不收縮 */
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #ccc;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.detail-actions button {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
}
.btn-approve {
    background-color: #28a745;
}
.btn-approve:hover {
    background-color: #218838;
}
.btn-reject {
    background-color: #dc3545;
}
.btn-reject:hover {
    background-color: #c82333;
}
.success-message {
  text-align: center;
  color: #28a745;
  font-weight: bold;
  padding: 10px;
  margin-top: 10px;
  background-color: #e9f7ef;
  border-radius: 4px;
}

/* 讓按鈕在禁用時有更明確的樣式 */
.detail-actions button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>