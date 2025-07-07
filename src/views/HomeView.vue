<script setup>
import ProductGridComponent from '@/components/ProductGridComponent.vue'
import CouponComponent from '@/components/CouponComponent.vue'
import ProductCategoryComponent from '@/components/ProductCategoryComponent.vue';
import ActivityComponent from '@/components/CampaignComponent.vue';
import LoadingComponent from '@/components/LoadingComponent.vue';
</script>

<template>
  <div class="home-view">
    <h3 class="fw-bold">首頁HomeView.vue的部分</h3>
    <h3 class="fw-bold">分成五個Component，請大家依照自己的部分去做</h3>
    <hr>
    <LoadingComponent></LoadingComponent>
    <hr>
    <!-- 商品分類組件 --玥彤-->
    <ProductCategoryComponent></ProductCategoryComponent>
    <hr>
    <!-- 商品局部列表組件 --玥彤-->
    <ProductGridComponent></ProductGridComponent>
    <hr>
    <!-- 活動組件 --如謙-->
    <ActivityComponent></ActivityComponent>
    <hr>
    <!-- 優惠券組件 --梓瑋-->
    <CouponComponent></CouponComponent>

  </div>
</template>

<style lang="css" scoped>

</style>