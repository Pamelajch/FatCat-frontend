<script setup>
import CreateComplaintForm from '@/components/CreateComplaintForm.vue';
import ReviewComponent from '../components/ReviewComponent.vue';
import PostReviewForm from '@/components/PostReviewForm.vue';

// 為了方便測試，我們可以在這裡定義一個假的訂單ID
const testOrderId = 3; // 👈 你可以改成任何數字，例如你資料庫中已存在的一筆訂單ID

const handleComplaintSubmitted = () => {
    alert(`測試頁面收到通知：訂單 #${testOrderId} 的申訴已提交！`);
    // 在真實情境中，這裡可能會關閉一個 Modal 或重新導向
}

</script>

<template>
  <div class="container">
    <h1>rr 各個元件的測試區塊</h1>
    <hr>
    <!-- 
      我們在這裡使用 ReviewComponent，
      並手動提供一個「假的」產品 ID 給它，例如 1。
      這樣它就能去呼叫 /api/products/1/reviews 來抓取資料。
    -->
    <ReviewComponent :product-id="1" />
    <hr>
    <PostReviewForm></PostReviewForm>
    <hr>
    <CreateComplaintForm 
            :order-id="testOrderId" 
            @complaint-submitted="handleComplaintSubmitted"
    />    <hr>
  </div>
</template>