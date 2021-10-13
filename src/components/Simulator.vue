<template>
  <div>
    <button @click="toggle()">{{state.running ? 'Stop' : 'Start'}}</button>
    <button @click="reset()">Reset</button>
  </div>
  <svg width="600" height="600" class="shadow">
    <g :transform="`scale(1 -1) translate(300 -300)`">
      <g v-for="path in state.paths">
        <path :d="path" stroke-width="1" stroke="#333" fill="none"/>
      </g>
      <g v-for="body in state.bodies">

        <circle :r="body.radius"
                :cx="body.position[0]"
                :cy="body.position[1]"
                fill="orange">
        </circle>
      </g>
    </g>
  </svg>
  <Plot/>
</template>


<script>
import {reactive, watchEffect} from 'vue'
import _ from 'lodash'
import {nextId} from "../id_helper";
import Plot from './Plot.vue'
import {Clock} from '../time_helper'

function abs(vector) {
  return Math.sqrt(vector[0]**2 + vector[1]**2)
}

let G = 100


export default {
  props: {
    bodies: Array,
    dt: Number,
    nSteps: Number,
  },
  components: {
    Plot
  },
  setup(props) {


    let state = reactive({
      bodies: [],
      histories: [],
      paths: [],
      histories2: [],
      running: false,
      logError: false,
    })

    watchEffect(() => {
      state.paths = state.histories.map((history) => {
        return formatPathD(history.position, state.running ? 300 : 10000)
      })
    })

    watchEffect(() => {
      state.bodies = _.cloneDeep(props.bodies)
    })

    window.state = state
    window._ = _

    let clock = Clock()

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

      clock.tik()
      for (let i=0; i<props.nSteps; i++) {
        let A = abs(state.bodies[2].a)
        let oldDt = props.dt/props.nSteps
        let dt = Math.min(5*oldDt, Math.max(oldDt/5,
            oldDt/(A*100)**1))
        dt = oldDt

        if (state.logError) {
          duplicateBodies = _.cloneDeep(state.bodies)
          advance(duplicateBodies, dt/2)
          advance(duplicateBodies, dt/2)
          addToHistories(duplicateBodies, state.histories2)
        }

        advance(state.bodies, dt)
        if (i%4 === 0) {
          addToHistories(state.bodies, state.histories)
        }
      }
      let remainingTime = Math.max(0, timeout-clock.tok())
      setTimeout(() => iterate(nIterations, timeout), remainingTime)
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
          let move = otherBody.id > body.id ? 0.5 : -0.5 //TODO: depend on index instead of id
          let r = [
            (otherBody.position[0]+move*otherBody.v[0]*dt)-(body.position[0]+0.5*body.v[0]*dt),
            (otherBody.position[1]+move*otherBody.v[1]*dt)-(body.position[1]+0.5*body.v[1]*dt)
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
        iterate(1000, 1000/60)
      } else if (state.logError) {
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
      state.bodies = _.cloneDeep(props.bodies)
      state.histories = []
      state.histories2 = []
    }

    function formatPathD(array, last=10000) {
      if (array.length < 1) return
      let i = Math.max(array.length - last, 0)
      let result = `M ${array[i][0]} ${array[i][1]}`
      i++
      for (; i<array.length; i++) {
        result += ` L ${array[i][0]} ${array[i][1]}`
      }
      return result
    }

    return {state, toggle, reset, formatPathD}
  }
}

</script>


<style>

</style>
