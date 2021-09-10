<template>
  <h1>Hello World</h1>
  <div>
    <label>Time</label>
    <input type="number" v-model="state.dt" step="any"/>
    <input type="number" v-model="state.nSteps" step="any"/>
    <input type="number" v-model="state.tweak" step="any"/>
    <button @click="toggle()">{{state.running ? 'Stop' : 'Start'}}</button>
    <button @click="reset()">Reset</button>
  </div>
  <svg width="600" height="600">
    <g v-for="history in state.histories">
      <path :d="formatPathD(history.position, state.running ? 200 : 10000)" stroke-width="1" stroke="#333" fill="none"/>
    </g>
    <g v-for="body in state.bodies">

      <circle :r="body.radius"
        :cx="body.position[0] + state.center[0]"
        :cy="body.position[1] + state.center[1]"
        fill="orange">
      </circle>
    </g>
  </svg>
  <Plot/>
</template>


<script>
import {reactive} from 'vue'
import _ from 'lodash'
import {nextId} from "../id_helper";
import Plot from './Plot.vue'

function abs(vector) {
  return Math.sqrt(vector[0]**2 + vector[1]**2)
}

let G = 20



export default {
  components: {
    Plot
  },
  setup() {

    let defaultBodies = [{
      id: nextId(),
      mass: 1,
      position: [0, 0],
      v: [0.02,0],
      a: [0,0],
      radius: 10,
      fixed: false,
    },{
      id: nextId(),
      mass: 0,
      position: [0, 0],
      v: [0,0],
      a: [0,0],
      radius: 10,
      fixed: true,
    }, {
      id: nextId(),
      mass: 0,
      position: [0, -200],
      v: [0.18, 0],
      a: [0, 0],
      radius: 5,
      fixed: false,
    }]
    // },{
    //   id: nextId(),
    //   mass: 0.01,
    //   position: [0, 200],
    //   v: [-0.32,0],
    //   a: [0,0],
    //   radius: 3,
    //   fixed: false,
    // }]

    let state = reactive({
      bodies: _.cloneDeep(defaultBodies),
      histories: [],
      histories2: [],
      diffs: [],
      center: [300, 300],
      running: false,
      dt: 80,
      nSteps: 20,
      tweak: 0,
    })

    window.state = state
    window._ = _

    function addToHistories(bodies, histories = state.histories) {
      bodies.forEach((body) => {
        // debugger
        body = _.cloneDeep(body)
        let history = _.find(histories, {id: body.id})
        if (!history) {
          history = {id: body.id, position: [], v: [], a: []}
          histories.push(history)
        }
        history.position.push(body.position)
        history.v.push(body.v)
        history.a.push(body.a)
      })
    }

    function iterate(nIterations, timeout) {
      if (!state.running) return
      let duplicateBodies
      for (let i=0; i<state.nSteps; i++) {
        duplicateBodies = _.cloneDeep(state.bodies)
        advance(duplicateBodies, state.dt/state.nSteps/2)
        advance(duplicateBodies, state.dt/state.nSteps/2)
        addToHistories(duplicateBodies, state.histories2)

        advance(state.bodies, state.dt/state.nSteps)
        addToHistories(state.bodies, state.histories)
      }

      setTimeout(() => iterate(nIterations, timeout), timeout)
    }

    function advance(bodies, dt) {
      bodies.forEach((body) => {
        if (body.fixed) {
          return
        }

        let a = [0,0]
        bodies.forEach((otherBody) => {
          if (otherBody.id === body.id || otherBody.mass === 0) {
            return
          }
          let move = otherBody.id > body.id //TODO: depend on index instead of id
          let r = [
            (otherBody.position[0]+move*0.5*otherBody.v[0]*dt)-(body.position[0]+0.5*body.v[0]*dt),
            (otherBody.position[1]+move*0.5*otherBody.v[1]*dt)-(body.position[1]+0.5*body.v[1]*dt)
          ]
          let R = abs(r)
          let A = G * otherBody.mass / R**2
          a[0] += A*r[0]/R
          a[1] += A*r[1]/R
        })

        body.position[0] += body.v[0]*dt + 0.5*a[0]*dt**2
        body.position[1] += body.v[1]*dt + 0.5*a[1]*dt**2
        body.v[0] += a[0]*dt
        body.v[1] += a[1]*dt
        body.a = a
      })
    }

    function toggle() {
      state.running = !state.running
      if (state.running) {
        iterate(1000, 20)
      } else {
        let delta = {R: [], A: []}
        for (let i=0; i<state.histories2[2].position.length; i++) {
          let position1 = state.histories[2].position[i]
          // let a1 = state.histories[2].a[2*i]

          let position2 = state.histories2[2].position[i]
          let a2 = state.histories2[2].a[i]

          let a = state.histories[2][i]
          delta.R.push(abs([position1[0]-position2[0], position1[1]-position2[1]]))
          delta.A.push(abs(a2))
        }
        window.delta = delta
        window.plot(delta.A, delta.R)
      }
    }

    function reset() {
      state.bodies = _.cloneDeep(defaultBodies)
      state.histories = []
      state.histories2 = []
    }

    function formatPathD(array, last=10000) {
      if (array.length < 1) return
      let i = Math.max(array.length - last, 0)
      let result = `M ${array[i][0]+state.center[0]} ${array[i][1]+state.center[1]}`
      i++
      for (; i<array.length; i++) {
        result += ` L ${array[i][0]+state.center[0]} ${array[i][1]+state.center[1]}`
      }
      return result
    }

    return {state, toggle, reset, formatPathD}
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
</style>
