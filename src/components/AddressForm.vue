<script setup>
import { ref, reactive, computed, watch } from 'vue'

const showMapModal = ref(false)

const props = defineProps({
    address: { type: Object, default: null },
    isSubmitting: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
    recipientName: '',
    phoneNumber: '',
    addressType: '',
    storeType: null,
    storeId: '',
    storeName: '',
    storeBranch: '',
    city: '',
    district: '',
    addressDetail: '',
    isDefault: false
})

const errors = reactive({
    recipientName: '',
    phoneNumber: '',
    addressType: '',
    storeType: '',
    storeId: '',
    storeName: '',
    storeBranch: '',
    city: '',
    district: '',
    addressDetail: ''
})

const isEdit = computed(() => props.address !== null)

// 綠界超商地圖
const openMapModal = () => {
  showMapModal.value = true
  if (!document.getElementById('emap-sdk')) {
    const script = document.createElement('script')
    script.id = 'emap-sdk'
    script.src = 'https://emap.pcsc.com.tw/EMapSDK/SDKLoader.js'
    script.onload = openEcpayMap
    document.body.appendChild(script)
  } else {
    openEcpayMap()
  }
}

window.GetSelectedStoreCallback = function(data) {
  form.storeId = data.StoreID
  form.storeName = data.StoreName
  form.addressDetail = data.StoreAddress
  // 拆 city/district
  const addr = data.StoreAddress
  if (addr.includes('台北市')) {
    form.city = '台北市'
    form.district = addr.replace('台北市', '').substring(0, 3)
  } else if (addr.includes('新北市')) {
    form.city = '新北市'
    form.district = addr.replace('新北市', '').substring(0, 3)
  } else if (addr.includes('桃園市')) {
    form.city = '桃園市'
    form.district = addr.replace('桃園市', '').substring(0, 3)
  } else if (addr.includes('台中市')) {
    form.city = '台中市'
    form.district = addr.replace('台中市', '').substring(0, 3)
  } else if (addr.includes('台南市')) {
    form.city = '台南市'
    form.district = addr.replace('台南市', '').substring(0, 3)
  } else if (addr.includes('高雄市')) {
    form.city = '高雄市'
    form.district = addr.replace('高雄市', '').substring(0, 3)
  }
  showMapModal.value = false
  // 清空地圖內容
  const mapDiv = document.getElementById('map_container')
  if (mapDiv) mapDiv.innerHTML = ''
}

function openEcpayMap() {
  window.EMapSDK.open({
    type: "UNIMARTC2C", // 7-11 交貨便
    getStore: "GetSelectedStoreCallback"
  })
}

const closeMapModal = () => {
  showMapModal.value = false
  const mapDiv = document.getElementById('map_container')
  if (mapDiv) mapDiv.innerHTML = ''
}

// 監聽地址資料變化，用於編輯模式
watch(() => props.address, (newAddress) => {
    if (newAddress) {
        form.recipientName = newAddress.recipientName || ''
        form.phoneNumber = newAddress.phoneNumber || ''
        form.addressType = newAddress.addressType?.toString() || ''
        form.storeType = newAddress.storeType || null
        form.storeName = newAddress.storeName || ''
        form.storeBranch = newAddress.storeBranch || ''
        form.city = newAddress.city || ''
        form.district = newAddress.district || ''
        form.addressDetail = newAddress.addressDetail || ''
        form.isDefault = newAddress.isDefault || false
    }
}, { immediate: true })

const validateForm = () => {
    let isValid = true
    Object.keys(errors).forEach(key => { errors[key] = '' })
    if (!form.recipientName.trim()) { errors.recipientName = '收件人姓名為必填欄位'; isValid = false }
    else if (form.recipientName.length > 50) { errors.recipientName = '收件人姓名不能超過50個字元'; isValid = false }
    if (!form.phoneNumber.trim()) { errors.phoneNumber = '電話號碼為必填欄位'; isValid = false }
    else if (!/^[0-9+\-\s()]+$/.test(form.phoneNumber)) { errors.phoneNumber = '請輸入有效的電話號碼'; isValid = false }
    if (!form.addressType) { errors.addressType = '請選擇地址類型'; isValid = false }
    if (form.addressType === '1' && !form.storeName.trim()) { errors.storeName = '請先選擇門市'; isValid = false }
    if (!form.city.trim()) { errors.city = '城市為必填欄位'; isValid = false }
    if (!form.district.trim()) { errors.district = '區域為必填欄位'; isValid = false }
    if (!form.addressDetail.trim()) { errors.addressDetail = '詳細地址為必填欄位'; isValid = false }
    return isValid
}

const handleSubmit = () => {
    if (!validateForm()) return
    const submitData = {
        recipientName: form.recipientName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        addressType: parseInt(form.addressType),
        city: form.city.trim(),
        district: form.district.trim(),
        addressDetail: form.addressDetail.trim(),
        isDefault: form.isDefault
    }
    if (form.addressType === '1') {
        submitData.storeType = parseInt(form.storeType)
        submitData.storeName = form.storeName.trim()
        submitData.storeBranch = form.storeBranch.trim()
    }
    emit('submit', submitData)
}
</script>

<template>
    <div class="address-form-container">
        <form @submit.prevent="handleSubmit" class="address-form">
            <!-- 收件人姓名 -->
            <div class="form-group">
                <label for="recipientName" class="form-label">收件人姓名 *</label>
                <input id="recipientName" v-model="form.recipientName" type="text" class="form-control" :class="{ 'is-invalid': errors.recipientName }" placeholder="請輸入收件人姓名" required />
                <div v-if="errors.recipientName" class="invalid-feedback">{{ errors.recipientName }}</div>
            </div>
            <!-- 電話號碼 -->
            <div class="form-group">
                <label for="phoneNumber" class="form-label">電話號碼 *</label>
                <input id="phoneNumber" v-model="form.phoneNumber" type="tel" class="form-control" :class="{ 'is-invalid': errors.phoneNumber }" placeholder="請輸入電話號碼" required />
                <div v-if="errors.phoneNumber" class="invalid-feedback">{{ errors.phoneNumber }}</div>
            </div>
            <!-- 地址類型 -->
            <div class="form-group">
                <label for="addressType" class="form-label">地址類型 *</label>
                <select id="addressType" v-model="form.addressType" class="form-select" :class="{ 'is-invalid': errors.addressType }" required>
                    <option value="">請選擇地址類型</option>
                    <option value="0">一般宅配地址</option>
                    <option value="1">超商取貨地址</option>
                </select>
                <div v-if="errors.addressType" class="invalid-feedback">{{ errors.addressType }}</div>
            </div>
            <!-- 超商相關欄位 -->
            <div v-if="form.addressType === '1'" class="store-fields">
                <button @click.prevent="openMapModal" class="btn btn-outline-primary">選擇 7-11 門市</button>
                <div v-if="showMapModal" class="modal-backdrop">
                    <div class="modal-content" style="width: 90vw; height: 90vh;">
                        <button class="btn btn-danger" @click="closeMapModal" style="float:right;">關閉</button>
                        <div id="map_container"></div>
                    </div>
                </div>
                <div v-if="form.storeName" class="form-group">
                    <label class="form-label">已選擇的門市</label>
                    <div class="alert alert-success">
                        <strong>{{ form.storeName }}</strong><br>
                        <small class="text-muted">門市編號：{{ form.storeId }}</small><br>
                        {{ form.addressDetail }}
                    </div>
                </div>
            </div>
            <!-- 城市 -->
            <div class="form-group">
                <label for="city" class="form-label">城市 *</label>
                <input id="city" v-model="form.city" type="text" class="form-control" :class="{ 'is-invalid': errors.city }" placeholder="請輸入城市" required />
                <div v-if="errors.city" class="invalid-feedback">{{ errors.city }}</div>
            </div>
            <!-- 區域 -->
            <div class="form-group">
                <label for="district" class="form-label">區域 *</label>
                <input id="district" v-model="form.district" type="text" class="form-control" :class="{ 'is-invalid': errors.district }" placeholder="請輸入區域" required />
                <div v-if="errors.district" class="invalid-feedback">{{ errors.district }}</div>
            </div>
            <!-- 詳細地址 -->
            <div class="form-group">
                <label for="addressDetail" class="form-label">詳細地址 *</label>
                <textarea id="addressDetail" v-model="form.addressDetail" class="form-control" :class="{ 'is-invalid': errors.addressDetail }" placeholder="請輸入詳細地址" rows="3" required></textarea>
                <div v-if="errors.addressDetail" class="invalid-feedback">{{ errors.addressDetail }}</div>
            </div>
            <!-- 預設地址 -->
            <div class="form-group">
                <div class="form-check">
                    <input id="isDefault" v-model="form.isDefault" type="checkbox" class="form-check-input" />
                    <label for="isDefault" class="form-check-label">設為預設地址</label>
                </div>
            </div>
            <!-- 按鈕區域 -->
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="$emit('cancel')" :disabled="isSubmitting">取消</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isSubmitting ? '處理中...' : (isEdit ? '更新地址' : '新增地址') }}
                </button>
            </div>
        </form>
    </div>
</template>

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
.form-control, .form-select { 
    border: 1px solid #d3a2da; 
    border-radius: 8px; 
    padding: 0.75rem; 
    font-size: 0.9rem; 
    transition: all 0.3s ease; 
}
.form-control:focus, .form-select:focus { 
    border-color: #92559c; 
    box-shadow: 0 0 0 0.2rem rgba(146, 85, 156, 0.25); 
    outline: none; 
}
.form-control.is-invalid, .form-select.is-invalid, .btn.is-invalid { 
    border-color: #dc3545; 
}
.invalid-feedback { display: block; 
    color: #dc3545; 
    font-size: 0.85rem;
     margin-top: 0.25rem;
 }
.store-fields { background: #f8f9fa;
     padding: 1rem;
     border-radius: 8px;
     margin-bottom: 1rem;
     border-left: 4px solid #92559c;
 }
.form-check { margin-top: 1rem;
 }
.form-check-input:checked { background-color: #92559c;
     border-color: #92559c;
 }
.form-actions { display: flex;
     gap: 1rem;
     justify-content: flex-end;
     margin-top: 2rem;
     padding-top: 1rem;
     border-top: 1px solid #eee;
 }
.btn { padding: 0.75rem 1.5rem;
     border-radius: 8px;
     font-weight: 500;
     transition: all 0.3s ease;
 }
.btn-primary { background: linear-gradient(135deg, #92559c 0%, #d3a2da 100%);
     border: none;
     color: white;
 }
.btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #d3a2da 0%, #ffa600 100%);
     transform: translateY(-2px);
 }
.btn-outline-primary { border: 2px solid #92559c;
     color: #92559c;
     background: white;
 }
.btn-outline-primary:hover:not(:disabled) { background: #92559c;
     color: white;
 }
.btn-secondary { background: #6c757d;
     border: none;
     color: white;
 }
.btn-secondary:hover:not(:disabled) { background: #5a6268;
 }
.btn:disabled { opacity: 0.6;
     cursor: not-allowed;
 }
.form-text { font-size: 0.85rem;
     color: #6c757d;
     margin-top: 0.25rem;
 }
.alert { border-radius: 8px;
     padding: 1rem;
 }
.alert-success { background-color: #d4edda;
     border-color: #c3e6cb;
     color: #155724;
 }
.modal-backdrop { position: fixed;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     background: rgba(0,0,0,0.5);
     z-index: 9999;
     display: flex;
     align-items: center;
     justify-content: center;
 }
.modal-content { background: #fff;
     border-radius: 8px;
     padding: 1rem;
     position: relative;
 }
@media (max-width: 768px) {
    .address-form { padding: 1.5rem;
     }
    .form-actions { flex-direction: column;
     }
    .btn { width: 100%;
     }
}
</style>