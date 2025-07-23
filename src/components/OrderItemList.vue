<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  orderId: {
    type: Number,
    required: true
  }
})

const orderId = 2 // 使用傳入的 orderId

const loading = ref(true)
const error = ref(null)

const orderItems = ref([])

const total = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.unitprice * item.quantity, 0)
)

// 評價按鈕點擊事件的預留函式
function handleReviewClick(item) {
  // 這裡可擴充為開啟評價表單、跳轉評價頁面等
  console.log('點擊評價按鈕，商品：', item.name)
  // TODO: 未來實作評價功能
}

onMounted(async () => {
  try {
    // 並行請求
    const [orderDetailRes, cartItemRes, productRes, imageRes] = await Promise.all([
      axios.get('https://localhost:7017/api/OrderDetails'),
      axios.get('https://localhost:7017/api/ShoppingCartItems'),
      axios.get('https://localhost:7017/api/Products'),
      axios.get('https://localhost:7017/api/ProductImages')
    ])

    const orderDetails = orderDetailRes.data.filter(od => od.orderId === orderId)
    const cartItems = cartItemRes.data
    const products = productRes.data
    const images = imageRes.data

    const merged = orderDetails.map(od => {
      const cartItem = cartItems.find(ci => ci.itemId === od.itemId)
      const product = products.find(p => p.productsId === cartItem?.productsId)

      // 取商品主圖，若找不到則用預設圖
      const mainImage = images.find(img => img.productId === product?.productsId && img.isMain === 1)

      return {
        name: product?.name || '未知商品',
        unitprice: cartItem?.unitprice || 0,
        quantity: cartItem?.quantity || 0,
        subtotal: (cartItem?.unitprice || 0) * (cartItem?.quantity || 0),
        image: mainImage ? `/images/products/${mainImage.imageUrl}` : '/images/products/default.jpg'
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
        <!-- 評價按鈕 -->
        <button 
          class="btn btn-outline-primary btn-sm"
          @click="handleReviewClick(item)"
        >
          評價
        </button>
      </div>
    </div>

    <!-- 總金額 -->
    <div class="text-end fw-bold fs-5">
      總金額：<span class="text-danger">${{ total }}</span>
    </div>
  </div>
</template>
