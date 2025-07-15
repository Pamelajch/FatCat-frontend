<script setup>
import { useCheckoutStore } from '@/stores/checkout'
import { useOrderStore } from '@/stores/order'
import { useOrderLookup } from '@/composables/useOrderLookup'

const checkout = useCheckoutStore()
const order = useOrderStore()
const orderStatus = '訂單成立（待處理）'
const shippingStatus = '未出貨'
const { selectedCoupon, selectedShipping } = useOrderLookup()
</script>

<template>
  <div class="row">
    <!-- 個人資料 -->
    <div class="col-12 col-md-4 mb-3">
      <ul class="list-group">
        <li class="list-group-item"><h3>個人資料</h3></li>
        <li class="list-group-item">姓名：<div>{{ checkout.name }}</div></li>
        <li class="list-group-item">電話：<div>{{ checkout.phone }}</div></li>
        <li class="list-group-item">Email：<div>{{ checkout.email }}</div></li>
      </ul>
    </div>

    <!-- 送貨資料 -->
    <div class="col-12 col-md-4 mb-3">
      <ul class="list-group">
        <li class="list-group-item"><h3>送貨資料</h3></li>
        <li class="list-group-item">訂單狀態：<div>{{ orderStatus }}</div></li>
        <li class="list-group-item">物流狀態：<div>{{ shippingStatus }}</div></li>
        <li class="list-group-item">送貨方式：<div>{{ selectedShipping?.name || '未選擇' }}</div></li>
        <li class="list-group-item">收件人姓名：<div>{{ checkout.recipientName }}</div></li>
        <li class="list-group-item">收件人電話：<div>{{ checkout.recipientPhone }}</div></li>
      </ul>
    </div>

    <!-- 付款資料 -->
    <div class="col-12 col-md-4 mb-3">
      <ul class="list-group">
        <li class="list-group-item"><h3>付款資料</h3></li>
        <li class="list-group-item">使用優惠券：<div>{{ selectedCoupon?.description || '未使用' }}</div></li>
        <li class="list-group-item">
          <div>
            訂單總金額：{{ checkout.productTotal }} 元<br />
            運費：{{ checkout.shippingFee }} 元<br />
            折扣金額：-{{ checkout.discount }} 元
            <hr />
            實付金額：<strong>{{ checkout.total }} 元</strong>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
