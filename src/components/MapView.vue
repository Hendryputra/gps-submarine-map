<template>
    <div class="app-container">
      <!-- Header Badge -->
      <header class="header-badge">
        <span class="header-title">🚢 Submarine Tracking System</span>
      </header>
  
      <!-- Loading Spinner -->
      <div v-if="loading" class="loading-overlay">
        <img src="https://i.gifer.com/ZZ5H.gif" alt="Loading..." class="spinner" />
        <p>Waiting for GPS data...</p>
      </div>
  
      <!-- Map -->
      <div id="map" class="map-container"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick } from 'vue';
  import L from 'leaflet';
  import 'leaflet-rotatedmarker';
  import mqtt from 'mqtt';
  
  const map = ref(null);
  const marker = ref(null);
  const loading = ref(true);
  
  // Submarine icon
  const submarineIcon = new L.Icon({
    iconUrl: '/gps-submarine-map/submarine.png',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
  
  onMounted(async () => {
    await nextTick();
  
    map.value = L.map('map').setView([0, 0], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.value);
  
    const client = mqtt.connect('wss://test.mosquitto.org:8081');
  
    client.on('connect', () => {
      console.log('✅ MQTT connected');
      client.subscribe('/pmm/submarine/gps');
    });
  
    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
  
        if (data.lat && data.lng) {
          const latlng = [data.lat, data.lng];
  
          if (!marker.value) {
            marker.value = L.marker(latlng, {
              icon: submarineIcon,
              rotationAngle: data.hdg ? data.hdg - 90 : 0,
              rotationOrigin: 'center center',
            }).addTo(map.value);
            loading.value = false;
          } else {
            marker.value.setLatLng(latlng);
            if (data.hdg !== undefined) {
              marker.value.setRotationAngle(data.hdg - 90);
            }
          }
  
          map.value.setView(latlng, map.value.getZoom());
        }
      } catch (err) {
        console.error('Invalid GPS data:', err);
      }
    });
  });
  </script>
  
  <style scoped>
  .app-container {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 0;
    top: 0;
  }
  
  .header-badge {
    background-color: #003366;
    color: white;
    text-align: center;
    padding: 6px 0;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    width: 100%;
  }
  
  .header-title {
    display: inline-block;
    padding: 2px 8px;
  }
  
  .map-container {
    flex: 1;
    width: 100%;
  }
  
  .loading-overlay {
    position: absolute;
    top: 32px; /* Adjust if header size changes */
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .spinner {
    width: 64px;
    height: 64px;
    margin-bottom: 12px;
  }
  </style>
  