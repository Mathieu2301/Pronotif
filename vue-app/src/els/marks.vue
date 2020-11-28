<template>
  <div>
    <!-- <div class="chart">
      <marksChart :marks="marks"/>
    </div> -->
    <div class="block">
      <div class="title">Moyennes</div>
      <div class="content">
        <table v-if="averages">
          <tr>
            <th class="left">Matière</th>
            <th class="left">Moyenne</th>
            <th class="left negligible2">Classe</th>
          </tr>

          <tr class="time"
            v-for="(avrg, i) in averages"
            :key="i"
          >
            <td class="left" :style="{ color: avrg.color }">
              {{ avrg.name }}
            </td>
            <td class="left mark">
              <span :class="{
                green: avrg.class && (avrg.value - avrg.class >= 0.5),
                yellow: avrg.class && (
                  (avrg.value - avrg.class < 0.5)
                  && (avrg.class - avrg.value < 1)
                ),
                red: avrg.class && (avrg.class - avrg.value >= 1),
              }">
                {{ avrg.value || '?' }}
              </span>
            </td>
            <td class="left negligible2">{{ avrg.class || '?' }}</td>
          </tr>
        </table>
        <div v-else>Aucune moyenne</div>
      </div>
    </div>

    <div class="separator"/>

    <div class="block">
      <div class="title">Notes</div>
      <div class="content">
        <table v-if="mrks && mrks.length > 0">
          <tr>
            <th class="left">Nom</th>
            <th class="left">Note</th>
            <th class="left negligible2">Étend</th>
            <th class="left negligible2">Moy</th>
          </tr>

          <tr class="time"
            v-for="(mrk, i) in mrks"
            :key="i"
          >
            <td class="left" :style="{ color: mrk.subject.color }">
              {{ mrk.title || mrk.subject.name }}
            </td>
            <td class="left mark">
              <span :class="{
                green: mrk.average && (mrk.value - mrk.average >= 0.5),
                yellow: mrk.average && (
                  (mrk.value - mrk.average < 0.5)
                  && (mrk.average - mrk.value < 1)
                ),
                red: mrk.average && (mrk.average - mrk.value >= 1),
              }">
                {{ mrk.value || '?' }}/{{ mrk.scale }}
              </span>
              <div class="coef">x{{ mrk.coefficient }}</div>
            </td>
            <td class="left negligible2">{{ mrk.min || '?' }} - {{ mrk.max || '?' }}</td>
            <td class="left negligible2">{{ mrk.average || '?' }}</td>
          </tr>
        </table>
        <div v-else>Aucune note</div>
      </div>
    </div>
  </div>
</template>

<script>
// import marksChart from '@/els/marksChart.vue';

export default {
  name: 'Marks',
  props: { marks: Object },

  // components: { marksChart },

  data: () => ({
    // filter: '',
    averages: false,
  }),

  watch: {
    marks() {
      if (!this.marks || this.marks.length < 1) return;
      const averages = {};

      this.marks.forEach((m) => {
        if (!averages[m.subject.name]) {
          averages[m.subject.name] = {
            name: m.subject.name,
            color: m.subject.color,
            total: 0,
            total_class: 0,
            count: 0,
          };
        }

        averages[m.subject.name].count += m.coefficient;
        averages[m.subject.name].total += (m.value / m.scale) * m.coefficient;
        averages[m.subject.name].total_class += (m.average / m.scale) * m.coefficient;

        averages[m.subject.name].value = Math.round(
          (averages[m.subject.name].total / averages[m.subject.name].count) * 2000,
        ) / 100;
        averages[m.subject.name].class = Math.round(
          (averages[m.subject.name].total_class / averages[m.subject.name].count) * 2000,
        ) / 100;
      });

      this.averages = Object.values(averages).sort((a, b) => b.value - a.value);
    },
  },

  computed: {
    mrks() {
      if (!this.marks || this.marks.length < 1) return false;
      return this.marks;
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
