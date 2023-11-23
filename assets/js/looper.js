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

  save() {
    const data = this.player.getVideoData()
    const date = new Date()

    const newItem = {
      created: date.toISOString(),
      start: round2(this.startTime),
      end: round2(this.endTime)
    }
    newItem.name = `${newItem.start}-${newItem.end}`
    appendStore(data.video_id, newItem)

    refreshSavedLoops(data.video_id)
  }
}
