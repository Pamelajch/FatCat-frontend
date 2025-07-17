<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/jjapi.js'

// 防抖函數
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 響應式資料
const members = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedMember = ref(null)

// 搜尋和篩選
const searchTerm = ref('')
const statusFilter = ref('')
const genderFilter = ref('')
const thirdPartyFilter = ref('')
const isSearching = ref(false)

// 表單資料
const createForm = ref({
  name: '',
  email: '',
  phone: '',
  gender: null,
  birthdate: '',
  password: '',
  picPath: ''
})

const editForm = ref({
  name: '',
  email: '',
  phone: '',
  gender: null,
  birthdate: '',
  password: '',
  status: 1,
  picPath: ''
})

// 狀態選項
const statusOptions = [
  { value: '', label: '全部狀態' },
  { value: 0, label: '已刪除' },
  { value: 1, label: '正常' },
  { value: 2, label: '黑名單' }
]

const genderOptions = [
  { value: '', label: '全部性別' },
  { value: 0, label: '男' },
  { value: 1, label: '女' }
]

const thirdPartyOptions = [
  { value: '', label: '全部' },
  { value: false, label: '一般註冊' },
  { value: true, label: '第三方登入' }
]

// 計算屬性：篩選後的會員列表
const filteredMembers = computed(() => {
  let filtered = members.value

  // 搜尋篩選（支援多欄位搜尋）
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase().trim()
    if (term) {
      filtered = filtered.filter(member => 
        (member.name && member.name.toLowerCase().includes(term)) ||
        (member.email && member.email.toLowerCase().includes(term)) ||
        (member.phone && member.phone.includes(term))
      )
    }
  }

  // 狀態篩選
  if (statusFilter.value !== '') {
    filtered = filtered.filter(member => member.status === parseInt(statusFilter.value))
  }

  // 性別篩選
  if (genderFilter.value !== '') {
    filtered = filtered.filter(member => member.gender === parseInt(genderFilter.value))
  }

  // 第三方登入篩選
  if (thirdPartyFilter.value !== '') {
    filtered = filtered.filter(member => member.isThirdparty === thirdPartyFilter.value)
  }

  return filtered
})

// API 呼叫函數
const fetchMembers = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/members')
    members.value = response.data
  } catch (error) {
    console.error('取得會員列表失敗:', error)
  } finally {
    loading.value = false
  }
}

const createMember = async () => {
  try {
    await api.post('/admin/members', createForm.value)
    showCreateModal.value = false
    resetCreateForm()
    await fetchMembers()
    alert('會員新增成功')
  } catch (error) {
    console.error('新增失敗:', error)
    alert(error.response?.data?.message || '新增失敗')
  }
}

const updateMember = async () => {
  try {
    await api.put(`/admin/members/${selectedMember.value.userId}`, editForm.value)
    showEditModal.value = false
    await fetchMembers()
    alert('會員更新成功')
  } catch (error) {
    console.error('更新失敗:', error)
    alert(error.response?.data?.message || '更新失敗')
  }
}

const deleteMember = async () => {
  try {
    await api.delete(`/admin/members/${selectedMember.value.userId}`)
    showDeleteModal.value = false
    await fetchMembers()
    alert('會員刪除成功')
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗')
  }
}

const updateMemberStatus = async (memberId, newStatus) => {
  try {
    await api.put(`/admin/members/${memberId}/status`, { status: newStatus })
    await fetchMembers()
    alert('狀態更新成功')
  } catch (error) {
    console.error('狀態更新失敗:', error)
    alert('狀態更新失敗')
  }
}

// 輔助函數
const openEditModal = (member) => {
  selectedMember.value = member
  editForm.value = {
    name: member.name,
    email: member.email,
    phone: member.phone,
    gender: member.gender,
    birthdate: member.birthdate ? member.birthdate.split('T')[0] : '',
    password: '',
    status: member.status,
    picPath: member.picPath || ''
  }
  showEditModal.value = true
}

const openDeleteModal = (member) => {
  selectedMember.value = member
  showDeleteModal.value = true
}

const resetCreateForm = () => {
  createForm.value = {
    name: '',
    email: '',
    phone: '',
    gender: null,
    birthdate: '',
    password: '',
    picPath: ''
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 0: return '已刪除'
    case 1: return '正常'
    case 2: return '黑名單'
    default: return '未知'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'text-danger'
    case 1: return 'text-success'
    case 2: return 'text-warning'
    default: return 'text-secondary'
  }
}

const getGenderText = (gender) => {
  return gender === 0 ? '男' : gender === 1 ? '女' : '未設定'
}

const formatDate = (dateString) => {
  if (!dateString) return '未設定'
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 搜尋處理函數（使用防抖）
const handleSearch = debounce(() => {
  // 由於我們使用的是計算屬性 filteredMembers，
  // 當 searchTerm 改變時，filteredMembers 會自動重新計算
  // 防抖可以避免過於頻繁的搜尋操作
  isSearching.value = true
  console.log('搜尋關鍵字:', searchTerm.value)
  
  // 模擬搜尋延遲，讓用戶看到搜尋狀態
  setTimeout(() => {
    isSearching.value = false
  }, 200)
}, 300) // 300ms 延遲

// 清除搜尋
const clearSearch = () => {
  searchTerm.value = ''
  isSearching.value = false
}

// 清除所有篩選
const clearAllFilters = () => {
  searchTerm.value = ''
  statusFilter.value = ''
  genderFilter.value = ''
  thirdPartyFilter.value = ''
  isSearching.value = false
}

// 生命週期
onMounted(() => {
  fetchMembers()
})
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="card-title">會員管理</h3>
            <button class="btn btn-primary" @click="showCreateModal = true">
              <i class="fas fa-plus"></i> 新增會員
            </button>
          </div>
          
          <div class="card-body">
            <!-- 搜尋和篩選 -->
            <div class="row mb-3">
              <div class="col-md-3">
                <div class="input-group">
                  <input 
                    v-model="searchTerm"
                    type="text" 
                    class="form-control" 
                    placeholder="搜尋姓名、Email 或電話"
                    @keyup="handleSearch"
                    @input="handleSearch"
                  >
                  <span v-if="isSearching" class="input-group-text">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">搜尋中...</span>
                    </div>
                  </span>
                  <span v-else-if="searchTerm" class="input-group-text">
                    <i class="fas fa-search"></i>
                  </span>
                  <button 
                    v-if="searchTerm" 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    @click="clearSearch"
                    title="清除搜尋"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-2">
                <select v-model="statusFilter" class="form-control">
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <select v-model="genderFilter" class="form-control">
                  <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <select v-model="thirdPartyFilter" class="form-control">
                  <option v-for="option in thirdPartyOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <button class="btn btn-secondary" @click="fetchMembers">
                  <i class="fas fa-refresh"></i> 重新整理
                </button>
              </div>
            </div>

            <!-- 搜尋結果統計 -->
            <div class="row mb-3" v-if="searchTerm || statusFilter || genderFilter || thirdPartyFilter">
              <div class="col-12">
                <div class="alert alert-info">
                  <i class="fas fa-info-circle"></i>
                  搜尋結果：顯示 {{ filteredMembers.length }} 筆資料
                  <span v-if="searchTerm">（關鍵字：「{{ searchTerm }}」）</span>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-info ms-2" 
                    @click="clearAllFilters"
                  >
                    清除所有篩選
                  </button>
                </div>
              </div>
            </div>

            <!-- 會員列表 -->
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>姓名</th>
                    <th>Email</th>
                    <th>電話</th>
                    <th>性別</th>
                    <th>生日</th>
                    <th>狀態</th>
                    <th>註冊日期</th>
                    <th>最後登入</th>
                    <th>登入方式</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="11" class="text-center">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">載入中...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="filteredMembers.length === 0">
                    <td colspan="11" class="text-center">沒有找到會員資料</td>
                  </tr>
                  <tr v-else v-for="member in filteredMembers" :key="member.userId">
                    <td>{{ member.userId }}</td>
                    <td>{{ member.name }}</td>
                    <td>{{ member.email }}</td>
                    <td>{{ member.phone }}</td>
                    <td>{{ getGenderText(member.gender) }}</td>
                    <td>{{ formatDate(member.birthdate) }}</td>
                    <td>
                      <span :class="getStatusClass(member.status)">
                        {{ getStatusText(member.status) }}
                      </span>
                    </td>
                    <td>{{ formatDate(member.registerdate) }}</td>
                    <td>{{ formatDate(member.lastLogin) }}</td>
                    <td>
                      <span :class="member.isThirdparty ? 'text-info' : 'text-secondary'">
                        {{ member.isThirdparty ? '第三方' : '一般' }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <button 
                          class="btn btn-sm btn-outline-primary" 
                          @click="openEditModal(member)"
                          title="編輯"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          v-if="member.status !== 0"
                          class="btn btn-sm btn-outline-danger" 
                          @click="openDeleteModal(member)"
                          title="刪除"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                        <div class="btn-group" role="group">
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                            data-bs-toggle="dropdown"
                          >
                            狀態
                          </button>
                          <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" @click="updateMemberStatus(member.userId, 1)">設為正常</a></li>
                            <li><a class="dropdown-item" href="#" @click="updateMemberStatus(member.userId, 2)">設為黑名單</a></li>
                            <li><a class="dropdown-item" href="#" @click="updateMemberStatus(member.userId, 0)">軟刪除</a></li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增會員 Modal -->
    <div class="modal fade" :class="{ show: showCreateModal }" :style="{ display: showCreateModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">新增會員</h5>
            <button type="button" class="btn-close" @click="showCreateModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createMember">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">姓名 *</label>
                    <input v-model="createForm.name" type="text" class="form-control" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Email *</label>
                    <input v-model="createForm.email" type="email" class="form-control" required>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">電話</label>
                    <input v-model="createForm.phone" type="text" class="form-control">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">密碼 *</label>
                    <input v-model="createForm.password" type="password" class="form-control" required>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">性別</label>
                    <select v-model="createForm.gender" class="form-control">
                      <option :value="null">請選擇</option>
                      <option :value="0">男</option>
                      <option :value="1">女</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">生日</label>
                    <input v-model="createForm.birthdate" type="date" class="form-control">
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">頭像路徑</label>
                <input v-model="createForm.picPath" type="text" class="form-control">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">取消</button>
            <button type="button" class="btn btn-primary" @click="createMember">新增</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯會員 Modal -->
    <div class="modal fade" :class="{ show: showEditModal }" :style="{ display: showEditModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">編輯會員</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateMember">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">姓名 *</label>
                    <input v-model="editForm.name" type="text" class="form-control" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Email *</label>
                    <input v-model="editForm.email" type="email" class="form-control" required>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">電話</label>
                    <input v-model="editForm.phone" type="text" class="form-control">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">密碼 (留空不修改)</label>
                    <input v-model="editForm.password" type="password" class="form-control">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">性別</label>
                    <select v-model="editForm.gender" class="form-control">
                      <option :value="null">請選擇</option>
                      <option :value="0">男</option>
                      <option :value="1">女</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">生日</label>
                    <input v-model="editForm.birthdate" type="date" class="form-control">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">狀態</label>
                    <select v-model="editForm.status" class="form-control">
                      <option :value="0">已刪除</option>
                      <option :value="1">正常</option>
                      <option :value="2">黑名單</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">頭像路徑</label>
                    <input v-model="editForm.picPath" type="text" class="form-control">
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showEditModal = false">取消</button>
            <button type="button" class="btn btn-primary" @click="updateMember">更新</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 刪除確認 Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" :style="{ display: showDeleteModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認刪除</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>確定要刪除會員「{{ selectedMember?.name }}」嗎？</p>
            <p class="text-muted">此操作將執行軟刪除，會員狀態將設為「已刪除」。</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">取消</button>
            <button type="button" class="btn btn-danger" @click="deleteMember">確認刪除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 背景遮罩 -->
    <div v-if="showCreateModal || showEditModal || showDeleteModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

.btn-group .dropdown-menu {
  z-index: 1060;
}

/* 搜尋框樣式 */
.input-group .form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

/* 搜尋結果統計樣式 */
.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}

/* 搜尋按鈕樣式 */
.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

/* 載入動畫樣式 */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>