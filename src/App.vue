<script setup lang="ts">
import { provide, ref } from 'vue'

const isLoggedIn = ref(!!localStorage.getItem('googleUser'))
provide('isLoggedIn', isLoggedIn)
</script>

<template>
  <router-view></router-view>
</template>
