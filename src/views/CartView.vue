<script setup>
import { useCartStore } from '@/stores/cart'
import CartItemList from '@/components/CartItemList.vue'
import CouponSection from '@/components/CouponSection.vue'
import { ref } from 'vue'
import GueseeULikeSection from '@/components/GueseeULikeSection.vue'

const cartStore = useCartStore()

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
  <div class="page-content-wrapper pt-5 pb-5">
    <div class="container mb-2">
      <h2>購物車確認</h2>

      <!-- 購物車 Accordion -->
      <div class="accordion col-lg-10 container mb-5" id="accordionPanelsStayOpenExample">
        <div class="accordion-item">
          <h2 class="accordion-header" id="panelsStayOpen-headingOne">
            <button class="accordion-button" type="button" data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true"
              aria-controls="panelsStayOpen-collapseOne">
              <h3>購物車</h3>
            </button>
          </h2>
          <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show"
            aria-labelledby="panelsStayOpen-headingOne">
            <div class="accordion-body">
              <!-- 購物車內容開始 -->
              <CartItemList />
              <!-- 購物車內容結束 -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 猜你喜歡與優惠 -->
    <div class="container">
      <div class="row">
        <!-- 猜你喜歡區塊 -->
        <div class="col-12 col-md-6">
          <li class="list-group-item d-flex gap-2">
            <GueseeULikeSection />
          </li>
        </div>

        <!-- 優惠區塊 + 按鈕 -->
        <div class="col-12 col-md-6 d-flex flex-column">
          <CouponSection />

          <!-- 按鈕區塊，靠右排列 -->
          <div class="mt-3 d-flex justify-content-end gap-2">
            <router-link to="/">
              <button type="button" class="btn custom-purple-outline-btn">繼續購物</button>
            </router-link>
            <router-link to="/checkout">
              <button type="button" class="btn custom-purple-btn">前往結帳</button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="css" scoped>
.custom-purple-btn {
  background-color: #92559c;
  border-color: #92559c;
  color: white;
}

.custom-purple-btn:hover {
  background-color: #7b4583; /* 可選的 hover 色 */
  border-color: #7b4583;
}

.custom-purple-outline-btn {
  background-color: transparent;
  border: 2px solid #92559c;
  color: #92559c;
  transition: all 0.3s ease;
}

.custom-purple-outline-btn:hover {
  background-color: #92559c;
  color: white;
  border-color: #92559c;
}
.btn-space {
  margin-right: 10px; /* 可以依需求微調距離 */
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  margin-top: 10px; /* 圖片上方間距 */
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
.product-grid {
  display: flex;
  gap: 1rem;
  justify-content: space-between; /* 或 center / flex-start */
}
.product-card {
  flex: 1 1 30%;
  max-width: 30%;
}

.product-section {
  flex: 1;
}
</style>