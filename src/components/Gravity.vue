<template>
  <h1>Gravity</h1>
  <div>
    <div style="display: inline-block; margin: 0 0.5rem;">
      <label>Time Step</label>
      <input type="number" v-model.number="state.dt" step="any"/>
    </div>
    <div style="display: inline-block; margin: 0 0.5rem;">
      <label>Subdivisions</label>
      <input type="number" v-model.number="state.nSteps" step="any"/>
    </div>
    <button @click="exportBodies()">Export</button>
  </div>

  <div class="scrolling-wrapper">
    <div style="display: inline-block; width: 15rem;"
         class="card"
         v-for="body in state.bodies">


      <label>mass</label>
      <input type="number" v-model.number="body.mass" step="any"/>

      <label>radius</label>
      <div class="flex-row">
        <input style="flex-grow: 1" type="range" v-model.number="body.radius" min="0" max="20" step="0.1"/>
        <input style="width: 4rem" type="number" v-model.number="body.radius" step="0.1"/>
      </div>

      <label>position</label>
      <div class="flex-row">
        <input style="width: 50%" type="number" v-model.number="body.position[0]" step="any"/>
        <input style="width: 50%" type="number" v-model.number="body.position[1]" step="any"/>
      </div>
      <div class="flex-row">
        <input style="width: 50%" type="range" v-model.number="body.position[0]" min="-300" max="300" step="1"/>
        <input style="width: 50%" type="range" v-model.number="body.position[1]" min="-300" max="300" step="1"/>
      </div>

      <label>velocity</label>
      <div class="flex-row">
        <input style="width: 50%" type="number" v-model.number="body.v[0]" step="any"/>
        <input style="width: 50%" type="number" v-model.number="body.v[1]" step="any"/>
      </div>

      <label>fixed</label>
      <input type="checkbox" style="margin: 0.5rem" v-model="body.fixed" />

      <label>center</label>
      <input type="checkbox" style="margin: 0.5rem" v-model="body.center" @change="changeCenter(body)" />

      <div class="flex-row">
        <div style="flex-grow: 1"></div>
        <button @click="removeBody(body)">remove</button>
      </div>
    </div>

    <div style="display: inline-block; vertical-align: top; padding-top: 1rem;">
      <button @click="addBody()">Add</button>
    </div>
  </div>

  <Simulator :bodies="state.bodies" :dt="state.dt" :n-steps="state.nSteps"></Simulator>
</template>


<script>
import {reactive} from 'vue'
import _ from 'lodash'
import json5 from 'json5'
import {nextId} from "../id_helper";
import Simulator from "./Simulator.vue";
import {copyToClipboard, setUrlParam, getUrlParam} from "../export_helper";

window.json5 = json5

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
      center: false,
    },{
      id: nextId(),
      mass: 0.02,
      position: [0, 100],
      v: [1, 0],
      a: [0, 0],
      radius: 5,
      fixed: false,
      center: false,
    },{
      id: nextId(),
      mass: 0.001,
      position: [0, 250],
      v: [0.6, 0],
      a: [0, 0],
      radius: 3,
      fixed: false,
      center: false,
    }]



    let state = reactive({
      bodies: defaultBodies,
      dt: 10,
      nSteps: 10,
    })

    load()

    function load() {
      let urlState = getUrlParam('state')
      if (urlState === null) return

      let validState = {}
      let isValid = true

      try {
        validState.dt = validFloat(urlState.dt, state.dt)
        validState.nSteps = validInt(urlState.nSteps, state.nSteps)
        validState.bodies = urlState.bodies.map((body) => validBody(body))
      } catch {
        isValid = false
      }

      if (isValid) {
        Object.assign(state, validState)
      } else {
        console.error('state from URL was invalid')
        setUrlParam('state', null)
      }
    }

    function validFloat(input, defaultValue) {
      let isValid = (typeof input === 'number')
      if (!isValid && defaultValue === undefined) {
        throw `${input} is not a valid float`
      }
      return isValid ? input : defaultValue
    }

    function validInt(input, defaultValue) {
      let isValid = (typeof input === 'number')
      if (!isValid && defaultValue === undefined) {
        throw `${input} is not a valid integer`
      }
      return isValid ? Math.round(input) : defaultValue
    }

    function validBody(body) {
      return {
        id: nextId(),
        mass: validFloat(body.mass, 0),
        position: [validFloat(body.position[0]), validFloat(body.position[1])],
        v:  [validFloat(body.v[0]), validFloat(body.v[1])],
        a: [0, 0],
        radius: validFloat(body.radius, 5),
        fixed: body.fixed || false,
        center: body.center || false,
      }
    }

    let defaultBody = {
      id: null,
      mass: 0,
      position: [0, 220],
      v: [0.5, 0],
      a: [0, 0],
      radius: 5,
      fixed: false,
      center: false,
    }
    function addBody() {
      let body = _.cloneDeep(defaultBody)
      body.id = nextId()
      state.bodies.push(body)
    }

    function removeBody(body) {
      _.remove(state.bodies, body)
    }

    function exportBodies() {
      let copiedState = _.cloneDeep(state)
      setUrlParam('state', copiedState)
      copyToClipboard(window.href)
    }

    function changeCenter(currentBody) {
      if (currentBody.center) {
        state.bodies.forEach((body) => {
          if (body.id === currentBody.id) return
          body.center = false
        })
      }
    }

    return {state, addBody, exportBodies, removeBody, changeCenter}
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
  /*display: inline-flex;*/
}

.card {
  padding: 0.5rem;
  margin: 0.5rem;
  border: solid #ccc 1px;
  border-radius: 5px;
}

.flex-row {
  display: flex;
  flex-direction :row;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgba(0,0,0,0.3),0 1px 2px 0 rgba(0,0,0,0.3);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

</style>
