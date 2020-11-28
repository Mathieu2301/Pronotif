<template>
  <div class="option" @click="onClick">
    <div class="name">
      <slot/>
    </div>
    <label class="switch">
      <input type="checkbox"
        v-model="value"
        :checked="firstValue">
      <span class="slider"></span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'OptionSwitch',
  props: {
    firstValue: Boolean,
    onClick: Function,
  },

  updated() {
    if (this.firstValue !== this.value) this.value = this.firstValue;
  },

  data() {
    return {
      value: this.firstValue,
    };
  },
};
</script>

<style scoped>
.option {
  display: flex;
  padding: 0 20px;
  height: 70px;
  align-items: center;
  background-color: #e6e6e61f;
  justify-content: space-between;
  margin-bottom: 10px;
  cursor: pointer;
}

.option.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.switch {
  position: relative;
  display: inline-block;
  min-width: 59px;
  height: 32px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 34px;
  background-color: var(--orange);
  box-shadow: 0 1px 1px var(--shadow);
  transition: 80ms;
  border: solid 2px #e6e6e6;
}

.slider:before {
  position: absolute;
  content: '';
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  border-radius: 50%;
  background-color: var(--white);
  box-shadow: 1px 1px 5px var(--shadow);
  transition: 80ms;
}

input:checked + .slider {
  background-color: var(--color1);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--shadow);
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>
