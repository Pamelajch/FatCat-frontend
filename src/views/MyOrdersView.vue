<script setup>
    
</script>

<template>
    <div class=" container mb-2">
        <h2>我的訂單</h2>
        <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active" id="pills-1-tab" data-bs-toggle="pill" data-bs-target="#pills-1" type="button" role="tab" aria-controls="pills-1" aria-selected="true">未處理</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="pills-2-tab" data-bs-toggle="pill" data-bs-target="#pills-2" type="button" role="tab" aria-controls="pills-2" aria-selected="false">處理中</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="pills-3-tab" data-bs-toggle="pill" data-bs-target="#pills-3" type="button" role="tab" aria-controls="pills-3" aria-selected="false">已完成</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="pills-4-tab" data-bs-toggle="pill" data-bs-target="#pills-4" type="button" role="tab" aria-controls="pills-4" aria-selected="false">退貨</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="pills-5-tab" data-bs-toggle="pill" data-bs-target="#pills-5" type="button" role="tab" aria-controls="pills-5" aria-selected="false">已取消</button>
        </li>
        </ul>
        <div class="tab-content" id="pills-tabContent">
        <div class="tab-pane fade show active" id="pills-1" role="tabpanel" aria-labelledby="pills-1-tab">
            <ul class="list-group">
            <li class="list-group-item"><router-link to="/orderdetail">
                    <button type="button" class="btn btn-primary float-end">訂單明細</button>
                </router-link></li>
            <li class="list-group-item">A second item</li>
            <li class="list-group-item">A third item</li>
            <li class="list-group-item">A fourth item</li>
            <li class="list-group-item">And a fifth one</li>
            </ul>

        </div>
        <div class="tab-pane fade" id="pills-2" role="tabpanel" aria-labelledby="pills-2-tab">2



        </div>
        <div class="tab-pane fade" id="pills-3" role="tabpanel" aria-labelledby="pills-3-tab">3



        </div>
        <div class="tab-pane fade" id="pills-4" role="tabpanel" aria-labelledby="pills-4-tab">4


        </div>
        <div class="tab-pane fade" id="pills-5" role="tabpanel" aria-labelledby="pills-5-tab">5



        </div>
        </div>
    </div>
</template>

<style lang="css" scoped>

</style>