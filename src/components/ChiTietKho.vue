<template>
  <BaseHeader />

  <div class="container-fluid px-0">
    <div class="d-flex h-100">
      <div :style="{ width: collapsed ? '60px' : '220px', transition: 'width 0.3s' }">
        <SidebarMenu :user="user" style="height: 100%" @updateCollapsed="collapsed = $event" />
      </div>
      <div class="flex-grow-1 ms-3 mt-3 me-3" style="width: 100%; height: 100%">
        <h3>{{ $t('khoLanh.detail') }} {{ maKho }}</h3>

        <div v-if="latest" class="row mb-3">
          <div class="col-3">
            <div class="card shadow-sm border-primary stat-card h-100">
              <div class="p-2 d-flex align-items-center justify-content-center h-100">
                <div class="row align-items-center text-center w-100">
                  <div class="text-danger fs-1 col-4">
                    <i class="fa-solid fa-temperature-high"></i>
                  </div>
                  <div class="col-8">
                    <div class="fw-normal text-black mb-1">{{ $t('khoLanh.card.nhietDo') }}</div>
                    <div class="fs-3 fw-bolder">{{ latest.nhietDo }}°C</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-3">
            <div class="card shadow-sm border-primary stat-card h-100">
              <div class="p-2 d-flex align-items-center justify-content-center h-100">
                <div class="row align-items-center text-center w-100">
                  <div class="text-success fs-1 col-4">
                    <i class="fa-solid fa-microchip"></i>
                  </div>
                  <div class="col-8">
                    <div class="fw-normal text-black mb-1">
                      {{ $t('khoLanh.card.nhietDoThietBi') }}
                    </div>
                    <div class="fs-3 fw-bolder">{{ latest.nhietDoThietBi }}°C</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-3">
            <div class="card shadow-sm border-primary stat-card h-100">
              <div class="p-2 d-flex align-items-center justify-content-center h-100">
                <div class="row align-items-center text-center w-100">
                  <div class="text-primary fs-1 col-4">
                    <i class="fa-solid fa-droplet"></i>
                  </div>
                  <div class="col-8">
                    <div class="fw-normal text-black mb-1">{{ $t('khoLanh.card.doAm') }}</div>
                    <div class="fs-3 fw-bolder">{{ latest.doAm }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-3">
            <div class="card shadow-sm border-primary stat-card h-100">
              <div class="p-2 d-flex align-items-center justify-content-center h-100">
                <div class="row align-items-center text-center w-100">
                  <div class="text-warning fs-1 col-4">
                    <i class="fa-solid fa-clock"></i>
                  </div>
                  <div class="col-8">
                    <div class="fw-normal text-black mb-1">{{ $t('khoLanh.card.capNhatLuc') }}</div>
                    <div class="fw-bolder">{{ latest.thoiGian }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <div class="fw-bolder text-black text-uppercase mb-2 mt-2 fs-5">
            {{ $t('khoLanh.tongHopData') }}
          </div>
          <table class="table table-bordered table-striped text-start">
            <thead class="table-light">
              <tr>
                <th>{{ $t('khoLanh.table.createDate') }}</th>
                <th>{{ $t('khoLanh.table.nhietDo') }}</th>
                <th>{{ $t('khoLanh.table.doAm') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in paginatedList" :key="i">
                <td>{{ r.thoiGian }}</td>
                <td>{{ r.nhietDo }}</td>
                <td>{{ r.doAm }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div>
            {{ $t('khoLanh.pagination.display') }}
            <select v-model.number="itemsPerPage" class="form-select d-inline w-auto mx-2">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
            </select>
            {{ $t('khoLanh.pagination.rowPerPage') }}
          </div>

          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="prevPage">
                  {{ $t('khoLanh.button.firstPage') }}
                </button>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="goToPage(page)">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="nextPage">
                  {{ $t('khoLanh.button.lastPage') }}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div class="col-12 text-center mt-3">
          <button class="btn btn-secondary" @click="$router.back()">
            {{ $t('khoLanh.button.back') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-5">{{ $t('khoLanh.loading') }}</div>
  </div>
</template>

<script>
import BaseHeader from './common/BaseHeader.vue'
import SidebarMenu from './common/SidebarMenu.vue'

export default {
  props: ['maKho'],
  components: { BaseHeader, SidebarMenu },

  data() {
    return {
      list: [],
      loading: false,
      user: JSON.parse(localStorage.getItem('googleUser') || 'null'),
      sheetId: '1azXTmdVEGAJkRxF6fxtVKt5LxMHo_Vp4xubCB_9wmSs',
      apiKey: 'AIzaSyBJOLTWvnRRegbkw1rRvr0K2dzV9SZ_Mwk',
      range: 'KhoLanh!A:I',
      latest: null,
      collapsed: false,
      currentPage: 1,
      itemsPerPage: 10,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.list.length / this.itemsPerPage)
    },

    paginatedList() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.list.slice(start, end)
    },
  },

  methods: {
    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },

    goToPage(page) {
      this.currentPage = page
    },

    async fetchAllRecords() {
      this.loading = true

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`,
      )

      const data = await res.json()
      const rows = data.values?.slice(1) || []

      const records = rows
        .filter((r) => r[1] === this.maKho)
        .map((row) => {
          const [
            thoiGian,
            maKho,
            loaiKho,
            hangHoa,
            toaNha,
            nhietDo,
            doAm,
            coNguoi,
            nhietDoThietBi,
          ] = row

          return {
            thoiGian,
            maKho,
            loaiKho,
            hangHoa,
            toaNha,
            nhietDo,
            doAm,
            coNguoi,
            nhietDoThietBi,
          }
        })
        .sort((a, b) => this.parseThoiGian(b.thoiGian) - this.parseThoiGian(a.thoiGian))

      this.list = records
      this.latest = records.length ? records[0] : null

      this.loading = false
    },

    parseThoiGian(str) {
      const [date, time] = str.split(' ')
      const [d, m, y] = date.split('/')
      const [h, min, s] = time.split(':')
      return new Date(+y, +m - 1, +d, +h, +min, +s)
    },
  },

  mounted() {
    this.fetchAllRecords()
  },
}
</script>
<style>
.stat-card {
  transition: 0.25s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.icon-box {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
