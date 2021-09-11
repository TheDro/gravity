

function Clock() {
  let self = {
    startTime: new Date(),
    endTime: new Date(),
    tik: tik,
    tok: tok,
    delta: 0,
  }

  function tik() {
    self.startTime = new Date()
    return self.startTime
  }

  function tok() {
    self.endTime = new Date()
    self.delta = self.endTime.valueOf() - self.startTime.valueOf()
    return self.delta
  }


    return self
}


export {Clock}