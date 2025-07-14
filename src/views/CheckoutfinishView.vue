<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import CartItemList from '@/components/CartItemList.vue'
import OrderSummary from '@/components/OrderSummary.vue' // ⬅️ 加入整合後的元件

const cartStore = useCartStore()
const orderStore = useOrderStore()

onMounted(() => {
  if (cartStore.items.length > 0) {
    orderStore.setOrderItems(cartStore.items)
    cartStore.clearCart()
  }
})
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
              <CartItemList :items="orderStore.latestOrderItems" />
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ 整合後的個人/送貨/付款資訊元件 -->
      <OrderSummary />

      <router-link to="/myorders">
        <button type="button" class="btn custom-purple-btn float-end">我的訂單</button>
      </router-link>
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
