<template>
  <table v-if="times && times.length > 0">
    <tr>
      <th class="left">Début</th>
      <th class="left">Salle</th>
      <th class="left negligible">Prof</th>
      <th class="left">Cours</th>
      <th class="right negligible2">Fin</th>
    </tr>

    <tr class="time"
      v-for="(t, i) in times"
      :key="i"
    >
      <td class="left">{{ toHour(t.from._seconds) }}</td>
      <td class="left">{{ t.room }}</td>
      <td class="left negligible">{{ t.teacher }}</td>
      <td class="left" :style="{ color: t.color }">{{ t.subject }}</td>
      <td class="right negligible2">{{ toHour(t.to._seconds) }}</td>
    </tr>
  </table>
  <div v-else>Aucun cours aujourd'hui</div>
</template>

<script>
export default {
  name: 'Timetable',
  props: { times: Array },

  methods: {
    toHour: (sec) => new Date(sec * 1000)
      .toLocaleTimeString()
      .replace(':00', '')
      .replace(':', 'h'),
  },
};
</script>
