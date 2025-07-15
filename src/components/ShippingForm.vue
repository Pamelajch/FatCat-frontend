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
          <option v-for="option in shippingOptions" :key="option.shippingId" :value="option.shippingId">
            {{ option.name }}
          </option>
        </select>
        <span class="text-danger" v-if="errors.shippingId">請選擇送貨方式</span>
      </div>
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
import { ref, onMounted, watch, defineExpose } from 'vue'
import axios from 'axios'
import { useCheckoutStore } from '@/stores/checkout'

const checkout = useCheckoutStore()
const shippingOptions = ref([])
const selectedShippingId = ref('')
const recipientName = ref('')
const recipientPhone = ref('')
const sameAsMember = ref(false)

// 錯誤訊息狀態
const errors = ref({
  shippingId: false,
  recipientName: false,
  recipientPhone: false
})

onMounted(async () => {
  try {
    const res = await axios.get('https://localhost:7017/api/Shippings')
    shippingOptions.value = res.data
  } catch (error) {
    console.error('取得送貨方式失敗:', error)
  }
})

// 同步到 checkout store
watch(selectedShippingId, (newId) => {
  checkout.shippingId = newId
  const selected = shippingOptions.value.find(s => s.shippingId === Number(newId))
  checkout.shippingFee = selected?.shippingFee ?? 0
})
watch(recipientName, val => checkout.recipientName = val)
watch(recipientPhone, val => checkout.recipientPhone = val)
watch(sameAsMember, val => checkout.sameAsMember = val)

// ✅ 驗證方法給外部呼叫
function validateShippingInfo() {
  let isValid = true

  // 清除舊錯誤
  errors.value.shippingId = false
  errors.value.recipientName = false
  errors.value.recipientPhone = false

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

  return isValid
}

defineExpose({ validateShippingInfo })
</script>
