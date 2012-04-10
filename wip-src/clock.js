define( function( require ) {
  
  var Clock = function() {
    this.time = 0;
    this.delta = 0;
    this.timeScale = 1.0;
    this.idealFrameInterval = 1.0/30.0;
    
    this.C_STARTED = 0;
    this.C_PAUSED = 1;
   
    this.clockState = this.C_STARTED;
  };
  
  function suspend() {
    this.clockState = this.C_PAUSED;
  };
  
  function resume() {
    this.clockState = this.C_STARTED;
  };
  
  function update( delta ) {
    if( this.C_PAUSED !== this.clockState ) {
      this.delta = delta * this.timeScale;
      this.time += this.delta;
    }
  };
  
  function step( count ) {
    count = undefined === count ? 1 : count;
    if( this.C_PAUSED === this.clockState ) {
      this.delta = count * this.idealFrameInterval * this.timeScale;
      this.time += this.delta;
    }
  };
  
  function isPaused() {
    return this.clockState === this.C_PAUSED;
  };
  
  function reset() {
    this.time = 0;
    this.delta = 0;
  };
  
  Clock.prototype = {
     suspend: suspend,
     resume: resume,
     update: update,
     isPaused: isPaused,
     step: step,
     reset: reset
  };
  
  return Clock;
  
});