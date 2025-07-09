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
const onDragStart = (product, from = 'list') => {
  event.dataTransfer.setData('product-id', product.productsId)
  event.dataTransfer.setData('from', from)
}

// 放進碗裡
const onDrop = (event) => {
  const id = parseInt(event.dataTransfer.getData('product-id'))
  const product = products.value.find(p => p.productsId === id)
  if (product && !bowl.value.some(i => i.productsId === id)) {
    bowl.value.push(product)
  }
}

const onDropToList = (event) => {
  const id = parseInt(event.dataTransfer.getData('product-id'))
  const from = event.dataTransfer.getData('from')

  // 如果是從 bowl 拖出來的，才需要移除
  if (from === 'bowl') {
    const index = bowl.value.findIndex(p => p.productsId === id)
    if (index !== -1) {
      bowl.value.splice(index, 1)
    }
  }
}
</script>

<template>
  <div class="container">
    <!-- 食材清單 -->
    <div class="product-list" @dragover.prevent @drop="onDropToList">
      <div
        v-for="product in products"
        :key="product.productsId"
        class="product"
        draggable="true"
        @dragstart="onDragStart(product, 'list')"
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
        draggable="true"
        @dragstart="onDragStart(item, 'bowl')"
        />
      </div>
    </div>
    <button @click="bowl = []" class="clear-button">清空碗</button>
  </div>
  <div>
    <!-- 給梓瑋的放加入購物車按鈕連結的地方 -->
  </div>
  <div>
    <!-- 給如謙的放加入購物車按鈕連結的地方 -->
  </div>
</template>


<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 60px; /* 下方空間，避免壓到 footer */
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
  margin-top: 30px;
  background-color: #f79c6a;
  border: none;
  padding: 14px 28px;         /* 加大按鈕內部空間 */
  border-radius: 14px;        /* 邊角更圓潤 */
  color: white;
  cursor: pointer;
  font-size: 20px;            /* 字體變大 */
  font-weight: bold;          /* 更有力道 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* 加點陰影感 */
  transition: all 0.2s ease-in-out;
}

.clear-button:hover {
  background-color: #ffad7f;
  transform: scale(1.05);     /* 滑鼠移上去微微放大 */
}
</style>
