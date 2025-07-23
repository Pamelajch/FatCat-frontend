<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  orderId: {
    type: Number,
    required: true
  }
})

const orderId = 2 // 🔁 根據實際傳入的訂單 ID 動態設定

const loading = ref(true)
const error = ref(null)

const orderItems = ref([])

const total = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.unitprice * item.quantity, 0)
)

onMounted(async () => {
  try {
    // 並行請求
    const [orderDetailRes, cartItemRes, productRes] = await Promise.all([
      axios.get('https://localhost:7017/api/OrderDetails'),
      axios.get('https://localhost:7017/api/ShoppingCartItems'),
      axios.get('https://localhost:7017/api/Products'),
      axios.get('https://localhost:7017/api/ProductImages')
    ])

    const orderDetails = orderDetailRes.data.filter(od => od.orderId === orderId)
    const cartItems = cartItemRes.data
    const products = productRes.data

    const merged = orderDetails.map(od => {
      const cartItem = cartItems.find(ci => ci.itemId === od.itemId)
      const product = products.find(p => p.productsId === cartItem?.productsId)

      return {
        name: product?.name || '未知商品',
        unitprice: cartItem?.unitprice || 0,
        quantity: cartItem?.quantity || 0,
        subtotal: (cartItem?.unitprice || 0) * (cartItem?.quantity || 0),
        image: `/images/products/${product?.productsId || 'default'}.jpg`
      }
    })

    orderItems.value = merged
  } catch (err) {
    error.value = '載入失敗：' + err.message
  } finally {
    loading.value = false
  }
})
</script>


<template>
  <div v-if="loading">載入中...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>
    <div class="list-group mb-3">
      <div
        class="list-group-item d-flex align-items-center gap-3"
        v-for="(item, index) in orderItems"
        :key="index"
      >
        <img
          :src="item.image"
          alt="商品圖"
          style="width: 60px; height: 60px; object-fit: cover;"
        />
        <div class="flex-grow-1">
          <h6 class="mb-1">{{ item.name }}</h6>
          <div>單價：${{ item.unitprice }}</div>
          <div>數量：{{ item.quantity }}</div>
          <div class="text-muted">小計：${{ item.subtotal }}</div>
        </div>
      </div>
    </div>

    <!-- ✅ 總金額 -->
    <div class="text-end fw-bold fs-5">
      總金額：<span class="text-danger">${{ total }}</span>
    </div>
  </div>
</template>
