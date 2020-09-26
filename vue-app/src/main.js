import { createApp } from 'vue';
import app from './app.vue';
import registerSW from './registerServiceWorker';

const socket = require('socket.io-client')('https://cloud1.usp-3.fr:500');

window.getAuth = () => ({
  username: localStorage.getItem('username') || '',
  password: localStorage.getItem('password') || '',
});

if (window.location.hostname.split('.').length === 3 && process.env.NODE_ENV === 'production') {
  window.addEventListener('beforeinstallprompt', (e) => { window.pwaPrompt = e; });
  registerSW();
}

window.socket = socket;

createApp(app).mount('#app');
