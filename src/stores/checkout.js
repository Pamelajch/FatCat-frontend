// stores/checkout.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCheckoutStore = defineStore('checkout', () => {
    const userId = ref(1)
    const name = ref('')
    const phone = ref('')
    const email = ref('')
    const address = ref('')
    const storeName = ref('')
    const shippingId = ref(null)
    const shippingStatusId = ref(1)
    const recipientName = ref('')
    const recipientPhone = ref('')
    const sameAsMember = ref(false)

    const productTotal = ref(0)
    const couponId = ref(null)
    const shippingFee = ref(0)
    const discount = ref(0)
    const total = ref(0)

    return {
        userId,
        name, phone, email,
        address, storeName,
        shippingId, shippingStatusId,
        recipientName, recipientPhone,
        sameAsMember,
        couponId, shippingFee, discount, total,
        productTotal
    }
})
