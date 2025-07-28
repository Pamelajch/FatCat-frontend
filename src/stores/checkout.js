// stores/checkout.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCheckoutStore = defineStore('checkout', () => {
    const userId = ref(1)
    const name = ref('')
    const phone = ref('')
    const email = ref('')

    // 送貨資料
    const shippingId = ref(null)
    const recipientName = ref('')
    const recipientPhone = ref('')
    const recipientAddress = ref('') // 新增：完整收件地址
    const shippingAddressId = ref(null) // 新增：選擇的地址ID
    const addressType = ref(null) // 新增：地址類型 (1=宅配, 2=超商)
    const sameAsMember = ref(false)

    // 新增：宅配地址
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
        recipientName, recipientPhone, recipientAddress, shippingAddressId, addressType,
        sameAsMember,
        couponId, shippingFee, discount, total,
        productTotal
    }
})
