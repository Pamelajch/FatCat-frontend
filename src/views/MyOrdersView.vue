<script setup>
import { ref } from 'vue'
import OrderTab from '@/components/OrderTab.vue'

// 模擬訂單資料
const sampleOrders = [
  { id: 1, orderNumber: 'ORD001', status: '未處理', amount: '$1,200' },
  { id: 2, orderNumber: 'ORD002', status: '未處理', amount: '$980' }
]

const finishedOrders = [
  { id: 3, orderNumber: 'ORD003', status: '已完成', amount: '$1,500' }
]

const selectedTab = ref(0)

const tabs = [
  { id: 'pills-1', label: '未處理', orders: sampleOrders, showReview: false },
  { id: 'pills-2', label: '處理中', orders: [], showReview: false },
  { id: 'pills-3', label: '已完成', orders: finishedOrders, showReview: true },
  { id: 'pills-4', label: '退貨', orders: [], showReview: false },
  { id: 'pills-5', label: '已取消', orders: [], showReview: false }
]
</script>

<template>
  <div class="page-content-wrapper pt-5 pb-5">
    <div class="container mb-2">
      <h2>我的訂單</h2>

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
.btn-space {
  margin-right: 10px;
}
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
