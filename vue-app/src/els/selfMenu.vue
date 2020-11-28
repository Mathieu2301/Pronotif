<template>
  <div class="block">
    <div class="title">Menu d'aujourd'hui</div>
    <div class="content">
      <div class="list" v-if="menu && menu.length > 0">
        <div
          v-for="m in menu"
          :key="m"
        >
          <div class="left">{{ m }}</div>
        </div>
      </div>
      <div v-else>Pas de menu aujourd'hui</div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'SelfMenu',

  props: {
    menu: Object,
  },
};
</script>
