console.log("Loaded ui.js")

function clearStorage() {
  if (confirm("Delete saved data?")) {
    localStorage.clear()
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
      // Play the selected video. 
      player.loadVideoById(id, 0)
      setTimeout(() => {
        LOOPER.reset()  // FIXME: This might jumping the gun before video is loaded.
        showSavedSections(id)
      }, 500);
    })
    datalist.appendChild(option)
  }
}

// Create localStorage if needed.
if (localStorage !== null) {
  populateVideos()
}

function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100
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
        title: player.getVideoData().title,
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
  info.loops.forEach((section, idx) => {
    if (section.name == name) {
      info.loops.splice(idx, 1)
    }
  })

  localStorage.setItem(videoId, JSON.stringify(info))
}

class Looper {
  constructor() {
    this.startTime = 0
    this.endTime = Infinity
    this.sectionName = null
  }

  reset() {
    this.startTime = 0
    this.endTime = player.getDuration()
    setTextById("btn-start-loop", `Start Loop`)
    setTextById("btn-end-loop", `End Loop`)
  }

  save() {
    // this.endTime = this.endTime === Infinity ? player.getDuration : this.endTime
    const data = player.getVideoData()
    const date = new Date()

    appendStore(data.video_id, {
      name: date.toISOString(),
      start: round2(this.startTime),
      end: round2(this.endTime)
    })

    showSavedSections(data.video_id)
  }
}
const LOOPER = new Looper()

function setHTMLById(id, html) {
  document.getElementById(id).innerHTML = html
}

function aComponent(name, idx, icon, listener) {
  const i = document.createElement("i")
  i.id = `i-${name}-${idx + 1}`
  i.setAttribute("class", `fa fa-fw ${icon}`)
  i.addEventListener("click", () => listener(i.id))

  const a = document.createElement("a")
  a.setAttribute("href", "#/")
  a.appendChild(i)

  return a
}

function liComponent(section, idx) {
  const li = document.createElement("li")
  li.setAttribute("name", section.name)
  li.id = `li-${idx + 1}`
  li.classList.add("li-section")
  li.innerHTML = `
    ${section.name} | start: ${section.start} | end: ${section.end}
  `
  
  li.appendChild(aComponent("play", idx, "fa-play", playSection))
  li.appendChild(aComponent("edit", idx, "fa-pencil", editSection))
  li.appendChild(aComponent("remove", idx, "fa-trash", removeSection))
  return li
}

function showSavedSections(videoId) {
  // const info = getStore(videoId)
  const info = JSON.parse(localStorage.getItem(videoId))
  const savedSections = info.loops

  const ul = document.getElementById("ul-saved-sections")
  ul.innerHTML = ""

  savedSections.forEach((section, idx) => {
    ul.appendChild(liComponent(section, idx))
  })
}

function removeSection(clickedId) {
  // 1. Remove the list item from page.
  const id = clickedId.split("-").pop()
  const li_id = `li-${id}`
  const elem = document.getElementById(li_id)
  const name = elem.getAttribute("name")
  elem.remove()
  console.log(`Clicked ${clickedId}`)

  // 2. Remove the record from storage.
  const data = player.getVideoData()
  removeStore(data.video_id, name)
}

function playSection(clickedId) {
  const videoId = player.getVideoData().video_id
  const info = getStore(videoId)

  const id = clickedId.split("-").pop()
  const li_id = `li-${id}`
  const elem = document.getElementById(li_id)
  const name = elem.getAttribute("name")

  for (section of info.loops) {
    if (section.name == name) {
      LOOPER.startTime = section.start
      LOOPER.endTime = section.end
      player.seekTo(LOOPER.startTime)
      break
    }
  }

  console.log(`Clicked ${clickedId}`)
}

function editSection(clickedId) {
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
  player.seekTo(LOOPER.startTime)
}

// Show the list of tracks saved for current video.
const saved_sections = document.getElementById("ul-saved-sections")

function addClickListener(id, f) {
  document.getElementById(id).addEventListener("click", f)
}

// Event Listeners.
addClickListener("btn-start-loop", () => {
  const currentTime = player.getCurrentTime()
  LOOPER.startTime = currentTime
  if (LOOPER.endTime === Infinity) {
    LOOPER.endTime = player.getDuration()
  }

  if(currentTime < LOOPER.endTime) {
    setTextById("btn-start-loop", `Start Loop (${round2(LOOPER.startTime)})`)
  } else {
    setTextById("btn-end-loop", `End Loop`)
  }

  console.log(`${LOOPER.startTime} ${LOOPER.endTime}`)
})

addClickListener("btn-end-loop", () => {
  const currentTime = player.getCurrentTime()
  LOOPER.endTime = currentTime
  if(LOOPER.startTime < currentTime) {
    setTextById("btn-end-loop", `End Loop (${round2(currentTime)})`)
  } else {
    LOOPER.startTime = 0
    setTextById("btn-start-loop", `Start Loop`)
  }

  console.log(`${LOOPER.startTime} ${LOOPER.endTime}`)
})


addClickListener("btn-load-yt-url", () => {
  let url = document.getElementById("input-yt-url").value

  // If the title is provided in the URL box, find the appropriate id.
  let foundExisting = false
  const videoIds = Object.keys(localStorage)
  let id = null
  for (vid of videoIds) {
    const info = JSON.parse(localStorage.getItem(vid))
    console.log(info)
    if (url == info.title) {
      foundExisting = true
      id = info.videoId
      break
    }
  }

  const videoId = foundExisting ? id : url.split("/").pop()
  player.loadVideoById(videoId, 0)
  setTimeout(() => {
    getStore(videoId)
    LOOPER.reset()  // FIXME: This might jumping the gun before video is loaded.
    showSavedSections(videoId)
  }, 500)
})

addClickListener("app-name", clearStorage)
addClickListener("btn-restart-loop", restartLoop)
addClickListener("btn-save-section", () => LOOPER.save())
addClickListener("btn-clear-loop", () => LOOPER.reset())

/* For loading video with different url:
  player.loadVideoByUrl("some-url", 0)

  Or:

  player.loadVideoByUrl({
    mediaContentUrl: "some-url",
    startSeconds: 0,
    endSeconds=10
  })
*/
