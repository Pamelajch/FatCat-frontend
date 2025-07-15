<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { watch } from 'vue'

const router = useRouter()

// 前往產品詳情
const goToProductDetail = (id) => {
  router.push({ name: 'product', query: { id } })
}

// 食材與分類資料
const products = ref([])       // 所有商品
const bowl = ref([])           // 使用者拖進碗裡的商品
const categories = ref([])     // 商品種類
const sorts = ref([])          // 商品小分類

// 使用者選擇的篩選條件
const selectedCategory = ref('')
const selectedSort = ref('')
const minPrice = ref('')
const maxPrice = ref('')

// 取得分類、小分類
const fetchFilterOptions = async () => {
  try {
    const catRes = await fetch('https://localhost:7017/api/ProductCategories')
    categories.value = await catRes.json()

    const sortRes = await fetch('https://localhost:7017/api/Sorts')
    sorts.value = await sortRes.json()
  } catch (error) {
    console.error('無法取得篩選資料:', error)
  }
}

const filteredSorts = computed(() => {
  if (!selectedCategory.value) {
    return sorts.value // 沒選分類，顯示全部小分類
  }
  return sorts.value.filter(s => s.categoryId === parseInt(selectedCategory.value))
})

watch(selectedCategory, () => {
  selectedSort.value = ''  // 主分類變動時，清空小分類選項
})

// 預設載入全部商品（透過 filter API）
const fetchProducts = async () => {
  try {
    const res = await fetch('https://localhost:7017/api/Products/filter')
    const data = await res.json()
    // 這裡加上圖片路徑補全
    products.value = data.map(p => ({
      ...p,
      imageUrl: `/ProductImages/${p.imageUrl}`
    }))
  } catch (error) {
    console.error('無法取得商品資料:', error)
  }
}

// 套用使用者篩選條件
const applyFilters = async () => {
  try {
    const query = new URLSearchParams()
    if (selectedCategory.value) query.append('categoryId', selectedCategory.value)
    if (selectedSort.value) query.append('sortId', selectedSort.value)
    if (minPrice.value !== '') query.append('minPrice', minPrice.value)
    if (maxPrice.value !== '') query.append('maxPrice', maxPrice.value)

    const res = await fetch(`https://localhost:7017/api/Products/filter?${query.toString()}`)
    const data = await res.json()
    // 一樣補上圖片路徑
    products.value = data.map(p => ({
      ...p,
      imageUrl: `/ProductImages/${p.imageUrl}`
    }))
  } catch (error) {
    console.error('篩選商品失敗:', error)
  }
}

// 頁面載入時執行
onMounted(() => {
  fetchFilterOptions()
  fetchProducts()
})

// 拖曳邏輯：開始拖曳
const onDragStart = (product, from = 'list') => {
  event.dataTransfer.setData('product-id', product.productsId)
  event.dataTransfer.setData('from', from)
}

const showBubbles = ref(false)

const onDrop = (event) => {
  const id = parseInt(event.dataTransfer.getData('product-id'))
  const product = products.value.find(p => p.productsId === id)
  if (product && !bowl.value.some(i => i.productsId === id)) {
    bowl.value.push(product)

    // 觸發泡泡動畫
    showBubbles.value = true
    setTimeout(() => {
      showBubbles.value = false
    }, 800) // 泡泡動畫持續 0.8 秒
  }
}

// 拖回食材清單
const onDropToList = (event) => {
  const id = parseInt(event.dataTransfer.getData('product-id'))
  const from = event.dataTransfer.getData('from')

  if (from === 'bowl') {
    const index = bowl.value.findIndex(p => p.productsId === id)
    if (index !== -1) {
      bowl.value.splice(index, 1)
    }
  }
}
</script>

<template>
  <div class="page-wrapper">
  <div class="blur-overlay"></div> <!-- 全頁毛玻璃層 -->
  <div class="container">
    <!-- 篩選區 -->
<div class="filter-box">
  <div class="filter-group">
    <label>商品種類</label>
    <select v-model="selectedCategory">
      <option value="">全部</option>
      <option v-for="cat in categories" :key="cat.productCategoriesId" :value="cat.productCategoriesId">
        {{ cat.name }}
      </option>
    </select>
  </div>

  <div class="filter-group">
    <label>商品小分類</label>
    <select v-model="selectedSort">
      <option value="">全部</option>
      <option v-for="sort in filteredSorts" :key="sort.sortId" :value="sort.sortId">
        {{ sort.name }}
      </option>
    </select>
  </div>

  <div class="filter-group">
    <label>價格區間</label>
    <div class="price-range">
      <input type="number" v-model.number="minPrice" placeholder="最低價格" />
      <span>～</span>
      <input type="number" v-model.number="maxPrice" placeholder="最高價格" />
    </div>
  </div>

  <button class="filter-button" @click="applyFilters">套用篩選</button>
</div>
    <!-- 食材清單 -->
    <div class="product-list" @dragover.prevent @drop="onDropToList">
      <div
  v-for="product in products"
  :key="product.productsId"
  class="product"
  draggable="true"
  @dragstart="onDragStart(product, 'list')"
  @dblclick="goToProductDetail(product.productsId)"
>
  <img :src="product.imageUrl" />
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
      <div v-if="showBubbles" class="bubble-effect"></div> <!-- 泡泡動畫 -->
    </div>
    <button @click="bowl = []" class="clear-button">清空碗</button>
    <RouterLink :to="{name:'specialnoodle'}"><button class="clear-button">查看特殊款泡麵 ➜</button></RouterLink>
  <div>
    <!-- 給梓瑋的放加入購物車按鈕連結的地方 -->
  </div>
  <div>
    <!-- 給如謙的放加入購物車按鈕連結的地方 -->
  </div>
  </div>
  </div>
</template>


<style scoped>
.page-wrapper {
  position: relative;
  min-height: 100vh;
  background-image: url('/catnightcar.png');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.1); /* 微透明白，讓毛玻璃更柔和 */
  z-index: 0;
}

.container {
  position: relative;
  z-index: 1; /* 確保在毛玻璃上層 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  padding-bottom: 60px;
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
  transition: all 0.2s ease-in-out;
}

.product:active {
  cursor: grabbing;
  transform: scale(1.05);
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

.filter-box {
  background-color: #fff5e1;
  border: 2px solid #fcd38a;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.filter-group label {
  font-weight: bold;
  color: #ff8c42;
  margin-bottom: 6px;
}

.filter-group select,
.price-range input {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ffd280;
  min-width: 140px;
  background-color: #fff;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-button {
  background-color: #ffa94d;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.filter-button:hover {
  background-color: #ff922b;
}

.bubble-effect {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  background-image: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.4) 0%, transparent 30%),
                    radial-gradient(circle at 60% 60%, rgba(255,255,255,0.3) 0%, transparent 25%),
                    radial-gradient(circle at 50% 80%, rgba(255,255,255,0.5) 0%, transparent 35%);
  background-repeat: no-repeat;
  animation: bubble-float 0.8s ease-out forwards;
  border-radius: 50%;
}

@keyframes bubble-float {
  0% {
    opacity: 1;
    transform: translateY(0) scale(0.8);
  }
  100% {
    opacity: 0;
    transform: translateY(-80px) scale(1.5);
  }
}
</style>
