<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import PostReviewForm from './PostReviewForm.vue'

const props = defineProps({
  items: Array,
  isCompleted: Boolean,
  orderId: Number
})

const cartStore = useCartStore()

// ✅ 優先使用 props.items，如果沒有就用購物車內的資料
const showItems = computed(() => {
  const rawItems = props.items || cartStore.items
  return rawItems.map(item => ({
    ...item,
    subtotal: item.price * item.quantity
  }))
})


// 🔄 狀態與事件
const loading = ref(false)
const error = ref(null)
const showReviewForm = ref(false)
const selectedItem = ref(null)

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
  // ✅ 可以根據需要將 item 標記為 hasBeenReviewed = true
  if (selectedItem.value) {
    selectedItem.value.hasBeenReviewed = true
  }
}

// ✅ 計算總金額
const total = computed(() => {
  return showItems.value.reduce((sum, item) => {
    const subtotal = item.subtotal || (item.price * item.quantity)
    return sum + subtotal
  }, 0).toFixed(2)
})
</script>

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