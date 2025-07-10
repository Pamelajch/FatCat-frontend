<script setup>
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
</script>

<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasExampleLabel">購物車</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>

    <div class="offcanvas-body">
      <template v-if="cartStore.items.length">
        <div class="list-group mb-3">
          <div
            class="list-group-item d-flex align-items-center gap-3"
            v-for="item in cartStore.items"
            :key="item.id"
          >
            <img
              :src="item.image"
              alt="商品圖"
              class="rounded"
              style="width: 60px; height: 60px; object-fit: cover;"
            />
            <div class="flex-grow-1">
              <h6 class="mb-1">{{ item.name }}</h6>
              <div>單價：${{ item.price }}</div>
              <div class="d-flex align-items-center mt-1">
                <button class="btn btn-outline-secondary btn-sm" @click="cartStore.decreaseQty(item)">-</button>
                <span class="mx-2">{{ item.quantity }}</span>
                <button class="btn btn-outline-secondary btn-sm" @click="cartStore.increaseQty(item)">+</button>
              </div>
            </div>
            <button class="btn btn-sm btn-danger" @click="cartStore.removeItem(item.id)">移除</button>
          </div>
        </div>

        <div class="fw-bold text-end mb-3">
          總金額：<span class="text-danger">${{ cartStore.totalAmount }}</span>
        </div>

        <router-link to="/cart" class="btn btn-primary w-100">立刻結帳</router-link>
      </template>

      <template v-else>
        <div class="text-center">購物車內尚無商品</div>
        <router-link to="/" class="btn btn-outline-secondary mt-3 w-100">前往購物</router-link>
      </template>
    </div>
  </div>
</template>
