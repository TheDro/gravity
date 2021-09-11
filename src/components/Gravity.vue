<template>
  <h1>Hello World</h1>
  <div>
    <label>Time</label>
    <input type="number" v-model="state.dt" step="any"/>
    <input type="number" v-model="state.nSteps" step="any"/>
  </div>

  <div class="scrolling-wrapper">
    <div style="display: inline-block;" class="card"
         v-for="body in state.bodies">
      <label>mass</label>
      <input type="number" v-model="body.mass" step="any"/>
      <label>radius</label>
      <input type="number" v-model="body.radius" step="any"/>
      <label>position</label>
      <input type="number" v-model="body.position[0]" step="any"/>
      <input type="number" v-model="body.position[1]" step="any"/>
      <label>velocity</label>
      <input type="number" v-model="body.v[0]" step="any"/>
      <input type="number" v-model="body.v[1]" step="any"/>
      <label>fixed</label>
      <input type="checkbox" style="margin: 0.5rem" v-model="body.fixed" />
    </div>
  </div>

  <Simulator :bodies="state.bodies" :dt="state.dt" :n-steps="state.nSteps"></Simulator>
</template>


<script>
import {reactive} from 'vue'
import _ from 'lodash'
import {nextId} from "../id_helper";
import Simulator from "./Simulator.vue";



export default {
  components: {
    Simulator
  },
  setup() {

    let defaultBodies = [{
      id: nextId(),
      mass: 1,
      position: [0, 0],
      v: [0.0,0],
      a: [0,0],
      radius: 10,
      fixed: true,
    },{
      id: nextId(),
      mass: 0,
      position: [0, 0],
      v: [0,0],
      a: [0,0],
      radius: 10,
      fixed: true,
    },{
      id: nextId(),
      mass: 0.02,
      position: [0, -100],
      v: [0.35, 0],
      a: [0, 0],
      radius: 5,
      fixed: false,
    },{
      id: nextId(),
      mass: 0.02,
      position: [0, 100],
      v: [-0.35, 0],
      a: [0, 0],
      radius: 5,
      fixed: false,
    }]

    let state = reactive({
      bodies: defaultBodies,
      dt: 80,
      nSteps: 20,
    })



    return {state}
  }
}

</script>


<style>
label {
  font-weight: bold;
}
body {
  padding: 1rem;
}

.scrolling-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.card {
  padding: 0.5rem;
  margin: 0.5rem;
  border: solid #ccc 1px;
  border-radius: 5px;
}
</style>
