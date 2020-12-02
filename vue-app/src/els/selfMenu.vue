<template>
  <div class="block">
    <div class="title">Menu de {{ getDay }}</div>
    <div class="content">
      <div class="list" v-if="menu && menu.length > 0">
        <div
          v-for="m in menu"
          :key="m"
        >
          <div class="left">{{ m }}</div>
        </div>
      </div>
      <div v-else>Pas de menu {{ getDay }}</div>

      <div class="separator"/>

      <div class="inline">
        <div class="lightBtn"
          @click="day > 0 ? day-- : false"
          :class="{ selected: day === 0 }"
        >{{ dNames[new Date(menus[0].date._seconds * 1000).getDay()] }}</div>

        <div class="lightBtn"
          @click="day < 1 ? day++ : false"
          :class="{ selected: day === 1 }"
        >{{ dNames[new Date(menus[1].date._seconds * 1000).getDay()] }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelfMenu',

  props: { menus: Object },

  data: () => ({
    day: 0,
    dNames: [
      'Dimanche',
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
    ],
  }),

  computed: {
    menu() {
      if (!this.menus || this.menus.length < 1) return false;
      return this.menus[this.day].meals;
    },

    getDay() {
      /* eslint no-underscore-dangle: 0 */
      return this.dNames[new Date(this.menus[this.day].date._seconds * 1000).getDay()];
    },
  },
};
</script>
