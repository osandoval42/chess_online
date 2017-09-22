const Clock = function(minutes, renderWon, clockDisplay){ //need 15:00 to render.  try to do this in her
  this.seconds = minutes * 60;
  this.renderWon = renderWon;
  this.isRunning = false;
  this.clockDisplay = clockDisplay;
  this.renderDisplay();
}


Clock.prototype.start = function () {
  this.isRunning = true;
  this.intervalId = setInterval(() => {
    this.seconds--;
    this.checkForExpiration();
    this.renderDisplay();
  }, 1000)
};

Clock.prototype.toggleRunning = function(){
  if (this.isRunning){
    this.stop();
  }
  else{
    this.start();
  }
}

Clock.prototype.stop= function() {
  this.isRunning = false;
  clearInterval(this.intervalId)
};

Clock.prototype.renderDisplay = function(){
  let minutes = Math.floor(this.seconds / 60)
  let seconds = this.seconds % 60;

  let minutesString = minutes > 0 ? `${minutes}` : `${0}`
  let secondsString = seconds > 9 ? `${seconds}` : `0${seconds}`
  let displayString = minutesString + ":" + secondsString;

  this.clockDisplay.innerHTML = displayString;
}

Clock.prototype.checkForExpiration = function(){
  if (this.seconds <= 0){
    this.stop();
    this.renderWon();
  }
}

module.exports = Clock;
