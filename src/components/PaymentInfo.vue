<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { useCheckoutStore } from '@/stores/checkout'

const checkout = useCheckoutStore()

const couponOptions = ref([])
const shippingOptions = ref([])

const productTotal = ref(2000) // TODO: 這應該從 cartStore 或父元件傳入

// 取得優惠券與送貨方式資料
onMounted(async () => {
  try {
    const [couponRes, shippingRes] = await Promise.all([
      axios.get('https://localhost:7017/api/Coupons'),
      axios.get('https://localhost:7017/api/Shippings'),
    ])
    couponOptions.value = couponRes.data
    shippingOptions.value = shippingRes.data
  } catch (error) {
    console.error('載入優惠券與送貨方式失敗:', error)
  }
})

// ✅ 當選擇運送方式時更新 shippingFee
watch(() => checkout.shippingId, (newId) => {
  const selected = shippingOptions.value.find(s => s.shippingId === Number(newId))
  checkout.shippingFee = selected?.fee ?? 0
  updateTotal()
})

// ✅ 當選擇優惠券時更新 discount
watch(() => checkout.couponId, (newId) => {
  const selected = couponOptions.value.find(c => c.couponId === Number(newId))

  if (!selected) {
    checkout.discount = 0
    updateTotal()
    return
  }

  switch (selected.couponTypeId) {
    case 1: // 滿千折百
      checkout.discount = productTotal.value >= 1000 ? 100 : 0
      break
    case 2: // 免運
      checkout.discount = checkout.shippingFee
      break
    case 3: // 9折
      checkout.discount = Math.floor(productTotal.value * 0.1)
      break
    default:
      checkout.discount = 0
  }

  updateTotal()
})

// ✅ 總金額計算
function updateTotal() {
  checkout.total = productTotal.value + checkout.shippingFee - checkout.discount
}
</script>

<template>
  <ul class="list-group">
    <li class="list-group-item">
      <h3>付款資料</h3>
    </li>

    <!-- 優惠券選擇 -->
    <li class="list-group-item">使用優惠券:
      <select class="form-select form-select-sm" v-model="checkout.couponId">
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
