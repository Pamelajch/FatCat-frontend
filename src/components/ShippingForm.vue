<template>
  <ul class="list-group">
    <li class="list-group-item">
      <h3>選擇送貨地址</h3>
    </li>

    <!-- 載入狀態 -->
    <li class="list-group-item" v-if="isLoading">
      <div class="text-center">
        <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        載入地址中...
      </div>
    </li>

    <!-- 地址列表 -->
    <template v-else>
      <!-- 沒有地址時顯示提示 -->
      <li class="list-group-item" v-if="addressList.length === 0">
        <div class="text-center text-muted">
          <i class="bi bi-geo-alt" style="font-size: 2rem;"></i>
          <p class="mt-2 mb-0">尚未新增任何地址</p>
          <router-link to="/user" class="btn btn-outline-primary btn-sm mt-2">
            前往地址管理
          </router-link>
        </div>
      </li>

      <!-- 地址選項 -->
      <li 
        v-for="address in addressList" 
        :key="address.addressId"
        class="list-group-item address-option"
        :class="{ 'selected': selectedAddressId === address.addressId }"
      >
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="selectedAddress"
            :id="'address-' + address.addressId"
            :value="address.addressId"
            v-model="selectedAddressId"
          />
          <label class="form-check-label w-100" :for="'address-' + address.addressId">
            <div class="address-content">
              <div class="address-header">
                <span v-if="address.isDefault" class="badge bg-success me-2">預設</span>
                <span class="address-type-badge">
                  {{ address.addressType === 1 ? '宅配' : '超商取貨' }}
                </span>
              </div>
              <div class="recipient-info">
                <strong>{{ address.recipientName }}</strong>
                <span class="text-muted ms-2">{{ address.phoneNumber }}</span>
              </div>
              <div class="address-detail">
                <span v-if="address.addressType === 1">
                  {{ address.city }}{{ address.district }}{{ address.addressDetail }}
                </span>
                <span v-else>
                  {{ address.storeName }}
                </span>
              </div>
            </div>
          </label>
        </div>
      </li>
    </template>

    <!-- 同會員資料填入選項 -->
    <li class="list-group-item" v-if="addressList.length > 0">
      <div class="form-check">
        <input 
          class="form-check-input" 
          type="checkbox" 
          id="sameAsMember" 
          v-model="sameAsMember" 
        />
        <label class="form-check-label" for="sameAsMember">
          同會員資料填入
        </label>
      </div>
    </li>

    <!-- 錯誤訊息 -->
    <li class="list-group-item" v-if="errors.addressId">
      <span class="text-danger">請選擇送貨地址</span>
    </li>
  </ul>
</template>

<script setup>
import { ref, onMounted, watch, defineExpose } from 'vue'
import api from '@/services/jjapi.js'
import { useCheckoutStore } from '@/stores/checkout'

const checkout = useCheckoutStore()

// 狀態管理
const addressList = ref([])
const selectedAddressId = ref('')
const sameAsMember = ref(false)
const isLoading = ref(false)

// 錯誤處理
const errors = ref({
  addressId: false
})

// 載入地址列表
const loadAddresses = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/address')
    if (res.data && res.data.success) {
      addressList.value = res.data.data
      
      // 預設選擇預設地址
      const defaultAddr = addressList.value.find(a => a.isDefault)
      if (defaultAddr) {
        selectedAddressId.value = defaultAddr.addressId
      } else if (addressList.value.length > 0) {
        // 如果沒有預設地址，選擇第一個
        selectedAddressId.value = addressList.value[0].addressId
      }
    }
  } catch (error) {
    console.error('載入地址失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 當選擇地址時，同步到 checkout store
watch(selectedAddressId, (id) => {
  errors.value.addressId = false
  
  const addr = addressList.value.find(a => a.addressId === id)
  if (addr) {
    checkout.recipientName = addr.recipientName
    checkout.recipientPhone = addr.phoneNumber
    checkout.shippingAddressId = addr.addressId
    checkout.addressType = addr.addressType
    
    // 組合完整地址
    if (addr.addressType === 1) {
      checkout.recipientAddress = (addr.city || '') + (addr.district || '') + (addr.addressDetail || '')
      checkout.storeName = ''
    } else {
      checkout.recipientAddress = ''
      checkout.storeName = addr.storeName || ''
    }
  }
})

// 同會員資料填入功能
watch(sameAsMember, (val) => {
  checkout.sameAsMember = val
  if (val) {
    // 如果勾選同會員資料，可以從會員資料填入
    // 這裡可以根據需求實作
  }
})

// 驗證方法
function validateShippingInfo() {
  let isValid = true
  
  // 重置錯誤
  errors.value.addressId = false
  
  if (!selectedAddressId.value) {
    errors.value.addressId = true
    isValid = false
  }
  
  return isValid
}

// 初始化
onMounted(() => {
  loadAddresses()
})

defineExpose({ validateShippingInfo })
</script>

<style scoped>
.address-option {
  cursor: pointer;
  transition: all 0.2s ease;
}

.address-option:hover {
  background-color: #f8f9fa;
}

.address-option.selected {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.address-content {
  margin-left: 0.5rem;
}

.address-header {
  margin-bottom: 0.5rem;
}

.address-type-badge {
  background: #92559c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.recipient-info {
  margin-bottom: 0.25rem;
}

.address-detail {
  color: #6c757d;
  font-size: 0.9rem;
}

.form-check-input:checked {
  background-color: #92559c;
  border-color: #92559c;
}

.form-check-input:focus {
  border-color: #92559c;
  box-shadow: 0 0 0 0.25rem rgba(146, 85, 156, 0.25);
}
</style>