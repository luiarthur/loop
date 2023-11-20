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

    appendStore(data.video_id, {
      created: date.toISOString(),
      name: data.video_id,
      start: round2(this.startTime),
      end: round2(this.endTime)
    })

    refreshSavedLoops(data.video_id)
  }
}