function sanitizeName(name) {
    return name.replaceAll(/[.:-]/gi, "")
}

function randomLetters(numLetters) {
  let result = ""
  const characters = "abcdefghijklmnopqrstuvwxyz"
  for (let i = 0; i < numLetters; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
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

  save() {
    const data = this.player.getVideoData()
    const date = new Date()

    const newItem = {
      created: date.toISOString(),
      start: round2(this.startTime),
      end: round2(this.endTime),
      videoId: data.video_id,
      title: data.title,
      uname: randomLetters(20)
    }
    // Unique name.
    let uname = newItem.uname
    appendStore({[uname]: newItem})
  }
}
