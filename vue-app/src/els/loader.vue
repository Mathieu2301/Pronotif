<template>
  <svg v-if="animated" viewBox="0 0 38 38" stroke="#fff">
    <g fill="none" transform="translate(1 1)" stroke-width="2">
      <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
      <path d="M36 18c0-9.94-8.06-18-18-18" transform="rotate(80.2602 18 18)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 18 18"
          to="360 18 18"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  </svg>
  <div v-else>Loading...</div>
</template>

<script>
export default {
  name: 'Loader',
  props: {
    animated: Boolean,
  },
};
</script>

<style scoped>
svg, div {
  position: fixed;
  top: 40%;
  left: calc(50% - 25px);
  text-align: center;
  width: 50px;
  z-index: 1000;
}
</style>
