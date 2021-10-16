<template>
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
</template>


<script>
import {reactive, watchEffect} from 'vue'
import {subtract} from '../math_helper'


export default {
  props: {
    bodies: {type: Array, required: true},
    histories: {type: Array, required: true},
    last: {type: Number, default: 10000},
    relative: {type: Boolean, default: false},
  },
  setup(props) {

    let state = reactive({
      bodies: [],
      paths: [],
    })

    watchEffect(() => {
      let centerBody;
      let centerHistory;
      if (props.relative) {
        centerBody = _.cloneDeep(_.find(props.bodies, {center: true}))
        centerHistory = _.find(props.histories, {id: centerBody?.id})
      }

      state.bodies = _.cloneDeep(props.bodies).map((body) => {
        if (centerBody) {
          body.position = subtract(body.position, centerBody.position)
        }
        return body
      })
      state.paths = props.histories.map((history) => {
        if (centerHistory) {
          return formatPathD(history.position, props.last, centerHistory.position)
        } else {
          return formatPathD(history.position, props.last)
        }
      })
    })

    function formatPathD(array, last=10000, centerArray=null) {
      if (array.length < 1) return

      let i = Math.max(array.length - last, 0)
      let result;
      if (centerArray) {
        result = `M ${array[i][0]-centerArray[i][0]} ${array[i][1]-centerArray[i][1]}`
        i++
        for (; i<array.length; i++) {
          result += ` L ${array[i][0]-centerArray[i][0]} ${array[i][1]-centerArray[i][1]}`
        }
      } else {
        result = `M ${array[i][0]} ${array[i][1]}`
        i++
        for (; i<array.length; i++) {
          result += ` L ${array[i][0]} ${array[i][1]}`
        }
      }
      return result
    }

    return {state, props}
  }
}

</script>


<style>

</style>
