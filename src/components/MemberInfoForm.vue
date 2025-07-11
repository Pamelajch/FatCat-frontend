<template>
  <ul class="list-group">
    <li class="list-group-item">
      <h3>個人資料</h3>
    </li>
    <li class="list-group-item">姓名:
      <div>
        <input type="text" class="form-control" v-model="name" />
      </div>
    </li>
    <li class="list-group-item">電話:
      <div>
        <input type="text" class="form-control" v-model="phone" />
      </div>
    </li>
    <li class="list-group-item">Email:
      <div>
        <input type="email" class="form-control" v-model="email" />
      </div>
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const phone = ref('')
const email = ref('')
</script>
