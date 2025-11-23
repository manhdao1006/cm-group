<template>
  <div>
    <BaseHeader />
    <div class="container mt-3">
      <p v-if="user" class="fw-bold text-success fs-5">
        {{ $t('homePage.welcome') }}, {{ user.name }} 👋
      </p>
      <h6 v-if="user" class="text-black">{{ $t('homePage.content') }}</h6>
      <p v-else class="text-muted">{{ $t('homePage.valid') }}</p>
    </div>
  </div>
</template>

<script>
import { eventBus } from '@/eventBus'
import BaseHeader from './common/BaseHeader.vue'

export default {
  name: 'TrangChu',
  components: {
    BaseHeader,
  },
  data() {
    return {
      user: null,
    }
  },
  mounted() {
    const savedUser = localStorage.getItem('googleUser')
    if (savedUser) this.user = JSON.parse(savedUser)

    this.userLoggedInHandler = (user) => {
      this.user = user
    }
    eventBus.on('userLoggedIn', this.userLoggedInHandler)
  },
  beforeUnmount() {
    if (this.userLoggedInHandler) {
      eventBus.off('userLoggedIn', this.userLoggedInHandler)
    }
  },
}
</script>
