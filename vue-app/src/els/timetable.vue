<template>
  <div>
    <table v-if="tms && tms.length > 0">
      <tr>
        <th class="left">Début</th>
        <th class="left">Salle</th>
        <th class="left negligible">Prof</th>
        <th class="left">Cours</th>
        <th class="right negligible2">Fin</th>
      </tr>

      <tr class="time"
        v-for="(t, i) in tms"
        :key="i"
      >
        <td class="left">{{ toHour(t.from._seconds) }}</td>
        <td class="left">{{ t.room }}</td>
        <td class="left negligible">{{ t.teacher }}</td>
        <td class="left" :style="{ color: t.color }">{{ t.subject }}</td>
        <td class="right negligible2">{{ toHour(t.to._seconds) }}</td>
      </tr>
    </table>
    <div v-else>Aucun cours {{ ['aujourd\'hui', 'demain'][timeDay] }}</div>

    <div class="separator"/>

    <div class="inline">
      <div class="lightBtn"
        @click="timeDay = 0"
        :class="{ selected: timeDay === 0 }"
      >{{ dNames[addDay(0)] }}</div>

      <div class="lightBtn"
        @click="timeDay = 1"
        :class="{ selected: timeDay === 1 }"
      >{{ dNames[addDay(1)] }}</div>
    </div>
  </div>
</template>

<script>
/* eslint no-underscore-dangle: 0 */

export default {
  name: 'Timetable',
  props: { times: Array },

  data: () => ({
    timeDay: 0,
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
    tms() {
      if (!this.times || this.times.length < 1) return false;
      return this.times.filter((tm) => (
        new Date(tm.from._seconds * 1000).getDate()
          === new Date(Date.now() + this.timeDay * 86400000).getDate()
      ));
    },
  },

  methods: {
    addDay: (nbr = 0) => new Date(Date.now() + nbr * 86400000).getDay(),

    toHour: (sec) => new Date(sec * 1000)
      .toLocaleTimeString()
      .replace(':00', '')
      .replace(':', 'h'),
  },
};
</script>
