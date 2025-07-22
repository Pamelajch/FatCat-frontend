<script setup>
import { ref, computed } from 'vue'

const DRINK_CATEGORY_ID = 99

// 小分類列表（sortId 對應）
const drinkSorts = [
  { sortId: '', name: '全部' },
  { sortId: 1, name: '幻覺系' },
  { sortId: 2, name: '力量系' },
  { sortId: 3, name: '治癒系' },
  { sortId: 4, name: '時間系' },
  { sortId: 5, name: '靈魂系' },
]

const selectedSort = ref('') // 當前選擇的小分類（初始為全部）

// 假資料
const products = ref([
  { productsId: 201, name: '星光精華', categoryId: DRINK_CATEGORY_ID, sortId: 1, imageUrl: '/magic.png', description: '閃爍微光的神秘液體' },
  { productsId: 202, name: '夢境露滴', categoryId: DRINK_CATEGORY_ID, sortId: 1, imageUrl: '/magic.png', description: '散發淡紫色迷霧的濃縮露' },
  { productsId: 203, name: '龍焰汁', categoryId: DRINK_CATEGORY_ID, sortId: 2, imageUrl: '/magic.png', description: '熱辣噴發，據說能暫時提高攻擊力' },
  { productsId: 204, name: '猛虎液', categoryId: DRINK_CATEGORY_ID, sortId: 2, imageUrl: '/magic.png', description: '讓你如猛虎出柙，活力暴增' },
  { productsId: 205, name: '綠意茶', categoryId: DRINK_CATEGORY_ID, sortId: 3, imageUrl: '/magic.png', description: '充滿生命力的草本飲' },
  { productsId: 206, name: '柔光蜜露', categoryId: DRINK_CATEGORY_ID, sortId: 3, imageUrl: '/magic.png', description: '甜甜的療癒飲品，據說能穩定心神' },
  { productsId: 207, name: '時光沙', categoryId: DRINK_CATEGORY_ID, sortId: 4, imageUrl: '/magic.png', description: '喝了會覺得時間放慢一點點' },
  { productsId: 208, name: '回憶之泉', categoryId: DRINK_CATEGORY_ID, sortId: 4, imageUrl: '/magic.png', description: '讓你回憶起最溫柔的瞬間' },
  { productsId: 209, name: '幽冥花茶', categoryId: DRINK_CATEGORY_ID, sortId: 5, imageUrl: '/magic.png', description: '泡製靈魂的花朵，略帶苦味' },
  { productsId: 210, name: '月影之酒', categoryId: DRINK_CATEGORY_ID, sortId: 5, imageUrl: '/magic.png', description: '濃郁如夜色，深沉如靈魂的低語' }
])

// 根據篩選分類過濾材料
const filteredProducts = computed(() => {
  if (!selectedSort.value) return products.value
  return products.value.filter(p => p.sortId === Number(selectedSort.value))
})
</script>

<template>
  <div class="drink-view">
    <!-- 分類選單 -->
    <div class="filter-bar">
      <label>材料風格分類：</label>
      <select v-model="selectedSort">
        <option v-for="sort in drinkSorts" :key="sort.sortId" :value="sort.sortId">
          {{ sort.name }}
        </option>
      </select>
    </div>

    <!-- 材料清單 -->
    <div class="grid">
      <div v-for="item in filteredProducts" :key="item.productsId" class="ingredient-card">
        <img :src="item.imageUrl" :alt="item.name" />
        <h4>{{ item.name }}</h4>
        <p>{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drink-view {
  padding: 2rem;
}

.filter-bar {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.ingredient-card {
  width: 160px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  text-align: center;
  transition: transform 0.2s;
}
.ingredient-card:hover {
  transform: scale(1.05);
}

.ingredient-card img {
  width: 100%;
  border-radius: 10px;
}
</style>