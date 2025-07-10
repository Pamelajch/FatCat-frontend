import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrderStore = defineStore('order', () => {
    const latestOrderItems = ref([])

    const setOrderItems = (items) => {
        latestOrderItems.value = [...items]
    }

    return {
        latestOrderItems,
        setOrderItems
    }
})
