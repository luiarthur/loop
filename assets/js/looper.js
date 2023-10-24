function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomUpperCase() {
    return String.fromCharCode(randomInteger(65, 90))
}

function randomLetters(n) {
    let letters = ""
    for (let i=0; i < n; i++) {
        letters += randomUpperCase()
    }
    return letters
}

class Looper {
  constructor(player) {
    this.startTime = 0
    this.endTime = Infinity
    this.loopName = null
    this.player = player
  }

  reset() {
    this.startTime = 0
    this.endTime = this.player.getDuration()
    setTextById("btn-start-loop", `Start`)
    setTextById("btn-end-loop", `End`)
  }

  async save() {
    const data = this.player.getVideoData()
    const date = new Date()

    const newItem = {
      created: date.toISOString(),
      start: round2(this.startTime),
      end: round2(this.endTime),
    }
    newItem.name = `${newItem.start}-${newItem.end}`
    await window.appendFirebase(data.video_id, newItem)

    // deprecate
    appendStore(data.video_id, newItem)

    refreshSavedLoops(data.video_id)
  }
}