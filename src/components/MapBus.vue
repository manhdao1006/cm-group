<template>
  <div>
    <BaseHeader />

    <div class="container-lg px-0 mt-3 mb-3" style="height: 600px">
      <div class="row h-100 g-0 border border-dark-subtle border-2 rounded-3">
        <div class="col-3 overflow-auto h-100 border-dark-subtle border-2 border-end">
          <input
            type="text"
            class="form-control mb-2"
            placeholder="Tìm kiếm theo tên hoặc mã tài xế"
            v-model="searchText"
          />
          <ul
            class="list-group list-group-flush flex-grow-1 overflow-auto"
            style="max-height: 520px"
          >
            <li
              v-for="item in filteredVehicleList"
              :key="item.bienSoXe"
              class="list-group-item"
              :class="{
                'list-group-item-active': selectedVehicle === item,
                'list-group-item-hover': selectedVehicle !== item,
              }"
              @click="selectVehicle(item)"
              style="cursor: pointer; font-size: 12px"
            >
              <div v-if="item.trangThai === '1'" class="d-flex align-items-center mb-1">
                <div class="dot-ping-red me-1"></div>
                <div class="badge bg-danger-subtle text-danger" style="font-size: 12px">
                  Cần cứu
                </div>
                <div class="text-black fst-italic ms-auto" style="font-size: 11px">
                  ({{ getTimeAgo(item.ngayNhap) }})
                </div>
              </div>
              <div v-if="item.trangThai === '0'" class="d-flex align-items-center mb-1">
                <div class="dot-ping-green"></div>
                <div class="text-black fst-italic ms-auto" style="font-size: 11px">
                  ({{ getTimeAgo(item.ngayNhap) }})
                </div>
              </div>
              <strong>{{ item.tenXe }}</strong
              ><br />
              Biển số xe: {{ item.bienSoXe }}<br />
              Nhiệt độ: {{ item.nhietDo }}<br />
              Tên tài xế: {{ item.tenTaiXe }}<br />
              Số điện thoại: {{ item.soDienThoai }}<br />
            </li>
          </ul>
        </div>

        <div class="col-9 h-100">
          <div id="map" class="w-100 h-100"></div>
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <div class="mt-2 text-primary fw-bold">Đang tải dữ liệu bản đồ...</div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet/dist/leaflet.css'
import BaseHeader from './common/BaseHeader.vue'

export default {
  name: 'MapView',
  components: {
    BaseHeader,
  },
  data() {
    return {
      map: null,
      markers: [],
      circles: [],
      markerCluster: null,
      sheetId: '1azXTmdVEGAJkRxF6fxtVKt5LxMHo_Vp4xubCB_9wmSs',
      apiKey: 'AIzaSyBJOLTWvnRRegbkw1rRvr0K2dzV9SZ_Mwk',
      range: 'A:J',
      darkMode: false,
      baseLayer: null,
      vehicleList: [],
      searchText: '',
      selectedVehicle: null,
      lastDataHash: '',
      isRefreshing: false,
      isLoading: true,
      prevMarkerCount: 0,
      addressCache: {},
    }
  },
  computed: {
    filteredVehicleList() {
      if (!this.searchText) return this.vehicleList
      const text = this.searchText.toLowerCase()
      return this.vehicleList.filter(
        (v) => v.maNhanVien.toLowerCase().includes(text) || v.tenTaiXe.toLowerCase().includes(text),
      )
    },
  },
  mounted() {
    this.initMap()
    setTimeout(async () => {
      this.isLoading = true
      await this.fetchSheetData()
      this.isLoading = false
      setInterval(this.refreshIfSheetChanged, 10000)
    }, 1000)
  },
  methods: {
    getTimeAgo(dateString) {
      if (!dateString) return 'không xác định'
      const [datePart, timePart] = dateString.split(' ')
      const [day, month, year] = datePart.split('/')
      const date = new Date(`${year}-${month}-${day}T${timePart}`)
      if (isNaN(date)) return 'ngày không hợp lệ'
      const now = new Date()
      const diffMs = now - date
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffSec / 60)
      const diffHour = Math.floor(diffMin / 60)
      const diffDay = Math.floor(diffHour / 24)

      if (diffMin < 1) return 'vừa xong'
      if (diffMin < 60) return `${diffMin} phút trước`
      if (diffHour < 24) return `${diffHour} giờ trước`
      return `${diffDay} ngày trước`
    },
    initMap() {
      if (this.map) {
        this.map.remove()
        this.map = null
      }
      this.map = L.map('map').setView([16.0678, 108.2208], 12)

      this.baseLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 30,
        },
      ).addTo(this.map)

      this.markerCluster = L.markerClusterGroup()
      this.map.addLayer(this.markerCluster)
      setTimeout(() => {
        this.map.invalidateSize()
      }, 200)
    },

    async refreshIfSheetChanged() {
      if (this.isRefreshing) return
      this.isRefreshing = true
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`,
        )
        console.log(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`,
        )

        const data = await res.json()
        if (!data.values) return

        const newHash = JSON.stringify(data.values)

        if (newHash !== this.lastDataHash) {
          console.log('🟢 Sheet changed → Refreshing markers')
          this.lastDataHash = newHash
          await this.refreshMarkers()
        } else {
          console.log('🟡 Sheet unchanged → Skip refresh')
        }
      } catch (err) {
        console.error('Error checking sheet:', err)
      } finally {
        this.isRefreshing = false
      }
    },

    async refreshMarkers() {
      if (!this.map) return
      this.isLoading = true

      // Lưu tâm và zoom hiện tại
      const currentCenter = this.map.getCenter()
      const currentZoom = this.map.getZoom()

      // Lưu lại popup đang mở (nếu có)
      const openedPopupVehicle = this.vehicleList.find((v) => v.marker && v.marker.isPopupOpen())

      // Làm mới dữ liệu, không fitBounds để tránh lệch tâm
      await this.fetchSheetData(false)

      // Giữ nguyên vị trí người xem
      this.map.setView(currentCenter, currentZoom, { animate: false })

      // Nếu popup đang mở trước đó, mở lại popup đó
      if (openedPopupVehicle) {
        const newVehicle = this.vehicleList.find((v) => v.bienSoXe === openedPopupVehicle.bienSoXe)
        if (newVehicle && newVehicle.marker) {
          newVehicle.marker.openPopup()
        }
      }
      this.isLoading = false
    },

    async fetchSheetData(fitBounds = true) {
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
          soDienThoai,
          address: 'Đang tải...',
        })
      }
      vehicles.sort((a, b) => {
        const ta = Number(a.trangThai)
        const tb = Number(b.trangThai)

        if (ta !== tb) return tb - ta
        return b.nhietDo - a.nhietDo
      })

      this.vehicleList = vehicles
      const newCount = vehicles.length
      if (newCount > this.prevMarkerCount) {
        fitBounds = true
      }

      this.prevMarkerCount = newCount
      this.showMarkers(fitBounds)
      this.loadAddressesAsync()
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
          const address = await this.getAddressFromLatLng(v.lat, v.lng)
          v.address = address
          if (v.marker && v.marker.isPopupOpen()) {
            v.marker.setPopupContent(this.generatePopupContent(v))
          } else if (v.marker) {
            v.marker.bindPopup(this.generatePopupContent(v))
          }
        } catch {
          v.address = 'Không xác định được địa chỉ'
        }
        await new Promise((resolve) => setTimeout(resolve, 1300))
      }
    },
    generatePopupContent(v) {
      return `
        Địa chỉ: ${v.address}
      `
    },
    showMarkers(fitBounds) {
      this.markerCluster.clearLayers()
      this.circles.forEach((c) => this.map.removeLayer(c))
      this.circles = []

      this.markers = []

      const markersOnly = []

      this.vehicleList.forEach((v) => {
        const isActive = v.trangThai === '1'

        const marker = L.marker([v.lat, v.lng], {
          icon: L.icon({
            iconUrl:
              'https://res.cloudinary.com/springboot-cloud/image/upload/v1759936855/marker_car_uwtjen.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          }),
        })

        const circle = L.circle([v.lat, v.lng], {
          color: isActive ? 'red' : 'green',
          fillColor: isActive ? 'tomato' : 'green',
          fillOpacity: 0.35,
          radius: 200,
          weight: 2,
        }).addTo(this.map)
        this.circles.push(circle)

        marker.bindPopup(this.generatePopupContent(v))
        marker.on('click', () => {
          this.selectedVehicle = v
          this.map.flyTo([v.lat, v.lng], 15)
          marker.openPopup()
        })
        marker.on('popupclose', () => {
          if (this.selectedVehicle === v) {
            this.selectedVehicle = null
          }
        })

        this.markerCluster.addLayer(marker)
        this.markers.push(marker)
        markersOnly.push(marker)
        v.marker = marker
      })

      if (fitBounds && markersOnly.length > 0) {
        const group = L.featureGroup(markersOnly)
        this.map.invalidateSize()
        setTimeout(() => {
          if (markersOnly.length === 1) {
            this.map.setView(group.getBounds().getCenter(), 15)
          } else {
            this.map.fitBounds(group.getBounds(), { padding: [50, 50] })
          }
        }, 300)
      }
    },
    async getAddressFromLatLng(lat, lng) {
      const key = `${lat.toFixed(6)},${lng.toFixed(6)}`
      if (this.addressCache[key]) {
        return this.addressCache[key]
      }
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      )
      const data = await response.json()
      const address = data.display_name || 'Không xác định được địa chỉ'
      this.addressCache[key] = address
      return address
    },

    flyToMarker(item) {
      if (item.marker) {
        this.map.flyTo([item.lat, item.lng], 15)
        item.marker.openPopup()
      }
    },
    selectVehicle(item) {
      this.selectedVehicle = item
      this.flyToMarker(item)
    },
  },
}
</script>

<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.dot-ping-red {
  position: relative;
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
}
.dot-ping-red::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: red;
  opacity: 0.6;
  animation: ping 1s infinite;
}

.dot-ping-green {
  position: relative;
  width: 10px;
  height: 10px;
  background-color: green;
  border-radius: 50%;
}

.dot-ping-green::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: green;
  opacity: 0.6;
  animation: ping 1s infinite;
}

@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.list-group-item-active {
  background-color: #3782f5;
  color: #ffffff;
}
.list-group-item-hover:hover {
  background-color: #e0e0e0; /* màu hover */
}
</style>
