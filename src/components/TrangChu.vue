<template>
  <div>
    <BaseHeader />
    <div class="container-fluid px-0">
      <div class="d-flex h-100">
        <div :style="{ width: collapsed ? '60px' : '220px', transition: 'width 0.3s' }">
          <SidebarMenu :user="user" style="height: 100%" @updateCollapsed="collapsed = $event" />
        </div>
        <div class="flex-grow-1 ms-3 mt-3 me-3" style="width: 100%; height: 100%">
          <p v-if="user" class="fw-bold text-success fs-5">
            {{ $t('homePage.welcome') }}, {{ user.name }} 👋
          </p>
          <h6 v-if="user" class="text-black">{{ $t('homePage.content') }}</h6>
          <p v-else class="text-muted">{{ $t('homePage.valid') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { eventBus } from '@/eventBus'
import BaseHeader from './common/BaseHeader.vue'
import SidebarMenu from './common/SidebarMenu.vue'

export default {
  name: 'TrangChu',
  components: {
    BaseHeader,
    SidebarMenu,
  },
  data() {
    return {
      user: JSON.parse(localStorage.getItem('googleUser') || 'null'),
      collapsed: false,
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
