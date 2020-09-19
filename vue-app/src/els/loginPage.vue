<template>
  <div>
    <div class="header">
      <div>Pronotif</div>
    </div>
    <div class="pageContainer">
      <div class="text">
        Connectez-vous avec vos identifiants Pronote
        et recevez des notifications utiles.
      </div>
      <form @submit="login">
        <select v-if="srvList" v-model="srvUrl">
          <option disabled value="*">Choisissez un établissement</option>
          <option v-for="srv in srvList" :key="srv.nomEtab" :value="srv.url">
            {{ srv.nomEtab }}
          </option>
        </select>
        <input type="text"
          autocomplete="username"
          placeholder="Nom d'utilisateur"
          v-model="username">
        <input type="password"
          :class="{ red: error }"
          autocomplete="current-password"
          placeholder="Mot de passe"
          v-model="password">
        <input type="submit" value="Connexion">
      </form>
    </div>
    <div class="error" v-if="localErr || error">{{ localErr || error }}</div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  props: { error: String },

  data: () => ({
    username: localStorage.getItem('username'),
    password: '',
    srvUrl: localStorage.getItem('server') || '*',

    srvList: [],

    localErr: '',
  }),

  mounted() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        window.socket.emit(
          'getServsList',
          pos.coords.latitude,
          pos.coords.longitude,
          (rs) => {
            if (rs.error) this.localErr = rs.error;
            else this.srvList = rs.data;
          },
        );
      });
    } else this.localErr = 'Géolocalisation désactivée';
  },

  methods: {
    login(e) {
      e.preventDefault();
      if (!this.username || !this.password) return;
      localStorage.setItem('username', this.username);
      localStorage.setItem('password', this.password);
      localStorage.setItem('server', this.srvUrl);

      window.location.reload();
    },
  },
};
</script>

<style scoped>
.text {
  font-size: 25px;
  max-width: 800px;
  margin: 100px auto;
}
</style>
