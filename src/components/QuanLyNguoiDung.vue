<template>
  <BaseHeader />
  <div class="container mx-auto p-4 max-w-md">
    <form @submit.prevent="submitForm">
      <div class="row g-4">
        <div class="col-12 col-md-3 text-center">
          <div
            class="border rounded overflow-hidden mb-2 mx-auto"
            style="width: 150px; height: 150px"
          >
            <img
              src="https://res.cloudinary.com/springboot-cloud/image/upload/v1760115196/user_vcqlq3.webp"
              alt="Avatar"
              class="img-fluid w-100 h-100"
              loading="lazy"
            />
          </div>

          <div class="mb-3 row g-2 align-items-center visually-hidden">
            <label class="col-auto col-form-label me-1 pe-1"
              >{{ $t('user.label.imageLink') }}:</label
            >
            <div class="col">
              <input v-model="form.linkAnh" type="text" class="form-control" />
            </div>
          </div>
        </div>

        <div class="col-12 col-md-9">
          <div class="mb-3 row g-2 align-items-center">
            <div class="col-3">
              <label class="col-auto col-form-label">{{ $t('user.label.surname') }}:</label>
            </div>
            <div class="col-6">
              <input v-model="form.ho" type="text" class="form-control" />
            </div>
          </div>

          <div class="mb-3 row g-2 align-items-center">
            <div class="col-3">
              <label class="col-auto col-form-label">{{ $t('user.label.name') }}:</label>
            </div>
            <div class="col-6">
              <input v-model="form.ten" type="text" class="form-control" />
            </div>
          </div>

          <div class="mb-3 row g-2 align-items-center">
            <div class="col-3">
              <label class="col-auto col-form-label">{{ $t('user.label.fullname') }}:</label>
            </div>
            <div class="col-6">
              <input v-model="form.hoVaTen" type="text" class="form-control" />
            </div>
          </div>

          <div class="mb-3 row g-2 align-items-center">
            <div class="col-3">
              <label class="col-auto col-form-label">{{ $t('user.label.dob') }}:</label>
            </div>
            <div class="col-6">
              <input v-model="form.ngaySinh" type="date" class="form-control" />
            </div>
          </div>

          <div class="mb-3 row g-2 align-items-center">
            <div class="col-3">
              <label class="col-auto col-form-label">{{ $t('user.label.phoneNumber') }}:</label>
            </div>
            <div class="col-6">
              <input v-model="form.soDienThoai" type="tel" class="form-control" />
            </div>
          </div>

          <div class="mb-3 row g-2 align-items-center">
            <div class="col-3">
              <label class="col-auto col-form-label">{{ $t('user.label.email') }}:</label>
            </div>
            <div class="col-6">
              <input v-model="form.email" type="email" class="form-control" />
            </div>
          </div>

          <div class="mb-3 row g-2 align-items-center">
            <div class="col-3">
              <label class="col-auto col-form-label">{{ $t('user.label.address') }}:</label>
            </div>
            <div class="col-6">
              <input v-model="form.diaChi" type="text" class="form-control" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3 text-center">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ $t('user.button.save') }}
        </button>
      </div>
    </form>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification'
import BaseHeader from './common/BaseHeader.vue'

export default {
  components: { BaseHeader },
  data() {
    return {
      form: {
        ho: '',
        ten: '',
        hoVaTen: '',
        ngaySinh: '',
        soDienThoai: '',
        email: '',
        diaChi: '',
        linkAnh: '',
        ngayTao: '',
      },
      message: '',
      success: false,
      toast: null,
      loading: false,
    }
  },
  mounted() {
    const storedUser = localStorage.getItem('googleUser')
    let email = ''
    if (storedUser) {
      const user = JSON.parse(storedUser)
      email = user.email || ''
      this.form.linkAnh = user.picture || ''
    }

    if (email) {
      this.loadDataByEmail(email)
    }

    this.toast = useToast()
  },
  methods: {
    toInputDate(value) {
      if (!value) return ''
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
      const parts = value.split('/')
      if (parts.length === 3) {
        const [day, month, year] = parts
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      }
      return ''
    },
    async loadDataByEmail(email) {
      this.loading = true
      try {
        const SHEET_URL =
          'https://script.google.com/macros/s/AKfycbwLVCQ8MP03YK4EfC241DEl8VQIOCxQc0nivgeQY3NPKexeoAqZ7zaptXjks9tFMARK/exec?' +
          new URLSearchParams({
            action: 'getAllByEmail',
            email: email,
          }).toString()

        const res = await fetch(SHEET_URL)
        const result = await res.json()

        if (result.status === 'success' && result.data) {
          const latest = result.data

          this.form.ho = latest.ho || ''
          this.form.ten = latest.ten || ''
          this.form.hoVaTen = latest.hoVaTen || ''
          this.form.ngaySinh = this.toInputDate(latest.ngaySinh)
          this.form.soDienThoai = latest.soDienThoai || ''
          this.form.email = latest.email || email
          this.form.diaChi = latest.diaChi || ''
          this.form.linkAnh = latest.linkAnh || this.form.linkAnh
        } else {
          const storedUser = localStorage.getItem('googleUser')
          if (storedUser) {
            const user = JSON.parse(storedUser)
            this.form.ho = user.family_name || ''
            this.form.ten = user.given_name || ''
            this.form.hoVaTen = user.name || ''
            this.form.email = user.email || ''
            this.form.linkAnh = user.picture || ''
          }
        }
      } catch (err) {
        this.toast.error(this.$t('notification.error') + err.message)
      } finally {
        this.loading = false
      }
    },
    async submitForm() {
      this.loading = true

      try {
        const params = new URLSearchParams({
          action: 'save',
          ...this.form,
          soDienThoai: String(this.form.soDienThoai),
        }).toString()

        const SHEET_URL =
          'https://script.google.com/macros/s/AKfycbwLVCQ8MP03YK4EfC241DEl8VQIOCxQc0nivgeQY3NPKexeoAqZ7zaptXjks9tFMARK/exec?' +
          params

        const res = await fetch(SHEET_URL)
        const data = await res.json()

        if (data.status === 'success') {
          this.message = this.$t('notification.successSave')
          this.success = true
          this.toast.success(this.message)
        } else {
          this.message = this.$t('notification.error') + data.message
          this.success = false
          this.toast.error(this.message)
        }
      } catch (err) {
        this.message = this.$t('notification.error') + err.message
        this.success = false
        this.toast.error(this.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.container {
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Overlay toàn màn hình khi loading */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

/* Spinner */
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3490dc; /* màu xanh */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
