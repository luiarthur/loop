// References: 
// - https://developers.google.com/youtube/iframe_api_reference
// - https://webninjadeveloper.com/javascript/javascript-iframe-youtube-api-example-to-embed-video-with-advanced-controls-in-browser/

console.log("Loaded load-iframe.js")

// Globals.
var PLAYER, LOOPER;

// TODO: set initialVideoID to be the last viewed video id.
// const videoID = "sK0J62VFC78" // Blue Serve -- Bill Evans
const initialVideoID = "JyjFCbB6qhA" // Dreamer -- Kiefer

// 2. This code loads the IFrame Player API code asynchronously.
function loadYouTubeIFrame() {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

loadYouTubeIFrame()

// 3. This function creates an <iframe> (and YouTube player) after the API code
// downloads.
function onYouTubeIframeAPIReady() {
  PLAYER = new YT.Player('yt-player', {
    height: '350',
    width: '100%',
    videoId: initialVideoID,
    playerVars: {
      playsinline: 1,
      autoplay: 0,
      controls: 1,
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  LOOPER = new Looper(PLAYER)

  event.target.playVideo()
  refreshSavedLoops(event.target.getVideoData().video_id)

  setInterval(() => {
    // Check if current time is out of bounds.
    if (outOfBounds(LOOPER, PLAYER)) {
      PLAYER.seekTo(LOOPER.startTime)
    }

    // Update current time.
    const currentTime = document.querySelector("#current-time")
    currentTime.textContent = secondsToMinuteSeconds(PLAYER.getCurrentTime())
  }, 200) // execute every 0.2 seconds.
}

function onPlayerStateChange(event) {
  const states = new Set([
    YT.PlayerState.UNSTARTED,
    YT.PlayerState.CUED,
  ])

  if (states.has(event.data)) {
    refreshSavedLoops(event.target.getVideoData().video_id)
    populateVideos()
    LOOPER.reset()
  }
}