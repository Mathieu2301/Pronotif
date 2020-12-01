<template>
  <div class="block">
    <div class="title">Menu {{ (day === 0) ? 'd\'aujourd\'hui' : 'de demain' }}</div>
    <div class="content">
      <div class="list" v-if="menu && menu.length > 0">
        <div
          v-for="m in menu"
          :key="m"
        >
          <div class="left">{{ m }}</div>
        </div>
      </div>
      <div v-else>Pas de menu {{ (day === 0) ? 'aujourd\'hui' : 'demain' }}</div>

      <div class="separator"/>

      <div class="inline">
        <div class="lightBtn"
          @click="day > 0 ? day-- : false"
          :class="{ selected: day === 0 }"
        >Aujourd'hui</div>

        <div class="lightBtn"
          @click="day < 1 ? day++ : false"
          :class="{ selected: day === 1 }"
        >Demain</div>
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
  }),

  computed: {
    menu() {
      if (!this.menus || this.menus.length < 1) return false;
      return this.menus[this.day].meals;
    },
  },
};
</script>
