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

  const uname = loop.uname
  div.id += uname
  div.setAttribute("name", uname)

  const start = secondsToMinuteSeconds(loop.start)
  const end = secondsToMinuteSeconds(loop.end)
  const timeRange = `${start} - ${end}`

  const btn = div.querySelectorAll("button")
  btn.forEach(b => b.id += uname)

  btn[0].textContent = timeRange
  btn[0].addEventListener("click", () => playLoop(btn[0].id))
  btn[1].addEventListener("click", () => removeLoop(btn[1].id))
  // btn[1].addEventListener("click", () => editLoop(btn[1].id))

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
  const videoId = sanitizeName(`${clickedId.split("-").pop()}`)
  LOOPER.startTime = window.doc_data[videoId].start
  LOOPER.endTime = window.doc_data[videoId].end
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

function renameTitle() {
  const data = PLAYER.getVideoData()
  const videoId = data.video_id
  const oldTitle = data.title
  const newTitle = prompt("Please enter a new title:", oldTitle)
  if (newTitle === null || newTitle == "") {
    alert("Action cancelled. Video title not renamed.")
  } else {
    window.renameVideoTitle(videoId, newTitle)
  }
}

function startLoop() {
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
}

function endLoop() {
  LOOPER.endTime = PLAYER.getCurrentTime()
  if(LOOPER.startTime < LOOPER.endTime) {
    const end = secondsToMinuteSeconds(LOOPER.endTime)
    setTextById("btn-end-loop", `End (${end})`)
  } else {
    LOOPER.startTime = 0
    setTextById("btn-start-loop", `Start`)
  }
}

function run() {
  console.log("Loaded ui.js")
  
  // Event Listeners.
  document.querySelectorAll(".input-yt").forEach(input => {
    input.addEventListener("change", event => {
      document.querySelectorAll(".yt-input-section").forEach(input_ => {
        input_.classList.add("hidden")
      })
      const target = document.getElementById(input.id.replace("radio", "div"))
      target.classList.remove("hidden")
    })
  })

  addClickListener("btn-start-loop", startLoop)
  addClickListener("btn-end-loop", endLoop)
  addClickListener("btn-load-yt-url", loadVideoByUrl)
  addClickListener("btn-restart-loop", restartLoop)
  addClickListener("btn-save-loop", () => LOOPER.save())
  addClickListener("btn-clear-loop", () => LOOPER.reset())
  addClickListener("btn-rename-title", renameTitle)
}

run()