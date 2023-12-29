/* TODO:
- [X] Remove setTimeout
- [ ] The name of the loops should just be the start and end times.
      Because that is unique.
- [ ] Add option to remove saved videos.
*/

function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100
}

function secondsToMinuteSeconds(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

// TODO
function clearStorage() {
  if (confirm("Delete saved data?")) {
    alert("clearStorage() is not implemented!")
  }
}


function getOr(obj, key, defaultValue) {
  if (!obj.hasOwnProperty(key)) {
    obj.setItem(key, defaultValue)
  }
  return obj.getItem(key)
}

function getStore(videoId) {
  return JSON.parse(
    getOr(
      localStorage,
      videoId,
      JSON.stringify({
        title: PLAYER.getVideoData().title,
        videoId: videoId,
        loops: []
      })
    )
  )
}

function appendStore(newItem) {
  console.log(`Adding loop: ${JSON.stringify(newItem)}`)
  window.appendFirebase(newItem)
}

function removeStore(name) {
  console.log(`Removing loop: ${name}`)
  window.removeLoopFromFirebase(name)
}

window.loopComponent = (loop) => {
  const template = document.querySelector("#template-loop-item")
  const div = template.content.cloneNode(true).querySelector("div")

  let uname = sanitizeName(`${loop.videoId}_${loop.created}`)

  div.id += uname
  div.setAttribute("name", uname)

  const start = secondsToMinuteSeconds(loop.start)
  const end = secondsToMinuteSeconds(loop.end)
  const timeRange = `${start} - ${end}`

  const btn = div.querySelectorAll("button")
  btn.forEach(b => b.id += uname)

  btn[0].textContent = timeRange
  btn[0].addEventListener("click", () => playLoop(btn[0].id))
  btn[1].addEventListener("click", () => editLoop(btn[1].id))
  btn[2].addEventListener("click", () => removeLoop(btn[2].id))

  return div
}

function removeLoop(clickedId) {
  if (confirm("Delete loop?")) {
    // 1. Remove the record from storage.
    const id = clickedId.split("-").pop()
    console.log(`Clicked: ${clickedId}`)

    // This also updates the page.
    removeStore(id)
  }
}

function playLoop(clickedId) {
  const videoId = PLAYER.getVideoData().video_id
  const id = sanitizeName(`${clickedId.split("-").pop()}`)
  const div_id = `div-saved-loop-${id}`
  const elem = document.getElementById(div_id)
  console.log(elem)

  console.log(id)
  console.log(window.doc_data)
  LOOPER.startTime = window.doc_data[id].start
  LOOPER.endTime = window.doc_data[id].end
  PLAYER.seekTo(LOOPER.startTime)

  console.log(`Clicked ${clickedId}`)
}

function editLoop(clickedId) {
  // TODO
  alert("'Edit' is not implemented")
  console.log(`Clicked ${clickedId}`)
}

function outOfBounds(looper, player) {
  const currentTime = player.getCurrentTime()
  return (currentTime < looper.startTime) || (currentTime >= looper.endTime)
}

function setTextById(id, text) {
  document.getElementById(id).textContent = text
}

function restartLoop() {
  PLAYER.seekTo(LOOPER.startTime)
}

function addClickListener(id, f) {
  document.getElementById(id).addEventListener("click", f)
}

function getIdFromSharedUrl(url) {
  const re = /youtu.be\/(\w+)/
  const id = url.match(re)[1]
  return id
}

async function loadVideoByUrl() {
  let url = document.getElementById("input-yt-url").value
  const videoId = getIdFromSharedUrl(url)
  LOOPER.reset()
  PLAYER.cueVideoById(videoId, 0)
  window.render(videoId)
}

function run() {
  console.log("Loaded ui.js")
  
  // Show the list of tracks saved for current video.
  const saved_loops = document.getElementById("ul-saved-loops")

  // Event Listeners.
  addClickListener("btn-start-loop", () => {
    LOOPER.startTime = PLAYER.getCurrentTime()
    if (LOOPER.endTime === Infinity) {
      LOOPER.endTime = PLAYER.getDuration()
    }

    if(LOOPER.startTime < LOOPER.endTime) {
      const start = secondsToMinuteSeconds(LOOPER.startTime)
      setTextById("btn-start-loop", `Start (${start})`)
    } else {
      setTextById("btn-end-loop", `End`)
    }
  })

  addClickListener("btn-end-loop", () => {
    LOOPER.endTime = PLAYER.getCurrentTime()
    if(LOOPER.startTime < LOOPER.endTime) {
      const end = secondsToMinuteSeconds(LOOPER.endTime)
      setTextById("btn-end-loop", `End (${end})`)
    } else {
      LOOPER.startTime = 0
      setTextById("btn-start-loop", `Start`)
    }
  })


  document.querySelectorAll(".input-yt").forEach(input => {
    input.addEventListener("change", event => {
      document.querySelectorAll(".yt-input-section").forEach(input_ => {
        input_.classList.add("hidden")
      })
      const target = document.getElementById(input.id.replace("radio", "div"))
      target.classList.remove("hidden")
    })
  })

  addClickListener("btn-load-yt-url", loadVideoByUrl)
  addClickListener("btn-restart-loop", restartLoop)
  addClickListener("btn-save-loop", () => LOOPER.save())
  addClickListener("btn-clear-loop", () => LOOPER.reset())
  addClickListener("btn-clear-cache", clearStorage)
}

run()