import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  // state
  state: () => ({
    unit: 'celsius',
  }),
  // getter
  getters: {
    isCelsius: (state) => state.unit === 'celsius',
    isFahrenheit: (state) => state.unit === 'fahrenheit',
  },
  // action
  actions: {
    setUnit(newUnit) {
      this.unit = newUnit
    },

    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    },
  },
})
