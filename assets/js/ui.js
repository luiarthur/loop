console.log("Loaded ui.js")

function clearASDStorage() {
  localStorage.removeItem("asd")
}

function populateVideos() {
  const asd = JSON.parse(localStorage.getItem("asd"))
  const datalist = document.getElementById("dl-video-names")
  for (let id in asd) {
    const option = document.createElement("option")
    option.setAttribute("id", id)
    option.value = asd[id].title
    option.addEventListener("click", () => {
      // TODO
      // Play the selected video. 
      player.loadVideoById(id, 0)
      LOOPER.reset()  // FIXME: This might jumping the gun before video is loaded.
      showSavedSections(id)
    })
    datalist.appendChild(option)
  }
}

// Create localStorage if needed.
if(localStorage.hasOwnProperty("asd")) {
  console.log("localStorage already has key: 'asd'")
  populateVideos()
} else {
  localStorage.setItem("asd", JSON.stringify({}))
  console.log("Setting localStorage to {}")
}

function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100
}

function getOr(obj, key, defaultValue) {
  if (!obj.hasOwnProperty(key)) {
    obj[key] = defaultValue
  }
  return obj[key]
}

function getStore(videoId) {
  let asd = JSON.parse(localStorage.getItem("asd"))
  getOr(asd, videoId, {
    title: player.getVideoData().title,
    videoId: videoId,
    loops: []
  })
  return asd
}

function setStore(videoId, asd, newItem) {
  asd[videoId].loops.push(newItem)
  localStorage.setItem("asd", JSON.stringify(asd))
}

function removeStore(videoId, asd, title) {
  asd[videoId].forEach((section, idx) => {
    if (section.title == title) {
      asd[videoId].loops.splice(idx, 1)
    }
  })
  console.log(asd)
  localStorage.setItem("asd", JSON.stringify(asd))
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
    const endTime = this.endTime === Infinity ? player.getDuration : this.endTime
    const data = player.getVideoData()
    const asd = getStore(data.video_id)

    const date = new Date()

    setStore(data.video_id, asd, {
      title: date.toISOString(),
      start: round2(this.startTime),
      end: round2(this.endTime)
    })

    showSavedSections()
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
  li.setAttribute("title", section.title)
  li.id = `li-${idx + 1}`
  li.classList.add("li-section")
  li.innerHTML = `
    ${section.title} | start: ${section.start} | end: ${section.end}
  `
  
  li.appendChild(aComponent("play", idx, "fa-play", playSection))
  li.appendChild(aComponent("edit", idx, "fa-pencil", editSection))
  li.appendChild(aComponent("remove", idx, "fa-trash", removeSection))
  return li
}

function showSavedSections(videoId) {
  if (videoId === undefined) {
    videoId = player.getVideoData().video_id
  }
  const asd = JSON.parse(localStorage.getItem("asd"))
  const savedSections = asd[videoId].loops

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
  const title = elem.getAttribute("title")
  elem.remove()
  console.log(`Clicked ${clickedId}`)

  // 2. Remove the record from storage.
  const data = player.getVideoData()
  removeStore(data.video_id, getStore(data.video_id), title)
}

function playSection(clickedId) {
  // TODO
  const videoId = player.getVideoData().video_id
  const asd = getStore(videoId)

  const id = clickedId.split("-").pop()
  const li_id = `li-${id}`
  const elem = document.getElementById(li_id)
  const title = elem.getAttribute("title")

  for (section of asd[videoId].loops) {
    if (section.title == title) {
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
  const asd = JSON.parse(localStorage.getItem("asd"))
  let url = document.getElementById("input-yt-url").value

  // If the title is provided in the URL box, find the appropriate id.
  let foundExisting = false
  for (let id in asd) {
    if (url == asd[id].title) {
      url = id
      break
    }
  }

  const videoId = foundExisting ? url : url.split("/").pop()
  player.loadVideoById(videoId, 0)
  LOOPER.reset()  // FIXME: This might jumping the gun before video is loaded.
  showSavedSections(videoId)
})

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
