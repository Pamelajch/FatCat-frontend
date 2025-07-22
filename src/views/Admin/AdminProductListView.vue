<script setup>
import { ref, onMounted, computed } from 'vue'

const products = ref([])
const categories = ref([])
const sorts = ref([])

const keyword = ref('')
const selectedCategoryId = ref('')
const selectedSortId = ref('')
const selectedStatus = ref('')

// 撈商品資料（已包含 categoryId、sortId）
const fetchProducts = async () => {
  const res = await fetch('https://localhost:7017/api/AdminProducts')
  products.value = await res.json()
}

// 撈分類資料
const fetchCategories = async () => {
  const res = await fetch('https://localhost:7017/api/ProductCategories')
  categories.value = await res.json()
}

// 撈小分類資料
const fetchSorts = async () => {
  const res = await fetch('https://localhost:7017/api/Sorts')
  sorts.value = await res.json()
}

// 篩選後的商品清單
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchKeyword =
      !keyword.value ||
      p.name.includes(keyword.value) ||
      p.categoryName.includes(keyword.value) ||
      p.sortName.includes(keyword.value)

    const matchCategory =
      !selectedCategoryId.value || p.categoryId === parseInt(selectedCategoryId.value)

    const matchSort =
      !selectedSortId.value || p.sortId === parseInt(selectedSortId.value)

    const matchStatus =
      !selectedStatus.value ||
      (selectedStatus.value === '上架' && p.isAvailable) ||
      (selectedStatus.value === '下架' && !p.isAvailable)

    return matchKeyword && matchCategory && matchSort && matchStatus
  })
})

onMounted(() => {
  fetchProducts()
  fetchCategories()
  fetchSorts()
})

const toggleStatus = async (product) => {
  try {
    const res = await fetch(`https://localhost:7017/api/AdminProducts/ToggleStatus/${product.productsId}`, {
      method: 'PATCH'
    })

    const result = await res.json()

    // 更新前端的狀態（即時畫面同步）
    product.statusText = result.statusText
    product.isAvailable = result.isAvailable
  } catch (err) {
    console.error('切換上下架失敗', err)
    alert('操作失敗，請稍後再試')
  }
}

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<template>
  <div class="product-admin-wrapper">
    <h2>📦 全站商品列表</h2>

    <!-- 🔍 篩選區 -->
    <div class="filter-box">
      <input type="text" v-model="keyword" placeholder="搜尋商品 / 分類 / 小分類" />

      <select v-model="selectedCategoryId">
        <option value="">全部種類</option>
        <option v-for="cat in categories" :key="cat.productCategoriesId" :value="cat.productCategoriesId">
          {{ cat.name }}
        </option>
      </select>

      <select v-model="selectedSortId">
        <option value="">全部小分類</option>
        <option v-for="sort in sorts" :key="sort.sortId" :value="sort.sortId">
          {{ sort.name }}
        </option>
      </select>

      <select v-model="selectedStatus">
        <option value="">全部狀態</option>
        <option value="上架">上架</option>
        <option value="下架">下架</option>
      </select>
    </div>

    <!-- 📋 商品表格 -->
    <table class="product-table">
      <thead>
        <tr>
          <th>圖片</th>
          <th>名稱</th>
          <th>分類</th>
          <th>價格</th>
          <th>庫存</th>
          <th>狀態</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in paginatedProducts" :key="p.productsId">
          <td><img :src="p.mainImage" alt="商品圖" class="thumb" /></td>
          <td>{{ p.name }}</td>
          <td>{{ p.categoryName }} / {{ p.sortName }}</td>
          <td>{{ p.price }} 元</td>
          <td>{{ p.stock }}</td>
          <td>
            <span :class="p.isAvailable ? 'status-on' : 'status-off'">
              {{ p.statusText }}
            </span>
          </td>
          <td>
          <RouterLink :to="{ name: 'AdminProductEdit', params: { id: p.productsId } }" class="btn-edit">編輯</RouterLink>
            <button class="btn-delete">刪除</button>
            <button class="btn-status" @click="toggleStatus(p)">
              {{ p.isAvailable ? '下架' : '上架' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
        <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">上一頁</button>
        <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="{ active: page === currentPage }"
        >
            {{ page }}
        </button>
        <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">下一頁</button>
        <p class="result-count">共 {{ filteredProducts.length }} 筆，頁數：{{ currentPage }} / {{ totalPages }}</p>
    </div>
    </div>
</template>

<style lang="css" scoped>
.product-admin-wrapper {
  padding: 1rem;
}

.filter-box {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-box input,
.filter-box select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th,
.product-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.status-on {
  background-color: #28a745;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 14px;
}

.status-off {
  background-color: #6c757d;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 14px;
}

button {
  margin: 0 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-edit {
  background-color: #409eff;
  color: white;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none; /* 移除底線 */
  display: inline-block;
}

.btn-delete {
  background-color: #f56c6c;
  color: white;
}

.btn-status {
  background-color: #e6a23c;
  color: white;
}

.pagination {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
}

.pagination button.active {
  background-color: #409eff;
  color: white;
  font-weight: bold;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>