<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark-subtle w-100">
    <div class="container-fluid row fw-bolder">
      <div class="col-6 row justify-content-around">
        <div class="col-6">
          <i class="fas fa-envelope"></i>
          <span>cmgroup@gmail.com</span>
        </div>
        <div class="col-6">
          <i class="fas fa-phone"></i>
          <span>0123456789</span>
        </div>
      </div>

      <div class="col-6 row text-end align-items-center">
        <template v-if="!user">
          <div class="col-12 d-flex justify-content-end">
            <div
              id="g_id_onload"
              data-client_id="954414108201-06v6lu48msd5hu6jkfgc77sit28i3gvl.apps.googleusercontent.com"
              data-context="signin"
              data-ux_mode="popup"
              data-callback="handleCredentialResponse"
              data-auto_prompt="false"
            ></div>

            <div
              class="g_id_signin"
              data-type="standard"
              data-shape="rectangular"
              data-theme="outline"
              data-text="sign_in_with"
              data-size="large"
              data-logo_alignment="left"
            ></div>
          </div>
        </template>

        <template v-else>
          <div class="col-8 d-flex justify-content-end align-items-center">
            <i class="fas fa-user"></i> <span class="ms-2">{{ user.name }}</span>
          </div>
          <div class="col-4 text-danger fw-bold logout-btn" @click="logout">
            <i class="fas fa-sign-out-alt"></i> Đăng xuất
          </div>
        </template>
      </div>
    </div>
  </nav>

  <nav class="navbar navbar-expand-lg navbar-dark bg-banner w-100">
    <div class="container-fluid">
      <router-link class="navbar-brand fw-bold text-black d-flex align-items-center" to="/">
        <img
          src="https://res.cloudinary.com/springboot-cloud/image/upload/v1760017916/cm_logo_ylpem1.jpg"
          alt="CM-GROUP"
          class="logo-navbar"
        />
        <div class="text-center ms-3">
          <div class="brand-title">PHAN NGUYỄN HÀ NAM</div>
          <div class="brand-title">CM-GROUP</div>
          <div class="brand-title text-danger">HỆ THỐNG QUẢN LÝ</div>
        </div>
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Trang chủ</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/map-bus">Map-Bus</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/">Truy xuất dữ liệu</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/">Quản lý người dùng</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { eventBus } from '@/eventBus';

export default {
  name: 'BaseHeader',
  data() {
    return {
      user: null,
      clientId: '954414108201-06v6lu48msd5hu6jkfgc77sit28i3gvl.apps.googleusercontent.com',
    }
  },
  mounted() {
    const savedUser = localStorage.getItem('googleUser')
    if (savedUser) this.user = JSON.parse(savedUser)
    this.loadGoogleScript()
    window.handleCredentialResponse = this.handleCredentialResponse
  },
  methods: {
    loadGoogleScript() {
      if (document.getElementById('gsi-script')) return
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.id = 'gsi-script'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    },

    handleCredentialResponse(response) {
      const credential = response.credential
      const payload = this.parseJwt(credential)

      this.user = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      }

      localStorage.setItem('googleUser', JSON.stringify(this.user))
      eventBus.emit('userLoggedIn', this.user)
      this.$router.push('/')
    },

    parseJwt(token) {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )
      return JSON.parse(jsonPayload)
    },

    logout() {
      this.user = null
      localStorage.removeItem('googleUser')
      window.location.reload()
    },
  },
}
</script>

<style scoped>
.bg-banner {
  background-color: skyblue;
}
.logo-navbar {
  width: 80px;
  height: 80px;
  object-fit: cover;
}
.brand-title {
  font-size: 14px;
}
.nav-link {
  font-weight: 500;
  color: #000;
  transition: color 0.3s ease;
}
.nav-link:hover {
  color: red !important;
}
.avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
}
.logout-btn {
  cursor: pointer;
}
</style>
