<script setup>
import { ref, onMounted } from 'vue';

const coupons = ref([]);
const message = ref('');

onMounted(async () => {
  try {
    const res = await fetch('https://localhost:7017/api/Coupons');
    if (!res.ok) throw new Error('載入失敗');
    coupons.value = await res.json();
  } catch (error) {
    console.error(error);
    message.value = '無法載入優惠券資料';
  }
});

// 模擬領取功能（目前只是顯示訊息）
const handleClaim = (coupon) => {
  alert(`你點擊了「領取」優惠券：${coupon.name}`);
};
</script>

<template>
  <div class="campaign-container container-fluid py-5">
    <h2 class="text-center mb-5 display-5 fw-bold text-black">優惠領取</h2>
    <p v-if="message" class="text-danger">{{ message }}</p>

    <div class="row row-cols-1 row-cols-md-2 g-4">
      <div class="col" v-for="coupon in coupons" :key="coupon.couponId">
        <div class="card border-success h-100">
          <div class="card-body">
            <h5 class="card-title">{{ coupon.name }}</h5>
            <p class="card-text">
              {{ coupon.description }}<br>
              折扣金額：NT$ {{ coupon.discountAmount }}<br>
              到期日：{{ coupon.expirydate.split('T')[0] }}
            </p>
            <button class="btn btn-success" @click="handleClaim(coupon)">領取</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>
