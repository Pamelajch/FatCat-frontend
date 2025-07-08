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
    <button @click="bowl = []" class="clear-button">清空碗</button>
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

    <!-- 拖曳進來的碗（用 pot.jpg 當背景）-->
    <div class="bowl" @dragover.prevent @drop="onDrop">
      <div class="bowl-items">
        <img
        v-for="item in bowl"
        :key="item.productsId"
        :src="item.imageUrl"
        :alt="item.name"
        class="bowl-img"
        />
      </div>
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
  width: 800px;
  height: 800px;
  background-image: url('/pot.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;  /* 讓子元素可以絕對定位 */
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
}

.bowl-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
  position: absolute; /* 疊在碗圖上 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.bowl-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.clear-button {
  margin-top: 12px;
  background-color: #f79c6a;
  border: none;
  padding: 6px 12px;
  border-radius: 10px;
  color: white;
  cursor: pointer;
}

.clear-button:hover {
  background-color: #ffad7f;
}
</style>
