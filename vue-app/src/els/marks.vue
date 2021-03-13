<template>
  <div class="marksPage">
    <div class="block">
      <div class="title">Graphique des moyennes</div>
      <div class="content">
        <radarChart v-if="avrgs" :averages="avrgs"/>
      </div>
    </div>

    <div class="separator"/>

    <div class="block">
      <div class="title">Moyennes</div>
      <div class="content">
        <div class="marks" v-if="avrgs">
          <div class="markItem"
            v-for="(avrg, i) in avrgs"
            :key="i"
          >
            <div class="marged" :style="{ color: avrg.color }">
              {{ avrg.name }}
            </div>

            <div class="margedLR">
              <div class="grey">{{ avrg.min >= 0 ? avrg.min : 'Abs' }} - {{ avrg.max }}</div>
              <div class="grey">{{ avrg.class }}</div>
              <span :class="{
                green: avrg.class && (avrg.value - avrg.class >= 0.5),
                yellow: avrg.class && (
                  (avrg.value - avrg.class < 0.5)
                  && (avrg.class - avrg.value < 1)
                ),
                red: avrg.class && (avrg.class - avrg.value >= 1),
              }">
                {{ (avrg.value >= 0 ? avrg.value : 'Abs') }}
              </span>

            </div>
            <div class="barContainer">
              <div class="bar" :style="{
                background: genGradient(avrg.value, avrg.class, avrg.min, avrg.max, 20),
              }"/>
            </div>
          </div>

          <div/>

          <div class="markItem" style="font-weight: 800">
            <div class="marged">
              <div>Moyenne générale</div>

              <span :class="{
                green: globalAvrgs.class && (globalAvrgs.value - globalAvrgs.class >= 0.5),
                yellow: globalAvrgs.class && (
                  (globalAvrgs.value - globalAvrgs.class < 0.5)
                  && (globalAvrgs.class - globalAvrgs.value < 1)
                ),
                red: globalAvrgs.class && (globalAvrgs.class - globalAvrgs.value >= 1),
              }">
                {{ globalAvrgs.value }}
              </span>
              <div>{{ globalAvrgs.class }}</div>
            </div>
          </div>
        </div>
        <div v-else>
          Aucune moyenne pour la période "{{ period !== 'ALL' ? period : 'Toutes périodes' }}"
        </div>
      </div>
    </div>

    <div class="separator"/>

    <div class="block">
      <div class="title">Notes</div>
      <div class="content">
        <input type="text" class="filter" placeholder="Rechercher..." v-model="filter">

        <div class="marks" v-if="mrks && mrks.length > 0">
          <div class="markItem"
            v-for="(mrk, i) in mrks"
            :key="i"
          >
            <div>
              <div class="marged" :style="{ color: mrk.subject.color }">
                {{ mrk.subject.name }}
              </div>
              <div class="coef grey">
                x{{ mrk.coefficient }}
              </div>
            </div>

            <div class="margedLR margedB">{{ mrk.title || mrk.subject.name }}</div>
            <div class="margedLR">
              <div class="grey">{{ mrk.min >= 0 ? mrk.min : 'Abs' }} - {{ mrk.max }}</div>
              <div class="grey">{{ mrk.average }}</div>
              <span :class="{
                green: mrk.average && (mrk.value >= mrk.average),
                yellow: mrk.average && (
                  (mrk.value < mrk.average)
                  && ((mrk.average - mrk.value) / mrk.scale < 0.1)
                ),
                red: mrk.average && ((mrk.average - mrk.value) / mrk.scale >= 0.1),
              }">
                {{ (mrk.value >= 0 ? mrk.value : 'abs') }} /{{ mrk.scale }}
              </span>
            </div>
            <div class="barContainer">
              <div class="bar" :style="{
                background: genGradient(mrk.value, mrk.average, mrk.min, mrk.max, mrk.scale),
              }"/>
            </div>
          </div>
        </div>
        <div v-else>
          Aucune note pour la période "{{ period !== 'ALL' ? period : 'Toutes périodes' }}"
        </div>
      </div>
    </div>

    <div class="periodSelect" v-if="periods.length > 2">
      <div class="periodList" v-if="periods.length < 4">
        <div v-for="prd in periods"
          class="periodItem"
          :key="prd.name"
          :value="prd.name"
          :class="{ selected: period === prd.name }"
          @click="period = prd.name"
        >{{ !prd.all ? prd.name : 'Année' }}</div>
      </div>
      <select v-model="period" v-else>
        <option v-for="prd in periods" :key="prd.name" :value="prd.name">
          {{ !prd.all ? prd.name : 'Toutes périodes' }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import radarChart from '@/els/radarChart.vue';

function removeAccents(inp) {
  const ina = 'ÀÁÂÃÄÅÒÓÔÕÕÖØÈÉÊËðÇÐÌÍÎÏÙÚÛÜÑŠŸŽ';
  const out = 'AAAAAAOOOOOOOEEEEECDIIIIUUUUNSYZ';
  const str = inp.split('');
  for (let i = 0; i < str.length; i += 1) {
    const x = ina.indexOf(str[i]);
    if (x !== -1) str[i] = out[x];
  }
  return str.join('');
}

function compare(a, b) {
  return removeAccents(a.toUpperCase())
    .includes(removeAccents(b.toUpperCase()));
}

export default {
  name: 'Marks',
  props: { marks: Object, periods: Object },

  components: { radarChart },

  data: () => ({
    period: localStorage.getItem('period') || 'ALL',
    filter: '',
  }),

  methods: {
    genGradient(value, average, min, max, scale = 20) {
      const gap = 0.8;

      let colorI = 0;
      if (average) {
        if (
          (value < average)
          && ((average - value) / scale < 0.1)
        ) colorI = 1;
        if ((average - value) / scale >= 0.1) colorI = 2;
      }

      const color = ['#00ff0d', '#fff777', '#e63b3b'][colorI];

      const vals = [
        Math.round((min / scale) * 1000) / 10,
        Math.round((average / scale) * 1000) / 10,
        Math.round((value / scale) * 1000) / 10,
        Math.round((max / scale) * 1000) / 10,
      ].sort((a, b) => a - b);

      const c = [
        '#007cdea0',
        '#11d18ea0',
        (value > average ? '#ffffffb0' : color),
        (value > average ? color : '#ffffffb0'),
      ];

      return `linear-gradient(90deg,
        ${c[0]} ${vals[0]}%,
        ${c[1]} ${vals[0]}%, ${c[1]} ${vals[1] - gap}%,
        ${c[2]} ${vals[1] - gap}%, ${c[2]} ${vals[1] + gap}%,
        ${c[1]} ${vals[1] + gap}%, ${c[1]} ${vals[2] - gap}%,
        ${c[3]} ${vals[2] - gap}%, ${c[3]} ${vals[2] + gap}%,
        ${c[1]} ${vals[2] + gap}%, ${c[1]} ${vals[3]}%,
        ${c[0]} ${vals[3]}%
      )`;
    },
  },

  watch: {
    period() {
      localStorage.setItem('period', this.period);
    },
  },

  computed: {
    avrgs() {
      if (!this.periods || this.periods.length < 1) return false;
      const period = this.periods.find((a) => a.name === this.period);
      if (!period || !period.averages) return false;
      return Object.values(period.averages).sort((a, b) => b.value - a.value);
    },

    mrks() {
      if (!this.marks || this.marks.length < 1) return false;
      return this.marks.filter((m) => (
        (this.period === 'ALL' || m.period === this.period)
        && (
          !this.filter
          || compare(m.title, this.filter)
          || compare(m.period, this.filter)
          || compare(m.subject.name, this.filter)
        )
      ));
    },

    globalAvrgs() {
      if (!this.periods || this.periods.length < 1) return false;
      let period = this.periods.find((a) => a.name === this.period);
      if (!period) [period] = this.periods;
      return period;
    },
  },
};
</script>

<style scoped>
.marksPage {
  margin-bottom: 40px;
}

.filter {
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
}

.marks {
  display: grid;
  row-gap: 10px;
}

.markItem {
  display: grid;
  border: 1px solid #ffffff70;
  border-radius: 10px;
  background-color: #a9a9a919;
}

.markItem > * {
  display: flex;
  justify-content: space-between;
}

.marged { margin: 10px }
.margedLR { margin: 0 10px }
.margedB { margin-bottom: 10px }

.grey { opacity: 0.8 }

.coef {
  height: min-content;
  padding: 8px;
  font-size: 15px;
  border-left: 1px solid #ffffff70;
  border-bottom: 1px solid #ffffff70;
  border-bottom-left-radius: 10px;
}

.bar {
  height: 10px;
  width: 100%;
  margin: 10px;
  border-radius: 10px;
}

.periodSelect {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  justify-content: center;
  background-color: #0091ffc4;
}

.periodSelect > select {
  width: 100%;
  max-width: 300px;
  margin: 10px;
}

.periodList {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  max-width: 600px;
}

.periodList > .periodItem {
  width: 100%;
  padding: 10px;
  cursor: pointer;
}
.periodList > .periodItem.selected {
  background-color: #11d18e;
}
</style>
