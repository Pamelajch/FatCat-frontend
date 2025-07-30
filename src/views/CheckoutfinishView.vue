<script setup>
import { onMounted, ref,computed  } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

import OrderSummary from '@/components/OrderSummary.vue'
import OrderItemList from '@/components/OrderItemList.vue'

const cartStore = useCartStore()
const orderStore = useOrderStore()
const router = useRouter()
const route = useRoute()

const orderId = computed(() => Number(route.query.orderId)) // ⬅️ 要用 query 而不是 params

onMounted(async () => {
  orderId.value = route.query.orderId
  if (!orderId.value) return

  try {
    const res = await axios.get('/api/OrderDetails', {
      params: { orderId: orderId.value }
    })
    orderStore.latestOrderItems.value = res.data
  } catch (error) {
    console.error('❌ 抓取訂單明細失敗:', error)
  }
})

const goToMyOrders = () => {
  cartStore.clearCart()
  router.push('/myorders')
}
</script>

<template>
  <div class="page-content-wrapper pt-5 pb-5">
    <div class="container mb-2">
      <h2>結帳完成</h2>

      <div class="accordion col-lg-10 container mb-5" id="accordionPanelsStayOpenExample">
        <div class="accordion-item">
          <h2 class="accordion-header" id="panelsStayOpen-headingOne">
            <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseOne"
              aria-expanded="true"
              aria-controls="panelsStayOpen-collapseOne"
            >
              <h3>商品列表</h3>
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseOne"
            class="accordion-collapse collapse show"
            aria-labelledby="panelsStayOpen-headingOne"
          >
            <div class="accordion-body">
              <OrderItemList :order-id="Number(orderId)" />
            </div>
          </div>
        </div>
      </div>

      <OrderSummary />

      <button type="button" class="btn custom-purple-btn float-end" @click="goToMyOrders">
        我的訂單
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-purple-btn {
  background-color: #92559c;
  border-color: #92559c;
  color: white;
}
.custom-purple-btn:hover {
  background-color: #7b4583;
  border-color: #7b4583;
}
</style>
