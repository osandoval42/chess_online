const Clock = function(milliseconds, renderWon, clockDisplay){ //need 15:00 to render.  try to do this in her
  console.log(`milliseconds passed in ${milliseconds}`);
  this.milliseconds =  milliseconds;
  this.renderWon = renderWon;
  this.isRunning = false;
  this.clockDisplay = clockDisplay;
  this.renderDisplay();
}


Clock.prototype.start = function () {
  this.isRunning = true;
  this.intervalId = setInterval(() => {
    this.milliseconds -= 100;
    this.checkForExpiration();
    this.renderDisplay();
  }, 100)
};

Clock.prototype.toggleRunning = function(){
  if (this.isRunning){
    this.stop();
  }
  else{
    this.start();
  }
}

Clock.prototype.stop = function() {
  this.isRunning = false;
  clearInterval(this.intervalId)
};

Clock.prototype.renderDisplay = function(){
  let totalSeconds = Math.ceil(this.milliseconds / 1000)
  let minutes = Math.floor(totalSeconds / 60)
  let seconds = totalSeconds % 60;

  let minutesString = minutes > 0 ? `${minutes}` : `${0}`
  let secondsString = seconds > 9 ? `${seconds}` : `0${seconds}`
  let displayString = minutesString + ":" + secondsString;

  this.clockDisplay.innerHTML = displayString;
}

Clock.prototype.checkForExpiration = function(){
  if (this.milliseconds <= 0){
    this.stop();
    this.renderWon();
  }
}

module.exports = Clock;
