<!-- src/components/GuessULikeSection.vue -->
<script setup>
import { ref } from 'vue'

const products = ref([
  {
    id: 101,
    name: '社畜最愛宵夜麵',
    imageUrl: '/fakenoodle.jpg',
    tag: '強檔'
  },
  {
    id: 102,
    name: '小女友泡麵套餐',
    imageUrl: '/fakenoodle.jpg',
    tag: '推薦'
  },
  {
    id: 103,
    name: '16塊腹肌指定口味',
    imageUrl: '/fakenoodle.jpg',
    tag: '人氣'
  }
])
</script>

<template>
  <ul class="list-group mb-3">
    <li class="list-group-item">
      <h3>猜你喜歡</h3>
    </li>
    <li class="list-group-item d-flex gap-2">
      <div class="product-grid">
        <RouterLink
          v-for="product in products"
          :key="product.id"
          :to="{ name: 'onespecialnoodle', query: { id: product.id } }"
          class="product-card"
        >
          <img :src="product.imageUrl" :alt="product.name" class="product-image" />
          <div class="product-info">
            <span class="product-tag">{{ product.tag }}</span>
            <h3 class="product-name">{{ product.name }}</h3>
          </div>
        </RouterLink>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.product-grid {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  flex-wrap: nowrap;
}
.product-card {
  flex: 1 1 30%;
  max-width: 30%;
  display: block;
  text-decoration: none;
  background-color: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}
.product-card:hover {
  transform: translateY(-5px);
}
.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  margin-top: 10px;
}
.product-info {
  padding: 1rem;
  text-align: center;
}
.product-tag {
  display: inline-block;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  background-color: #ff8c00;
  color: white;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}
.product-name {
  font-size: 1.1rem;
  color: #4a2e6e;
  font-weight: bold;
}
</style>
