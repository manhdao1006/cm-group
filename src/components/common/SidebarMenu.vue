<template>
  <div :class="['sidebar', { collapsed }]">
    <button class="toggle-btn text-uppercase fw-bolder" @click="toggleSidebar">
      <i class="fa-solid fa-bars"></i>
      <span v-if="!collapsed">{{ $t('header.navigation.system') }}</span>
    </button>

    <ul class="navbar-nav text-capitalize mt-3 fw-medium" v-if="!collapsed">
      <li class="nav-item" v-for="item in menuItems" :key="item.to">
        <router-link class="nav-link" :to="item.to" @click.prevent="checkLogin(item.to)">
          {{ $t(item.label) }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification'

export default {
  name: 'SidebarMenu',
  props: {
    user: Object,
  },
  data() {
    return {
      collapsed: false,
      menuItems: [
        { to: '/', label: 'header.navigation.homePage' },
        { to: '/map-bus', label: 'header.navigation.mapBus' },
        { to: '/du-lieu', label: 'header.navigation.data' },
        { to: '/quan-ly-nguoi-dung', label: 'header.navigation.account' },
      ],
      toast: useToast(),
    }
  },
  methods: {
    toggleSidebar() {
      this.collapsed = !this.collapsed
      this.$emit('updateCollapsed', this.collapsed)
    },
    checkLogin(path) {
      const protectedRoutes = ['/map-bus', '/du-lieu', '/quan-ly-nguoi-dung']
      if (!this.user && protectedRoutes.includes(path)) {
        this.toast.error(this.$t('notification.checkLogin'))
        return
      }
    },
  },
}
</script>

<style scoped>
.sidebar {
  background-color: #3782f5;
  padding: 10px;
  min-height: 100vh;
  transition: 0.3s;
}

.sidebar.collapsed {
  width: 60px;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.nav-link {
  color: #fff;
  padding: 10px;
  display: block;
  font-size: 14px;
  border-radius: 6px;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}
</style>
