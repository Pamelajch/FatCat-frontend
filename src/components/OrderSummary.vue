<template>
  <div class="row">
    <!-- 個人資料 -->
    <div class="col-12 col-md-4 mb-3">
      <ul class="list-group">
        <li class="list-group-item"><h3>個人資料</h3></li>
        <li class="list-group-item">姓名：<div>{{ checkout.name }}</div></li>
        <li class="list-group-item">電話：<div>{{ checkout.phone }}</div></li>
        <li class="list-group-item">Email：<div>{{ checkout.email }}</div></li>
      </ul>
    </div>

    <!-- 送貨資料 -->
    <div class="col-12 col-md-4 mb-3">
      <ul class="list-group">
        <li class="list-group-item"><h3>送貨資料</h3></li>
        <li class="list-group-item">送貨方式：
          <div>{{ selectedShipping?.name || '未選擇' }}</div>
        </li>
        <li class="list-group-item">收件人姓名：<div>{{ checkout.recipientName }}</div></li>
        <li class="list-group-item">收件人電話：<div>{{ checkout.recipientPhone }}</div></li>
      </ul>
    </div>

    <!-- 付款資料 -->
    <div class="col-12 col-md-4 mb-3">
      <ul class="list-group">
        <li class="list-group-item"><h3>付款資料</h3></li>
        <li class="list-group-item">使用優惠券：
          <div>{{ selectedCoupon?.description || '未使用' }}</div>
        </li>
        <li class="list-group-item">
          訂單總金額：{{ checkout.productTotal }} 元
          <div>
            運費：{{ checkout.shippingFee }} 元<br />
            折扣金額：-{{ checkout.discount }} 元
            <hr />
            實付金額：<strong>{{ checkout.total }} 元</strong>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useCheckoutStore } from '@/stores/checkout'

const checkout = useCheckoutStore()

const couponOptions = ref([])
const shippingOptions = ref([])

// 載入對應資料名稱
onMounted(async () => {
  try {
    const [couponRes, shippingRes] = await Promise.all([
      axios.get('https://localhost:7017/api/Coupons'),
      axios.get('https://localhost:7017/api/Shippings')
    ])
    couponOptions.value = couponRes.data
    shippingOptions.value = shippingRes.data

    checkout.productTotal = productTotal.value  // ✅ 新增這行

    recalculateTotal()
  } catch (error) {
    console.error('❌ 載入優惠券或送貨方式失敗:', error)
  }
})

// 比對對應名稱
const selectedCoupon = computed(() =>
  couponOptions.value.find(c => c.couponId === checkout.couponId)
)
const selectedShipping = computed(() =>
  shippingOptions.value.find(s => s.shippingId === checkout.shippingId)
)
</script>
