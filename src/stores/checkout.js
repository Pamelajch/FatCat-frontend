import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCheckoutStore = defineStore('checkout', () => {
    // 個人資料
    const name = ref('')
    const phone = ref('')
    const email = ref('')

    // 送貨資料

    // 新增：宅配地址
    const address = ref('')

    // 新增：超商門市資訊
    const storeName = ref('')

    const shippingId = ref(null)
    const recipientName = ref('')
    const recipientPhone = ref('')
    const sameAsMember = ref(false)

    // 優惠 & 金額
    const productTotal = ref(2000)

    const couponId = ref(null)
    const shippingFee = ref(0)
    const discount = ref(0)
    const total = ref(0)

    // 表單送出方法（可串接 API）
    const submitOrder = async () => {
        try {
            const payload = {
                name: name.value,
                phone: phone.value,
                email: email.value,
                shippingId: shippingId.value,
                recipientName: recipientName.value,
                recipientPhone: recipientPhone.value,
                address: address.value,
                storeName: storeName.value, // 新增
                couponId: couponId.value,
                shippingFee: shippingFee.value,
                discount: discount.value,
                total: total.value,
            }

            const res = await fetch('https://localhost:7017/api/Orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error('訂單送出失敗')
            return await res.json()
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    return {
        name, phone, email,
        shippingId, recipientName, recipientPhone, sameAsMember, address, storeName,
        couponId, shippingFee, discount, total,
        productTotal,
        submitOrder
    }
})
