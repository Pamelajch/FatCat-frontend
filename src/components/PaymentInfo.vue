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
    <li class="list-group-item">
      <div>
        商品總金額: {{ cartStore.total }} 元<br />
        運費: {{ checkout.shippingFee }} 元<br />
        折扣金額: -{{ checkout.discount }} 元
        <hr />
        實付金額: <strong>{{ checkout.total }} 元</strong>
      </div>
    </li>
  </ul>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import { useCheckoutStore } from '@/stores/checkout'
import { useCartStore } from '@/stores/cart'

const checkout = useCheckoutStore()
const cartStore = useCartStore()

const productTotal = computed(() => cartStore.total)
const couponOptions = ref([])

onMounted(async () => {
  try {
    const res = await axios.get('https://localhost:7017/api/Coupons')
    couponOptions.value = res.data
    console.log('✅ Coupon API 成功:', couponOptions.value)
    recalculateTotal()
  } catch (error) {
    console.error('❌ 載入優惠券失敗:', error)
  }
})

// ✅ 單純監看必要變數變化即可
watch(() => checkout.couponId, recalculateTotal)
watch(() => checkout.shippingFee, recalculateTotal)
watch(productTotal, recalculateTotal)

// ✅ 計算折扣與總金額
function recalculateTotal() {
  const selectedCoupon = couponOptions.value.find(c => c.couponId === Number(checkout.couponId))

  if (!selectedCoupon) {
    checkout.discount = 0
  } else if (selectedCoupon.coupontypeId === 3) {
    // ✅ 免運券 → 折扣等於 shippingFee
    checkout.discount = checkout.shippingFee
  } else {
    checkout.discount = selectedCoupon.discountAmount ?? 0
  }

  checkout.total = productTotal.value + checkout.shippingFee - checkout.discount
}
</script>
