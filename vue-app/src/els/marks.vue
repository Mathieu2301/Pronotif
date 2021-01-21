<template>
  <div>
    <div class="block">
      <div class="title">Graphique des moyennes</div>
      <div class="content">
        <radarChart v-if="averages" :averages="averages"/>
      </div>
    </div>

    <div class="separator"/>

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

          <tr/>

          <tr class="time" style="font-weight: 800">
            <td class="left">Moyenne générale</td>
            <td class="left mark">
              <span :class="{
                green: global.class && (global.value - global.class >= 0.5),
                yellow: global.class && (
                  (global.value - global.class < 0.5)
                  && (global.class - global.value < 1)
                ),
                red: global.class && (global.class - global.value >= 1),
              }">
                {{ global.value || '?' }}
              </span>
            </td>
            <td class="left negligible2">{{ global.class || '?'  }}</td>
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
                green: mrk.average && (mrk.value >= mrk.average),
                yellow: mrk.average && (
                  (mrk.value < mrk.average)
                  && ((mrk.average - mrk.value) / mrk.scale < 0.1)
                ),
                red: mrk.average && ((mrk.average - mrk.value) / mrk.scale >= 0.1),
              }">
                {{ (mrk.value >= 0 ? mrk.value : 'abs') }}/{{ mrk.scale }}
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
import radarChart from '@/els/radarChart.vue';

export default {
  name: 'Marks',
  props: { marks: Object },

  components: { radarChart },

  data: () => ({
    // filter: '',
    averages: false,

    global: {
      total_class: 0,
      total_value: 0,
      class: 0,
      value: 0,
    },
  }),

  mounted() {
    if (!this.marks || this.marks.length < 1) return;
    const averages = {};

    this.marks.forEach((m) => {
      if (m.value < 0) return;
      if (!averages[m.subject.name]) {
        averages[m.subject.name] = {
          name: m.subject.name,
          color: m.subject.color,
          total: 0,
          total_class: 0,
          count: 0,
        };
      }

      averages[m.subject.name].count += m.scale * m.coefficient;
      averages[m.subject.name].total += m.value * m.coefficient;
      averages[m.subject.name].total_class += m.average * m.coefficient;

      averages[m.subject.name].value = Math.round(
        (averages[m.subject.name].total / averages[m.subject.name].count) * 2000,
      ) / 100;
      averages[m.subject.name].class = Math.round(
        (averages[m.subject.name].total_class / averages[m.subject.name].count) * 2000,
      ) / 100;
    });

    this.averages = Object.values(averages).sort((a, b) => b.value - a.value);

    this.averages.forEach((avrg) => {
      this.global.total_value += avrg.value;
      this.global.total_class += avrg.class;
      this.global.value = Math.round((this.global.total_value / this.averages.length) * 100) / 100;
      this.global.class = Math.round((this.global.total_class / this.averages.length) * 100) / 100;
    });
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
