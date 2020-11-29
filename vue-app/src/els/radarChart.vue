<template>
  <canvas id="canvas"></canvas>
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
          pointBorderColor: '#FFF',
          lineTension: 0.1,
          data: [],
        }, {
          backgroundColor: '#1b1f2338',
          borderColor: '#1b1f2338',
          pointBorderColor: '#FFF',
          lineTension: 0.1,
          data: [],
        }],
      },
      options: {
        scale: {
          gridLines: {
            color: '#d9d9d9',
          },
          pointLabels: {
            fontSize: 11,
            fontColor: '#fafafa',
            fontFamily: '"Questrial", sans-serif',
          },
          ticks: {
            beginAtZero: true,
            maxTicksLimit: 20,
            min: 0,
            max: 20,
            display: false,
          },
        },
        responsive: true,
        tooltips: {
          enabled: false,
        },
        legend: {
          display: false,
        },
      },
    },
  }),

  mounted() {
    const ctx = document.getElementById('canvas').getContext('2d');

    this.averages.forEach((avrg) => {
      this.chartOptions.data.labels.push(avrg.name);
      this.chartOptions.data.datasets[0].data.push(avrg.value);
      this.chartOptions.data.datasets[1].data.push(avrg.class);
    });

    this.chart = new Chart(ctx, this.chartOptions);
  },
};
</script>

<style>

</style>
