<template>
  <div>
    <BaseHeader />
    <div id="map" style="width: 100%; height: 500px"></div>
    <BaseFooter />
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet/dist/leaflet.css'
import BaseFooter from './common/BaseFooter.vue'
import BaseHeader from './common/BaseHeader.vue'

export default {
  name: 'MapView',
  components: {
    BaseHeader,
    BaseFooter,
  },
  data() {
    return {
      map: null,
      markers: [],
      markerCluster: null,
      sheetId: '1azXTmdVEGAJkRxF6fxtVKt5LxMHo_Vp4xubCB_9wmSs',
      apiKey: 'AIzaSyBJOLTWvnRRegbkw1rRvr0K2dzV9SZ_Mwk',
      range: 'A:I',
      darkMode: false,
      baseLayer: null,
    }
  },
  mounted() {
    this.initMap()
    this.fetchSheetData()
    setInterval(this.refreshMarkers, 10000)
  },
  methods: {
    initMap() {
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
    },

    async refreshMarkers() {
      const currentCenter = this.map.getCenter()
      const currentZoom = this.map.getZoom()
      this.map.closePopup()
      this.markerCluster.clearLayers()

      this.markers.forEach((m) => {
        if (m instanceof L.Circle) {
          this.map.removeLayer(m)
          if (m._interval) clearInterval(m._interval)
        }
      })

      this.markers = []
      await this.fetchSheetData(false)
      this.map.setView(currentCenter, currentZoom)
    },

    async fetchSheetData(fitBounds = true) {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`,
      )
      const data = await res.json()
      if (!data.values) return

      const rows = data.values.slice(1)
      const latestByMaXe = {}
      rows.forEach((row) => {
        const maXe = row[1]
        const ngayNhap = new Date(row[0])
        if (!latestByMaXe[maXe] || ngayNhap > new Date(latestByMaXe[maXe][0])) {
          latestByMaXe[maXe] = row
        }
      })

      const latestRows = Object.values(latestByMaXe)
      const markersOnly = []

      latestRows.forEach((row) => {
        const [
          ngayNhap,
          maXe,
          tenXe,
          trangThai,
          lngStr,
          latStr,
          maNhanVien,
          tenTaiXe,
          soDienThoai,
        ] = row
        console.log(typeof trangThai)

        const lng = parseFloat(lngStr)
        const lat = parseFloat(latStr)
        if (isNaN(lat) || isNaN(lng)) return

        const isActive = String(trangThai) === '1'

        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl:
              'https://res.cloudinary.com/springboot-cloud/image/upload/v1759936855/marker_car_uwtjen.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          }),
        })

        const circle = L.circle([lat, lng], {
          color: isActive ? 'orange' : 'green',
          fillColor: isActive ? 'orange' : 'green',
          fillOpacity: 0.35,
          radius: 200,
          weight: 2,
        }).addTo(this.map)

        if (isActive) {
          let opacity = 0.35
          let increasing = true
          circle._interval = setInterval(() => {
            if (increasing) {
              opacity += 0.05
              if (opacity >= 0.7) increasing = false
            } else {
              opacity -= 0.05
              if (opacity <= 0.35) increasing = true
            }
            circle.setStyle({ fillOpacity: opacity })
          }, 300)
        }

        const popupContent = `<strong>${tenXe}</strong><br>Mã xe: ${maXe}<br>Kinh độ: ${lng}<br>Vĩ độ: ${lat}<br>Ngày nhập: ${ngayNhap}<br>Trạng thái: ${trangThai}<br>Mã nhân viên: ${maNhanVien}<br>Tên tài xế: ${tenTaiXe}<br>Số điện thoại: ${soDienThoai}`

        if (isActive) {
          marker.bindPopup(popupContent)
          setTimeout(() => {
            marker.openPopup()
          }, 300)
        } else {
          marker.bindPopup(popupContent)
          marker.on('click', () => {
            marker.openPopup()
            this.map.flyTo([lat, lng], 15)
          })
        }

        this.markerCluster.addLayer(marker)
        this.markers.push(marker)
        this.markers.push(circle)
        markersOnly.push(marker)
      })

      if (fitBounds && markersOnly.length > 0) {
        const group = L.featureGroup(markersOnly)
        this.map.fitBounds(group.getBounds(), { padding: [50, 50] })
      }
    },
  },
}
</script>
