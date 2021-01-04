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

      <div class="inline top-separator" v-if="this.menus.length > 1">
        <div class="lightBtn"
          @click="day = 0"
          :class="{ selected: day === 0 }"
        >{{ dNames[getValidDay()] }}</div>

        <div class="lightBtn"
          @click="day = 1"
          :class="{ selected: day === 1 }"
        >{{ dNames[getValidDay(1)] }}</div>
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

  methods: {
    getValidDay(nbr = 0) {
      return this.menus[nbr]
        ? new Date(this.menus[nbr].date).getDay()
        : new Date(this.menus[0].date + 86400000).getDay();
    },
  },

  computed: {
    menu() {
      if (!this.menus
        || this.menus.length < 1
        || !this.menus[this.day]
        || this.menus[this.day].length < 1
      ) return false;
      return this.menus[this.day].meals;
    },

    getDay() {
      if (!this.menus[0]) return this.dNames[new Date().getDay()];
      return this.menus[this.day]
        ? this.dNames[new Date(this.menus[this.day].date).getDay()]
        : this.dNames[new Date(this.menus[0].date + 86400000).getDay()];
    },
  },
};
</script>
