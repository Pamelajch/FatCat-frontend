<script setup>
import ProductGridComponent from '@/components/ProductGridComponent.vue'
import CouponComponent from '@/components/CouponComponent.vue'
import ProductCategoryComponent from '@/components/ProductCategoryComponent.vue';
import ActivityComponent from '@/components/CampaignComponent.vue';
import LoadingComponent from '@/components/LoadingComponent.vue';
</script>

<template>
  <div class="home-view">
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