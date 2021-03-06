<template>
  <div v-if="!waiting">
    <DeprecatedPage v-if="deprecated"/>

    <HomePage v-if="!deprecated && !logged && !loginPage"
      :login="() => loginPage = true" :installPWA="installPWA"/>

    <LoginPage v-if="!deprecated && !logged && loginPage"
      :installPWA="installPWA"/>

    <UserPage v-if="!deprecated && logged"
      :user="user" :data="data" :installPWA="installPWA"/>
  </div>
  <loader :animated="true" v-else/>
</template>

<script>
import loader from '@/els/loader.vue';
import HomePage from '@/els/homePage.vue';
import LoginPage from '@/els/loginPage.vue';
import UserPage from '@/els/userPage.vue';
import DeprecatedPage from '@/els/deprecatedPage.vue';

export default {
  name: 'Pronotification',

  components: {
    loader,
    HomePage,
    LoginPage,
    UserPage,
    DeprecatedPage,
  },

  data: () => ({
    user: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password'),
      server: localStorage.getItem('server'),
      cas: localStorage.getItem('cas'),
    },
    waiting: true,
    logged: false,
    loginPage: false,
    data: {},

    deprecated: (process.env.NODE_ENV !== 'development' && ![
      'pronotif.fr',
      'pronotif.web.app',
      'pronotif.dev',
    ].includes(window.location.hostname)),

    installPWA: {},
  }),

  methods: {
    fetch() {
      window.socket.emit('fetch', this.user, (rs) => {
        if (rs.success) {
          this.logged = true;
          if (window.ga) window.ga.setUserId(this.user.username);
        } else {
          window.toast.error({ title: rs.error });
          this.waiting = false;
          this.logged = false;
          this.loginPage = true;

          localStorage.removeItem('password');

          if (window.ga) window.ga.logEvent('wrong_pass');
        }
      });
    },
  },

  mounted() {
    if (this.deprecated) {
      this.waiting = false;
      return;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      if (window.ga) window.ga.setUserProperties({ installed: false });
      this.installPWA.prompt = () => {
        e.prompt();
        e.userChoice.then((rs) => {
          if (rs.outcome === 'accepted') {
            if (window.ga) window.ga.logEvent('install');
            window.location.reload();
          }
        });
      };
    });

    if (this.user.username && this.user.password && this.user.server && this.user.cas) {
      const lastDataRaw = localStorage.getItem('lastData');
      if (lastDataRaw) {
        try {
          this.data = JSON.parse(lastDataRaw) || {};
          this.logged = true;
          this.waiting = false;
        } catch (err) {
          localStorage.removeItem('lastData');
        }
      }

      this.fetch();
      setInterval(this.fetch, 600000);
    } else {
      this.waiting = false;
    }

    window.socket.on('data', (data) => {
      localStorage.setItem('lastData', JSON.stringify(data));
      window.toast.success({ title: 'Synchronisé !' });
      document.title = `${data.name} - Pronotif`;
      this.waiting = false;
      this.data = data;
      if (data.daysHours && Object.keys(data.daysHours).length > 0) {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'setHours', hours: data.daysHours });
          console.log('Background notifications enabled !');
        } else console.error('Serviceworker is unreachable...');
      } else console.error('No background processing data...');
    });

    window.socket.on('friendQRCode', (qrCode) => {
      localStorage.setItem('friendQRCode', qrCode);
    });
  },
};
</script>

<style>

:root {
  --color1: #11d18e;
  --color2: #007cde;

  --red: #e63b3b;
  --orange: #e48f34;
  --yellow: #fff777;
  --green: #00ff0d;

  --shadow: #1b1f2338;
  --white: #fafafa;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 17px;
  margin: 0;

  background: linear-gradient(
    -10deg,
    var(--green),
    var(--color1),
    var(--color2),
    var(--color2)
  );
  background-color: var(--color2);
  background-attachment: fixed;
  background-size: 200% 200%;
  animation: gradient 10s ease-in-out infinite;
}

@keyframes gradient {
  0% { background-position: 0% 20% }
  50% { background-position: 0% 50% }
  100% { background-position: 0% 20% }
}

body * {
  color: #e6e6e6;
  font-family: Questrial, Arial, sans-serif;
  transition-duration: 0.1s;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  text-shadow: 0 0 2px #00000020;
  user-select: none;
}

::placeholder { color: #d0d0d0 }

.header {
  background-color: #0088dbc2;
  box-shadow: 0 0 3px #00000038;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 55px;
  padding: 0 15px;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
}

.header svg {
  height: 20px;
  fill: #e6e6e6;
  cursor: pointer;
}

.backButton {
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  width: 70%;
}

.pageContainer {
  padding: 50px;
  margin: 0 auto;
  margin-top: 55px;
  max-width: 1000px;
}

form {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  margin: 0 auto;
  max-width: 400px;
}

input, select {
  outline: none;
  background-color: #ffffff1c;
  border-radius: 20px;
  height: 40px;
  padding: 0 15px;
  border: solid 2px #e6e6e6;
  font-size: 16px;
}

input:focus, select:focus {
  border: solid 2px var(--color1);
}

a {
  color: var(--yellow);
  text-shadow: 0 0 2px #00000040;
}

option {
  color: #3a3d3f;
}

input.red { border: solid 2px var(--red) }

.button,
input[type=submit] {
  background-color: var(--color1);
  cursor: pointer;
  padding: 0 20px;
}

.button.blue,
input[type=submit].blue { background-color: var(--color2) }

.input { display: flex }

.input > * { border-radius: 0 }

.input > *:first-child {
  flex: 1 1 auto;
  width: 100%;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  border-right: 0;
}

.input > *:last-child {
  flex: 0 0 auto;
  min-width: 110px;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}

.svgBtn {
  fill: var(--yellow);
  height: 30px;
  cursor: pointer;
}

.svgBtn.disabled {
  fill: #ffffff44;
  cursor: not-allowed;
}

.lightBtn {
  background-color: #ffffff20;
  padding: 5px 10px;
  font-size: 14px;
  border-radius: 40px;
  border: solid 2px #ffffff44;
  cursor: pointer;
}

.lightBtn.selected {
  border: solid 2px var(--yellow);
  cursor: not-allowed;
}

.block {
  background-color: #ffffff1c;
  box-shadow: 2px 2px 10px #2323230a;
}

.block > .title {
  background-color: #ffffff24;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  font-size: 20px;
  padding: 0 20px;
}

.block > .content {
  padding: 20px;
}

.inline {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.list {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
}

.left { text-align: left }
.right { text-align: right }

table {
  width: 100%;
  border-collapse: collapse;
}

tr { height: 30px }

@media screen and (max-width: 600px) {
  .pageContainer {
    padding: 20px;
  }
  .negligible {
    font-size: 0 !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 0 !important;
  }
}

@media screen and (max-width: 430px) {
  .negligible2 {
    font-size: 0 !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 0 !important;
  }
}

.delCross {
  height: 18px;
  fill: var(--red);
}

.yellow { color: var(--yellow) }
.green { color: var(--green) }
.red { color: var(--red) }

.top-separator { margin-top: 20px }
.separator { padding: 10px 0 }
.clickable { cursor: pointer }

</style>
