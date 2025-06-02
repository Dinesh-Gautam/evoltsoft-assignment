<template>
  <div class="relative map-wrapper">
    <div ref="mapContainer" class="map-container" style="width: 100%; height: 400px"></div>
    <div ref="popupContainer" class="ol-popup">
      <a href="#" ref="popupCloser" class="ol-popup-closer">✖</a>
      <div ref="popupContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Feature from 'ol/Feature'
import Map from 'ol/Map'
import Overlay from 'ol/Overlay'
import View from 'ol/View'
import Point from 'ol/geom/Point'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import 'ol/ol.css'
import { fromLonLat, toLonLat } from 'ol/proj'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import IconStyle from 'ol/style/Icon' // Renamed to avoid conflict with Vue's Icon component
import Style from 'ol/style/Style'
import { defineEmits, defineExpose, defineProps, onMounted, onUnmounted, ref, watch } from 'vue'

interface MarkerData {
  id: string | number
  longitude: number
  latitude: number
  name?: string
}

const props = defineProps({
  initialCenter: {
    type: Object as () => { longitude: number; latitude: number },
    default: () => ({ longitude: 0, latitude: 0 }),
  },
  initialZoom: {
    type: Number,
    default: 2,
  },
  markers: {
    type: Array as () => MarkerData[],
    default: () => [],
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  selectedLongitude: {
    type: Number,
    default: null,
  },
  selectedLatitude: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['map-click', 'marker-click'])

const mapContainer = ref<HTMLDivElement | null>(null)
let map: Map | null = null
const vectorSource = new VectorSource()
const selectedMarkerSource = new VectorSource()
const popupContainer = ref<HTMLDivElement | null>(null)
const popupContent = ref<HTMLDivElement | null>(null)
const popupCloser = ref<HTMLAnchorElement | null>(null)
let popupOverlay: Overlay | null = null

const createMap = () => {
  if (!mapContainer.value || !popupContainer.value || !popupCloser.value) return

  const tileLayer = new TileLayer({
    source: new OSM(),
  })

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      image: new IconStyle({
        anchor: [0.5, 2000],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: '/charger-blip.png', // Default marker icon
        width: 30,
      }),
    }),
  })

  const selectedMarkerLayer = new VectorLayer({
    source: selectedMarkerSource,
    style: new Style({
      image: new IconStyle({
        anchor: [0.5, 2000],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        width: 30,
        src: '/charger-blip.png', // Consider a different icon for selected
      }),
    }),
  })

  popupOverlay = new Overlay({
    element: popupContainer.value,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  })

  popupCloser.value.onclick = () => {
    hidePopup()
    return false
  }

  map = new Map({
    target: mapContainer.value,
    layers: [tileLayer, vectorLayer, selectedMarkerLayer],
    overlays: [popupOverlay],
    view: new View({
      center: fromLonLat([props.initialCenter.longitude, props.initialCenter.latitude]),
      zoom: props.initialZoom,
    }),
  })

  if (props.interactive) {
    map.on('click', (event) => {
      const lonLat = toLonLat(event.coordinate)
      emit('map-click', { longitude: lonLat[0], latitude: lonLat[1] })
      hidePopup()
    })
  }

  map.on('click', (evt) => {
    if (map!.hasFeatureAtPixel(evt.pixel, { layerFilter: (layer) => layer === vectorLayer })) {
      const feature = map!.forEachFeatureAtPixel(evt.pixel, (featureAtPixel) => featureAtPixel, {
        layerFilter: (layer) => layer === vectorLayer,
      })
      if (feature) {
        const markerId = feature.get('id')
        if (markerId) {
          const clickedMarker = props.markers.find((m) => m.id === markerId)
          if (clickedMarker) {
            emit('marker-click', clickedMarker) // This will be handled by parent to show popup
          }
        }
        return // Stop event propagation if a marker was clicked
      }
    } else {
      // If click was not on a marker, hide popup
      hidePopup()
    }
  })

  updateMarkers(props.markers)
  updateSelectedMarker()
}

const updateMarkers = (newMarkers: MarkerData[]) => {
  vectorSource.clear()
  if (newMarkers && newMarkers.length > 0) {
    newMarkers.forEach((markerInfo) => {
      const point = new Point(fromLonLat([markerInfo.longitude, markerInfo.latitude]))

      const feature = new Feature({
        geometry: point,
        name:
          markerInfo.name ||
          `Marker at ${markerInfo.latitude.toFixed(4)}, ${markerInfo.longitude.toFixed(4)}`,
        id: markerInfo.id,
      })

      vectorSource.addFeature(feature)
    })
  }
}

const updateSelectedMarker = () => {
  selectedMarkerSource.clear()

  if (props.interactive && props.selectedLatitude !== null && props.selectedLongitude !== null) {
    const selectedPoint = new Point(fromLonLat([props.selectedLongitude, props.selectedLatitude]))

    const selectedFeature = new Feature({
      geometry: selectedPoint,
      name: 'Selected Location',
    })

    selectedMarkerSource.addFeature(selectedFeature)
  }
}

watch(
  () => props.markers,
  (newMarkers) => {
    if (map) {
      updateMarkers(newMarkers)
    }
  },
  { deep: true },
)

watch(
  () => [props.selectedLatitude, props.selectedLongitude],
  () => {
    if (map && props.interactive) {
      updateSelectedMarker()

      if (props.selectedLatitude !== null && props.selectedLongitude !== null) {
        setTimeout(() => {
          map!.getView().animate({
            center: fromLonLat([props.selectedLongitude, props.selectedLatitude]),
            duration: 500, // Animation duration in milliseconds
          })
        }, 100)
      }
    }
  },
)

onMounted(() => {
  createMap()
})

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined)
    map = null
  }
  if (popupOverlay) {
    popupOverlay = null
  }
})

const setView = (center: { longitude: number; latitude: number }, zoomLevel: number) => {
  if (map) {
    map.getView().animate({
      center: fromLonLat([center.longitude, center.latitude]),
      zoom: zoomLevel,
      duration: 800,
    })
  }
}

const showPopup = (coordinate: { longitude: number; latitude: number }, htmlContent: string) => {
  if (map && popupOverlay && popupContent.value && popupContainer.value) {
    popupContent.value.innerHTML = htmlContent
    popupOverlay.setPosition(fromLonLat([coordinate.longitude, coordinate.latitude]))
    popupContainer.value.style.display = 'block'
  }
}

const hidePopup = () => {
  if (popupOverlay && popupContainer.value) {
    popupContainer.value.style.display = 'none'
    popupOverlay.setPosition(undefined) // important to truly hide it from OL
  }
}

defineExpose({
  setView,
  showPopup,
  hidePopup,
})
</script>

<style scoped>
.map-wrapper {
  position: relative;
}
.map-container {
  border: 1px solid #ccc;
  border-radius: 8px;
}
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 200px;
  display: none;
  transform: translateX(-50%);
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: ' ';
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 50%;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 50%;
  margin-left: -11px;
}
.ol-popup-closer {
  position: absolute;
  text-decoration: none;
  top: 1rem;
  right: 8px;
  font-size: 1rem;
  color: #555555 !important;
  line-height: 1;
}
</style>
