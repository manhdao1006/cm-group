<template>
  <div class="dropdown">
    <button
      class="btn btn-light dropdown-toggle d-flex align-items-center"
      type="button"
      data-bs-toggle="dropdown"
    >
      <div class="me-2">{{ currentLang.label }}</div>
      <img :src="currentLang.icon" :alt="currentLang.label" width="30px" class="me-2" />
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li v-for="lang in languages" :key="lang.code">
        <a
          class="dropdown-item d-flex align-items-center"
          href="#"
          @click.prevent="locale = lang.code"
        >
          <div class="me-2">{{ lang.label }}</div>
          <img :src="lang.icon" :alt="lang.label" width="30px" class="me-2" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  {
    code: 'vi',
    label: 'VN',
    icon: 'https://res.cloudinary.com/springboot-cloud/image/upload/v1755921541/Flag_of_Vietnam.svg_uqekcw.png',
  },
  {
    code: 'en',
    label: 'EN',
    icon: 'https://res.cloudinary.com/springboot-cloud/image/upload/v1755921541/Flag_of_the_United_Kingdom__1-2.svg_icn36z.webp',
  },
]

const currentLang = computed(() => {
  return languages.find((l) => l.code === locale.value) || languages[0]
})

watch(locale, (newLang) => {
  localStorage.setItem('lang', newLang)
})

const savedLang = localStorage.getItem('lang')
if (savedLang) {
  locale.value = savedLang
}
</script>

<style scoped>
.dropdown-menu {
  min-width: 100% !important;
}
</style>
