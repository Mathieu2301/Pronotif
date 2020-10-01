<template>
  <div>
    <div class="middeled">
      <div class="bigTitle">Pronotif</div>

      <div class="text">
        Connectez-vous avec vos identifiants Pronote
        et recevez des notifications utiles.
      </div>

      <div class="btns" v-if="installPWA.prompt">
        <input type="submit" class="blue" value="Continuer en web" @click="login">
        <input type="submit" value="Installer l'application" @click="installPWA.prompt">
      </div>
      <div class="btns" v-else>
        <input type="submit" value="Continuer" @click="login">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  props: { login: Function, installPWA: Object },
};
</script>

<style scoped>
.middeled {
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: space-evenly;
}

.text {
  font-size: 25px;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px;
}

.bigTitle {
  font-size: 50px;
}

.btns {
  padding: 0 5%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap-reverse;
  gap: 20px;
}
</style>
