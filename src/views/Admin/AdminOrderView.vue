<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getOrders, 
  getOrderStatuses, 
  getShippings, 
  getShippingStatuses 
} from '@/services/orderService'

const orders = ref([])
const orderStatuses = ref([])
const shippings = ref([])
const shippingStatuses = ref([])
const router = useRouter()

const selectedStatusId = ref(null) // 目前選中的訂單狀態分頁

const goToOrderDetail = (orderId) => {
  router.push(`/order-detail/${orderId}`)
}

const fetchAllData = async () => {
  try {
    const [ordersRes, statusRes, shippingRes, shippingStatusRes] = await Promise.all([
      getOrders(),
      getOrderStatuses(),
      getShippings(),
      getShippingStatuses()
    ])

    orders.value = ordersRes.data
    orderStatuses.value = statusRes.data
    shippings.value = shippingRes.data
    shippingStatuses.value = shippingStatusRes.data

    // 預設第一個訂單狀態分頁
    if(statusRes.data.length > 0) {
      selectedStatusId.value = statusRes.data[0].orderStatusId
    }
  } catch (err) {
    console.error('資料載入錯誤:', err)
  }
}

// 篩選出當前分頁的訂單
const filteredOrders = computed(() => {
  if (selectedStatusId.value === null) return orders.value
  return orders.value.filter(o => o.orderStatusId === selectedStatusId.value)
})

const getOrderStatusDesc = (id) =>
  orderStatuses.value.find(item => item.orderStatusId === id)?.description || '未知'

const getShippingName = (id) =>
  shippings.value.find(item => item.shippingId === id)?.name || '未知'

const getShippingStatusDesc = (id) =>
  shippingStatuses.value.find(item => item.shippingStatusId === id)?.description || '未知'

onMounted(fetchAllData)
</script>

<template>
  <div class="container">
    <h2>訂單管理</h2>

    <!-- 頁籤區塊 -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item" v-for="status in orderStatuses" :key="status.orderStatusId">
        <a 
          href="#" 
          class="nav-link"
          :class="{ active: selectedStatusId === status.orderStatusId }"
          @click.prevent="selectedStatusId = status.orderStatusId"
        >
          {{ status.description }}
        </a>
      </li>
    </ul>

    <table class="table table-bordered">
      <thead>
        <tr>
          <th>訂單編號</th>
          <th>會員ID</th>
          <th>訂單日期</th>
          <th>總金額</th>
          <th>訂單狀態</th>
          <th>運送方式</th>
          <th>運送狀態</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in filteredOrders" :key="order.orderId">
          <td>{{ order.orderId }}</td>
          <td>{{ order.userId }}</td>
          <td>{{ new Date(order.orderdate).toLocaleString() }}</td>
          <td>{{ order.payableAmount }}</td>
          <td>{{ getOrderStatusDesc(order.orderStatusId) }}</td>
          <td>{{ getShippingName(order.shippingId) }}</td>
          <td>{{ getShippingStatusDesc(order.shippingStatusId) }}</td>
          <td>
            <button @click="goToOrderDetail(order.orderId)" class="btn btn-sm btn-primary">明細</button>
          </td>
        </tr>
        <tr v-if="filteredOrders.length === 0">
          <td colspan="8" class="text-center">此狀態無訂單資料</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
