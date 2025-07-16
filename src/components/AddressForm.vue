<template>
    <div class="address-form-container">
        <form @submit.prevent="handleSubmit" class="address-form">
            <!-- 收件人姓名 -->
            <div class="form-group">
                <label for="recipientName" class="form-label">收件人姓名 *</label>
                <input
                    id="recipientName"
                    v-model="form.recipientName"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.recipientName }"
                    placeholder="請輸入收件人姓名"
                    required
                />
                <div v-if="errors.recipientName" class="invalid-feedback">
                    {{ errors.recipientName }}
                </div>
            </div>

            <!-- 電話號碼 -->
            <div class="form-group">
                <label for="phoneNumber" class="form-label">電話號碼 *</label>
                <input
                    id="phoneNumber"
                    v-model="form.phoneNumber"
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': errors.phoneNumber }"
                    placeholder="請輸入電話號碼"
                    required
                />
                <div v-if="errors.phoneNumber" class="invalid-feedback">
                    {{ errors.phoneNumber }}
                </div>
            </div>

            <!-- 地址類型 -->
            <div class="form-group">
                <label for="addressType" class="form-label">地址類型 *</label>
                <select
                    id="addressType"
                    v-model="form.addressType"
                    class="form-select"
                    :class="{ 'is-invalid': errors.addressType }"
                    required
                >
                    <option value="">請選擇地址類型</option>
                    <option value="0">一般宅配地址</option>
                    <option value="1">超商取貨地址</option>
                </select>
                <div v-if="errors.addressType" class="invalid-feedback">
                    {{ errors.addressType }}
                </div>
            </div>

            <!-- 超商相關欄位 -->
            <div v-if="form.addressType === '1'" class="store-fields">
                <div class="form-group">
                    <label for="storeType" class="form-label">超商類型 *</label>
                    <select
                        id="storeType"
                        v-model="form.storeType"
                        class="form-select"
                        :class="{ 'is-invalid': errors.storeType }"
                        required
                    >
                        <option value="">請選擇超商類型</option>
                        <option value="0">7-Eleven</option>
                        <option value="1">FamilyMart</option>
                        <option value="2">OK</option>
                        <option value="3">Hi-Life</option>
                    </select>
                    <div v-if="errors.storeType" class="invalid-feedback">
                        {{ errors.storeType }}
                    </div>
                </div>

                <div class="form-group">
                    <label for="storeName" class="form-label">超商名稱 *</label>
                    <input
                        id="storeName"
                        v-model="form.storeName"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.storeName }"
                        placeholder="請輸入超商名稱"
                        required
                    />
                    <div v-if="errors.storeName" class="invalid-feedback">
                        {{ errors.storeName }}
                    </div>
                </div>

                <div class="form-group">
                    <label for="storeBranch" class="form-label">超商分店 *</label>
                    <input
                        id="storeBranch"
                        v-model="form.storeBranch"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.storeBranch }"
                        placeholder="請輸入超商分店"
                        required
                    />
                    <div v-if="errors.storeBranch" class="invalid-feedback">
                        {{ errors.storeBranch }}
                    </div>
                </div>
            </div>

            <!-- 城市 -->
            <div class="form-group">
                <label for="city" class="form-label">城市 *</label>
                <input
                    id="city"
                    v-model="form.city"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.city }"
                    placeholder="請輸入城市"
                    required
                />
                <div v-if="errors.city" class="invalid-feedback">
                    {{ errors.city }}
                </div>
            </div>

            <!-- 區域 -->
            <div class="form-group">
                <label for="district" class="form-label">區域 *</label>
                <input
                    id="district"
                    v-model="form.district"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.district }"
                    placeholder="請輸入區域"
                    required
                />
                <div v-if="errors.district" class="invalid-feedback">
                    {{ errors.district }}
                </div>
            </div>

            <!-- 詳細地址 -->
            <div class="form-group">
                <label for="addressDetail" class="form-label">詳細地址 *</label>
                <textarea
                    id="addressDetail"
                    v-model="form.addressDetail"
                    class="form-control"
                    :class="{ 'is-invalid': errors.addressDetail }"
                    placeholder="請輸入詳細地址"
                    rows="3"
                    required
                ></textarea>
                <div v-if="errors.addressDetail" class="invalid-feedback">
                    {{ errors.addressDetail }}
                </div>
            </div>

            <!-- 預設地址 -->
            <div class="form-group">
                <div class="form-check">
                    <input
                        id="isDefault"
                        v-model="form.isDefault"
                        type="checkbox"
                        class="form-check-input"
                    />
                    <label for="isDefault" class="form-check-label">
                        設為預設地址
                    </label>
                </div>
            </div>

            <!-- 按鈕區域 -->
            <div class="form-actions">
                <button
                    type="button"
                    class="btn btn-secondary"
                    @click="$emit('cancel')"
                    :disabled="isSubmitting"
                >
                    取消
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="isSubmitting"
                >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isSubmitting ? '處理中...' : (isEdit ? '更新地址' : '新增地址') }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
    address: {
        type: Object,
        default: null
    },
    isSubmitting: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['submit', 'cancel'])

// 表單資料
const form = reactive({
    recipientName: '',
    phoneNumber: '',
    addressType: '',
    storeType: null, // 新增超商類型，使用 null 而不是空字串
    storeName: '',
    storeBranch: '',
    city: '',
    district: '',
    addressDetail: '',
    isDefault: false
})

// 錯誤訊息
const errors = reactive({
    recipientName: '',
    phoneNumber: '',
    addressType: '',
    storeType: '', // 新增超商類型
    storeName: '',
    storeBranch: '',
    city: '',
    district: '',
    addressDetail: ''
})

// 是否為編輯模式
const isEdit = computed(() => props.address !== null)

// 監聽地址資料變化，用於編輯模式
watch(() => props.address, (newAddress) => {
    if (newAddress) {
        form.recipientName = newAddress.recipientName || ''
        form.phoneNumber = newAddress.phoneNumber || ''
        form.addressType = newAddress.addressType?.toString() || ''
        form.storeType = newAddress.storeType || null // 編輯模式時設定超商類型
        form.storeName = newAddress.storeName || ''
        form.storeBranch = newAddress.storeBranch || ''
        form.city = newAddress.city || ''
        form.district = newAddress.district || ''
        form.addressDetail = newAddress.addressDetail || ''
        form.isDefault = newAddress.isDefault || false
    }
}, { immediate: true })

// 驗證表單
const validateForm = () => {
    let isValid = true
    
    // 清除所有錯誤
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    // 驗證收件人姓名
    if (!form.recipientName.trim()) {
        errors.recipientName = '收件人姓名為必填欄位'
        isValid = false
    } else if (form.recipientName.length > 50) {
        errors.recipientName = '收件人姓名不能超過50個字元'
        isValid = false
    }

    // 驗證電話號碼
    if (!form.phoneNumber.trim()) {
        errors.phoneNumber = '電話號碼為必填欄位'
        isValid = false
    } else if (!/^[0-9+\-\s()]+$/.test(form.phoneNumber)) {
        errors.phoneNumber = '請輸入有效的電話號碼'
        isValid = false
    }

    // 驗證地址類型
    if (!form.addressType) {
        errors.addressType = '請選擇地址類型'
        isValid = false
    }

    // 驗證超商相關欄位
    if (form.addressType === '1') {
        if (form.storeType === null || form.storeType === '') {
            errors.storeType = '請選擇超商類型'
            isValid = false
        }
        if (!form.storeName.trim()) {
            errors.storeName = '超商名稱為必填欄位'
            isValid = false
        }
        if (!form.storeBranch.trim()) {
            errors.storeBranch = '超商分店為必填欄位'
            isValid = false
        }
    }

    // 驗證城市
    if (!form.city.trim()) {
        errors.city = '城市為必填欄位'
        isValid = false
    }

    // 驗證區域
    if (!form.district.trim()) {
        errors.district = '區域為必填欄位'
        isValid = false
    }

    // 驗證詳細地址
    if (!form.addressDetail.trim()) {
        errors.addressDetail = '詳細地址為必填欄位'
        isValid = false
    }

    return isValid
}

// 處理表單提交
const handleSubmit = () => {
    if (!validateForm()) {
        return
    }

    // 準備提交資料
    const submitData = {
        recipientName: form.recipientName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        addressType: parseInt(form.addressType),
        city: form.city.trim(),
        district: form.district.trim(),
        addressDetail: form.addressDetail.trim(),
        isDefault: form.isDefault
    }

    // 如果是超商類型，添加超商相關欄位
    if (form.addressType === '1') {
        submitData.storeType = parseInt(form.storeType)
        submitData.storeName = form.storeName.trim()
        submitData.storeBranch = form.storeBranch.trim()
    }

    emit('submit', submitData)
}
</script>

<style scoped>
.address-form-container {
    max-width: 600px;
    margin: 0 auto;
}

.address-form {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    font-weight: 600;
    color: #686868;
    margin-bottom: 0.5rem;
    display: block;
}

.form-control,
.form-select {
    border: 1px solid #d3a2da;
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
    border-color: #92559c;
    box-shadow: 0 0 0 0.2rem rgba(146, 85, 156, 0.25);
    outline: none;
}

.form-control.is-invalid,
.form-select.is-invalid {
    border-color: #dc3545;
}

.invalid-feedback {
    display: block;
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.store-fields {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border-left: 4px solid #92559c;
}

.form-check {
    margin-top: 1rem;
}

.form-check-input:checked {
    background-color: #92559c;
    border-color: #92559c;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

.btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #92559c 0%, #d3a2da 100%);
    border: none;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #d3a2da 0%, #ffa600 100%);
    transform: translateY(-2px);
}

.btn-secondary {
    background: #6c757d;
    border: none;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #5a6268;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .address-form {
        padding: 1.5rem;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
    }
}
</style> 