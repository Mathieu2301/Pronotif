<template>
  <div v-if="!waiting">
    <LoginPage :error="error" v-if="!logged"/>
    <UserPage :error="error" :user="user" :data="data" v-else/>
  </div>
  <loader :animated="true" v-else/>
</template>

<script>
import loader from '@/els/loader.vue';
import LoginPage from '@/els/loginPage.vue';
import UserPage from '@/els/userPage.vue';

export default {
  name: 'Pronotification',

  components: {
    loader,
    LoginPage,
    UserPage,
  },

  data: () => ({
    user: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password'),
      server: localStorage.getItem('server'),
    },
    waiting: true,
    logged: false,
    data: {},

    error: '',
  }),

  mounted() {
    if (this.user.username && this.user.password && this.user.server) {
      window.socket.emit('fetch', this.user, (rs) => {
        if (rs.success) {
          this.logged = true;
        } else {
          this.error = rs.error;
          this.waiting = false;

          localStorage.removeItem('password');
        }
      });
    } else {
      this.waiting = false;
    }

    window.socket.on('data', (data) => {
      console.log(data);
      this.waiting = false;
      this.data = data;
      navigator.serviceWorker.controller.postMessage({ type: 'setHours', hours: data.daysHours });
    });
  },
};
</script>

<style>

:root {
  --color1: #01e9bd;
  --color2: #007cde;
  --red: #e63b3b;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 17px;

  margin: 0;
  background: linear-gradient(-10deg, var(--color1), var(--color2));
  height: 100vh;
  background-attachment: fixed;
  background-color: var(--color2);
}

body * {
  color: #e6e6e6;
  font-family: Questrial, Arial, sans-serif;
  transition-duration: 0.2s;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

::placeholder {
  color: #d0d0d0;
}

.header {
  background-color: #0000001c;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 15px;
}

.header > svg {
  height: 20px;
  fill: #e6e6e6;
  cursor: pointer;
}

.pageContainer {
  padding: 50px;
  margin: 0 auto;
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
  padding-left: 15px;
  border: solid 2px #e6e6e6;
  font-size: 16px;
}

input:focus, select:focus {
  border: solid 2px var(--color1);
}

option {
  color: #3a3d3f;
}

input.red { border: solid 2px var(--red) }

input[type=submit] {
  background-color: var(--color1);
  cursor: pointer;
  padding: 0 20px;
}

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

.block {
  background-color: #ffffff1c;
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

@media screen and (max-width: 400px) {
  .negligible2 {
    font-size: 0 !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 0 !important;
  }
}

.success, .warning, .error {
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 15px;
  width: 100%;
  background-color: #00000052;
  margin: 0 auto;
}

.success { color: var(--color1) }
.warning { color: var(--orange) }
.error { color: var(--red) }

.separator { padding: 10px 0 }
.clickable { cursor: pointer }

</style>
