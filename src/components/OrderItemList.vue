<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

// ✅ 傳入 props：orderId 和 orderStatusId
const props = defineProps({
  orderId: {
    type: Number,
    required: true
  },
  orderStatusId: {
    type: Number,
    required: true
  }
})

const loading = ref(true)
const error = ref(null)
const orderItems = ref([])

// ✅ 判斷是否為已完成狀態（orderStatusId === 3）
const isCompleted = computed(() => props.orderStatusId === 3)
console.log('orderStatusId:', props.orderStatusId)
// ✅ 計算總金額
const total = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.unitprice * item.quantity, 0)
)

// ✅ 評價按鈕點擊處理（可擴充功能）
function handleReviewClick(item) {
  console.log('點擊評價按鈕，商品：', item.name)
  // 🟦 TODO: 這裡可實作開啟評價 modal 或跳轉頁面
}

onMounted(async () => {
  try {
    const [orderDetailRes, cartItemRes, productRes, imageRes] = await Promise.all([
      axios.get('https://localhost:7017/api/OrderDetails'),
      axios.get('https://localhost:7017/api/ShoppingCartItems'),
      axios.get('https://localhost:7017/api/Products'),
      axios.get('https://localhost:7017/api/ProductImages')
    ])

    const orderDetails = orderDetailRes.data.filter(
      od => Number(od.orderId) === Number(props.orderId)
    )
    const cartItems = cartItemRes.data
    const products = productRes.data
    const images = imageRes.data

    const merged = orderDetails.map(od => {
      const cartItem = cartItems.find(ci => ci.itemId === od.itemId)
      const product = products.find(p => p.productsId === cartItem?.productsId)
      const mainImage = images.find(
        img => img.productId === product?.productsId && img.isMain === 1
      )

      return {
        name: product?.name || '未知商品',
        unitprice: cartItem?.unitprice || 0,
        quantity: cartItem?.quantity || 0,
        subtotal: (cartItem?.unitprice || 0) * (cartItem?.quantity || 0),
        image: mainImage ? `https://localhost:7017/ProductImages/${mainImage.imageUrl}`
                          : 'https://localhost:7017/ProductImages/default.jpg'
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

        <!-- ✅ 僅在已完成狀態時顯示評價按鈕 -->
        <button
          v-if="isCompleted"
          class="btn btn-outline-primary btn-sm"
          @click="handleReviewClick(item)"
        >
          評價
        </button>
      </div>
    </div>

    <!-- ✅ 顯示總金額 -->
    <div class="text-end fw-bold fs-5">
      總金額：<span class="text-danger">${{ total }}</span>
    </div>
  </div>
</template>
