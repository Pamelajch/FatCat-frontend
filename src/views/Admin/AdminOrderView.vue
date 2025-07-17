<script setup>
import { ref, onMounted } from 'vue'
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

  } catch (err) {
    console.error('資料載入錯誤:', err)
  }
}

// ✅ 顯示 OrderStatus.description
const getOrderStatusDesc = (id) =>
  orderStatuses.value.find(item => item.orderStatusId === id)?.description || '未知'

// ✅ 顯示 Shipping.name
const getShippingName = (id) =>
  shippings.value.find(item => item.shippingId === id)?.name || '未知'

// ✅ 顯示 ShippingStatus.description
const getShippingStatusDesc = (id) =>
  shippingStatuses.value.find(item => item.shippingStatusId === id)?.description || '未知'

onMounted(fetchAllData)
</script>

<template>
  <div class="container">
    <h2>訂單管理</h2>

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
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.orderId">
          <td>{{ order.orderId }}</td>
          <td>{{ order.userId }}</td>
          <td>{{ new Date(order.orderdate).toLocaleString() }}</td>
          <td>{{ order.payableAmount }}</td>
          <td>{{ getOrderStatusDesc(order.orderStatusId) }}</td>
          <td>{{ getShippingName(order.shippingId) }}</td>
          <td>{{ getShippingStatusDesc(order.shippingStatusId) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}
</style>
