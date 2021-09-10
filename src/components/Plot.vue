<template>
  <svg :width="state.width" :height="state.height">
    <g :transform="`scale(1 -1) translate(0 ${-state.height})`" >
      <circle v-for="point in state.points"
        :r="2"
        :cx="(point[0]-state.minX)*state.scaleX"
        :cy="(point[1]-state.minY)*state.scaleY"
        fill="#333">
      </circle>
    </g>
  </svg>
  <div> x:[{{state.minX}}, {{state.maxX}}] </div>
  <div> y:[{{state.minY}}, {{state.maxY}}] </div>
  <div>y/x: {{state.maxY/state.maxX}}</div>

</template>


<script>
import {reactive} from 'vue'
import _ from 'lodash'

export default {
  setup() {
    let state = reactive({
      height: 200,
      width: 200,
      points: [],
      minX: 0,
      maxX: 1,
      minY: 0,
      maxY: 1,
      scaleX: 1,
      scaleY: 1,
    })

    function plot(x,y) {
      state.minX = _.min(x)
      state.maxX = _.max(x)
      state.minY = _.min(y)
      state.maxY = _.max(y)
      state.scaleX = state.width/(state.maxX-state.minX)
      state.scaleY = state.height/(state.maxY-state.minY)

      state.points = []
      for (let i=0; i<y.length; i++) {
        state.points.push([x[i], y[i]])
      }
      console.log(state)
      window.plotState = state
    }

    window.plot = plot

    return {state}
  }
}

</script>


<style>

</style>
