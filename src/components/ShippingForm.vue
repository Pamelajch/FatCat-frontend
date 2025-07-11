<template>
  <ul class="list-group">
    <li class="list-group-item">
      <h3>送貨資料填寫</h3>
    </li>
    <li class="list-group-item">送貨方式:
      <div>
        <select class="form-select form-select-sm" v-model="shippingMethod">
          <option selected disabled>請選擇送貨方式</option>
          <option value="home">宅配</option>
          <option value="store">超商取貨</option>
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
        <label class="form-check-label" for="sameAsMember">
          同會員資料填入
        </label>
      </div>
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'

const shippingMethod = ref('')
const recipientName = ref('')
const recipientPhone = ref('')
const sameAsMember = ref(false)
</script>
