<script setup>
    const user = localStorage.getItem('user');
    const a = JSON.parse(user);
    console.log(a.userId); //取得userId = 1002
</script>

<template>
    <div>
        <h2>通知NotificationView.vue -- 佳馨</h2>
        
    </div>
</template>

<style lang="css" scoped>

</style>