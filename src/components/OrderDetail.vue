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
        <li class="list-group-item" v-if="selectedShipping?.shippingTypeId === 1">
          收件地址：
          <div>{{ checkout.recipientAddress || '未填寫' }}</div>
        </li>
        <li class="list-group-item" v-else-if="selectedShipping?.shippingTypeId === 2">
          取貨門市：
          <div>{{ checkout.storeName || '未選擇' }}</div>
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
          訂單總金額：{{ productTotal }} 元
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
import { useOrderStore } from '@/stores/order'

const checkout = useCheckoutStore()
const orderStore = useOrderStore()

const couponOptions = ref([])
const shippingOptions = ref([])

const products = ref([])
const productImages = ref([])
const cartItems = ref([])

const productTotal = computed(() =>
  detailedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

// 彙整顯示的商品資訊（合併 product、image、cart）
const detailedItems = computed(() => {
  return cartItems.value.map(cart => {
    const product = products.value.find(p => p.productsId === cart.productsId) || {}
    const image = productImages.value.find(img => img.productId === cart.productsId && img.isMain === 1)

    return {
      itemId: cart.itemId,
      name: product.name || '未命名',
      price: cart.unitprice,
      quantity: cart.quantity,
      image: image?.imageUrl || 'default.jpg'
    }
  })
})

const selectedCoupon = computed(() =>
  couponOptions.value.find(c => c.couponId === checkout.couponId)
)
const selectedShipping = computed(() =>
  shippingOptions.value.find(s => s.shippingId === checkout.shippingId)
)

onMounted(async () => {
  try {
    const [couponRes, shippingRes, productRes, imageRes, cartRes] = await Promise.all([
      axios.get('https://localhost:7017/api/Coupons'),
      axios.get('https://localhost:7017/api/Shippings'),
      axios.get('https://localhost:7017/api/Products'),
      axios.get('https://localhost:7017/api/ProductImages'),
      axios.get('https://localhost:7017/api/ShoppingCartItems')
    ])
    couponOptions.value = couponRes.data
    shippingOptions.value = shippingRes.data
    products.value = productRes.data
    productImages.value = imageRes.data
    cartItems.value = cartRes.data.filter(c => c.cartId === checkout.cartId) // ✅ 根據購物車 ID 過濾

    checkout.productTotal = productTotal.value
  } catch (err) {
    console.error('❌ 載入訂單資料失敗:', err)
  }
})
</script>
