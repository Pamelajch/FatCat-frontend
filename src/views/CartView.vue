<script setup>
import { useCartStore } from '@/stores/cart'
import CartItemList from '@/components/CartItemList.vue'

const cartStore = useCartStore()
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

    <!-- 優惠與猜你喜歡 -->
    <div class="container">
      <div class="row">
        <!-- 優惠區塊 -->
        <div class="col-12 col-md-6">
          <ul class="list-group mb-3">
            <li class="list-group-item">
              <h3>優惠&促銷</h3>
            </li>
            <li class="list-group-item">
              已享有優惠&可用優惠券
              <div></div>
            </li>
            <li class="list-group-item">
              優惠促銷
              <div>指定系列滿XXX元可折XX元 再買XX元即享優惠</div>
            </li>
          </ul>
        </div>

        <!-- 猜你喜歡區塊 -->
        <div class="col-12 col-md-6">
          <ul class="list-group mb-3">
            <li class="list-group-item">
              <h3>猜你喜歡</h3>
            </li>
            <li class="list-group-item d-flex gap-2">
              <button type="button" class="btn btn-danger">Left</button>
              <button type="button" class="btn btn-warning">Middle</button>
              <button type="button" class="btn btn-success">Right</button>
            </li>
          </ul>
          
          <!-- 結帳按鈕 -->
          <router-link to="/checkout">
            <button type="button" class="btn custom-purple-btn float-end">前往結帳</button>
          </router-link>
        
          <router-link to="/">
            <button type="button" class="btn custom-purple-outline-btn float-end btn-space">繼續購物</button>
          </router-link>
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
</style>