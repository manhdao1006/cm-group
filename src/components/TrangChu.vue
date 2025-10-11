<template>
  <div>
    <BaseHeader />
    <div class="container mt-3">
      <h2 class="text-lg font-bold mb-2">Trang chủ</h2>
      <p v-if="user" class="fw-bold text-success fs-5">Xin chào, {{ user.name }} 👋</p>
      <h6 v-if="user" class="text-black">
        Đây là hệ thống giám sát xe đưa đón học sinh giúp theo dõi vị trí xe theo thời gian thực,
        quản lý học sinh lên xuống, và cảnh báo khi có sự cố, nhằm đảm bảo an toàn và hỗ trợ nhà
        trường quản lý hiệu quả.
      </h6>
      <p v-else class="text-muted">Vui lòng đăng nhập để tiếp tục.</p>
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
    eventBus.on('userLoggedIn', (user) => {
      this.user = user
    })
  },
  beforeUnmount() {
    eventBus.off('userLoggedIn')
  },
}
</script>
