<template>
  <canvas id="canvas" @contextmenu="toggleCircular" @click="toggleTicks"/>
</template>

<script>
import Chart from 'chart.js';

export default {
  name: 'RadarChart',

  props: { averages: Object },

  data: () => ({
    chart: null,

    chartOptions: {
      type: 'radar',
      data: {
        labels: [],
        datasets: [{
          backgroundColor: '#11d18e50',
          borderColor: '#11d18e',
          pointBorderColor: [],
          lineTension: 0.1,
          data: [],
        }, {
          backgroundColor: '#007cde38',
          borderColor: '#007cde',
          pointBorderColor: '#FFF',
          lineTension: 0.1,
          data: [],
        }],
      },
      options: {
        scale: {
          gridLines: {
            color: '#d9d9d9',
            circular: localStorage.getItem('radarCircularMode') === 'true',
          },
          pointLabels: {
            fontSize: 11,
            fontColor: [],
            fontFamily: '"Questrial", sans-serif',
          },
          ticks: {
            beginAtZero: true,
            maxTicksLimit: 20,
            min: 0,
            max: 20,
            display: localStorage.getItem('radarTicksShow') === 'true',
          },
        },
        tooltips: { enabled: false },
        legend: { display: false },
        responsive: true,
        aspectRatio: 1.5,
      },
    },
  }),

  methods: {
    toggleCircular(e) {
      e.preventDefault();
      this.chartOptions.options
        .scale.gridLines.circular = !this.chartOptions.options
          .scale.gridLines.circular;
      localStorage.setItem(
        'radarCircularMode',
        this.chartOptions.options.scale.gridLines.circular,
      );
      this.chart.update();
    },

    toggleTicks() {
      this.chartOptions.options
        .scale.ticks.display = !this.chartOptions.options
          .scale.ticks.display;
      localStorage.setItem(
        'radarTicksShow',
        this.chartOptions.options.scale.ticks.display,
      );
      this.chart.update();
    },

    update() {
      this.chartOptions.data.labels = [];
      this.chartOptions.options.scale.pointLabels.fontColor = [];
      this.chartOptions.data.datasets[0].data = [];
      this.chartOptions.data.datasets[1].data = [];

      this.averages.forEach((avrg) => {
        this.chartOptions.data.labels.push(avrg.name.split(/-|\.| /g)[0]);
        this.chartOptions.options.scale.pointLabels.fontColor.push(avrg.color);
        this.chartOptions.data.datasets[0].data.push(avrg.value);
        this.chartOptions.data.datasets[1].data.push(avrg.class);
      });

      this.chart.update();
    },
  },

  watch: {
    averages() { this.update(); },
  },

  mounted() {
    const ctx = document.getElementById('canvas').getContext('2d');
    this.chart = new Chart(ctx, this.chartOptions);
    this.update();
  },
};
</script>
