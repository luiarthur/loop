// References: 
// - https://developers.google.com/youtube/iframe_api_reference
// - https://webninjadeveloper.com/javascript/javascript-iframe-youtube-api-example-to-embed-video-with-advanced-controls-in-browser/

// 2. This code loads the IFrame Player API code asynchronously.
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'sK0J62VFC78',
    playerVars: {
      playsinline: 1,
      autoplay: 0,
      controls: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
let done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    // setTimeout(stopVideo, 6000);
    test()
    done = true;
  } else if (event.data == YT.PlayerState.ENDED && done) {
    // Auto loop. Better way to do this?
    test()
    done = false;
  }
}

function stopVideo() {
  player.stopVideo();
}

// TEST:
function test() {
  player.loadVideoByUrl({
    // The required mediaContentUrl parameter specifies a fully qualified
    // YouTube player URL in the format:
    // http://www.youtube.com/v/VIDEO_ID?version=3.
    mediaContentUrl: "https://www.youtube.com/v/sK0J62VFC78?version=3", // Blue Serve -- Bill Evans
    startSeconds: 77,
    endSeconds: 90
  })
}
console.log("ASD")
