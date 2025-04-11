<template>
    <div id="map" class="map-container"></div>
  </template>

  <script setup>
  import { onMounted, ref } from 'vue';
  import L from 'leaflet';
  import mqtt from 'mqtt';
  
  // Ikon kapal selam
  const submarineIcon = new L.Icon({
    iconUrl: '/submarine.png', // simpan icon PNG kamu di `public/`
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
  
  const map = ref(null);
  const marker = ref(null);
  
  onMounted(() => {
    map.value = L.map('map').setView([0, 0], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map.value);
  
    marker.value = L.marker([0, 0], { icon: submarineIcon }).addTo(map.value);
  
    // MQTT
    const client = mqtt.connect('wss://test.mosquitto.org:8081');
  
    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      client.subscribe('submarine/gps');
    });
  
    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.lat && data.lng) {
          const latlng = [data.lat, data.lng];
          marker.value.setLatLng(latlng);
          map.value.setView(latlng, map.value.getZoom());
        }
      } catch (err) {
        console.error('Invalid GPS data:', err);
      }
    });
  });
  </script>
  
  <style scoped>
.map-container {
  height: 100vh;
  width: 100%;
}
</style>