<script setup>
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import CartItemList from '@/components/CartItemList.vue'
import MemberInfoForm from '@/components/MemberInfoForm.vue'
import ShippingForm from '@/components/ShippingForm.vue'
import PaymentInfo from '@/components/PaymentInfo.vue'

const router = useRouter()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()

const shippingFormRef = ref()
const isSubmitting = ref(false)

async function handleCheckout() {
  const isValid = shippingFormRef.value?.validateShippingInfo?.()
  if (!isValid) return

  isSubmitting.value = true

  try {
    // === Step 1: Orders ===
    const orderPayload = {
      userId: checkoutStore.userId,
      orderdate: new Date().toISOString(),
      location: checkoutStore.address || checkoutStore.storeName || '未填寫地址',
      couponId: checkoutStore.couponId ?? null,
      totalAmount: cartStore.total,
      payableAmount: checkoutStore.total,
      orderStatusId: 1,
      shippingId: checkoutStore.shippingId,
      shippingStatusId: checkoutStore.shippingStatusId,
      supportpaymentMethodId: checkoutStore.paymentMethodId ?? null
    }

    console.log('📝 Orders payload:', orderPayload)

    const orderRes = await axios.post('/api/Orders', orderPayload)
    const orderId = orderRes.data.orderId
    if (!orderId) throw new Error('未取得 orderId')

    // === Step 2: ShoppingCartItems ===
    const cartPayload = cartStore.items.map(i => ({
      itemId: 0,
      productsId: i.id, // 對應原始 Product.Id
      quantity: i.quantity,
      unitprice: i.price
    }))
    const cartRes = await axios.post('/api/ShoppingCartItems/batch', cartPayload)
    const itemIds = cartRes.data
    if (!Array.isArray(itemIds)) throw new Error('未取得 itemIds')

    // === Step 3: OrderDetails ===
      const orderDetails = cartStore.items.map(item => ({
  OrderId: orderId,
  ItemId: item.id, // ✅ Product.Id，不是 ShoppingCartItem.Id
  ProductName: item.name ?? '',
  Quantity: item.quantity,
  Unitprice: item.price
}))
await axios.post('/api/OrderDetails/batch', orderDetails)



    alert('✅ 訂單已送出！')
    cartStore.clearCart()
    router.push('/checkoutfinish')
  } catch (err) {
    console.error('❌ 訂單送出失敗', err.response?.data || err)
    alert('訂單送出失敗，請查看 Console 錯誤')
    console.table(err.response?.data?.errors); // ⬅️ 這一行關鍵
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>
  <div class="page-content-wrapper pt-5 pb-5">
    <div class="container mb-2">
      <h2>訂單結帳</h2>

      <div class="accordion col-lg-10 container mb-5" id="accordionPanelsStayOpenExample">
        <div class="accordion-item">
          <h2 class="accordion-header" id="panelsStayOpen-headingOne">
            <button class="accordion-button" type="button" data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseOne">
              <h3>購物車</h3>
            </button>
          </h2>
          <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show">
            <div class="accordion-body">
              <CartItemList />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-md-4"><MemberInfoForm /></div>
        <div class="col-md-4"><ShippingForm ref="shippingFormRef" /></div>
        <div class="col-md-4"><PaymentInfo /></div>
        <div class="mt-3 text-end">
          <router-link to="/cart">
            <button class="btn custom-purple-outline-btn btn-space">購物車確認</button>
          </router-link>
          <button class="btn custom-purple-btn" @click="handleCheckout" :disabled="isSubmitting">
            {{ isSubmitting ? '處理中...' : '確定結帳' }}
          </button>
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
