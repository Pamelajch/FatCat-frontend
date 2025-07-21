<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import OrderTab from '@/components/OrderTab.vue'

const selectedTab = ref(0)
const orders = ref([])
const statuses = ref([])

// 取得資料
const fetchData = async () => {
  try {
    const [orderRes, statusRes] = await Promise.all([
      axios.get('/api/Orders'),
      axios.get('/api/OrderStatus')
    ])
    orders.value = orderRes.data
    statuses.value = statusRes.data
  } catch (err) {
    console.error('資料載入失敗:', err)
  }
}

onMounted(fetchData)

// 根據狀態建立 tabs
const tabs = computed(() =>
  statuses.value.map(status => {
    return {
      id: `tab-${status.orderStatusId}`,
      label: status.description,
      orders: orders.value.filter(order => order.orderStatusId === status.orderStatusId),
      showReview: status.orderStatusId === 3 // 已完成才顯示評論功能
    }
  })
)
</script>

<template>
  <div>
    <!-- Tabs -->
    <ul class="nav nav-pills mb-3" role="tablist">
      <li class="nav-item" role="presentation" v-for="(tab, index) in tabs" :key="tab.id">
        <button
          class="nav-link"
          :class="{ active: selectedTab === index }"
          :id="`${tab.id}-tab`"
          data-bs-toggle="pill"
          :data-bs-target="`#${tab.id}`"
          type="button"
          role="tab"
          :aria-controls="tab.id"
          :aria-selected="selectedTab === index"
          @click="selectedTab = index"
        >
          {{ tab.label }}
        </button>
      </li>
    </ul>

    <!-- Content -->
    <div class="tab-content">
      <OrderTab
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :id="tab.id"
        :labelledby="`${tab.id}-tab`"
        :active="selectedTab === index"
        :orders="tab.orders"
        :showReview="tab.showReview"
      />
    </div>
  </div>
</template>

<style scoped>
.nav-pills .nav-link {
  color: #92559c;
  border: 1px solid #92559c;
  background-color: transparent;
  margin-right: 8px;
  transition: all 0.3s ease;
}
.nav-pills .nav-link:hover {
  background-color: #f3e8f7;
  color: #92559c;
}
.nav-pills .nav-link.active {
  background-color: #92559c;
  color: white;
  border-color: #92559c;
}
</style>
