<script setup>
// --- 區塊 1：Setup & 引入 ---
import { ref, onMounted, computed, reactive, watch } from 'vue';
import axios from 'axios';

// --- 區塊 2：響應式狀態 (Reactive State) ---
const allReports = ref([]);
const reports = ref([]); // 維持原樣，用來顯示在表格上
const selectedReport = ref(null);
const isLoading = ref(true);
const error = ref(null);
const activeStatus = ref(0);
const searchTerm = ref('');

const statusButtons = [
  { id: null, name: '全部', color: 'btn-warning' },
  { id: 0, name: '待處理', color: 'btn-secondary' },
  { id: 1, name: '成立', color: 'btn-success' },
  { id: 2, name: '不成立', color: 'btn-danger' },
];

// --- 區塊 3：Toast 通知相關狀態與方法 ---
const isProcessing = ref(false);
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

// --- 區塊 4：主要方法 (Methods) ---

/**
 * @description 從後端 API 獲取檢舉列表資料 (只獲取，不過濾)
 */
const fetchReports = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get('/api/ReviewReports/admin-view');
    allReports.value = response.data; // 只更新原始資料備份
    // 【修改】不再自動呼叫 applyFilters
  } catch (err) {
    console.error("Failed to fetch reports:", err);
    error.value = "無法載入檢舉資料，請稍後再試。";
  } finally {
    isLoading.value = false;
  }
};

/**
 * @description 根據 activeStatus 和 searchTerm 在前端進行篩選和搜尋
 */
const applyFilters = () => {
    let result = [...allReports.value];
    if (activeStatus.value !== null) {
        result = result.filter(r => r.reportStatusId === activeStatus.value);
    }
    if (searchTerm.value.trim() !== '') {
        const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
        result = result.filter(r => 
            r.reporterUserName && r.reporterUserName.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }
    reports.value = result;
};

/**
 * @description 點擊狀態按鈕時的處理函式
 */
const selectStatus = (statusId) => {
    activeStatus.value = statusId;
    applyFilters(); // 點擊按鈕時，只需要根據已有的資料進行篩選
};

const selectReport = (report) => {
  selectedReport.value = report;
};

const closeDetailView = () => {
  selectedReport.value = null;
};

/**
 * @description 處理審核操作的核心邏輯
 */
const processReport = async (reportId, newStatusId) => {
    if (isProcessing.value) return;
    if (!confirm(`確定要將此案件狀態更改嗎?`)) return;

    // 獲取 adminId 的程式碼 ...
    const storedAdmin = localStorage.getItem('admin');
    const adminInfo = storedAdmin ? JSON.parse(storedAdmin) : null;
    if (!adminInfo || !adminInfo.adminId) {
        showToast('錯誤：找不到管理員登入資訊，請重新登入。', 'error');
        return;
    }
    const currentAdminId = adminInfo.adminId;
    isProcessing.value = true;

    try {
        const payload = { NewStatusId: newStatusId, AdminId: currentAdminId };
        await axios.put(`/api/ReviewReports/${reportId}/status`, payload);
        showToast('操作成功！', 'success');

        // vvvvvvvvvv 【核心修改】調整非同步流程 vvvvvvvvvv
        const reportIdToKeepOpen = selectedReport.value.reportId;
        
        // 1. 先從後端獲取最新的「全部」資料，更新到 allReports
        await fetchReports();
        
        // 2. 從最新的「全部」資料中，找到我們剛剛更新的那一筆
        const updatedReport = allReports.value.find(r => r.reportId === reportIdToKeepOpen);
        
        // 3. 更新右側詳情面板的顯示內容
        selectedReport.value = updatedReport || null;
        
        // 4. 最後，才根據當前的篩選條件，去更新左側的列表
        applyFilters();

    } catch (err) {
        const errorMessage = err.response?.data || "發生未知錯誤";
        showToast(`操作失敗：${errorMessage}`, 'error');
        console.error("Failed to process report:", err);
    } finally {
        isProcessing.value = false;
    }
};

// --- 區塊 5：監聽器 (Watchers) ---
watch(searchTerm, () => {
    applyFilters();
});

// --- 區塊 6：生命週期鉤子 (Lifecycle Hooks) ---
onMounted(async () => {
  activeStatus.value = 0; 
  await fetchReports(); // 等待資料獲取完成
  applyFilters();       // 然後再執行第一次篩選
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
      <div class="filters-and-search">
        <div class="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>
            <input type="text" v-model.trim="searchTerm" placeholder="搜尋檢舉人姓名...">
        </div>
        <div class="status-buttons">
            <button
                v-for="status in statusButtons"
                :key="status.id"
                class="btn"
                :class="[status.color, { 'active': activeStatus === status.id }]"
                @click="selectStatus(status.id)">
                {{ status.name }}
            </button>
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="content-layout">

      <div class="report-list">
        <h4>{{ statusButtons.find(s => s.id === activeStatus)?.name || '所有' }} 案件列表 ({{ reports.length }} 筆)</h4>
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

.filters-and-search {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap; /* 允許換行 */
}
.search-bar {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border: 1px solid #4e0466;
  border-radius: 20px;
  padding: 0.4rem 1rem;
}
.search-bar i {
  color: #620457;
  margin-right: 8px;
}
.search-bar input {
  border: none;
  background: none;
  outline: none;
}
.status-buttons {
    display: flex;
    gap: 10px;
}
.status-buttons .btn {
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-weight: 500;
    opacity: 0.7;
    transition: all 0.2s ease;
}
.status-buttons .btn.active {
    opacity: 1;
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
/* Bootstrap 按鈕顏色 */
.btn-warning { background-color: #ffc107; color: #212529; }
.btn-secondary { background-color: #6c757d; color: white; }
.btn-success { background-color: #198754; color: white; }
.btn-danger { background-color: #dc3545; color: white; }

</style>