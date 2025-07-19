<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 響應式資料
const admins = ref([])
const loading = ref(false)
const totalCount = ref(0)
const totalPages = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜尋和排序
const searchForm = reactive({
  searchKeyword: '',
  sortBy: 'AdminId',
  sortOrder: 'asc'
})

// 新增/編輯表單
const showModal = ref(false)
const isEdit = ref(false)
const currentAdmin = ref(null)
const formData = reactive({
  email: '',
  password: '',
  name: '',
  phone: '',
  role: '管理員',
  status: 1
})

// 表單驗證
const formErrors = reactive({})

// 角色選項
const roleOptions = [
  { value: '管理員', label: '管理員' },
  { value: '超級管理員', label: '超級管理員' }
]

// 狀態選項
const statusOptions = [
  { value: 1, label: '啟用' },
  { value: 0, label: '停用' }
]

// 計算屬性
const canEdit = computed(() => {
  return authStore.user?.role === '超級管理員'
})

const canDelete = computed(() => {
  return authStore.user?.role === '超級管理員'
})

// 方法
const fetchAdmins = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      searchKeyword: searchForm.searchKeyword,
      sortBy: searchForm.sortBy,
      sortOrder: searchForm.sortOrder,
      page: currentPage.value,
      pageSize: pageSize.value
    })

    const response = await fetch(`/api/Admins?${params}`)
    if (response.ok) {
      const data = await response.json()
      admins.value = data.admins
      totalCount.value = data.totalCount
      totalPages.value = data.totalPages
      currentPage.value = data.currentPage
    } else {
      console.error('取得管理員列表失敗')
    }
  } catch (error) {
    console.error('取得管理員列表時發生錯誤:', error)
  } finally {
    loading.value = false
  }
}

const search = () => {
  currentPage.value = 1
  fetchAdmins()
}

const resetSearch = () => {
  searchForm.searchKeyword = ''
  searchForm.sortBy = 'AdminId'
  searchForm.sortOrder = 'asc'
  currentPage.value = 1
  fetchAdmins()
}

const changePage = (page) => {
  currentPage.value = page
  fetchAdmins()
}

const openAddModal = () => {
  isEdit.value = false
  currentAdmin.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (admin) => {
  isEdit.value = true
  currentAdmin.value = admin
  formData.email = admin.email
  formData.name = admin.name
  formData.phone = admin.phone
  formData.role = admin.role
  formData.status = admin.status
  formData.password = '' // 編輯時不顯示密碼
  showModal.value = true
}

const resetForm = () => {
  formData.email = ''
  formData.password = ''
  formData.name = ''
  formData.phone = ''
  formData.role = '管理員'
  formData.status = 1
  formErrors.value = {}
}

const validateForm = () => {
  formErrors.value = {}
  
  if (!formData.email) {
    formErrors.value.email = 'Email是必填項目'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    formErrors.value.email = 'Email格式錯誤'
  }
  
  if (!isEdit.value && !formData.password) {
    formErrors.value.password = '密碼為必填欄位'
  } else if (!isEdit.value && formData.password.length < 6) {
    formErrors.value.password = '密碼長度至少為6個字元'
  }
  
  if (!formData.name) {
    formErrors.value.name = '姓名是必填項目'
  }
  
  if (!formData.phone) {
    formErrors.value.phone = '電話是必填項目'
  }
  
  if (!formData.role) {
    formErrors.value.role = '角色是必填項目'
  }
  
  return Object.keys(formErrors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return
  
  try {
    const url = isEdit.value 
      ? `/api/Admins/${currentAdmin.value.adminId}`
      : '/api/Admins'
    
    const method = isEdit.value ? 'PUT' : 'POST'
    const body = isEdit.value 
      ? { ...formData }
      : { ...formData }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    if (response.ok) {
      showModal.value = false
      fetchAdmins()
      alert(isEdit.value ? '管理員資料更新成功' : '管理員新增成功')
    } else {
      const error = await response.json()
      alert(error.message || '操作失敗')
    }
  } catch (error) {
    console.error('提交表單時發生錯誤:', error)
    alert('操作失敗')
  }
}

const deleteAdmin = async (adminId) => {
  if (!confirm('確定要刪除此管理員嗎？')) return
  
  try {
    const response = await fetch(`/api/Admins/${adminId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      fetchAdmins()
      alert('管理員刪除成功')
    } else {
      const error = await response.json()
      alert(error.message || '刪除失敗')
    }
  } catch (error) {
    console.error('刪除管理員時發生錯誤:', error)
    alert('刪除失敗')
  }
}

// 生命週期
onMounted(() => {
  fetchAdmins()
})
</script>

<template>
  <div class="admin-settings">
    <div class="header">
      <h2>管理員設定</h2>
      <button 
        v-if="canEdit" 
        @click="openAddModal" 
        class="btn btn-primary"
      >
        新增管理員
      </button>
    </div>

    <!-- 搜尋區域 -->
    <div class="search-section">
      <div class="search-form">
        <input
          v-model="searchForm.searchKeyword"
          type="text"
          placeholder="搜尋姓名、電話或Email..."
          class="form-control"
          @keyup.enter="search"
        />
        <select v-model="searchForm.sortBy" class="form-control">
          <option value="AdminId">ID</option>
          <option value="Name">姓名</option>
          <option value="Email">Email</option>
          <option value="Role">角色</option>
          <option value="Status">狀態</option>
        </select>
        <select v-model="searchForm.sortOrder" class="form-control">
          <option value="asc">升序</option>
          <option value="desc">降序</option>
        </select>
        <button @click="search" class="btn btn-secondary">搜尋</button>
        <button @click="resetSearch" class="btn btn-outline">重置</button>
      </div>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 管理員列表 -->
    <div v-else class="admin-list">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>Email</th>
            <th>電話</th>
            <th>角色</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in admins" :key="admin.adminId">
            <td>{{ admin.adminId }}</td>
            <td>{{ admin.name }}</td>
            <td>{{ admin.email }}</td>
            <td>{{ admin.phone }}</td>
            <td>{{ admin.role }}</td>
            <td>
              <span :class="['status-badge', `status-${admin.status}`]">
                {{ admin.statusText }}
              </span>
            </td>
            <td>
              <button 
                @click="openEditModal(admin)" 
                class="btn btn-sm btn-outline"
              >
                編輯
              </button>
              <button 
                v-if="canDelete" 
                @click="deleteAdmin(admin.adminId)" 
                class="btn btn-sm btn-danger"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="btn btn-outline"
        >
          上一頁
        </button>
        <span class="page-info">
          第 {{ currentPage }} 頁，共 {{ totalPages }} 頁
          (總計 {{ totalCount }} 筆資料)
        </span>
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="btn btn-outline"
        >
          下一頁
        </button>
      </div>
    </div>

    <!-- 新增/編輯 Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEdit ? '編輯管理員' : '新增管理員' }}</h3>
          <button @click="showModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>Email *</label>
              <input
                v-model="formData.email"
                type="email"
                class="form-control"
                :class="{ 'error': formErrors.email }"
              />
              <span v-if="formErrors.email" class="error-text">{{ formErrors.email }}</span>
            </div>

            <div class="form-group">
              <label>{{ isEdit ? '密碼 (留空則不修改)' : '密碼 *' }}</label>
              <input
                v-model="formData.password"
                type="password"
                class="form-control"
                :class="{ 'error': formErrors.password }"
              />
              <span v-if="formErrors.password" class="error-text">{{ formErrors.password }}</span>
            </div>

            <div class="form-group">
              <label>姓名 *</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-control"
                :class="{ 'error': formErrors.name }"
              />
              <span v-if="formErrors.name" class="error-text">{{ formErrors.name }}</span>
            </div>

            <div class="form-group">
              <label>電話 *</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-control"
                :class="{ 'error': formErrors.phone }"
              />
              <span v-if="formErrors.phone" class="error-text">{{ formErrors.phone }}</span>
            </div>

            <div class="form-group">
              <label>角色 *</label>
              <select
                v-model="formData.role"
                class="form-control"
                :class="{ 'error': formErrors.role }"
              >
                <option v-for="option in roleOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <span v-if="formErrors.role" class="error-text">{{ formErrors.role }}</span>
            </div>

            <div v-if="isEdit" class="form-group">
              <label>狀態</label>
              <select v-model="formData.status" class="form-control">
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" @click="showModal = false" class="btn btn-outline">
                取消
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEdit ? '更新' : '新增' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.admin-settings {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.search-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-control.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-outline {
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.table tr:hover {
  background: #f8f9fa;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-0 {
  background: #fff3cd;
  color: #856404;
}

.status-1 {
  background: #d4edda;
  color: #155724;
}

.status-2 {
  background: #f8d7da;
  color: #721c24;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 20px;
}

.page-info {
  color: #666;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table {
    font-size: 12px;
  }
  
  .table th,
  .table td {
    padding: 8px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style>