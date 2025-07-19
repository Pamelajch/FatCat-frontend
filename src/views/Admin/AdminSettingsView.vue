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

const deleteAdmin = async (adminId, adminName) => {
  if (!confirm(`確定要刪除管理員「${adminName}」嗎？此操作無法復原。`)) return
  
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
 <div class="container-fluid">
    <!-- 錯誤訊息顯示區域 -->
    <div v-if="false" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      錯誤訊息
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h3 mb-0 page-title">
            <i class="fa-solid fa-user-shield fa-bounce"></i>管理員列表
          </h1>
          <button 
            v-if="canEdit" 
            @click="openAddModal" 
            class="btn btn-custom"
          >
            <i class="bi bi-person-plus me-1" style="display: inline-block; margin-right: 0.25rem;"></i>新增管理員
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <!-- 搜尋區域 -->
        <div class="search-section mb-3">
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
            <button @click="resetSearch" class="btn btn-outline-secondary">重置</button>
          </div>
        </div>

        <!-- 載入中 -->
        <div v-if="loading" class="loading text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">載入中...</span>
          </div>
          <p class="mt-2">載入中...</p>
        </div>

        <!-- 管理員列表 -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Email</th>
                <th>姓名</th>
                <th>電話</th>
                <th>角色</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.adminId">
                <td>{{ admin.email }}</td>
                <td>{{ admin.name }}</td>
                <td>{{ admin.phone || '未填寫' }}</td>
                <td>
                  <span class="badge bg-primary">
                    {{ admin.role || '未設定' }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="admin.statusText === '啟用' ? 'bg-success' : admin.statusText === '停用' ? 'bg-secondary' : 'bg-danger'">
                    {{ admin.statusText }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button 
                      @click="openEditModal(admin)" 
                      class="btn btn-sm btn-outline-primary"
                    >
                      <i class="bi bi-pencil"></i>編輯
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-info"
                    >
                      <i class="bi bi-info-circle"></i>詳細資料
                    </button>
                    <button 
                      v-if="canDelete" 
                      @click="deleteAdmin(admin.adminId, admin.name)" 
                      class="btn btn-sm btn-outline-danger"
                    >
                      <i class="bi bi-trash"></i>刪除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 分頁 -->
          <div v-if="totalPages > 1" class="pagination d-flex justify-content-center align-items-center gap-3 mt-4">
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="btn btn-outline-secondary"
            >
              上一頁
            </button>
            <span class="text-muted">
              第 {{ currentPage }} 頁，共 {{ totalPages }} 頁
              (總計 {{ totalCount }} 筆資料)
            </span>
            <button 
              @click="changePage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="btn btn-outline-secondary"
            >
              下一頁
            </button>
          </div>
        </div>
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
            <div class="form-group mb-3">
              <label class="form-label">Email *</label>
              <input
                v-model="formData.email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': formErrors.email }"
              />
              <div v-if="formErrors.email" class="invalid-feedback">{{ formErrors.email }}</div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">{{ isEdit ? '密碼 (留空則不修改)' : '密碼 *' }}</label>
              <input
                v-model="formData.password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': formErrors.password }"
              />
              <div v-if="formErrors.password" class="invalid-feedback">{{ formErrors.password }}</div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">姓名 *</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.name }"
              />
              <div v-if="formErrors.name" class="invalid-feedback">{{ formErrors.name }}</div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">電話 *</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-control"
                :class="{ 'is-invalid': formErrors.phone }"
              />
              <div v-if="formErrors.phone" class="invalid-feedback">{{ formErrors.phone }}</div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">角色 *</label>
              <select
                v-model="formData.role"
                class="form-control"
                :class="{ 'is-invalid': formErrors.role }"
              >
                <option v-for="option in roleOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <div v-if="formErrors.role" class="invalid-feedback">{{ formErrors.role }}</div>
            </div>

            <div v-if="isEdit" class="form-group mb-3">
              <label class="form-label">狀態</label>
              <select v-model="formData.status" class="form-control">
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="form-actions d-flex gap-2 justify-content-end">
              <button type="button" @click="showModal = false" class="btn btn-outline-secondary">
                取消
              </button>
              <button type="submit" class="btn btn-custom">
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


/* 表格樣式 - 參考 MVC 樣式 */
.table th {
  font-weight: 600;
  white-space: nowrap;
  background-color: rgb(152,102,149) !important;
  color: white;
  vertical-align: middle;
}

.table td {
  vertical-align: middle;
}

/* 按鈕群組樣式 */
.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

/* Badge 樣式 */
.badge {
  font-weight: 500;
  padding: 0.5em 0.75em;
}

/* 頁面標題樣式 */
.page-title {
  color: rgb(115,2,95);
}

/* 自定義按鈕樣式 */
.btn-custom {
  color: rgb(115,2,95);
  border-color: rgb(115,2,95);
  background-color: transparent;
}

.btn-custom:hover {
  background-color: rgb(115,2,95);
  color: white;
}

/* 搜尋區域樣式 */
.search-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.search-form {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

/* 表單控制項樣式 */
.form-control {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: rgb(115,2,95);
  box-shadow: 0 0 0 2px rgba(115, 2, 95, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

/* 按鈕樣式 */
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

.btn-outline-primary {
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.btn-outline-primary:hover {
  background: #007bff;
  color: white;
}

.btn-outline-secondary {
  background: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.btn-outline-info {
  background: transparent;
  border: 1px solid #17a2b8;
  color: #17a2b8;
}

.btn-outline-info:hover {
  background: #17a2b8;
  color: white;
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
}

.btn-outline-danger:hover {
  background: #dc3545;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 載入動畫 */
.loading {
  text-align: center;
  padding: 40px;
}

/* 表格樣式 */
.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-hover tbody tr:hover {
  background: #f8f9fa;
}

/* 分頁樣式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 20px;
}

/* Modal 樣式 */
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

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

/* 響應式設計 */
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
  
  .btn-group {
    flex-direction: column;
  }
  
  .btn-group .btn {
    margin-bottom: 2px;
  }
}

/* Bootstrap 相容性樣式 */
.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.justify-content-center {
  justify-content: center;
}

.justify-content-end {
  justify-content: flex-end;
}

.align-items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 1rem;
}

.mb-0 {
  margin-bottom: 0;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.me-1 {
  margin-right: 0.25rem;
}

.py-3 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.py-5 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #6c757d;
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table-responsive {
  overflow-x: auto;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
</style>