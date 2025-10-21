<template>
  <div>
    <BaseHeader />

    <div class="container-fluid px-0 mt-3 mb-3">
      <div class="border border-dark-subtle border-2 rounded-3 p-3 bg-white shadow-sm">
        <!-- Bộ lọc tìm kiếm -->
        <div class="row g-2 mb-3">
          <div class="col-md-4">
            <input
              v-model="searchText"
              type="text"
              class="form-control"
              :placeholder="$t('data.button.search')"
            />
          </div>
          <div class="col-md-3">
            <select v-model="filterStatus" class="form-select">
              <option value="">{{ $t('data.button.filter.all') }}</option>
              <option value="1">{{ $t('data.button.filter.active') }}</option>
              <option value="0">{{ $t('data.button.filter.inactive') }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" @click="fetchSheetData">
              <i class="fas fa-sync-alt"></i> {{ $t('data.button.reload') }}
            </button>
          </div>
          <div class="col-md-3 text-end">
            <button class="btn btn-success w-100" @click="exportToExcel">
              <i class="fas fa-file-excel"></i> {{ $t('data.button.exportExcel') }}
            </button>
          </div>
        </div>

        <!-- Bảng dữ liệu -->
        <div class="table-responsive" style="max-height: 550px; overflow-y: auto">
          <table class="table table-striped table-bordered align-middle text-center">
            <thead class="table-light">
              <tr>
                <th>{{ $t('data.table.no') }}</th>
                <th>{{ $t('data.table.licenseNumber') }}</th>
                <th>{{ $t('data.table.carName') }}</th>
                <th>{{ $t('data.table.temperature') }}</th>
                <th>{{ $t('data.table.driverName') }}</th>
                <th>{{ $t('data.table.phoneNumber') }}</th>
                <th>{{ $t('data.table.address') }}</th>
                <th>{{ $t('data.table.status') }}</th>
                <th>{{ $t('data.table.createDate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, index) in filteredVehicleList" :key="v.bienSoXe">
                <td>{{ index + 1 }}</td>
                <td>{{ v.bienSoXe }}</td>
                <td>{{ v.tenXe }}</td>
                <td>{{ v.nhietDo }}</td>
                <td>{{ v.tenTaiXe }}</td>
                <td>{{ v.soDienThoai }}</td>
                <td>{{ v.address }}</td>
                <td>
                  <span class="badge" :class="v.trangThai === '1' ? 'bg-success' : 'bg-secondary'">
                    {{ v.trangThai === '1' ? $t('data.table.active') : $t('data.table.inactive') }}
                  </span>
                </td>
                <td>{{ v.ngayNhap }}</td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredVehicleList.length === 0" class="text-center py-3 text-muted">
            {{ $t('data.table.noData') }}
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div>
            {{ $t('data.pagination.display') }}
            <select v-model.number="itemsPerPage" class="form-select d-inline w-auto mx-2">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
            </select>
            {{ $t('data.pagination.rowPerPage') }}
          </div>

          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="prevPage">
                  {{ $t('data.button.firstPage') }}
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
                  {{ $t('data.button.lastPage') }}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import BaseHeader from './common/BaseHeader.vue'

export default {
  name: 'TruyXuatDuLieu',
  components: { BaseHeader },

  data() {
    return {
      vehicleList: [],
      searchText: '',
      filterStatus: '',
      sheetId: '1azXTmdVEGAJkRxF6fxtVKt5LxMHo_Vp4xubCB_9wmSs',
      apiKey: 'AIzaSyBJOLTWvnRRegbkw1rRvr0K2dzV9SZ_Mwk',
      range: 'A:J',
      currentPage: 1,
      itemsPerPage: 10,
    }
  },

  computed: {
    filteredVehicleList() {
      return this.vehicleList
        .filter((v) => {
          const text = this.searchText.trim().toLowerCase()
          const matchText =
            v.tenXe.toLowerCase().includes(text) ||
            v.bienSoXe.toLowerCase().includes(text) ||
            v.tenTaiXe.toLowerCase().includes(text)

          const matchStatus = !this.filterStatus || v.trangThai === this.filterStatus

          return matchText && matchStatus
        })
        .sort((a, b) => new Date(b.ngayNhap).getTime() - new Date(a.ngayNhap).getTime())
    },

    totalPages() {
      return Math.ceil(this.filteredVehicleList.length / this.itemsPerPage)
    },

    paginatedList() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredVehicleList.slice(start, end)
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

    exportToExcel() {
      const data = this.filteredVehicleList.map((v, i) => ({
        STT: i + 1,
        [this.$t('data.table.licenseNumber')]: v.bienSoXe,
        [this.$t('data.table.carName')]: v.tenXe,
        [this.$t('data.table.temperature')]: v.nhietDo,
        [this.$t('data.table.driverName')]: v.tenTaiXe,
        [this.$t('data.table.phoneNumber')]: v.soDienThoai,
        [this.$t('data.table.address')]: v.address,
        [this.$t('data.table.status')]:
          v.trangThai === '1' ? [this.$t('data.table.active')] : [this.$t('data.table.inactive')],
        [this.$t('data.table.createDate')]: v.ngayNhap,
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'PhuongTien')
      XLSX.writeFile(wb, 'ListData.xlsx')
    },

    async fetchSheetData() {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`,
        )
        const data = await res.json()
        if (!data.values) return

        const rows = data.values.slice(1)
        const latestByBienSo = {}

        rows.forEach((row) => {
          const bienSoXe = row[1]
          const [datePart, timePart] = row[0].split(' ')
          const [day, month, year] = datePart.split('/')
          const ngayNhap = new Date(`${year}-${month}-${day}T${timePart}`)

          if (bienSoXe && !isNaN(ngayNhap)) {
            const current = latestByBienSo[bienSoXe]
            if (!current) {
              latestByBienSo[bienSoXe] = row
            } else {
              const [curDatePart, curTimePart] = current[0].split(' ')
              const [curDay, curMonth, curYear] = curDatePart.split('/')
              const currentNgayNhap = new Date(`${curYear}-${curMonth}-${curDay}T${curTimePart}`)

              if (ngayNhap > currentNgayNhap) {
                latestByBienSo[bienSoXe] = row
              }
            }
          }
        })

        const latestRows = Object.values(latestByBienSo)
        const vehicles = []

        for (const row of latestRows) {
          const [
            ngayNhap = '',
            bienSoXe = '',
            tenXe = '',
            trangThai = '0',
            lngStr = '',
            latStr = '',
            nhietDo = '',
            maNhanVien = '-',
            tenTaiXe = '-',
            soDienThoai = '-',
          ] = row

          const lat = parseFloat(this.normalizeNumberString(latStr))
          const lng = parseFloat(this.normalizeNumberString(lngStr, true))
          if (isNaN(lat) || isNaN(lng)) continue

          vehicles.push({
            ngayNhap,
            bienSoXe,
            tenXe,
            trangThai,
            lat,
            lng,
            nhietDo: parseFloat(nhietDo) || 0,
            maNhanVien,
            tenTaiXe,
            soDienThoai: soDienThoai
              ? soDienThoai.startsWith('84')
                ? '+84 ' + soDienThoai.slice(2)
                : soDienThoai
              : '-',
            address: this.$t('data.loading'),
          })
        }

        this.vehicleList = vehicles
        this.loadAddressesAsync()
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error)
      }
    },

    normalizeNumberString(str, isLng = false) {
      if (!str) return ''

      str = str.replace(/[^0-9.]/g, '')
      const parts = str.split('.')
      if (parts.length > 2) {
        const integerPart = parts[0]
        const decimalPart = parts.slice(1).join('')
        str = `${integerPart}.${decimalPart}`
      }

      let num = parseFloat(str)
      if (isNaN(num)) return ''

      if (isLng && num < 11) {
        num = num * 10
      }

      return num.toString()
    },

    async loadAddressesAsync() {
      for (const v of this.vehicleList) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${v.lat}&lon=${v.lng}&format=json`,
          )
          const json = await res.json()
          v.address = json.display_name || this.$t('data.unknown')
        } catch {
          v.address = this.$t('data.unknown')
        }
      }
    },
  },

  mounted() {
    this.fetchSheetData()
  },
}
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle !important;
}
.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
