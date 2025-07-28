<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useCheckoutStore } from '@/stores/checkout'
import { useOrderStore } from '@/stores/order'
import { useRoute } from 'vue-router' // ⬅️ 加入這行
// 假設這裡你有 orderId ，可能從路由或其他方式取得
const route = useRoute()

const props = defineProps({
  orderId: {
    type: Number,
    required: true
  }
})

const currentOrderId = props.orderId

const checkout = useCheckoutStore()
const orderStore = useOrderStore()
const order = ref(null)
const orderDetails = ref([])
const couponOptions = ref([])
const shippingOptions = ref([])
const cartItems = ref([])
const products = ref([])
const productImages = ref([])

const matchedShipping = computed(() =>
  shippingOptions.value.find(s => s.shippingId === order.value?.shippingId)
)

const matchedCoupon = computed(() =>
  couponOptions.value.find(c => c.couponId === order.value?.couponId)
)



// 計算折扣金額（totalAmount - payableAmount）
const discountAmount = computed(() => {
  if (!order.value) return 0
  return (order.value.totalAmount || 0) - (order.value.payableAmount || 0)
}) 

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

const productTotal = computed(() =>
  detailedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const selectedCoupon = computed(() =>
  couponOptions.value.find(c => c.couponId === checkout.couponId)
)
const selectedShipping = computed(() =>
  shippingOptions.value.find(s => s.shippingId === checkout.shippingId)
)

onMounted(async () => {
  try {
    const [couponRes, shippingRes, productRes, imageRes, ordersRes] = await Promise.all([
      axios.get('https://localhost:7017/api/Coupons'),
      axios.get('https://localhost:7017/api/Shippings'),
      axios.get('https://localhost:7017/api/Products'),
      axios.get('https://localhost:7017/api/ProductImages'),
      axios.get('https://localhost:7017/api/Orders'),
    ])

    couponOptions.value = couponRes.data
    shippingOptions.value = shippingRes.data
    products.value = productRes.data
    productImages.value = imageRes.data

    // 找出該筆訂單資料
    order.value = ordersRes.data.find(o => o.orderId === currentOrderId)

    if (!order.value) {
      console.warn(`找不到 orderId=${currentOrderId} 的訂單`)
      return
    }

    // 用 orderId 取得購物車項目
    const cartRes = await axios.get(`https://localhost:7017/api/ShoppingCartItems?orderId=${order.value.orderId}`)
    cartItems.value = cartRes.data

    // 取得該訂單的訂單明細
    const orderDetailsRes = await axios.get(
      `https://localhost:7017/api/OrderDetails?orderId=${order.value.orderId}`
    )
    orderDetails.value = orderDetailsRes.data

    checkout.productTotal = productTotal.value

  } catch (err) {
    console.error('❌ 載入訂單資料失敗:', err)
  }
})
</script>

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
          <div>{{ matchedShipping?.name || '未選擇' }}</div>
        </li>
        <li class="list-group-item" v-if="matchedShipping?.shippingTypeId === 1">
          收件地址：
          <div>{{ checkout.recipientAddress || '未填寫' }}</div>
        </li>
        <li class="list-group-item" v-else-if="matchedShipping?.shippingTypeId === 2">
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
          <div>{{ matchedCoupon?.description || '未使用' }}</div>
        </li>
        <li class="list-group-item">
          訂單總金額：{{ order?.totalAmount ?? '—' }} 元
          <div>
            運費：{{ matchedShipping?.shippingFee ?? '—' }} 元<br />
            折扣金額：{{ discountAmount }} 元
            <hr />
            實付金額：<strong>{{ order?.payableAmount ?? '—' }} 元</strong>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
