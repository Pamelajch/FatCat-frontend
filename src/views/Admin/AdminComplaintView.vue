<script setup>
// ========================================================================
// 區塊 1：Setup & 引入
// ========================================================================
import { ref, onMounted, computed, reactive, watch } from 'vue';
import api from '@/services/jjapi.js'; // 👈 使用這個，而不是原始的 'axios'

// ========================================================================
// 區塊 2：響應式狀態 (Reactive State)
// ========================================================================
const allComplaints = ref([]);
const complaints = ref([]);
const selectedComplaint = ref(null);
const isLoading = ref(true);
const error = ref(null);
const activeStatus = ref(0);
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const newResponse = ref('');
const isProcessing = ref(false);

const statusButtons = [
  { id: null, name: '全部', color: 'btn-warning' },
  { id: 0, name: '待處理', color: 'btn-secondary' },
  { id: 1, name: '已回覆', color: 'btn-success' },
  { id: 2, name: '已結案', color: 'btn-dark' },
];

const toast = reactive({
  show: false,
  message: '',
  type: 'success',
});

// ========================================================================
// 區塊 3：計算屬性 (Computed Properties)
// ========================================================================
const totalPages = computed(() => Math.ceil(complaints.value.length / itemsPerPage));
const paginatedComplaints = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return complaints.value.slice(startIndex, startIndex + itemsPerPage);
});

// ========================================================================
// 區塊 4：主要方法 (Methods)
// ========================================================================
const fetchComplaints = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/complaints/admin-view');
    
    // ============================================================
    // vvvvvvvvvvvv 【偵錯步驟 1】 vvvvvvvvvvvv
    // ============================================================
    // 看看從後端收到的最原始資料長怎樣、有幾筆
    console.log("【偵錯 1】從後端收到的原始資料:", response.data);
    console.log("【偵錯 1】收到的總筆數:", response.data.length);
    // ============================================================
    
    allComplaints.value = response.data;
  } catch (err) {
    error.value = "無法載入申訴資料。";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = () => {
    // ============================================================
    // vvvvvvvvvvvv 【偵錯步驟 2】 vvvvvvvvvvvv
    // ============================================================
    console.log(`【偵錯 2】開始篩選，條件為: 狀態ID=${activeStatus.value}, 搜尋詞='${searchTerm.value}'`);
    console.log("【偵錯 2】用來篩選的完整資料 (allComplaints):", allComplaints.value);
    // ============================================================

    let result = [...allComplaints.value];
    if (activeStatus.value !== null) {
        result = result.filter(c => c.complaintStatusId === activeStatus.value);
    }
    if (searchTerm.value.trim() !== '') {
        const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
        result = result.filter(c => c.userName && c.userName.toLowerCase().includes(lowerCaseSearchTerm));
    }
    
    // ============================================================
    // vvvvvvvvvvvv 【偵錯步驟 3】 vvvvvvvvvvvv
    // ============================================================
    console.log("【偵錯 3】篩選後的結果:", result);
    // ============================================================

    complaints.value = result;
    currentPage.value = 1;
};

const selectStatus = (statusId) => {
    activeStatus.value = statusId;
    applyFilters();
};

const selectComplaint = (complaint) => {
    selectedComplaint.value = complaint;
    newResponse.value = '';
};

const closeDetailView = () => {
    selectedComplaint.value = null;
};

const getAdminId = () => {
    const storedAdmin = localStorage.getItem('admin');
    const adminInfo = storedAdmin ? JSON.parse(storedAdmin) : null;
    if (!adminInfo || !adminInfo.adminId) {
        alert('錯誤：找不到管理員登入資訊，請重新登入。');
        return null;
    }
    return adminInfo.adminId;
};

const submitReply = async () => {
    if (!newResponse.value.trim()) {
        alert('回覆內容不可為空。');
        return;
    }
    const adminId = getAdminId();
    if (!adminId) return;

    isProcessing.value = true;
    try {
        const payload = { responseText: newResponse.value, adminId };
        await api.post(`/complaints/${selectedComplaint.value.complaintId}/reply`, payload);
        alert('回覆成功！');
        newResponse.value = ''; //清空輸入框
        await refreshData();
    } catch (err) {
        alert('回覆失敗！');
        console.error(err);
    } finally {
        isProcessing.value = false;
    }
};

const markAsClosed = async () => {
    if (!confirm('確定要將此案件結案嗎？')) return;
    const adminId = getAdminId();
    if (!adminId) return;

    isProcessing.value = true;
    try {
        const payload = { newStatusId: 2, adminId };
        await api.put(`/complaints/${selectedComplaint.value.complaintId}/status`, payload);
        alert('案件已結案！');
        await refreshData();
    } catch (err) {
        alert('操作失敗！');
        console.error(err);
    } finally {
        isProcessing.value = false;
    }
};

const refreshData = async () => {
    const complaintIdToKeepOpen = selectedComplaint.value.complaintId;
    await fetchComplaints();
    applyFilters();
    const updatedComplaint = allComplaints.value.find(c => c.complaintId === complaintIdToKeepOpen);
    selectedComplaint.value = updatedComplaint || null;
};

// ========================================================================
// 區塊 5：監聽器 & 生命週期鉤子
// ========================================================================
watch(searchTerm, () => applyFilters());

onMounted(async () => {
  await fetchComplaints();
  applyFilters();
});
</script>

<template>
  <div class="complaint-management">
    <header class="page-header">
      <h3>消費申訴處理</h3>
      <div class="filters-and-search">
        <div class="search-bar">
            <input type="text" v-model.trim="searchTerm" placeholder="搜尋申訴人姓名...">
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

    <div v-if="isLoading">載入中...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else class="content-layout">
      <!-- 左側列表 -->
      <div class="list-panel">
        <h4>{{ statusButtons.find(s => s.id === activeStatus)?.name || '所有' }} 案件 ({{ complaints.length }} 筆)</h4>
        <table class="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>主旨</th>
              <th>申訴人</th>
              <th>訂單號碼</th>
              <th>申訴時間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedComplaints.length === 0">
              <td colspan="5">沒有符合條件的案件</td>
            </tr>
            <tr v-for="complaint in paginatedComplaints" :key="complaint.complaintId" @click="selectComplaint(complaint)" :class="{ 'table-active': selectedComplaint && selectedComplaint.complaintId === complaint.complaintId }">
              <td>{{ complaint.complaintId }}</td>
              <td>{{ complaint.subject }}</td>
              <td>{{ complaint.userName }}</td>
              <td>#{{ complaint.orderId }}</td>
              <td>{{ new Date(complaint.createdAt).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
        <!-- 分頁 -->
        <nav v-if="totalPages > 1" class="mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }"><a class="page-link" href="#" @click.prevent="currentPage--">上一頁</a></li>
            <li class="page-item disabled"><span class="page-link">{{ currentPage }} / {{ totalPages }}</span></li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }"><a class="page-link" href="#" @click.prevent="currentPage++">下一頁</a></li>
          </ul>
        </nav>
      </div>

      <!-- 右側詳情 -->
      <div class="detail-panel">
        <div v-if="selectedComplaint" class="detail-content">
          <h4>案件詳情 (ID: {{ selectedComplaint.complaintId }})</h4>
          <hr>
          <!-- 案件資訊 -->
          <p><strong>申訴人:</strong> {{ selectedComplaint.userName }} (ID: {{ selectedComplaint.userId }})</p>
          <p><strong>訂單號碼:</strong> #{{ selectedComplaint.orderId }}</p>
          <p><strong>申訴類型:</strong> {{ selectedComplaint.complaintTypeName }}</p>
          <p><strong>申訴時間:</strong> {{ new Date(selectedComplaint.createdAt).toLocaleString() }}</p>
          <p><strong>目前狀態:</strong> {{ selectedComplaint.complaintStatusName }}</p>
          <hr>
          <h5><strong>主旨:</strong> {{ selectedComplaint.subject }}</h5>
          <p class="description-box">{{ selectedComplaint.description }}</p>
          
          <!-- 客服回覆區 -->
          <div v-if="selectedComplaint.responseText" class="response-box mt-3">
            <h6><strong>客服回覆 (由 {{ selectedComplaint.adminName }} 於 {{ new Date(selectedComplaint.resolvedAt).toLocaleString() }}):</strong></h6>
            <p>{{ selectedComplaint.responseText }}</p>
          </div>

          <hr>
          <!-- 管理員操作區 -->
          <div class="admin-actions">
            <h5>管理員操作</h5>
            <div class="mb-3">
              <label for="responseText" class="form-label">回覆內容:</label>
              <textarea id="responseText" class="form-control" rows="4" v-model="newResponse" placeholder="在此輸入回覆..."></textarea>
            </div>
            <div class="d-flex justify-content-between">
                <button class="btn btn-info" @click="submitReply" :disabled="isProcessing">
                    {{ isProcessing ? '處理中...' : '送出回覆 (並標示為已回覆)' }}
                </button>
                <button v-if="selectedComplaint.complaintStatusId !== 2" class="btn btn-dark" @click="markAsClosed" :disabled="isProcessing">
                    {{ isProcessing ? '處理中...' : '手動結案' }}
                </button>
            </div>
          </div>
        </div>
        <div v-else class="placeholder">點擊左側列表以查看詳細資訊。</div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* 樣式與檢舉管理頁面類似，可以從那邊複製或微調 */
.complaint-management { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.content-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
.list-panel, .detail-panel { border: 1px solid #ccc; border-radius: 8px; padding: 15px; }
.table-hover tbody tr { cursor: pointer; }
.description-box, .response-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
</style>
