<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-banner w-100" style="height: 50px">
    <div class="container-fluid row fw-bolder" style="font-size: 12px">
      <div class="col-6 row">
        <div class="col-6">
          <LanguageSwitcher class="position-absolute top-0 start-0 mt-1 ms-2" />
        </div>
        <div class="col-6"></div>
      </div>

      <div class="col-6 row text-end align-items-center">
        <template v-if="!user">
          <div class="col-4 text-white d-flex justify-content-end align-items-center"></div>
          <div class="col-4 text-white d-flex justify-content-end align-items-center"></div>
          <div class="col-4 text-white d-flex justify-content-end align-items-center">
            <a href="/dang-nhap" class="navbar-brand text-white d-flex align-items-center fs-6"
              ><i class="fas fa-sign-in-alt"></i>
              <span class="ms-2">{{ $t('header.navigation.login') }}</span></a
            >
          </div>
          <!-- <div class="col-12 d-flex justify-content-end">
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
          </div> -->
        </template>

        <template v-else>
          <div class="col-4 text-white d-flex justify-content-end align-items-center">
            <i class="fas fa-envelope"></i> <span class="ms-2">{{ user.email }}</span>
          </div>
          <div class="col-4 text-white d-flex justify-content-end align-items-center">
            <i class="fas fa-user"></i> <span class="ms-2">{{ user.name }}</span>
          </div>
          <div class="col-4 logout-btn" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            <span class="ms-2">{{ $t('header.navigation.logout') }}</span>
          </div>
        </template>
      </div>
    </div>
  </nav>

  <!-- <nav class="navbar navbar-expand-lg navbar-dark w-100">
    <div class="container">
      <router-link class="navbar-brand fw-bold text-black d-flex align-items-center" to="/">
        <img
          src="https://res.cloudinary.com/springboot-cloud/image/upload/v1760101127/logo_xp5752.png"
          alt="CM-GROUP"
          width="100%"
          height="80px"
        />
      </router-link>
    </div>
  </nav> -->

  <!-- <nav class="navbar navbar-expand-lg navbar-dark bg-banner w-100">
    <div class="container-fluid">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
        <ul class="navbar-nav text-capitalize">
          <li class="nav-item">
            <router-link class="nav-link" to="/" @click.prevent="checkLogin('/')">{{
              $t('header.navigation.homePage')
            }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/map-bus" @click.prevent="checkLogin('/map-bus')">{{
              $t('header.navigation.mapBus')
            }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/du-lieu" @click.prevent="checkLogin('/du-lieu')">{{
              $t('header.navigation.data')
            }}</router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link"
              to="/quan-ly-nguoi-dung"
              @click.prevent="checkLogin('/quan-ly-nguoi-dung')"
              >{{ $t('header.navigation.account') }}</router-link
            >
          </li>
        </ul>
      </div>
    </div>
  </nav> -->

  <nav
    class="navbar navbar-expand-lg navbar-dark bg-dark-subtle w-100"
    style="padding-top: 5px; padding-bottom: 5px"
  >
    <div class="container">
      <div class="collapse navbar-collapse justify-content-start" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item" v-for="item in activeNavItems" :key="item.to">
            <router-link
              class="nav-link d-flex align-items-center text-uppercase fw-bolder"
              style="font-size: 14px; color: #183153"
              :to="item.to"
            >
              <i :class="[item.icon, 'me-2']"></i>
              <span class="me-2">/</span>
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { eventBus } from '@/eventBus'
import { useToast } from 'vue-toastification'
import LanguageSwitcher from '../LanguageSwitcher.vue'

export default {
  name: 'BaseHeader',
  components: {
    LanguageSwitcher,
  },
  data() {
    return {
      user: null,
      clientId: '954414108201-06v6lu48msd5hu6jkfgc77sit28i3gvl.apps.googleusercontent.com',
      toast: null,
      navItems: [],
    }
  },
  mounted() {
    const savedUser = localStorage.getItem('googleUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      const now = new Date().getTime()

      if (user.expiresAt && now < user.expiresAt) {
        this.user = user
      } else {
        localStorage.removeItem('googleUser')
        this.user = null
      }
    }
    this.loadGoogleScript()
    window.handleCredentialResponse = this.handleCredentialResponse
    this.toast = useToast()
    this.setNavItems()
  },
  computed: {
    activeNavItems() {
      const current = this.$route.path
      if (current.startsWith('/kho-lanh')) {
        return this.navItems.filter((item) => item.to === '/kho-lanh')
      }
      if (current === '/' || current === '/trang-chu') {
        return this.navItems.filter((item) => item.to === '/' || item.to === '/trang-chu')
      }
      return this.navItems.filter((item) => current === item.to)
    },
  },
  watch: {
    '$i18n.locale'() {
      this.setNavItems()
    },
  },
  methods: {
    setNavItems() {
      this.navItems = [
        { to: '/', label: this.$t('header.navigation.homePage'), icon: 'fas fa-home' },
        {
          to: '/map-bus',
          label: this.$t('header.navigation.mapBus'),
          icon: 'fas fa-map-marked-alt',
        },
        { to: '/du-lieu', label: this.$t('header.navigation.data'), icon: 'fas fa-database' },
        { to: '/kho-lanh', label: this.$t('header.navigation.khoLanh'), icon: 'fas fa-warehouse' },
        {
          to: '/kho-lanh/:maKho',
          label: this.$t('header.navigation.khoLanh'),
          icon: 'fas fa-warehouse',
        },
        {
          to: '/quan-ly-nguoi-dung',
          label: this.$t('header.navigation.account'),
          icon: 'fas fa-users-cog',
        },
      ]
    },
    checkLogin(path) {
      const protectedRoutes = ['/map-bus', '/quan-ly-nguoi-dung', '/kho-lanh', '/du-lieu']
      if (!this.user && protectedRoutes.includes(path)) {
        this.toast.error(this.$t('notification.checkLogin'))
        return
      }

      this.$router.push(path)
    },
    loadGoogleScript() {
      if (document.getElementById('gsi-script')) return
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.id = 'gsi-script'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    },

    async handleCredentialResponse(response) {
      const credential = response.credential
      const payload = this.parseJwt(credential)
      const now = new Date().getTime()
      const EXPIRATION_HOURS = 12

      this.user = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        family_name: payload.family_name,
        given_name: payload.given_name,
        expiresAt: now + EXPIRATION_HOURS * 60 * 60 * 1000,
      }

      localStorage.setItem('googleUser', JSON.stringify(this.user))
      eventBus.emit('userLoggedIn', this.user)

      try {
        const params = new URLSearchParams({
          action: 'save',
          ho: this.user.family_name,
          ten: this.user.given_name,
          hoVaTen: this.user.name,
          email: this.user.email,
          linkAnh: this.user.picture,
        }).toString()

        const SHEET_URL =
          'https://script.google.com/macros/s/AKfycbwLVCQ8MP03YK4EfC241DEl8VQIOCxQc0nivgeQY3NPKexeoAqZ7zaptXjks9tFMARK/exec?' +
          params

        const res = await fetch(SHEET_URL)
        const data = await res.json()

        if (data.status === 'success') {
          this.message = this.$t('notification.successSave')
          this.success = true
        } else {
          this.message = this.$t('notification.error') + data.message
          this.success = false
        }
      } catch (err) {
        this.message = this.$t('notification.error') + err.message
        this.success = false
      }
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
  background-color: #3782f5;
}
.nav-link {
  font-weight: 500;
  color: #ffffff;
  transition: color 0.3s ease;
  padding: 0px 40px !important;
  font-size: 17px;
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
  color: white;
  cursor: pointer;
  transition: color 0.2s ease;
}
.logout-btn:hover {
  color: red;
}
</style>
