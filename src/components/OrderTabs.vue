<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const orders = ref([])
const statuses = ref([])

// 目前的 tab 狀態 ID（預設是 1：訂單成立）
const selectedStatus = ref(1)

// 當前登入會員的 userId
const userId = computed(() => authStore.user?.userId)

// 載入所有訂單與訂單狀態
const fetchData = async () => {
  try {
    const [ordersRes, statusesRes] = await Promise.all([
      axios.get('https://localhost:7017/api/Orders'),
      axios.get('https://localhost:7017/api/OrderStatus')
    ])
    orders.value = ordersRes.data
    statuses.value = statusesRes.data
  } catch (error) {
    console.error('載入訂單資料失敗', error)
  }
}

// 過濾目前使用者的訂單
const userOrders = computed(() =>
  orders.value.filter(order => order.userId === userId.value)
)

// 再過濾目前狀態的訂單
const filteredOrders = computed(() =>
  userOrders.value.filter(order => order.orderStatusId === selectedStatus.value)
)

// 將狀態 ID 轉換成描述
const getStatusText = (statusId) => {
  const status = statuses.value.find(s => s.orderStatusId === statusId)
  return status?.description || '未知狀態'
}

// 找出「已完成」狀態的 ID
const completedStatusId = computed(() => {
  const status = statuses.value.find(s => s.description === '已完成')
  return status?.orderStatusId || null
})

// 預留未來實作的申訴處理函式
const handleAppeal = (order) => {
  console.log('申訴功能待實作，訂單 ID:', order.orderId)
}

onMounted(fetchData)
</script>

<template>
  <div class="container mt-4">
    <!-- 若尚未登入 -->
    <div v-if="!authStore.isAuthenticated">
      <p class="text-danger">請先登入以查看您的訂單。</p>
    </div>

    <!-- Tabs -->
    <div v-else>
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item" v-for="status in statuses" :key="status.orderStatusId">
          <a
            href="#"
            class="nav-link"
            :class="{ active: selectedStatus === status.orderStatusId }"
            @click.prevent="selectedStatus = status.orderStatusId"
          >
            {{ status.description }}
          </a>
        </li>
      </ul>

      <!-- 訂單列表 -->
      <div v-if="filteredOrders.length">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>訂單編號</th>
              <th>日期</th>
              <th>總金額</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.orderId">
              <td>{{ order.orderId }}</td>
              <td>{{ new Date(order.orderdate).toLocaleDateString() }}</td>
              <td>NT${{ order.payableAmount }}</td>
              <td>{{ getStatusText(order.orderStatusId) }}</td>
              <td>
                <router-link
                  :to="`/orderdetail/${order.orderId}`"
                  class="btn btn-outline-primary btn-sm me-2"
                >
                  查看明細
                </router-link>

                <!-- 顯示申訴按鈕 -->
                <button
                  v-if="order.orderStatusId === 3"
                  class="btn btn-outline-danger btn-sm"
                  @click="handleAppeal(order)"
                >
                  申訴
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else>
        <p>目前無此狀態的訂單。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-link.active {
  font-weight: bold;
}
</style>
