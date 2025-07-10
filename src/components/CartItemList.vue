<script setup>
import { useCartStore } from '@/stores/cart'
import { computed } from 'vue'
const props = defineProps({
  items: Array
})

const cartStore = useCartStore()
const showItems = computed(() => props.items || cartStore.items)
const showTotal = computed(() =>
  showItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)
</script>

<template>
  <div v-if="showItems.length">
    <div class="list-group mb-3">
      <div
        class="list-group-item d-flex align-items-center gap-3"
        v-for="item in showItems"
        :key="item.id"
      >
        <img :src="item.image" alt="商品圖" style="width: 60px; height: 60px; object-fit: cover;" />
        <div class="flex-grow-1">
          <h6 class="mb-1">{{ item.name }}</h6>
          <div>單價：${{ item.price }}</div>
          <div>數量：{{ item.quantity }}</div>
          <div class="text-muted">小計：${{ item.price * item.quantity }}</div>
        </div>
      </div>
    </div>

    <div class="text-end fw-bold fs-5">
      總金額：<span class="text-danger">${{ showTotal }}</span>
    </div>
  </div>
  <div v-else class="text-center text-muted">沒有商品資料</div>
</template>
