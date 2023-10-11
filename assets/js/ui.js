/* TODO:
- [X] Remove setTimeout
- [ ] The name of the loops should just be the start and end times.
      Because that is unique.
*/

console.log("Loaded ui.js")

function div(x, a) {
    return Math.floor(x / a)
}

function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100
}

function secondsToMinuteSeconds(seconds) {
  const m = div(seconds, 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function clearStorage() {
  if (confirm("Delete saved data?")) {
    localStorage.clear()
    refreshSavedLoops(PLAYER.getVideoData().video_id)
  }
}

function populateVideos() {
  const datalist = document.getElementById("dl-video-names")
  const videoIds = Object.keys(localStorage)
  for (id of videoIds) {
    const info = JSON.parse(localStorage.getItem(id))
    const option = document.createElement("option")
    option.setAttribute("id", id)
    console.log(info)
    option.value = info.title
    console.log(option)
    option.addEventListener("click", () => {
      LOOPER.reset()
      PLAYER.cueVideoById(id, 0)
    })
    datalist.appendChild(option)
  }
}

// Create localStorage if needed.
if (localStorage !== null) {
  populateVideos()
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

function appendStore(videoId, newItem) {
  const info = getStore(videoId)
  info.loops.push(newItem)
  localStorage.setItem(videoId, JSON.stringify(info))
}

function removeStore(videoId, name) {
  const info = getStore(videoId)
  info.loops.forEach((loop, idx) => {
    if (loop.name == name) {
      info.loops.splice(idx, 1)
    }
  })

  localStorage.setItem(videoId, JSON.stringify(info))
}


function setHTMLById(id, html) {
  document.getElementById(id).innerHTML = html
}

function loopItemComponent(name, idx, text, listener) {
  const button = document.createElement("button")
  button.id = `button-${name}-${idx + 1}`
  button.classList.add("p-2")
  if (name == "play") {
    button.classList.add("p-2", "flex-grow-1")
  }
  button.addEventListener("click", () => listener(button.id))
  button.innerText = text
  return button
}

function loopComponent(loop, idx) {
  const div = document.createElement("div")
  div.id = `div-saved-loop-${idx+1}`
  div.setAttribute("name", loop.name)
  div.classList.add("d-flex")
  const start = secondsToMinuteSeconds(loop.start)
  const end = secondsToMinuteSeconds(loop.end)
  const timeRange = `${start} - ${end}`
  
  div.appendChild(loopItemComponent("play", idx, timeRange, playLoop))
  div.appendChild(loopItemComponent("edit", idx, "Edit", editLoop))
  div.appendChild(loopItemComponent("remove", idx, "Remove", removeLoop))

  return div
}

function refreshSavedLoops(videoId) {
  // Clean loops first.
  const div = document.getElementById("div-saved-loops")
  div.innerHTML = ""

  if (localStorage.getItem(videoId) !== null) {
    const info = JSON.parse(localStorage.getItem(videoId))
    const savedLoops = info.loops

    savedLoops.forEach((loop, idx) => {
      div.appendChild(loopComponent(loop, idx))
    })
  }
}

function removeLoop(clickedId) {
  if (confirm("Delete loop?")) {
    // 1. Remove the list item from page.
    const id = clickedId.split("-").pop()
    console.log(id)
    const div_id = `div-saved-loop-${id}`
    const elem = document.getElementById(div_id)
    const name = elem.getAttribute("name")
    elem.remove()
    console.log(`Clicked ${clickedId}`)

    // 2. Remove the record from storage.
    const data = PLAYER.getVideoData()
    removeStore(data.video_id, name)
  }
}

function playLoop(clickedId) {
  const videoId = PLAYER.getVideoData().video_id
  const info = getStore(videoId)

  const id = clickedId.split("-").pop()
  const div_id = `div-saved-loop-${id}`
  const elem = document.getElementById(div_id)
  console.log(elem)
  const name = elem.getAttribute("name")

  for (loop of info.loops) {
    if (loop.name == name) {
      LOOPER.startTime = loop.start
      LOOPER.endTime = loop.end
      PLAYER.seekTo(LOOPER.startTime)
      console.log("found!")
      break
    }
  }

  console.log(`Clicked ${clickedId}`)
}

function editLoop(clickedId) {
  // TODO
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

// Show the list of tracks saved for current video.
const saved_loops = document.getElementById("ul-saved-loops")

function addClickListener(id, f) {
  document.getElementById(id).addEventListener("click", f)
}

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

function getIdFromSharedUrl(url) {
  const re = /youtu.be\/(\w+)/
  const id = url.match(re)[1]
  console.log(id)
  return id
}


addClickListener("btn-load-yt-url", () => {
  let url = document.getElementById("input-yt-url").value

  // If the title is provided in the URL box, find the appropriate id.
  let foundExisting = false
  const videoIds = Object.keys(localStorage)
  let id = null
  for (vid of videoIds) {
    const info = JSON.parse(localStorage.getItem(vid))
    if (url == info.title) {
      foundExisting = true
      id = info.videoId
      break
    }
  }

  const videoId = foundExisting ? id : getIdFromSharedUrl(url)
  LOOPER.reset()
  PLAYER.cueVideoById(videoId, 0)
})

function exportData() {
  // Copy localStorage to clipboard.
  // https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
  // https://stackoverflow.com/questions/69438702/why-does-navigator-clipboard-writetext-not-copy-text-to-clipboard-if-it-is-pro
  navigator.clipboard.writeText(
    JSON.stringify(localStorage)
  ).then(() => {
    console.log("Copied data to clipboard!")
    alert("App data to copied to clipboard!")
  }).catch(() => {
    alert("something went wrong")
  })
}

async function importData() {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  // https://stackoverflow.com/questions/13335967/export-data-in-localstorage-for-later-re-import
  const strData = await navigator.clipboard.readText()

  if (confirm("Import data from clipboard?")) {
    const data = JSON.parse(strData)
    Object.keys(data).forEach((k) => {
      localStorage.setItem(k, data[k])
    })
    console.log("Imported data from clipboard!")
    refreshSavedLoops(PLAYER.getVideoData().video_id)
  }
}

addClickListener("app-name", clearStorage)
addClickListener("btn-restart-loop", restartLoop)
addClickListener("btn-save-loop", () => LOOPER.save())
addClickListener("btn-clear-loop", () => LOOPER.reset())
addClickListener("btn-export-data", exportData)
addClickListener("btn-import-data", importData)