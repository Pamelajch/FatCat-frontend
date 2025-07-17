<template>
  <ul class="list-group">
    <li class="list-group-item">
      <h3>送貨資料填寫</h3>
    </li>

    <li class="list-group-item">
      送貨方式:
      <div>
        <select class="form-select form-select-sm" v-model.number="selectedShippingId">
          <option disabled value="">請選擇送貨方式</option>
          <option
            v-for="option in shippingOptions"
            :key="option.shippingId"
            :value="option.shippingId"
          >
            {{ option.name }}
          </option>
        </select>
        <span class="text-danger" v-if="errors.shippingId">請選擇送貨方式</span>
      </div>
    </li>

    <!-- 宅配地址輸入 -->
    <li class="list-group-item" v-if="selectedShipping?.shippingTypeId === 1">
      收件地址:
      <div>
        <input type="text" class="form-control" v-model="recipientAddress" />
        <span class="text-danger" v-if="errors.recipientAddress">請輸入收件地址</span>
      </div>
    </li>

    <!-- 超商取貨選門市 -->
    <li class="list-group-item" v-if="selectedShipping?.shippingTypeId === 2">
      超商取貨:
      <div class="d-flex align-items-center">
        <button class="btn btn-outline-primary btn-sm me-2" @click="selectStore">選擇門市</button>
        <span v-if="storeName">{{ storeName }}</span>
      </div>
      <span class="text-danger" v-if="errors.storeName">請選擇門市</span>
    </li>

    <li class="list-group-item">
      收件人姓名:
      <div>
        <input type="text" class="form-control" v-model="recipientName" />
        <span class="text-danger" v-if="errors.recipientName">請輸入收件人姓名</span>
      </div>
    </li>

    <li class="list-group-item">
      收件人電話:
      <div>
        <input type="text" class="form-control" v-model="recipientPhone" />
        <span class="text-danger" v-if="errors.recipientPhone">請輸入收件人電話</span>
      </div>
    </li>

    <li class="list-group-item">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="sameAsMember" v-model="sameAsMember" />
        <label class="form-check-label" for="sameAsMember">同會員資料填入</label>
      </div>
    </li>
  </ul>
</template>


<script setup>
import { ref, onMounted, watch, computed, defineExpose } from 'vue'
import axios from 'axios'
import { useCheckoutStore } from '@/stores/checkout'

const checkout = useCheckoutStore()

const shippingOptions = ref([])
const selectedShippingId = ref('')
const recipientName = ref('')
const recipientPhone = ref('')
const recipientAddress = ref('')
const storeName = ref('')
const sameAsMember = ref(false)

const errors = ref({
  shippingId: false,
  recipientName: false,
  recipientPhone: false,
  recipientAddress: false,
  storeName: false
})

const selectedShipping = computed(() =>
  shippingOptions.value.find(s => s.shippingId === Number(selectedShippingId.value))
)

onMounted(async () => {
  try {
    const res = await axios.get('https://localhost:7017/api/Shippings')
    shippingOptions.value = res.data
  } catch (error) {
    console.error('取得送貨方式失敗:', error)
  }
})

// 監聽 checkbox 勾選時從 store 帶入資料
watch(sameAsMember, (val) => {
  if (val) {
    recipientName.value = checkout.name
    recipientPhone.value = checkout.phone
  } else {
    recipientName.value = ''
    recipientPhone.value = ''
  }
})

// 同步到 store
watch(selectedShippingId, (newId) => {
  checkout.shippingId = newId
  const selected = shippingOptions.value.find(s => s.shippingId === Number(newId))
  checkout.shippingFee = selected?.shippingFee ?? 0
  checkout.shippingTypeId = selected?.shippingTypeId ?? null
})

watch(recipientName, val => checkout.recipientName = val)
watch(recipientPhone, val => checkout.recipientPhone = val)
watch(recipientAddress, val => checkout.recipientAddress = val)
watch(storeName, val => checkout.storeName = val)
watch(sameAsMember, val => checkout.sameAsMember = val)

// 🔘 假的選擇門市功能
function selectStore() {
  storeName.value = '7-11 台北南京店' // 先硬寫模擬，未來串接 API
}

// ✅ 驗證方法
function validateShippingInfo() {
  let isValid = true

  // reset
  errors.value.shippingId = false
  errors.value.recipientName = false
  errors.value.recipientPhone = false
  errors.value.recipientAddress = false
  errors.value.storeName = false

  if (!selectedShippingId.value) {
    errors.value.shippingId = true
    isValid = false
  }
  if (!recipientName.value.trim()) {
    errors.value.recipientName = true
    isValid = false
  }
  if (!recipientPhone.value.trim()) {
    errors.value.recipientPhone = true
    isValid = false
  }

  // 根據類型額外驗證
  if (selectedShipping.value?.shippingTypeId === 1) {
    if (!recipientAddress.value.trim()) {
      errors.value.recipientAddress = true
      isValid = false
    }
  }

  if (selectedShipping.value?.shippingTypeId === 2) {
    if (!storeName.value.trim()) {
      errors.value.storeName = true
      isValid = false
    }
  }

  return isValid
}

defineExpose({ validateShippingInfo })
</script>
