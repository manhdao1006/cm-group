<template>
  <div>
    <BaseHeader />

    <div class="container-fluid px-0">
      <div class="d-flex h-100">
        <div :style="{ width: collapsed ? '60px' : '220px', transition: 'width 0.3s' }">
          <SidebarMenu :user="user" style="height: 100%" @updateCollapsed="collapsed = $event" />
        </div>
        <div class="flex-grow-1 ms-3 mt-3 me-3" style="width: 100%; height: 100%">
          <div class="row col-12 border-bottom border-dark-subtle border-1 pb-3">
            <BarChart :vehicleList="vehicleList" />
          </div>

          <div class="row mt-3 mb-3">
            <div class="col-8 border-end border-dark-subtle border-1">
              <LineChart :vehicleList="vehicleList" />
            </div>
            <div class="col-4"><PieChart :vehicleList="vehicleList" /></div>
          </div>

          <div
            class="border border-dark-subtle border-2 rounded-3 p-3 bg-white shadow-sm"
            style="font-size: 13px"
          >
            <div class="text-black text-uppercase fs-5 fw-bolder">{{ $t('data.listCar') }}</div>
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

            <div class="table-responsive" style="max-height: 550px; overflow-y: auto">
              <table class="table table-striped table-bordered align-middle text-center">
                <thead class="table-light">
                  <tr>
                    <th>{{ $t('data.table.no') }}</th>
                    <th>{{ $t('data.table.licenseNumber') }}</th>
                    <!-- <th>{{ $t('data.table.carName') }}</th> -->
                    <th>{{ $t('data.table.temperature') }}</th>
                    <th>{{ $t('data.table.driverName') }}</th>
                    <th>{{ $t('data.table.phoneNumber') }}</th>
                    <th>{{ $t('data.table.address') }}</th>
                    <th>{{ $t('data.table.status') }}</th>
                    <th>{{ $t('data.table.createDate') }}</th>
                    <th>{{ $t('data.table.soLuongDon') }}</th>
                    <th>{{ $t('data.table.soLuongTra') }}</th>
                    <th
                      v-if="
                        user.email === 'manhdao1006@gmail.com' ||
                        user.email === 'hanam17082005@gmail.com'
                      "
                    >
                      {{ $t('data.table.action') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(v, index) in paginatedList" :key="v.bienSoXe">
                    <td>{{ index + 1 }}</td>
                    <td>{{ v.bienSoXe }}</td>
                    <!-- <td>{{ v.tenXe }}</td> -->
                    <td>{{ v.nhietDo }}</td>
                    <td>{{ v.tenTaiXe }}</td>
                    <td>{{ v.soDienThoai }}</td>
                    <td>{{ v.address }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="v.trangThai === '1' ? 'bg-success' : 'bg-secondary'"
                      >
                        {{
                          v.trangThai === '1' ? $t('data.table.active') : $t('data.table.inactive')
                        }}
                      </span>
                    </td>
                    <td>{{ v.ngayNhap }}</td>
                    <td>
                      <template v-if="v._isEditing">
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="v._editDon"
                          min="0"
                        />
                      </template>
                      <template v-else>
                        {{ v.soLuongDon }}
                      </template>
                    </td>

                    <td>
                      <template v-if="v._isEditing">
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="v._editTra"
                          min="0"
                        />
                      </template>
                      <template v-else>
                        {{ v.soLuongTra }}
                      </template>
                    </td>

                    <td
                      v-if="
                        user.email === 'manhdao1006@gmail.com' ||
                        user.email === 'hanam17082005@gmail.com'
                      "
                    >
                      <template v-if="v._isEditing">
                        <div class="d-flex">
                          <button class="btn btn-sm text-success" @click="saveRow(v)">
                            <i class="fa-solid fa-floppy-disk"></i>
                          </button>
                          <button class="btn btn-sm text-danger" @click="cancelEdit(v)">
                            <i class="fa-solid fa-ban"></i>
                          </button>
                        </div>
                      </template>

                      <template v-else>
                        <button class="btn btn-sm text-warning" @click="editRow(v)">
                          <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                      </template>
                    </td>
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
    </div>
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import BarChart from './charts/BarChart.vue'
import LineChart from './charts/LineChart.vue'
import PieChart from './charts/PieChart.vue'
import BaseHeader from './common/BaseHeader.vue'
import SidebarMenu from './common/SidebarMenu.vue'

export default {
  name: 'TruyXuatDuLieu',
  components: { BaseHeader, SidebarMenu, LineChart, PieChart, BarChart },

  data() {
    return {
      vehicleList: [],
      searchText: '',
      filterStatus: '',
      sheetId: '1azXTmdVEGAJkRxF6fxtVKt5LxMHo_Vp4xubCB_9wmSs',
      apiKey: 'AIzaSyBJOLTWvnRRegbkw1rRvr0K2dzV9SZ_Mwk',
      range: 'DATA!A:L',
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
    editRow(v) {
      v._isEditing = true
      v._editDon = v.soLuongDon
      v._editTra = v.soLuongTra
    },
    cancelEdit(v) {
      v._isEditing = false
    },
    async saveRow(v) {
      if (v._editDon < v._editTra) {
        this.toast.error('Số lượng trả không được lớn hơn số lượng đón')
        return
      }
      this.loading = true

      try {
        const params = new URLSearchParams({
          action: 'saveSoLuong',
          bienSoXe: v.bienSoXe,
          tenXe: v.tenXe,
          trangThai: v.trangThai,
          lng: v.lng,
          lat: v.lat,
          nhietDo: v.nhietDo,
          maNhanVien: v.maNhanVien,
          tenTaiXe: v.tenTaiXe,
          soDienThoai: v.soDienThoai,
          soLuongDon: v._editDon || 0,
          soLuongTra: v._editTra || 0,
        }).toString()

        const baseUrl =
          'https://script.google.com/macros/s/AKfycbwsxM1nFX50O9haEMlt1TUE8Lj1ABvpGpwtPyLenEV3P_iiGMRtvkTd99c66uCpbcuwoQ/exec?' +
          params

        const res = await fetch(baseUrl)
        const data = await res.json()

        if (data.status === 'success') {
          this.message = this.$t('notification.successSave')
          this.success = true
          this.toast.success(this.message)
          window.location.reload()
        } else {
          this.message = this.$t('notification.error') + data.message
          this.success = false
          this.toast.error(this.message)
          window.location.reload()
        }
        v.soLuongDon = v._editDon
        v.soLuongTra = v._editTra
        v._isEditing = false
      } catch (error) {
        this.message = this.$t('notification.error') + error.message
        this.success = false
        this.toast.error(this.message)
        window.location.reload()
      } finally {
        this.loading = false
        window.location.reload()
      }
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
      const data = this.filteredVehicleList.map((v, i) => ({
        STT: i + 1,
        [this.$t('data.table.licenseNumber')]: v.bienSoXe,
        [this.$t('data.table.carName')]: v.tenXe,
        [this.$t('data.table.temperature')]: v.nhietDo,
        [this.$t('data.table.driverName')]: v.tenTaiXe,
        [this.$t('data.table.phoneNumber')]: v.soDienThoai,
        [this.$t('data.table.address')]: v.address,
        [this.$t('data.table.status')]:
          v.trangThai === '1' ? this.$t('data.table.active') : this.$t('data.table.inactive'),
        [this.$t('data.table.createDate')]: v.ngayNhap,
        [this.$t('data.table.soLuongDon')]: v.soLuongDon,
        [this.$t('data.table.soLuongTra')]: v.soLuongTra,
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'PhuongTien')
      XLSX.writeFile(wb, 'Danh sách xe.xlsx')
    },

    async fetchSheetData() {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`,
        )
        const data = await res.json()
        if (!data.values) return

        const rows = data.values.slice(1)
        const recordsByBienSo = {}

        rows.forEach((row) => {
          const bienSoXe = row[1]
          if (!bienSoXe) return

          const [datePart, timePart] = row[0].split(' ')
          const [day, month, year] = datePart.split('/')
          const ngayNhap = new Date(`${year}-${month}-${day}T${timePart}`)

          if (isNaN(ngayNhap)) return

          if (!recordsByBienSo[bienSoXe]) {
            recordsByBienSo[bienSoXe] = []
          }

          recordsByBienSo[bienSoXe].push({
            ngayNhap,
            row,
          })
        })

        const latestRows = []

        Object.keys(recordsByBienSo).forEach((bienSo) => {
          const list = recordsByBienSo[bienSo].sort((a, b) => b.ngayNhap - a.ngayNhap)

          const newest = list[0].row

          let soLuongDon = newest[10]
          let soLuongTra = newest[11]

          if (!soLuongDon || soLuongDon === '' || !soLuongTra || soLuongTra === '') {
            for (let i = 1; i < list.length; i++) {
              const older = list[i].row
              if ((!soLuongDon || soLuongDon === '') && older[10]) soLuongDon = older[10]
              if ((!soLuongTra || soLuongTra === '') && older[11]) soLuongTra = older[11]
              if (soLuongDon && soLuongTra) break
            }
          }

          newest[10] = soLuongDon || '0'
          newest[11] = soLuongTra || '0'

          latestRows.push(newest)
        })

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
            soLuongDon = '',
            soLuongTra = '',
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
            soLuongDon,
            soLuongTra,
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
