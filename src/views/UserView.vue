<script setup>
    import { useAuthStore } from '@/stores/auth';

    const authStore = useAuthStore()

    console.log(authStore.user?.userId)     // 使用者ID
    console.log(authStore.user?.name)       // 使用者名稱
    console.log(authStore.user?.email)      // 電子郵件
</script>

<template>
    <div>
        <h2>會員中心UserView.vue -- 佳馨</h2>
        <p>是否已登入? {{ authStore.isAuthenticated ? "是":"否"}}</p>
        <p>登入的會員Id：{{authStore.user?.userId }}</p>
        <p>登入的會員名字：{{ authStore.user?.name }}</p>
        <p>登入的電子郵件：{{ authStore.user?.email }}</p>
        <p>登入的使用者大頭貼圖片路徑：{{ authStore.user?.picPath}}</p>
    </div>
</template>

<style lang="css" scoped>

</style>