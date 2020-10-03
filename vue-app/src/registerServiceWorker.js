import firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/analytics';
import { register } from 'register-service-worker';

firebase.initializeApp({
  apiKey: 'AIzaSyBR7DCsR_W3C3OHY8QRpTkQXk8Pcd7Do_E',
  authDomain: 'iridium-blast.firebaseapp.com',
  databaseURL: 'https://iridium-blast.firebaseio.com',
  projectId: 'iridium-blast',
  storageBucket: 'iridium-blast.appspot.com',
  messagingSenderId: '273479070895',
  appId: '1:273479070895:web:e5b1b8e71061dd96f6d05a',
  measurementId: 'G-STPWJL47YY',
});

window.ga = firebase.analytics();

/* eslint-disable-no-console */

export default function registerSW() {
  register(`${process.env.BASE_URL}sw.js`, {
    ready() {
      console.log('App is being served from cache by a service worker.');
    },
    registered(rg) {
      const fcm = firebase.messaging();
      window.enablePush = () => fcm.getToken({ serviceWorkerRegistration: rg });
      window.rg = rg;
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updatefound() {
      console.log('New content is downloading.');
    },
    updated(rg) {
      console.log('New content is available; please refresh.');
      rg.waiting.postMessage({ type: 'update' });
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    },
  });
}
