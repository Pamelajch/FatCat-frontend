<!-- src/components/OrderTabs.vue -->
<script setup>
import { ref, computed } from 'vue'
import { useOrderStore } from '@/stores/order'
import OrderTab from '@/components/OrderTab.vue'

const orderStore = useOrderStore()
const selectedTab = ref(0)

const tabs = computed(() => [
  {
    id: 'pills-1',
    label: '未處理',
    orders: orderStore.orders.filter(o => o.status === '未處理'),
    showReview: false
  },
  {
    id: 'pills-2',
    label: '處理中',
    orders: orderStore.orders.filter(o => o.status === '處理中'),
    showReview: false
  },
  {
    id: 'pills-3',
    label: '已完成',
    orders: orderStore.orders.filter(o => o.status === '已完成'),
    showReview: true
  },
  {
    id: 'pills-4',
    label: '退貨',
    orders: orderStore.orders.filter(o => o.status === '退貨'),
    showReview: false
  },
  {
    id: 'pills-5',
    label: '已取消',
    orders: orderStore.orders.filter(o => o.status === '已取消'),
    showReview: false
  }
])
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
