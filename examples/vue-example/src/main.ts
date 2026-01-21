import { createApp } from 'vue';
import { Chart, registerables } from 'chart.js';
import App from './App.vue';

// Register Chart.js globally BEFORE mounting the app
// This ensures Chart.js is available for the web component
Chart.register(...registerables);
(window as any).Chart = Chart;

createApp(App).mount('#app');
