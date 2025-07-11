<script setup>
import { useCartStore } from '@/stores/cart'
import CartItemList from '@/components/CartItemList.vue'
import MemberInfoForm from '@/components/MemberInfoForm.vue'
import ShippingForm from '@/components/ShippingForm.vue'
import PaymentInfo from '@/components/PaymentInfo.vue'
</script>

<template>
  <div class="page-content-wrapper pt-5 pb-5">
    <div class="container mb-2">
      <h2>訂單結帳</h2>

      <!-- Accordion：購物車內容 -->
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
              <CartItemList />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表單內容區 -->
    <div class="container">
      <div class="row">
        <div class="col-12 col-md-4">
          <MemberInfoForm />
        </div>
        <div class="col-12 col-md-4">
          <ShippingForm />
        </div>
        <div class="col-12 col-md-4">
          <PaymentInfo />
        </div>

        <!-- 下方按鈕 -->
        <div class="mt-3 text-end">
          <router-link to="/checkoutfinish">
            <button type="button" class="btn custom-purple-btn">確定結帳</button>
          </router-link>

          <router-link to="/cart">
            <button type="button" class="btn custom-purple-outline-btn btn-space">購物車確認</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-purple-btn {
  background-color: #92559c;
  border-color: #92559c;
  color: white;
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
</style>
