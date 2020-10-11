import { createApp } from 'vue';
import app from './app.vue';
import registerSW from './registerServiceWorker';

const socket = require('socket.io-client')('https://pronotif.herokuapp.com');

window.getAuth = () => ({
  username: localStorage.getItem('username') || '',
  password: localStorage.getItem('password') || '',
});

const params = (
  window.location.search
  || window.location.hash
  || window.location.pathname
).replace(/\?|#|&/g, '').split('/').filter((p) => p);

window.param = { [params[0]]: params[1] };

if (window.location.protocol === 'https:') registerSW();

window.socket = socket;

createApp(app).mount('#app');
