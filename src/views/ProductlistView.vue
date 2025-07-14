<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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

// 預設載入全部商品（透過 filter API）
const fetchProducts = async () => {
  try {
    const res = await fetch('https://localhost:7017/api/Products/filter')
    const data = await res.json()
    products.value = data
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
    products.value = data
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

// 拖曳到碗裡
const onDrop = (event) => {
  const id = parseInt(event.dataTransfer.getData('product-id'))
  const product = products.value.find(p => p.productsId === id)
  if (product && !bowl.value.some(i => i.productsId === id)) {
    bowl.value.push(product)
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
      <option v-for="sort in sorts" :key="sort.sortId" :value="sort.sortId">
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
  <img :src="`/ProductImages/${product.imageUrl}`" alt="product image" />
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
    <RouterLink :to="{name:'specialnoodle'}"><button class="clear-button">查看特殊款泡麵 ➜</button></RouterLink>
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
</style>
