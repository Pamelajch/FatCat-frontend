<script setup>
import { useCartStore } from '@/stores/cart'
import { onMounted, onUnmounted } from 'vue'
import * as bootstrap from 'bootstrap'

const cartStore = useCartStore()

let offcanvasInstance = null

// 這段可選，確保 offcanvas 正確初始化（只初始化一次）
onMounted(() => {
  const el = document.getElementById('offcanvasExample')
  if (el) {
    offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(el)
  }
})

onUnmounted(() => {
  // 清除殘留 backdrop（進一步安全保險）
  document.querySelectorAll('.offcanvas-backdrop').forEach(el => el.remove())
  document.body.classList.remove('offcanvas-backdrop')
  document.body.style.overflow = '' // 有時 bootstrap 加 overflow:hidden 也沒清掉
})

// 正確關閉 Offcanvas 並清理 backdrop
function closeOffcanvas() {
  const el = document.getElementById('offcanvasExample')
  const instance = bootstrap.Offcanvas.getInstance(el)
  if (instance) instance.hide()

  // 安全移除殘留
  document.querySelectorAll('.offcanvas-backdrop').forEach(el => el.remove())
  document.body.classList.remove('offcanvas-backdrop')
  document.body.style.overflow = ''
}
function onQtyInput(event, item) {
  const newQty = parseInt(event.target.value)
  if (!isNaN(newQty) && newQty > 0) {
    cartStore.setQty(item, newQty)
  }
}


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
              
              <input
                type="number"
                class="form-control form-control-sm mx-2"
                style="width: 60px;"
                :value="item.quantity"
                @input="onQtyInput($event, item)"
                min="1"
              />
              
              <button class="btn btn-outline-secondary btn-sm" @click="cartStore.increaseQty(item)">+</button>
            </div>
            </div>
            <button class="btn btn-sm btn-danger" @click="cartStore.removeItem(item.id)"><i class="fa-solid fa-trash-can"></i>移除</button>
          </div>
        </div>

        <div class="fw-bold text-end mb-3">
          總金額：<span class="text-danger">${{ cartStore.totalAmount }}</span>
        </div>

        <router-link to="/cart" class="btn custom-purple-btn w-100" @click="closeOffcanvas">立刻結帳</router-link>
      </template>

      <template v-else>
        <div class="text-center">購物車內尚無商品</div>
        <router-link to="/" class="btn custom-purple-outline-btn mt-3 w-100" @click="closeOffcanvas">前往購物</router-link>
      </template>
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