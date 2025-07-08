<script setup>
    import { ref, onMounted } from 'vue'

const products = ref([])  // 所有可拖曳商品（泡麵食材）
const bowl = ref([])      // 使用者拖進碗裡的食材

// 取得產品資料（從你提供的 API）
const fetchProducts = async () => {
  try {
    const res = await fetch('https://localhost:7017/api/Products/withImage')
    const data = await res.json()
    products.value = data
  } catch (error) {
    console.error('無法取得產品資料:', error)
  }
}

// 頁面載入時就抓一次
onMounted(() => {
  fetchProducts()
})

// 拖曳開始
const onDragStart = (product) => {
  event.dataTransfer.setData('product-id', product.productsId)
}

// 放進碗裡
const onDrop = (event) => {
  const id = parseInt(event.dataTransfer.getData('product-id'))
  const product = products.value.find(p => p.productsId === id)
  if (product && !bowl.value.some(i => i.productsId === id)) {
    bowl.value.push(product)
  }
}
</script>

<template>
  <div class="container">
    <!-- 食材清單 -->
    <div class="product-list">
      <div
        v-for="product in products"
        :key="product.productsId"
        class="product"
        draggable="true"
        @dragstart="onDragStart(product)"
      >
        <img :src="product.imageUrl" alt="product image" />
        <p>{{ product.name }}</p>
      </div>
    </div>

    <!-- 拖曳進來的碗 -->
    <div class="bowl" @dragover.prevent @drop="onDrop">
      <h3>🍜 你的泡麵碗</h3>
      <ul>
        <li v-for="item in bowl" :key="item.productsId">
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>


<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.product {
  width: 100px;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 8px;
  text-align: center;
  background-color: #fff6fa;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  cursor: grab;
}

.product img {
  width: 60px;
  height: 60px;
}

.bowl {
  width: 80%;
  min-height: 120px;
  padding: 16px;
  background-color: #ffe9d8;
  border: 2px dashed #f79c6a;
  border-radius: 20px;
  text-align: center;
}
</style>
