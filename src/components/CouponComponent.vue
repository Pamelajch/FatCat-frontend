<script setup>
import { ref, onMounted } from 'vue';

const coupons = ref([]);

onMounted(async () => {
  try {
    const res = await fetch('https://localhost:7017/api/Coupons');
    if (!res.ok) throw new Error('Network response was not ok');
    coupons.value = await res.json();
  } catch (error) {
    console.error('Fetch 錯誤:', error);
  }
});
</script>

<template>
  <div>
    <h2>優惠卷領取--CouponComponent--梓瑋</h2>
    <ul>
      <li v-for="coupon in coupons" :key="coupon.id">
        {{ coupon.name }} - {{ coupon.discount }}
      </li>
    </ul>
  </div>
</template>
