<template>
  <div>
    <button @click="toggle()">{{state.running ? 'Stop' : 'Start'}}</button>
    <button @click="reset()">Reset</button>
  </div>
  <StarMap
      :bodies="state.bodies"
      :histories="state.histories"
      :last="state.running ? 200 : 10000"
      :relative="false" />
  <StarMap
      :bodies="state.bodies"
      :histories="state.histories"
      :last="state.running ? 200 : 10000"
      :relative="true" />
  <Plot/>
</template>


<script>
import {reactive, watchEffect} from 'vue'
import _ from 'lodash'
import Plot from './Plot.vue'
import StarMap from "./StarMap.vue";
import {Clock} from '../time_helper'
import {add, subtract, mult, unit, mag} from '../math_helper'

let G = 100
let FPS = 60

export default {
  props: {
    bodies: Array,
    dt: Number,
    nSteps: Number,
  },
  components: {
    Plot, StarMap
  },
  setup(props) {

    let state = reactive({
      bodies: [],
      histories: [],
      histories2: [],
      running: false,
      logError: false,
    })

    watchEffect(() => {
      state.bodies = _.cloneDeep(props.bodies)
    })

    window.state = state
    window._ = _

    let clock = Clock()

    function addToHistories(bodies, histories = state.histories) {
      bodies.forEach((body) => {
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
        // let A = mag(state.bodies[2].a)
        let oldDt = props.dt/props.nSteps
        // let dt = Math.min(5*oldDt, Math.max(oldDt/5,
        //     oldDt/(A*100)**1))
        let dt = oldDt

        if (state.logError) {
          duplicateBodies = _.cloneDeep(state.bodies)
          advance(duplicateBodies, dt/2)
          advance(duplicateBodies, dt/2)
          addToHistories(duplicateBodies, state.histories2)
        }

        advance(state.bodies, dt)
        if (i%(Math.ceil(props.nSteps/2)) === 0) {
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
          let r = subtract(
              add(otherBody.position, mult(move*dt, otherBody.v)),
              add(body.position, mult(0.5*dt, body.v))
          )

          let R = mag(r)
          let A = G * otherBody.mass / R**2
          a = add(a, mult(A, unit(r)))
        })

        body.position = add(body.position, add( mult(body.v, dt), mult(a, 0.5*dt**2)))
        body.v = add(body.v, mult(dt, a))
        body.a = a
      })
    }

    function toggle() {
      state.running = !state.running
      if (state.running) {
        iterate(1000, 1000/FPS)
      } else if (state.logError) {
        let delta = {R: [], A: []}
        for (let i=0; i<state.histories2[2].position.length; i++) {
          let position1 = state.histories[2].position[i]
          // let a1 = state.histories[2].a[2*i]

          let position2 = state.histories2[2].position[i]
          let a2 = state.histories2[2].a[i]

          let a = state.histories[2][i]
          delta.R.push(mag([position1[0]-position2[0], position1[1]-position2[1]]))
          delta.A.push(mag(a2))
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

    return {state, toggle, reset}
  }
}

</script>


<style>

</style>
