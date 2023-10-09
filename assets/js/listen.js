// Check if current time is out of bounds.
setInterval(() => {
  if (outOfBounds(LOOPER, player)) {
    player.seekTo(LOOPER.startTime)
  }
}, 200) // execute every 0.2 seconds.