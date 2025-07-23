<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OrderItemList from '@/components/OrderItemList.vue'
import OrderDetail from '@/components/OrderDetail.vue'
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()
// 建議加載資料前先檢查是否為空，必要時使用 await fetch
const route = useRoute()
const router = useRouter()
const orderId = route.params.id

const order = ref(null)
const orderItems = ref([])

const fetchOrderDetail = async () => {
  try {
    const [orderRes, itemsRes] = await Promise.all([
      fetch(`https://localhost:7017/api/Orders/${orderId}`).then(res => res.json()),
      fetch(`https://localhost:7017/api/OrderDetails/${orderId}`).then(res => res.json())
    ])
    order.value = orderRes
    orderItems.value = itemsRes
  } catch (err) {
    console.error('無法載入訂單詳情', err)
  }
}

const props = defineProps({
  order: Object
})

onMounted(fetchOrderDetail)
</script>

<template>
  <div class="page-content-wrapper pt-5 pb-5">
    <div class="container mb-2">
      <h2>訂單明細</h2>
      <div class="accordion col-lg-10 container mb-5" id="accordionPanelsStayOpenExample">
        <div class="accordion-item">
          <h2 class="accordion-header" id="panelsStayOpen-headingOne">
            <button class="accordion-button" type="button" data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true"
              aria-controls="panelsStayOpen-collapseOne">
              <h3>商品列表</h3>
            </button>
          </h2>
          <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show"
            aria-labelledby="panelsStayOpen-headingOne">
            <div class="accordion-body">
              <!-- 訂單商品列表 -->
              <OrderItemList :items="orderItems" :order-id="orderId" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <OrderDetail :order="order" />
      
      <div class="mt-4">
        <button type="button" class="btn custom-purple-btn float-end">聯絡我們</button>
        <button type="button" class="btn btn-danger float-end btn-space">取消訂單</button>
        <router-link to="/myorders">
          <button type="button" class="btn custom-purple-outline-btn float-end btn-space">返回我的訂單</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.custom-purple-btn {
  background-color: #92559c;
  border-color: #92559c;
  color: white;
}

.custom-purple-btn:hover {
  background-color: #7b4583;
  border-color: #7b4583;
}

.custom-purple-outline-btn {
  background-color: transparent;
  border: 2px solid #92559c;
  color: #92559c;
  transition: all 0.3s ease;
}

.custom-purple-outline-btn:hover {
  background-color: #92559c;
  color: white;
  border-color: #92559c;
}

.btn-space {
  margin-right: 10px;
}
</style>