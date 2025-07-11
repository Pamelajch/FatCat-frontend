<template>
  <ul class="list-group">
    <li class="list-group-item">
      <h3>送貨資料填寫</h3>
    </li>

    <li class="list-group-item">送貨方式:
      <div>
        <select class="form-select form-select-sm" v-model="selectedShippingId">
          <option disabled value="">請選擇送貨方式</option>
          <option v-for="option in shippingOptions" :key="option.shippingId" :value="option.shippingId">
            {{ option.name }}
          </option>
        </select>
      </div>
    </li>

    <li class="list-group-item">收件人姓名:
      <div>
        <input type="text" class="form-control" v-model="recipientName" />
      </div>
    </li>

    <li class="list-group-item">收件人電話:
      <div>
        <input type="text" class="form-control" v-model="recipientPhone" />
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
import { ref, onMounted } from 'vue'
import axios from 'axios'

const shippingOptions = ref([])
const selectedShippingId = ref('')
const recipientName = ref('')
const recipientPhone = ref('')
const sameAsMember = ref(false)

onMounted(async () => {
  try {
    const response = await axios.get('https://localhost:7017/api/Shippings') // ⬅ 調整成你的後端 API base URL
    shippingOptions.value = response.data
  } catch (error) {
    console.error('取得送貨方式失敗:', error)
  }
})
</script>
