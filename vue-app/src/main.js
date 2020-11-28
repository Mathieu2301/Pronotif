import { createApp } from 'vue';
import izitoast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import app from './app.vue';
import registerSW from './registerServiceWorker';

window.toast = izitoast;

window.toast.settings({
  position: 'bottomRight',
});

window.toast.confirm = (message, cb) => {
  window.toast.show({
    theme: 'dark',
    title: 'Confirm ?',
    message,
    layout: 2,
    position: 'center',
    maxWidth: '70%',
    backgroundColor: '#344d61',
    progressBarColor: '#00db92',
    overlay: true,
    overlayClose: true,
    timeout: 8000,
    buttons: [
      ['<button>Confirm</button>', (inst, toast) => {
        cb();
        inst.hide({ transitionOut: 'fadeOutDown' }, toast);
      }],
      ['<button>Abort</button>', (inst, toast) => inst.hide({ transitionOut: 'fadeOutDown' }, toast)],
    ],
  });
};

const socket = require('socket.io-client')(
  window.location.port === '8080'
    ? `${window.location.protocol}//${window.location.hostname}:500`
    : 'https://pronotif.herokuapp.com',
);

const params = (
  window.location.search
  || window.location.hash
  || window.location.pathname
).replace(/\?|#|&/g, '').split('/').filter((p) => p);

window.param = { [params[0]]: params[1] };

if (window.location.protocol === 'https:') registerSW();

window.socket = socket;

createApp(app).mount('#app');
