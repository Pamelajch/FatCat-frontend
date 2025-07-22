<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const productId = route.params.id

// ===== 狀態 =====
const product = ref(null)
const categories = ref([])
const sorts = ref([])
const isLoading = ref(true)
const formErrors = ref([])

// ===== API：取得資料 =====
// ===== API：取得資料 =====
const fetchProduct = async () => {
  try {
    const res = await fetch(`https://localhost:7017/api/AdminProducts/${productId}`)
    if (!res.ok) throw new Error('找不到該商品')
    const data = await res.json()

    // ✅ 補上圖片前綴並清理重複 /ProductImages/
    data.images.forEach(img => {
      if (!img.imageUrl.startsWith('http')) {
        const cleaned = img.imageUrl.replace(/^\/+ProductImages\/+/, '/ProductImages/')
        img.imageUrl = `https://localhost:7017${cleaned}`
      }
    })

    product.value = data
  } catch (err) {
    alert('取得商品失敗，請稍後再試')
    console.error(err)
    router.push({ name: 'AdminProducts' })
  }
}

const fetchCategories = async () => {
  const res = await fetch('https://localhost:7017/api/ProductCategories')
  categories.value = await res.json()
}

const fetchSorts = async () => {
  const res = await fetch('https://localhost:7017/api/Sorts')
  sorts.value = await res.json()
}

// ===== 小分類篩選（根據種類）=====
const filteredSorts = computed(() => {
  if (!product.value || !product.value.categoryId) return []
  return sorts.value.filter(sort => sort.categoryId === product.value.categoryId)
})

// ===== 初始化 =====
onMounted(async () => {
  await Promise.all([fetchProduct(), fetchCategories(), fetchSorts()])

  // 等資料抓好後再監聽分類變更
  watch(() => product.value.categoryId, () => {
    product.value.sortId = ''
  })

  isLoading.value = false
})

// ===== 表單驗證 =====
const validateForm = () => {
  formErrors.value = []

  if (product.value.price < 0) formErrors.value.push('價格不能為負數')
  if (product.value.stock < 0) formErrors.value.push('庫存不能為負數')
  if (product.value.stockAlert && product.value.lowerthanAlert < 0)
    formErrors.value.push('提醒下限不能為負數')

  return formErrors.value.length === 0
}

// ===== 更新商品 =====
const updateProduct = async () => {
  if (!validateForm()) return

  try {
    const res = await fetch(`https://localhost:7017/api/AdminProducts/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product.value)
    })

    // 先判斷 response 是否成功
    if (!res.ok) {
      const message = await res.text()
      throw new Error(message || '更新失敗，請檢查欄位是否正確')
    }

    // 成功流程
    alert('✅ 更新成功！')
    router.push({ name: 'AdminProducts' })

  } catch (err) {
    // 錯誤處理流程
    alert(`❌ 更新失敗：${err.message}`)
    console.error(err)
  }
}

// ===== 圖片處理 =====
const uploadImage = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await fetch(`https://localhost:7017/api/AdminProducts/${productId}/images`, {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      const newImage = await res.json()

      // ✅ 加這段：補上 /ProductImages/
      if (!newImage.imageUrl.startsWith('http')) {
        newImage.imageUrl = `https://localhost:7017/ProductImages/${newImage.imageUrl}`
      }

      product.value.images.push(newImage)
    } else {
      alert('❌ 上傳圖片失敗')
    }
  } catch (err) {
    alert('⚠️ 圖片上傳錯誤')
    console.error(err)
  }
}

const deleteImage = async (imageId) => {
  try {
    await fetch(`https://localhost:7017/api/AdminProducts/images/${imageId}`, {
      method: 'DELETE'
    })
    product.value.images = product.value.images.filter(img => img.productImagesId !== imageId)
  } catch (err) {
    alert('⚠️ 刪除圖片失敗')
    console.error(err)
  }
}

const setMainImage = async (imageId) => {
  try {
    await fetch(`https://localhost:7017/api/AdminProducts/images/${imageId}/set-main`, {
      method: 'POST'
    })
    product.value.images.forEach(img => {
      img.isMain = img.productImagesId === imageId ? 1 : 0
    })
  } catch (err) {
    alert('⚠️ 設為主圖失敗')
    console.error(err)
  }
}
</script>

<template>
  <div v-if="!isLoading" class="edit-wrapper">
    <h2>📝 編輯商品</h2>

    <form @submit.prevent="updateProduct" class="edit-form">
      <!-- 左欄：商品基本資訊 -->
      <div class="form-left">
        <label>名稱
          <input v-model="product.name" />
        </label>

        <label>描述
          <textarea v-model="product.description" />
        </label>

        <label>價格
          <input type="number" v-model.number="product.price" min="0" />
        </label>

        <label>庫存
          <input type="number" v-model.number="product.stock" min="0" />
        </label>

        <label>提醒下限
          <input type="number" v-model.number="product.lowerthanAlert" min="0" />
        </label>
      </div>

      <!-- 右欄：狀態、分類、圖片 -->
      <div class="form-right">
        <label>狀態
          <select v-model="product.status">
            <option :value="1">上架</option>
            <option :value="0">下架</option>
          </select>
        </label>

        <label>種類
          <select v-model="product.categoryId">
            <option v-for="cat in categories" :key="cat.productCategoriesId" :value="cat.productCategoriesId">
              {{ cat.name }}
            </option>
          </select>
        </label>

        <label>小分類
            <select v-model="product.sortId">
                <option v-for="sort in filteredSorts" :key="sort.sortId" :value="sort.sortId">
                    {{ sort.name }}
                </option>
            </select>
        </label>

        <label>
          <input type="checkbox" v-model="product.stockAlert" />
          啟用庫存提醒
        </label>

        <!-- 🖼️ 圖片區 -->
        <div class="image-area">
          <h4>商品圖片</h4>
          <input type="file" @change="uploadImage" />

          <div class="img-list">
            <div v-for="img in product.images" :key="img.productImagesId" class="img-card">
              <img :src="img.imageUrl" />
              <button @click.prevent="deleteImage(img.productImagesId)">刪除</button>
              <button
                v-if="img.isMain !== 1"
                @click.prevent="setMainImage(img.productImagesId)"
              >
                設主圖
              </button>
              <span v-else class="main-label">主圖</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit">✔ 儲存變更</button>
      </div>
    </form>
  </div>
</template>

<style lang="css" scoped>
.edit-wrapper {
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.06);
}

.edit-form {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.form-left,
.form-right {
  flex: 1;
  min-width: 300px;
}

form label {
  display: block;
  margin-bottom: 1.2rem;
  font-weight: bold;
  color: #333;
}

form input,
form textarea,
form select {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  box-sizing: border-box;
}

form textarea {
  resize: vertical;
  min-height: 80px;
}

.image-area {
  margin-top: 2rem;
}

.img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.img-card {
  width: 120px;
  text-align: center;
}

.img-card img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.main-label {
  display: block;
  color: #2e7d32;
  font-weight: bold;
  margin-top: 6px;
}

.form-actions {
  width: 100%;
  margin-top: 2rem;
  text-align: center;
}

button[type="submit"] {
  padding: 10px 24px;
  background-color: #7c4dff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.3s;
}

button[type="submit"]:hover {
  background-color: #9575cd;
}
</style>