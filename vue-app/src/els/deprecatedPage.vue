<template>
  <div>
    <div class="middeled">
      <div class="bigTitle">Ancienne version de Pronotif</div>

      <div class="text">
        Merci d'installer la nouvelle version sur <u>pronotif.fr</u>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeprecatedPage',
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
  padding: 0 20px;
}
</style>
