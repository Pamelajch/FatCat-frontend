<template>
  <ul class="list-group">
    <li class="list-group-item">
      <h3>付款資料</h3>
    </li>

    <!-- 優惠券選擇 -->
    <li class="list-group-item">使用優惠券:
      <select class="form-select form-select-sm" v-model.number="checkout.couponId">
        <option value="">請選擇優惠</option>
        <option v-for="coupon in couponOptions" :key="coupon.couponId" :value="coupon.couponId">
          {{ coupon.description }}
        </option>
      </select>
    </li>

    <!-- 金額明細 -->
    <li class="list-group-item">訂單總金額:
      <div>
        商品小計: {{ productTotal }} 元<br />
        運費: {{ checkout.shippingFee }} 元<br />
        折扣金額: -{{ checkout.discount }} 元
        <hr />
        實付金額: <strong>{{ checkout.total }} 元</strong>
      </div>
    </li>
  </ul>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { useCheckoutStore } from '@/stores/checkout'

const checkout = useCheckoutStore()
const productTotal = ref(2000)
const couponOptions = ref([])
const shippingOptions = ref([])

onMounted(async () => {
  try {
    const [couponRes, shippingRes] = await Promise.all([
      axios.get('https://localhost:7017/api/Coupons'),
      axios.get('https://localhost:7017/api/Shippings')
    ])
    couponOptions.value = couponRes.data
    shippingOptions.value = shippingRes.data

    console.log('✅ Coupon API 成功:', couponOptions.value)
    console.log('✅ Shipping API 成功:', shippingOptions.value)

    recalculateTotal()
  } catch (error) {
    console.error('❌ 載入優惠券與送貨方式失敗:', error)
  }
})

// 當 shippingId 改變
watch(() => checkout.shippingId, recalculateTotal)

// 當 couponId 改變
watch(() => checkout.couponId, recalculateTotal)

// shippingOptions 載入完成也要再算一次（初始）
watch(shippingOptions, recalculateTotal)

// ✅ 統一的運費與折扣重計邏輯
function recalculateTotal() {
  const selectedShipping = shippingOptions.value.find(s => s.shippingId === Number(checkout.shippingId))
  const selectedCoupon = couponOptions.value.find(c => c.couponId === Number(checkout.couponId))

  checkout.shippingFee = selectedShipping?.shippingFee ?? 0

  if (!selectedCoupon) {
    checkout.discount = 0
  } else if (selectedCoupon.couponTypeId === 3) {
    // 🎯 免運券 → 折扣 = 運費
    checkout.discount = checkout.shippingFee
  } else {
    // 🎯 一般折價券
    checkout.discount = selectedCoupon.discountAmount ?? 0
  }

  checkout.total = productTotal.value + checkout.shippingFee - checkout.discount

  // Debug log
  console.log('📦 運費:', checkout.shippingFee)
  console.log('💰 折扣:', checkout.discount)
  console.log('💳 總金額:', checkout.total)
}
</script>
