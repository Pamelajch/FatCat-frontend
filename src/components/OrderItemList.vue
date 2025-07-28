<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'
import PostReviewForm from './PostReviewForm.vue'

const props = defineProps({
  items: Array,
  isCompleted: Boolean,
  orderId: Number,
})

const cartStore = useCartStore()
const showItems = ref([])
const loading = ref(false)
const error = ref(null)
const showReviewForm = ref(false)
const selectedItem = ref(null)
const isCompleted = ref(false)

onMounted(async () => {
  // 如果有傳入 items 就直接用，不用重抓
  if (props.items && props.items.length > 0) {
    showItems.value = props.items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }))
    return
  }

  try {
    loading.value = true

    // 先查訂單狀態判斷是否完成
    const orderRes = await axios.get(`/api/Orders/${props.orderId}`)
    const statusName = orderRes.data.orderStatus?.name
    isCompleted.value =
      orderRes.data.orderStatusId === 3 ||
      statusName === '已完成（收貨成功）'

    // 平行取得訂單明細、購物車、商品與圖片
    const [orderDetailsRes, cartRes, productRes, imageRes] = await Promise.all([
      axios.get('/api/OrderDetails', { params: { orderId: props.orderId } }),
      axios.get('/api/ShoppingCartItems'),
      axios.get('/api/Products'),
      axios.get('/api/ProductImages')
    ])

    const orderDetails = orderDetailsRes.data
    const cartItems = cartRes.data
    const products = productRes.data
    const productImages = imageRes.data

    // 對每筆訂單明細組合商品資料
    showItems.value = orderDetails.map(od => {
      const cartItem = cartItems.find(ci => ci.itemId === od.itemId)
      const product = products.find(p => p.productsId === cartItem?.productsId)

      const mainImage = productImages.find(img =>
        img.productId === product?.productsId && img.isMain === 1
      )

      return {
        productId: product?.productsId || 0,
        name: product?.name || od.productName,
        image: mainImage?.imageUrl ? `/ProductImages/${mainImage.imageUrl}` : '/ProductImages/default.png',
        price: od.unitprice,
        quantity: od.quantity,
        subtotal: od.unitprice * od.quantity,
        hasBeenReviewed: false
      }
    })
  } catch (err) {
    console.error(err)
    error.value = '載入失敗'
  } finally {
    loading.value = false
  }
})

const handleReviewClick = (item) => {
  selectedItem.value = item
  showReviewForm.value = true
}

const closeReviewForm = () => {
  showReviewForm.value = false
  selectedItem.value = null
}

const handleReviewSubmitted = () => {
  closeReviewForm()
  if (selectedItem.value) {
    selectedItem.value.hasBeenReviewed = true
  }
}

const total = computed(() => {
  return showItems.value.reduce((sum, item) => {
    return sum + (item.subtotal || item.price * item.quantity)
  }, 0).toFixed(2)
})
</script>


<style scoped>
.list-group-item {
  border-radius: 12px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
}
</style>

<template>
  <div v-if="loading">載入中...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>
    <div class="list-group mb-3">
      <div
        class="list-group-item d-flex align-items-center gap-3"
        v-for="(item, index) in showItems"
        :key="index"
      >
        <img
          :src="item.image"
          alt="商品圖"
          style="width: 60px; height: 60px; object-fit: cover;"
        />
        <div class="flex-grow-1">
          <h6 class="mb-1">{{ item.name }}</h6>
          <div>單價：${{ item.price }}</div>
          <div>數量：{{ item.quantity }}</div>
          <div class="text-muted">小計：${{ item.subtotal }}</div>
        </div>

        <!-- ✅ 僅在已完成狀態時顯示評價按鈕 -->
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