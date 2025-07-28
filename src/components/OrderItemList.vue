<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'; // by rr
import 'sweetalert2/dist/sweetalert2.min.css'; // by rr
import PostReviewForm from '@/components/PostReviewForm.vue' // by rr
import api from '@/services/jjapi.js'; //by rr

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

// rr新增：控制評論表單的顯示狀態
const showReviewForm = ref(false)
const selectedItem = ref(null)

// ✅ 判斷是否為已完成狀態（orderStatusId === 3）
const isCompleted = computed(() => props.orderStatusId === 3)
console.log('orderStatusId:', props.orderStatusId)
// ✅ 計算總金額
const total = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.unitprice * item.quantity, 0)
)

// rr 修改後的評價按鈕點擊處理
function handleReviewClick(item) {  
  // 設定選中的商品和顯示評論表單
  selectedItem.value = item
  showReviewForm.value = true
}

// 處理評論提交成功的回調
function handleReviewSubmitted() {
  if (selectedItem.value) {
    const reviewedItem = orderItems.value.find(
      item => item.productId === selectedItem.value.productId
    );
    if (reviewedItem) {
      reviewedItem.hasBeenReviewed = true;
    }
  }
  showReviewForm.value = false
  selectedItem.value = null
  
  Swal.fire({
    icon: 'success',
    title: '評論提交成功！',
    text: '感謝您的評論',
    timer: 2000,
    showConfirmButton: false
  })
}

// 關閉評論表單
function closeReviewForm() {
  showReviewForm.value = false
  selectedItem.value = null
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
        image: mainImage ? `https://localhost:7017/ProductImages/${mainImage.imageUrl}` : 'https://localhost:7017/ProductImages/default.jpg',
        productId: product?.productsId, // rr新增：評論表單需要的 productId
        hasBeenReviewed: false // rr新增 預設都是「未評價」
      }
    })
    const reviewedResponse = await api.get(`/reviews/by-user/reviewed-products`);//by rr
    const reviewedProductIds = reviewedResponse.data; // 得到陣列

    // 遍歷訂單項目，只要商品的 productId 在上面那個列表裡，就標記為「已評價」
    merged.forEach(item => {
      if (reviewedProductIds.includes(item.productId)) {
        item.hasBeenReviewed = true;
      }
    });

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

        <!-- ✅ 僅在已完成狀態時顯示評價按鈕 RRRRRRRRRRRRRRRR-->
        <template v-if="isCompleted">
        <button 
          v-if="item.hasBeenReviewed" 
          class="btn btn-secondary btn-sm" 
          disabled
        >
          已評價
        </button>
        
        <button 
          v-else 
          class="btn btn-outline-primary btn-sm" 
          @click="handleReviewClick(item)"
        >
          評價
        </button>
      </template>
      </div>
    </div>

    <!-- ✅ 顯示總金額 -->
    <div class="text-end fw-bold fs-5">
      總金額：<span class="text-danger">${{ total }}</span>
    </div>
  
    <!-- 評論表單 Modal -->
    <div 
      v-if="showReviewForm && selectedItem" 
      class="modal fade show" 
      style="display: block; background-color: rgba(0,0,0,0.5);"
      @click.self="closeReviewForm"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">對「{{ selectedItem.name }}」發表評論</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeReviewForm"
            ></button>
          </div>
          <div class="modal-body">
            <PostReviewForm
              :product-id="selectedItem.productId"
              :order-id="orderId"
              @review-submitted="handleReviewSubmitted"
            />
          </div>
        </div>
      </div>
    </div>
  </div>


</template>


<style scoped>
.modal {
  z-index: 1050;
}
</style>