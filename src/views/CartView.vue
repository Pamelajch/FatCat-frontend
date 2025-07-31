<script setup>
import { useCartStore } from '@/stores/cart'
import CartItemList from '@/components/CartItemList.vue'
import CouponSection from '@/components/CouponSection.vue'
import GueseeULikeSection from '@/components/GueseeULikeSection.vue'
import { useRouter } from 'vue-router'
import api from '@/services/jjapi.js'

const cartStore = useCartStore()
const router = useRouter()

// 點擊「前往結帳」：將購物車資料批次送至後端，並取得 itemId 列表存入 Pinia，再跳轉結帳頁
async function proceedToCheckout() {
  try {
    const cartPayload = cartStore.items.map(i => ({
      itemId: 0,            // 後端會自動產生
      productsId: i.id,
      quantity: i.quantity,
      unitprice: i.price
    }))
    
    const res = await api.post('/ShoppingCartItems/batch', cartPayload)

    if (Array.isArray(res.data)) {
      cartStore.setCartItemIds(res.data)
      console.log('後端回傳購物車項目ID列表:', res.data)
      router.push('/checkout')
    } else {
      alert('取得購物車項目ID失敗')
    }
  } catch (err) {
    console.error('❌ 建立購物車資料失敗:', err)
    alert('無法建立購物車資料，請稍後再試')
  }
}
</script>

<template>
  <div class="page-content-wrapper pt-5 pb-5">
    <div class="container mb-2">
      <h2>購物車確認</h2>

      <!-- 購物車區塊 -->
      <div class="accordion col-lg-10 container mb-5" id="accordionPanelsStayOpenExample">
        <div class="accordion-item">
          <h2 class="accordion-header" id="panelsStayOpen-headingOne">
            <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseOne"
              aria-expanded="true"
              aria-controls="panelsStayOpen-collapseOne"
            >
              <h3>購物車</h3>
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseOne"
            class="accordion-collapse collapse show"
            aria-labelledby="panelsStayOpen-headingOne"
          >
            <div class="accordion-body">
              <CartItemList />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 猜你喜歡 + 優惠券區塊 -->
    <div class="container">
      <div class="row">
        <div class="col-12 col-md-6">
          <li class="list-group-item d-flex gap-2">
            <GueseeULikeSection />
          </li>
        </div>

        <div class="col-12 col-md-6 d-flex flex-column">
          <CouponSection />
          <div class="mt-3 d-flex justify-content-end gap-2">
            <router-link to="/">
              <button type="button" class="btn custom-purple-outline-btn">繼續購物</button>
            </router-link>
            <button type="button" class="btn custom-purple-btn" @click="proceedToCheckout">
              前往結帳
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.custom-purple-btn {
  background-color: #92559c;
  border-color: #92559c;
  color: white;
  transition: background-color 0.3s ease;
}
.custom-purple-btn:hover {
  background-color: #7b4583;
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
  margin-right: 10px;
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

.product-grid {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.product-card {
  flex: 1 1 30%;
  max-width: 30%;
}

.product-section {
  flex: 1;
}
</style>
