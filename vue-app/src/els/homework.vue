<template>
  <div class="block">
    <div class="title">Pour {{ hwksDayName }}</div>
    <div class="content">
      <div class="inline">
        <svg viewBox="0 0 100 100"
          class="svgBtn"
          @click="hwksDay > 0 ? hwksDay-- : false"
          :class="{ disabled: hwksDay <= 0 }"
        >
          <path d="M97.5,50C97.5,23.8,76.2,2.5,50,2.5S2.5,23.8,2.5,50S23.8,97.5,50,
            97.5S97.5,76.2,97.5,50z M11.4,50c0-21.3,17.3-38.6,38.6-38.6S88.6,28.7,
            88.6,50c0,21.3-17.3,38.6-38.6,38.6S11.4,71.3,11.4,50z"/>
          <polygon points="43.1,50 61.4,31.6 55.1,25.3 30.5,50 55.1,74.7 61.4,68.4"/>
        </svg>
        <svg viewBox="0 0 100 100"
          class="svgBtn"
          @click="hwksDay < 14 ? hwksDay++ : false"
          :class="{ disabled: hwksDay >= 14 }"
        >
          <path d="M2.5,50c0,26.2,21.3,47.5,47.5,47.5S97.5,76.2,97.5,50S76.2,
            2.5,50,2.5S2.5,23.8,2.5,50z M88.6,50c0,21.3-17.3,38.6-38.6,38.6S11.4,
            71.3,11.4,50c0-21.3,17.3-38.6,38.6-38.6S88.6,28.7,88.6,50z"/>
          <polygon points="56.9,50 38.6,68.4 44.9,74.7 69.5,50 44.9,25.3 38.6,31.6"/>
        </svg>
      </div>

      <div class="separator"/>

      <div class="list" v-if="hwks && hwks.length > 0">
        <div
          v-for="(hw, i) in hwks"
          :key="i"
        >
          <div :style="{ color: hw.color }">{{ hw.subject }}</div>
          <div class="left">{{ hw.description }}</div>
        </div>
      </div>
      <div v-else>Rien à faire pour {{ hwksDayName }}</div>
    </div>
  </div>
</template>

<script>
const dNames = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
];

export default {
  name: 'Homework',
  props: { homeworks: Object },

  data: () => ({
    hwksDay: 1,
  }),

  computed: {
    hwks() {
      if (!this.homeworks || this.homeworks.length < 1) return false;
      return this.homeworks.filter((hw) => (
        !hw.done
        && new Date(hw.for).getDate()
          === new Date(Date.now() + this.hwksDay * 86400000).getDate()
      ));
    },

    hwksDayName() {
      const date = new Date(Date.now() + this.hwksDay * 86400000);
      return `${dNames[date.getDay()]} ${date.getDate()}`;
    },
  },
};
</script>

<style scoped>
.mark {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  max-width: 100px;
}
</style>
