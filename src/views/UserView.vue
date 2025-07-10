<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 初始化數據
const initializeData = async () => {
    if (authStore.isAuthenticated) {
        // 先獲取最新用戶資料
        await authStore.fetchUserProfile()
        
        // 然後初始化編輯表單
        if (authStore.user) {
            editForm.value = {
                name: authStore.user.name || '',
                birthdate: authStore.user.birthdate ? new Date(authStore.user.birthdate).toISOString().split('T')[0] : '',
                phone: authStore.user.phone || '',
                address1: '', // 暫時留空，等地址功能完善
                address2: ''  // 暫時留空，等地址功能完善
            }
        }
    }
}

// 在 onMounted 中調用
onMounted(async () => {
    await initializeData()
})

// 編輯模式控制
const editMode = ref({
    name: false,
    birthdate: false,
    phone: false,
    address1: false,
    address2: false
})

// 編輯表單數據
const editForm = ref({
    name: '',
    birthdate: '',
    phone: '',
    address1: '',
    address2: ''
})

// 檔案上傳相關
const fileInput = ref(null)

// 計算用戶頭像URL
const getUserAvatar = computed(() => {
    if (authStore.user?.picPath) {
        // 如果有自定義頭像，確保URL正確
        return authStore.user.picPath.startsWith('http') 
            ? authStore.user.picPath 
            : `http://localhost:7017${authStore.user.picPath}`
    }
    // 預設頭像
    return '/pingu.png'
})

// 觸發檔案選擇
const triggerFileUpload = () => {
    fileInput.value?.click()
}

// 處理檔案選擇
const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 檢查檔案大小（2MB限制）
    if (file.size > 2 * 1024 * 1024) {
        alert('檔案大小不能超過 2MB')
        return
    }

    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
        alert('只支援 JPG、PNG、GIF 格式')
        return
    }

    // 這裡將來會實作上傳邏輯
    console.log('選擇的檔案:', file)
    // TODO: 實作檔案上傳到伺服器
}

// 格式化生日
const formatBirthdate = (dateString) => {
    if (!dateString) return '未設定'
    return new Date(dateString).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

// 切換編輯模式
const toggleEdit = (field) => {
    if (editMode.value[field]) {
        // 保存該欄位
        saveField(field)
    } else {
        // 進入編輯模式
        editMode.value[field] = true
        // 初始化編輯值
        if (field === 'name') editForm.value.name = authStore.user?.name || ''
        if (field === 'phone') editForm.value.phone = authStore.user?.phone || ''
        if (field === 'birthdate') {
            // 將日期轉為 YYYY-MM-DD 格式
            const date = authStore.user?.birthdate
            if (date) {
                editForm.value.birthdate = new Date(date).toISOString().split('T')[0]
            }
        }
    }
}

// 保存單個欄位
const saveField = async (field) => {
    try {
        // 準備更新的數據
        const updateData = {}
        
        if (field === 'name') {
            updateData.name = editForm.value.name
        } else if (field === 'phone') {
            updateData.phone = editForm.value.phone
        } else if (field === 'birthdate') {
            updateData.birthdate = new Date(editForm.value.birthdate).toISOString()
        }
        
        console.log(`保存 ${field}:`, updateData)
        
        // 調用 API 更新
        const result = await authStore.updateProfile(updateData)
        
        if (result.success) {
            // 退出編輯模式
            editMode.value[field] = false
            
            // 顯示成功提示
            alert(`${field} 更新成功！`)
            
        } else {
            alert('更新失敗：' + result.message)
        }
        
    } catch (error) {
        console.error(`保存 ${field} 失敗:`, error)
        alert('保存失敗，請稍後再試')
    }
}

// 開啟密碼變更對話框
const openPasswordModal = () => {
    // 這裡將來會開啟密碼變更模態窗
    console.log('開啟密碼變更對話框')
    alert('密碼變更功能將在下一階段實作')
}

// 檢查是否有變更
const hasChanges = computed(() => {
    return Object.values(editMode.value).some(mode => mode === true)
})

// 保存所有變更
const saveAllChanges = async () => {
    try{
        // 準備更新數據
        const updateData = {}
        
        // 只傳送有變更的欄位
        if (editMode.value.name && editForm.value.name !== authStore.user?.name) {
            updateData.name = editForm.value.name
        }
        if (editMode.value.phone && editForm.value.phone !== authStore.user?.phone) {
            updateData.phone = editForm.value.phone
        }
        if (editMode.value.birthdate && editForm.value.birthdate) {
            updateData.birthdate = new Date(editForm.value.birthdate).toISOString()
        }
        
        // 如果沒有任何變更，不執行更新
        if (Object.keys(updateData).length === 0) {
            alert('沒有任何變更需要保存')
            return
        }
        
        console.log('準備更新的數據:', updateData)

         // 調用 API 更新
        const result = await authStore.updateProfile(updateData)
        
        if (result.success) {
            // 測試
            console.log('更新成功，當前用戶狀態:', authStore.user)
            // 成功提示
            alert('個人資料更新成功！')
            
            // 關閉所有編輯模式
            Object.keys(editMode.value).forEach(key => {
                editMode.value[key] = false
            })
            
            // 重新整理頁面數據
            await authStore.fetchUserProfile()

            // 重新初始化表單資料
            await initializeData()
            
        } else {
            // 錯誤提示
            alert('更新失敗：' + result.message)
        }
        

    }
    catch(error){
        console.error('保存變更錯誤:', error)
            alert('保存失敗：' + error.message)
        
    }

}

</script>

<template>
    <div class="user-profile-container">
        <!-- 主要個人資訊卡片 -->
        <div class="profile-main-card card">
            <div class="card-header text-center">
                <h4 class="mb-0">
                    <i class="bi bi-person-circle me-2"></i>個人資訊
                </h4>
            </div>
            
            <div class="card-body">
                <!-- 頭像上傳區域 -->
                <div class="avatar-upload-section row mb-4">
                    <div class="col-md-3 text-center">
                        <!-- 頭像顯示 -->
                        <div class="avatar-container mb-3">
                            <img :src="getUserAvatar" alt="用戶頭像" class="user-avatar-large">
                            <div class="avatar-overlay">
                                <i class="bi bi-camera-fill"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-9">
                        <!-- 上傳按鈕和說明 -->
                        <div class="upload-controls">
                            <button class="btn btn-outline-primary mb-2" @click="triggerFileUpload">
                                <i class="bi bi-upload me-2"></i>選擇圖片
                            </button>
                            <input type="file" ref="fileInput" @change="handleFileSelect" 
                                accept="image/*" style="display: none;">
                            
                            <div class="upload-info">
                                <p class="text-muted small mb-1">支援格式：JPG、PNG、GIF</p>
                                <p class="text-muted small mb-0">檔案大小：最大 2MB</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 個人資訊表單區域 -->
                <div class="personal-info-section">
                    <!-- 第一行：姓名 + EMAIL -->
                    <div class="info-row-group row mb-3">
                        <!-- 姓名 -->
                        <div class="col-md-6">
                            <div class="info-row">
                                <label class="info-label">姓名：</label>
                                <span v-if="!editMode.name" class="info-value">{{ authStore.user?.name || '未設定' }}</span>
                                <input v-else v-model="editForm.name" type="text" class="form-control info-input">
                                <button class="btn btn-link btn-sm" @click="toggleEdit('name')">
                                    <i class="bi" :class="editMode.name ? 'bi-check-lg' : 'bi-pencil-fill'"></i>
                                </button>
                            </div>
                        </div>

                        <!-- EMAIL -->
                        <div class="col-md-6">
                            <div class="info-row">
                                <label class="info-label">EMAIL：</label>
                                <span class="info-value">{{ authStore.user?.email || '未設定' }}</span>
                                <span class="text-muted small">（不可修改）</span>
                            </div>
                        </div>
                    </div>

                    <!-- 第二行：生日 + 手機 -->
                    <div class="info-row-group row mb-3">
                        <!-- 生日 -->
                        <div class="col-md-6">
                            <div class="info-row">
                                <label class="info-label">生日：</label>
                                <span v-if="!editMode.birthdate" class="info-value">{{ formatBirthdate(authStore.user?.birthdate) }}</span>
                                <input v-else v-model="editForm.birthdate" type="date" class="form-control info-input">
                                <button class="btn btn-link btn-sm" @click="toggleEdit('birthdate')">
                                    <i class="bi" :class="editMode.birthdate ? 'bi-check-lg' : 'bi-pencil-fill'"></i>
                                </button>
                            </div>
                        </div>

                        <!-- 手機 -->
                        <div class="col-md-6">
                            <div class="info-row">
                                <label class="info-label">手機：</label>
                                <span v-if="!editMode.phone" class="info-value">{{ authStore.user?.phone || '未設定' }}</span>
                                <input v-else v-model="editForm.phone" type="tel" class="form-control info-input">
                                <button class="btn btn-link btn-sm" @click="toggleEdit('phone')">
                                    <i class="bi" :class="editMode.phone ? 'bi-check-lg' : 'bi-pencil-fill'"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 第三行：密碼（單獨一行） -->
                    <div class="info-row-group row mb-3">
                        <div class="col-12">
                            <div class="info-row">
                                <label class="info-label">密碼：</label>
                                <span class="info-value">••••••••••</span>
                                <button class="btn btn-outline-warning btn-sm" @click="openPasswordModal">
                                    更改密碼
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 第四行：地址1 + 地址2 -->
                    <div class="info-row-group row mb-0">
                        <!-- 地址1 -->
                        <div class="col-md-6">
                            <div class="info-row">
                                <label class="info-label">地址1：</label>
                                <span v-if="!editMode.address1" class="info-value">{{ editForm.address1 || '未設定' }}</span>
                                <input v-else v-model="editForm.address1" type="text" class="form-control info-input" 
                                    placeholder="請輸入主要地址">
                                <button class="btn btn-link btn-sm" @click="toggleEdit('address1')">
                                    <i class="bi" :class="editMode.address1 ? 'bi-check-lg' : 'bi-pencil-fill'"></i>
                                </button>
                            </div>
                        </div>

                        <!-- 地址2 -->
                        <div class="col-md-6">
                            <div class="info-row">
                                <label class="info-label">地址2：</label>
                                <span v-if="!editMode.address2" class="info-value">{{ editForm.address2 || '未設定' }}</span>
                                <input v-else v-model="editForm.address2" type="text" class="form-control info-input" 
                                    placeholder="請輸入次要地址">
                                <button class="btn btn-link btn-sm" @click="toggleEdit('address2')">
                                    <i class="bi" :class="editMode.address2 ? 'bi-check-lg' : 'bi-pencil-fill'"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 第三方登入綁定區域 -->
                <div class="social-binding-section mb-4">
                    <h6 class="text-center mb-3">綁定第三方登入：</h6>
                    <div class="social-icons d-flex justify-content-center gap-3">
                        <button class="btn btn-outline-primary social-btn facebook">
                            <i class="bi bi-facebook"></i>
                            <span>Facebook</span>
                        </button>
                        <button class="btn btn-outline-danger social-btn google">
                            <i class="bi bi-google"></i>
                            <span>Google</span>
                        </button>
                        <button class="btn btn-outline-success social-btn line">
                            <i class="bi bi-line"></i>
                            <span>LINE</span>
                        </button>
                    </div>
                </div>

                <!-- 儲存按鈕區域 -->
                <div class="save-button-section text-center">
                    <button class="btn btn-primary btn-lg save-btn" @click="saveAllChanges" :disabled="!hasChanges">
                        <i class="bi bi-floppy-fill me-2"></i>儲存
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
/* 色系定義 - 與項目一致的紫色主題 */
.user-profile-container {
    --deep-purple: #92559c;
    --light-purple: #d3a2da;
    --light-yellow: #ffd689;
    --orange-yellow: #ffa600;
    --deep-gray: #686868;
    --light-gray: #f6f6f6;
    --danger-red: #dc3545;
    --success-green: #28a745;
    
    /* 調整寬度設定 */
    max-width: 95%;
    width: 100%;
    margin: 2rem auto;
    padding: 0 1rem;
}

/* 在大螢幕上設定最大寬度 */
@media (min-width: 1200px) {
    .user-profile-container {
        max-width: 1100px;
    }
}

@media (min-width: 992px) and (max-width: 1199px) {
    .user-profile-container {
        max-width: 90%;
    }
}

@media (min-width: 768px) and (max-width: 991px) {
    .user-profile-container {
        max-width: 95%;
    }
}

/* 主卡片樣式 */
.profile-main-card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(146, 85, 156, 0.15);
    overflow: hidden;
}

.profile-main-card .card-header {
    background: linear-gradient(135deg, var(--deep-purple) 0%, var(--light-purple) 100%);
    color: white;
    border: none;
    padding: 1.5rem;
}

.profile-main-card .card-header h4 {
    font-weight: 600;
    margin: 0;
}

.profile-main-card .card-body {
    padding: 2.5rem;
    background-color: #fafafa;
}

/* 調整各區域的間距 */
.avatar-upload-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.personal-info-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.social-binding-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.save-button-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


/* 頭像上傳區域樣式 */
.avatar-upload-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-container {
    position: relative;
    display: inline-block;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.avatar-container:hover {
    transform: scale(1.05);
}

.user-avatar-large {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid var(--light-purple);
    transition: border-color 0.3s ease;
}

.avatar-container:hover .user-avatar-large {
    border-color: var(--deep-purple);
}

.avatar-overlay {
    position: absolute;
    bottom: 0;
    right: 0;
    background: var(--deep-purple);
    color: white;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    border: 3px solid white;
    transition: all 0.3s ease;
}

.avatar-container:hover .avatar-overlay {
    background: var(--orange-yellow);
    transform: scale(1.1);
}

.upload-controls {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

.upload-controls .btn {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.upload-controls .btn-outline-primary {
    border-color: var(--deep-purple);
    color: var(--deep-purple);
}

.upload-controls .btn-outline-primary:hover {
    background: var(--deep-purple);
    border-color: var(--deep-purple);
}

.upload-info p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--deep-gray);
}
/* 個人資訊區域樣式 */
.personal-info-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-row-group {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
}

.info-row-group .col-md-6,
.info-row-group .col-12 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.info-row {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid #eee;
    border-radius: 8px;
    background: #fafafa;
    transition: all 0.3s ease;
    min-height: 60px;
}

.info-row:hover {
    background-color: #f0f0f0;
    border-color: var(--light-purple);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(146, 85, 156, 0.1);
}

.info-label {
    font-weight: 600;
    color: var(--deep-gray);
    min-width: 80px;
    margin: 0;
    font-size: 0.9rem;
}

.info-value {
    flex: 1;
    margin: 0 0.5rem;
    color: var(--deep-gray);
    font-size: 0.9rem;
}

.info-input {
    flex: 1;
    margin: 0 0.5rem;
    border: 1px solid var(--light-purple);
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
    transition: border-color 0.3s ease;
}

.info-input:focus {
    border-color: var(--deep-purple);
    box-shadow: 0 0 0 0.15rem rgba(146, 85, 156, 0.25);
    outline: none;
}

.info-row .btn-link {
    color: var(--deep-purple);
    text-decoration: none;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    transition: all 0.3s ease;
    font-size: 0.85rem;
}

.info-row .btn-link:hover {
    background-color: var(--light-purple);
    color: white;
}

.info-row .btn-outline-warning {
    border-color: var(--orange-yellow);
    color: var(--orange-yellow);
    border-radius: 6px;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
}

.info-row .btn-outline-warning:hover {
    background-color: var(--orange-yellow);
    border-color: var(--orange-yellow);
    color: white;
}

/* 響應式設計更新 */
@media (max-width: 768px) {
    .user-profile-container {
        margin: 1rem auto;
        padding: 0 0.5rem;
        max-width: 98%;
    }
    
    .profile-main-card .card-body {
        padding: 1.5rem;
    }
    
    .avatar-upload-section,
    .personal-info-section,
    .social-binding-section,
    .save-button-section {
        padding: 1.5rem;
    }
    
    .avatar-upload-section .row {
        text-align: center;
    }
    
    .avatar-upload-section .col-md-9 {
        margin-top: 1rem;
    }
    
    /* 手機版時改為單列 */
    .info-row-group .col-md-6 {
        margin-bottom: 0.75rem;
    }
    
    .info-row {
        min-height: 50px;
        padding: 0.5rem;
    }
    
    .info-label {
        min-width: 70px;
        font-size: 0.85rem;
    }
    
    .info-value,
    .info-input {
        font-size: 0.85rem;
    }
    
    .social-icons {
        flex-direction: column;
        align-items: center;
    }
    
    .social-btn {
        width: 100%;
        max-width: 200px;
        justify-content: center;
    }
}

@media (max-width: 576px) {
    .user-profile-container {
        margin: 0.5rem auto;
        padding: 0 0.25rem;
        max-width: 100%;
    }
    
    .profile-main-card .card-body {
        padding: 1rem;
    }
    
    .avatar-upload-section,
    .personal-info-section,
    .social-binding-section,
    .save-button-section {
        padding: 1rem;
    }
}
/* 第三方登入綁定區域樣式 */
.social-binding-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.social-binding-section h6 {
    color: var(--deep-gray);
    font-weight: 600;
    margin-bottom: 1rem;
}

.social-icons {
    gap: 1rem;
}

.social-btn {
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    min-width: 120px;
}

.social-btn.facebook:hover {
    background-color: #1877f2;
    border-color: #1877f2;
    color: white;
}

.social-btn.google:hover {
    background-color: #db4437;
    border-color: #db4437;
    color: white;
}

.social-btn.line:hover {
    background-color: #00b900;
    border-color: #00b900;
    color: white;
}

/* 儲存按鈕區域樣式 */
.save-button-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.save-btn {
    background: linear-gradient(135deg, var(--deep-purple) 0%, var(--light-purple) 100%);
    border: none;
    border-radius: 10px;
    padding: 1rem 2rem;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(146, 85, 156, 0.3);
}

.save-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--light-purple) 0%, var(--orange-yellow) 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(146, 85, 156, 0.4);
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 響應式設計 */
@media (max-width: 768px) {
    .user-profile-container {
        margin: 1rem auto;
        padding: 0 0.5rem;
    }
    
    .avatar-upload-section .row {
        text-align: center;
    }
    
    .avatar-upload-section .col-md-9 {
        margin-top: 1rem;
    }
    
    .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .info-label {
        min-width: auto;
    }
    
    .info-input,
    .info-value {
        margin: 0;
        width: 100%;
    }
    
    .social-icons {
        flex-direction: column;
        align-items: center;
    }
    
    .social-btn {
        width: 100%;
        max-width: 200px;
        justify-content: center;
    }
}
</style>