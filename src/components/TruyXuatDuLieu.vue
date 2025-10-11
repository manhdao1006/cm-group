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
              placeholder="Tìm kiếm theo tên xe, biển số, hoặc tài xế"
            />
          </div>
          <div class="col-md-3">
            <select v-model="filterStatus" class="form-select">
              <option value="">Tất cả trạng thái</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Tắt máy</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" @click="fetchSheetData">
              <i class="fas fa-sync-alt"></i> Tải lại
            </button>
          </div>
          <div class="col-md-3 text-end">
            <button class="btn btn-success w-100" @click="exportToExcel">
              <i class="fas fa-file-excel"></i> Xuất Excel
            </button>
          </div>
        </div>

        <!-- Bảng dữ liệu -->
        <div class="table-responsive" style="max-height: 550px; overflow-y: auto">
          <table class="table table-striped table-bordered align-middle text-center">
            <thead class="table-light">
              <tr>
                <th>STT</th>
                <th>Biển số</th>
                <th>Tên xe</th>
                <th>Nhiệt độ (°C)</th>
                <th>Tài xế</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Ngày nhập</th>
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
                    {{ v.trangThai === '1' ? 'Hoạt động' : 'Tắt' }}
                  </span>
                </td>
                <td>{{ formatDate(v.ngayNhap) }}</td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredVehicleList.length === 0" class="text-center py-3 text-muted">
            Không có dữ liệu phù hợp.
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div>
            Hiển thị
            <select v-model.number="itemsPerPage" class="form-select d-inline w-auto mx-2">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
            </select>
            hàng mỗi trang
          </div>

          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="prevPage">Trước</button>
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
                <button class="page-link" @click="nextPage">Sau</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
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
    formatDate(value) {
      return value ? moment(value).format('DD/MM/YYYY HH:mm') : ''
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
        'Biển số': v.bienSoXe,
        'Tên xe': v.tenXe,
        'Nhiệt độ (°C)': v.nhietDo,
        'Tài xế': v.tenTaiXe,
        'Số điện thoại': v.soDienThoai,
        'Địa chỉ': v.address,
        'Trạng thái': v.trangThai === '1' ? 'Hoạt động' : 'Tắt',
        'Ngày nhập': this.formatDate(v.ngayNhap),
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
          const ngayNhap = new Date(row[0])
          if (!latestByBienSo[bienSoXe] || ngayNhap > new Date(latestByBienSo[bienSoXe][0])) {
            latestByBienSo[bienSoXe] = row
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

          const lat = parseFloat(latStr)
          const lng = parseFloat(lngStr)
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
            soDienThoai,
            address: 'Đang tải...',
          })
        }

        this.vehicleList = vehicles
        this.loadAddressesAsync()
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error)
      }
    },

    async loadAddressesAsync() {
      for (const v of this.vehicleList) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${v.lat}&lon=${v.lng}&format=json`,
          )
          const json = await res.json()
          v.address = json.display_name || 'Không xác định'
        } catch {
          v.address = 'Không xác định'
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
