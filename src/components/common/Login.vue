<template>
  <div
    class="home-container p-0 m-0"
    style="background: linear-gradient(135deg, #000000 0%, #ff0000 100%)"
    role="main"
  >
    <div class="hero-section p-0">
      <div class="container pt-3 pb-3">
        <LanguageSwitcher class="position-absolute top-0 start-0 m-3" />

        <div class="row">
          <div class="col-12 align-items-center text-center mb-3">
            <div class="">
              <a href="/" rel="noopener noreferrer" title="CM-GROUP">
                <img
                  height="150px"
                  width="150px"
                  src="https://res.cloudinary.com/springboot-cloud/image/upload/v1763911080/logo_ychkz3.png"
                  alt="CM-GROUP"
                  title="CM-GROUP"
                />
              </a>
            </div>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-12 col-lg-10 col-xl-8">
            <div class="card login-card p-4 p-lg-5">
              <div class="row">
                <!-- FORM -->
                <div class="col-12 col-lg-5 text-black">
                  <div class="fw-bold text-uppercase fs-5">
                    {{ $t('auth.title.login') }}
                  </div>

                  <form class="isFormMobile">
                    <div class="row">
                      <div class="col-12 mb-3">
                        <div class="block-error">{{ error }}</div>

                        <div class="form-floating mb-3">
                          <input
                            type="text"
                            class="form-control"
                            :placeholder="$t('auth.placeholder.username')"
                            required
                            v-model="tenTK"
                          />
                          <label
                            >{{ $t('auth.label.username') }}
                            <span class="text-danger">*</span></label
                          >
                        </div>
                      </div>

                      <div class="col-12 d-flex mb-3">
                        <div class="form-floating flex-grow-1">
                          <input
                            :type="showMatKhau ? 'text' : 'password'"
                            class="form-control rounded-end-0"
                            :placeholder="$t('auth.placeholder.password')"
                            required
                            v-model="matKhau"
                          />
                          <label
                            >{{ $t('auth.label.password') }}
                            <span class="text-danger">*</span></label
                          >
                        </div>

                        <div
                          class="password-toggle-box d-flex align-items-center justify-content-center bg-light"
                          @click="toggleShowPassword"
                        >
                          <i :class="['far', showMatKhau ? 'fa-eye' : 'fa-eye-slash']"></i>
                        </div>
                      </div>

                      <div class="col-12 mb-3">
                        <button class="btn btn-dark btn-lg w-100 text-uppercase" type="submit">
                          {{ $t('auth.button.login') }}
                        </button>
                      </div>

                      <div class="col-12">
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

                      <div class="col-12">
                        <div class="col-12 mt-3 text-center">
                          <button
                            type="button"
                            class="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                          >
                            <i class="fab fa-facebook-f me-2"></i>
                            {{ $t('auth.button.loginFacebook') }}
                          </button>
                        </div>
                      </div>

                      <div class="col-12 text-center">
                        <a href="/" class="text-decoration-none fs-6 text-black">
                          {{ $t('auth.title.backToHome') }}
                        </a>
                      </div>
                    </div>
                  </form>
                </div>

                <!-- DIVIDER -->
                <div
                  class="col-12 col-lg-2 d-flex align-items-center justify-content-center isHiddenMobile"
                >
                  <div class="divider-vertical"></div>
                </div>

                <!-- LOGO -->
                <div
                  class="col-12 mt-5 col-lg-5 align-items-center justify-content-center text-center isHiddenMobile"
                >
                  <div class="main-logo">
                    <img
                      height="250px"
                      width="250px"
                      src="https://res.cloudinary.com/springboot-cloud/image/upload/v1763908444/qrcode_279828851_ac41ee4f397cf8832a1596917f5d47f4_loy2t3.png"
                      alt="CM"
                    />
                  </div>
                  <div class="mt-3">{{ $t('auth.title.qr') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <PopupLoading :isLoading="isLoadingPage" />
</template>

<script lang="ts">
import { useTogglePassword } from '@/composables/useTogglePassword'
import { eventBus } from '@/eventBus'
import { defineComponent, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import LanguageSwitcher from '../LanguageSwitcher.vue'

export default defineComponent({
  name: 'DangNhap',
  components: { LanguageSwitcher },

  data() {
    const { showMatKhau, toggle } = useTogglePassword()
    return {
      tenTK: '',
      matKhau: '',
      email: '',
      tenFace: '',
      linkFace: '',
      error: '',
      isLoadingPage: false,
      showMatKhau,
      toggleShowPassword: toggle,
      isLoggedIn: inject('isLoggedIn'),
      t: useI18n().t,
      toast: useToast(),
      clientId: '954414108201-06v6lu48msd5hu6jkfgc77sit28i3gvl.apps.googleusercontent.com',
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
      if (this.isLoggedIn) this.isLoggedIn.value = true
      this.$router.push('/trang-chu')

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
  },
})
</script>

<style scoped>
.block-error {
  color: #ed1c24;
  margin-bottom: 10px;
  font-size: 15px;
}
.home-container {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
.hero-section {
  position: relative;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url('https://res.cloudinary.com/springboot-cloud/image/upload/v1763946205/b9f1267f81ac399b539c96f68c63cade_j88bld.jpg');
  min-height: 100vh;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: visible;
  padding: 4rem 0;
}
.main-logo img {
  object-fit: cover;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(102, 126, 234, 0.3);
}
.form-floating {
  height: 58px !important;
}

.login-card {
  border-radius: 20px;
  background: #ffffffdd;
  backdrop-filter: blur(6px);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.15),
    0 0 15px rgba(255, 255, 255, 0.15);
}

.password-toggle-box {
  width: 50px;
  border-radius: 0 0.375rem 0.375rem 0;
  cursor: pointer;
}

.divider-vertical {
  width: 1px;
  height: 80%;
  background-color: rgba(0, 0, 0, 0.15);
}

.main-logo img {
  object-fit: cover;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.25),
    0 0 20px rgba(102, 126, 234, 0.3);
}

@media (max-width: 1024px) {
  .isHiddenMobile {
    display: none !important;
  }
}
</style>
