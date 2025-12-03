<template>
  <div>
    <BaseHeader />

    <div class="container-fluid px-0">
      <div class="d-flex h-100">
        <div :style="{ width: collapsed ? '60px' : '220px', transition: 'width 0.3s' }">
          <SidebarMenu :user="user" style="height: 100%" @updateCollapsed="collapsed = $event" />
        </div>
        <div class="flex-grow-1 ms-3 mt-3 me-3" style="width: 100%; height: 100%">
          <!-- <div class="row col-12 border-bottom border-dark-subtle border-1 pb-3">
            <BarChart :vehicleList="khoList" />
          </div> -->

          <div class="row mt-3 mb-3">
            <div class="col-12 border-end border-dark-subtle border-1">
              <KhoLineChart :khoList="khoList" />
            </div>
          </div>

          <div
            class="border border-dark-subtle border-2 rounded-3 p-3 bg-white shadow-sm"
            style="font-size: 13px"
          >
            <div class="text-black text-uppercase fs-5 fw-bolder">{{ $t('khoLanh.listKho') }}</div>
            <div class="row g-2 mb-3">
              <div class="col-md-4">
                <input
                  v-model="searchText"
                  type="text"
                  class="form-control"
                  :placeholder="$t('khoLanh.button.search')"
                />
              </div>
              <div class="col-md-3">
                <select v-model="filterLoaiKho" class="form-select">
                  <option value="">{{ $t('khoLanh.button.filter.all') }}</option>
                  <option value="Khô">{{ $t('khoLanh.button.filter.kho') }}</option>
                  <option value="Lạnh">{{ $t('khoLanh.button.filter.lanh') }}</option>
                </select>
              </div>
              <div class="col-md-2">
                <button class="btn btn-primary w-100" @click="fetchSheetData">
                  <i class="fas fa-sync-alt"></i> {{ $t('khoLanh.button.reload') }}
                </button>
              </div>
              <div class="col-md-3 text-end">
                <button class="btn btn-success w-100" @click="exportToExcel">
                  <i class="fas fa-file-excel"></i> {{ $t('khoLanh.button.exportExcel') }}
                </button>
              </div>
            </div>

            <div class="table-responsive" style="max-height: 550px; overflow-y: auto">
              <table class="table table-striped table-bordered align-middle text-center">
                <thead class="table-light">
                  <tr>
                    <th>{{ $t('khoLanh.table.no') }}</th>
                    <th>{{ $t('khoLanh.table.maKho') }}</th>
                    <th>{{ $t('khoLanh.table.loaiKho') }}</th>
                    <th>{{ $t('khoLanh.table.hangHoa') }}</th>
                    <th>{{ $t('khoLanh.table.toaNha') }}</th>
                    <th>{{ $t('khoLanh.table.nhietDo') }}</th>
                    <th>{{ $t('khoLanh.table.doAm') }}</th>
                    <th>{{ $t('khoLanh.table.coNguoi') }}</th>
                    <th>{{ $t('khoLanh.table.createDate') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(v, index) in paginatedList" :key="v.maKho">
                    <td>{{ index + 1 }}</td>
                    <td>{{ v.maKho }}</td>
                    <td>{{ v.loaiKho }}</td>
                    <td>{{ v.hangHoa }}</td>
                    <td>{{ v.toaNha }}</td>
                    <td>{{ v.nhietDo }}</td>
                    <td>{{ v.doAm }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="v.coNguoi === '1' ? 'bg-success' : 'bg-secondary'"
                      >
                        {{
                          v.coNguoi === '1'
                            ? $t('khoLanh.table.hasPerson')
                            : $t('khoLanh.table.noPerson')
                        }}
                      </span>
                    </td>
                    <td>{{ v.thoiGian }}</td>
                  </tr>
                </tbody>
              </table>

              <div v-if="filteredKhoList.length === 0" class="text-center py-3 text-muted">
                {{ $t('khoLanh.table.noData') }}
              </div>
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
          </div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import KhoLineChart from './charts/kho/KhoLineChart.vue'
import BaseHeader from './common/BaseHeader.vue'
import SidebarMenu from './common/SidebarMenu.vue'

export default {
  name: 'DuLieuKhoLanh',
  components: { BaseHeader, SidebarMenu, KhoLineChart },

  data() {
    return {
      khoList: [],
      searchText: '',
      filterLoaiKho: '',
      sheetId: '1azXTmdVEGAJkRxF6fxtVKt5LxMHo_Vp4xubCB_9wmSs',
      apiKey: 'AIzaSyBJOLTWvnRRegbkw1rRvr0K2dzV9SZ_Mwk',
      range: 'KhoLanh!A:H',
      currentPage: 1,
      itemsPerPage: 10,
      user: JSON.parse(localStorage.getItem('googleUser') || 'null'),
      collapsed: false,
      message: '',
      toast: null,
      success: false,
      loading: false,
    }
  },

  computed: {
    filteredKhoList() {
      return this.khoList
        .filter((v) => {
          const text = this.searchText.trim().toLowerCase()
          const matchText =
            v.maKho.toLowerCase().includes(text) ||
            v.hangHoa.toLowerCase().includes(text) ||
            v.toaNha.toLowerCase().includes(text)

          const matchLoaiKho = !this.filterLoaiKho || v.loaiKho === this.filterLoaiKho

          return matchText && matchLoaiKho
        })
        .sort((a, b) => this.parseThoiGian(b.thoiGian) - this.parseThoiGian(a.thoiGian))
    },

    totalPages() {
      return Math.ceil(this.filteredKhoList.length / this.itemsPerPage)
    },

    paginatedList() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredKhoList.slice(start, end)
    },
  },

  methods: {
    parseThoiGian(str) {
      const [date, time] = str.split(' ')
      const [day, month, year] = date.split('/')
      const [hours, minutes, seconds] = time.split(':')
      return new Date(+year, +month - 1, +day, +hours, +minutes, +seconds)
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },

    goToPage(page) {
      this.currentPage = page
    },

    exportToExcel() {
      const data = this.filteredKhoList.map((v, i) => ({
        STT: i + 1,
        [this.$t('khoLanh.table.maKho')]: v.maKho,
        [this.$t('khoLanh.table.loaiKho')]: v.loaiKho,
        [this.$t('khoLanh.table.hangHoa')]: v.hangHoa,
        [this.$t('khoLanh.table.toaNha')]: v.toaNha,
        [this.$t('khoLanh.table.nhietDo')]: v.nhietDo,
        [this.$t('khoLanh.table.doAm')]: v.doAm,
        [this.$t('khoLanh.table.coNguoi')]:
          v.coNguoi === '1'
            ? this.$t('khoLanh.table.hasPerson')
            : this.$t('khoLanh.table.noPerson'),
        [this.$t('khoLanh.table.createDate')]: v.thoiGian,
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'KhoLanh')
      XLSX.writeFile(wb, 'Danh sách kho.xlsx')
    },

    async fetchSheetData() {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`,
        )
        const data = await res.json()
        if (!data.values) return

        const rows = data.values.slice(1)
        const recordsByMaKho = {}

        rows.forEach((row) => {
          const maKho = row[1]
          if (!maKho) return

          const [datePart, timePart] = row[0].split(' ')
          const [day, month, year] = datePart.split('/')
          const thoiGian = new Date(`${year}-${month}-${day}T${timePart}`)

          if (isNaN(thoiGian)) return

          if (!recordsByMaKho[maKho]) {
            recordsByMaKho[maKho] = []
          }

          recordsByMaKho[maKho].push({
            thoiGian,
            row,
          })
        })

        const latestRows = []

        Object.keys(recordsByMaKho).forEach((maKho) => {
          const list = recordsByMaKho[maKho].sort((a, b) => b.thoiGian - a.thoiGian)
          const newest = list[0].row
          latestRows.push(newest)
        })

        const khos = []

        for (const row of latestRows) {
          const [
            thoiGian = '',
            maKho = '',
            loaiKho = '',
            hangHoa = '',
            toaNha = '',
            nhietDo = '',
            doAm = '',
            coNguoi = '0',
          ] = row

          khos.push({
            thoiGian,
            maKho,
            loaiKho,
            hangHoa,
            toaNha,
            nhietDo: parseFloat(nhietDo) || 0,
            doAm: parseFloat(doAm) || 0,
            coNguoi,
          })
        }

        this.khoList = khos
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error)
      }
    },
  },

  mounted() {
    this.fetchSheetData()
    this.toast = useToast()
  },
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3490dc;
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

.table th,
.table td {
  vertical-align: middle !important;
}
.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
