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
        <select v-model="cas" v-if="casToggle">
          <option v-for="(name, cas) in casList" :key="cas" :value="cas">
            {{ name }}
          </option>
        </select>
        <div/>
        <select v-if="srvList.length > 0" v-model="srvUrl">
          <option disabled value="*">Choisissez un établissement</option>
          <option v-for="srv in srvList" :key="srv.nomEtab" :value="srv.url">
            {{ srv.nomEtab }}
          </option>
        </select>
        <input v-else type="text"
          placeholder="ex: https://xxxxx.index-education.net/pronote/"
          v-model="srvUrl">

        <input type="text"
          autocomplete="username"
          placeholder="Nom d'utilisateur"
          v-model="username">
        <input type="password"
          autocomplete="current-password"
          placeholder="Mot de passe"
          v-model="password">
        <input type="submit" value="Connexion">
      </form>

      <div v-if="installPWA.prompt">
        <div class="seplink">ou</div>
        <input type="submit"
          class="blue"
          value="Installer l'application"
          @click="installPWA.prompt">
      </div>
    </div>

    <div class="casToggle" v-if="!casToggle" @click="casToggle = true">
      J'utilise un CAS
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  props: { installPWA: Object },

  data: () => ({
    username: localStorage.getItem('username'),
    password: '',
    srvUrl: localStorage.getItem('server') || '',
    cas: localStorage.getItem('cas') || 'none',

    srvList: [],
    casToggle: false,
    casList: {
      none: 'Pronote (par défaut)',
      'ac-orleans-tours': 'Académie d\'Orleans-Tours',
      'ac-besancon': 'Académie de Besançon',
      'ac-bordeaux': 'Académie de Bordeaux (bv)',
      'ac-bordeaux2': 'Académie de Bordeaux (idp-fim-ts)',
      'ac-caen': 'Académie de Caen',
      'ac-clermont': 'Académie de Clermont-Ferrand',
      'ac-dijon': 'Académie de Dijon',
      'ac-grenoble': 'Académie de Grenoble',
      'ac-lille': 'Académie de Lille',
      'ac-limoges': 'Académie de Limoges',
      'ac-lyon': 'Académie de Lyon',
      'ac-montpellier': 'Académie de Montpellier',
      'ac-nancy-metz': 'Académie de Nancy-Metz',
      'ac-nantes': 'Académie de Nantes',
      'ac-poitiers': 'Académie de Poitiers',
      'ac-reims': 'Académie de Reims',
      arsene76: 'Académie de Rouen (Arsene76)',
      'ac-rouen': 'Académie de Rouen (ac-rouen)',
      'ac-strasbourg': 'Académie de Strasbourg',
      'ac-toulouse': 'Académie de Toulouse',
      agora06: 'ENT "Agora 06" (Nice)',
      'haute-garonne': 'ENT "Haute-Garonne"',
      hdf: 'ENT "Hauts-de-France"',
      laclasse: 'ENT "La Classe" (Lyon)',
      lyceeconnecte: 'ENT "Lycee Connecte" (Nouvelle-Aquitaine)',
      'seine-et-marne': 'ENT "Seine-et-Marne"',
      somme: 'ENT "Somme"',
      toutatice: 'ENT "Toutatice"',
      iledefrance: 'ENT "Île de France"',
      parisclassenumerique: 'ENT "Paris Classe Numerique"',
      'ljr-munich': 'ENT "Lycee Jean Renoir Munich"',
      'eure-normandie': 'ENT "L\'Eure en Normandie"',
    },

    localErr: '',
  }),

  mounted() {
    const storedSrvListRaw = localStorage.getItem('srvList');
    if (storedSrvListRaw) {
      try {
        const storedSrvList = JSON.parse(storedSrvListRaw);
        if (storedSrvList) this.srvList = storedSrvList;
      } catch (e) {
        localStorage.removeItem('srvList');
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        window.socket.emit(
          'getServsList',
          pos.coords.latitude,
          pos.coords.longitude,
          (rs) => {
            if (rs.error) window.toast.error({ title: rs.error });
            else {
              this.srvList = rs.data;
              if (this.srvUrl === '') this.srvUrl = '*';
            }
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
      localStorage.setItem('cas', this.cas);

      localStorage.setItem('srvList', JSON.stringify(this.srvList));
      localStorage.removeItem('lastData');

      window.location.reload();
    },
  },
};
</script>

<style scoped>
.text {
  font-size: 25px;
  max-width: 500px;
  margin: 100px auto;
}

.seplink {
  margin: 15px 0;
}

.link {
  text-decoration: underline;
  cursor: pointer;
}

.casToggle {
  text-decoration: underline;
  cursor: pointer;
}
</style>
