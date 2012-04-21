define( function( require ) {
  
  var Clock = function() {
    this.time = 0;
    this.delta = 0;
    this._timeScale = 1.0;
    this._idealFrameInterval = 1.0/30.0;
    
    this.C_STARTED = 0;
    this.C_PAUSED = 1;
   
    this._clockState = this.C_STARTED;
  };
  
  function suspend() {
    this._clockState = this.C_PAUSED;
  }
  
  function resume() {
    this._clockState = this.C_STARTED;
  }
  
  function update( delta ) {
    if( this.C_PAUSED !== this._clockState ) {
      this.delta = delta * this._timeScale;
      this.time += this.delta;
    }
  }
  
  function step( count ) {
    count = undefined === count ? 1 : count;
    if( this.C_PAUSED === this._clockState ) {
      this.delta = count * this._idealFrameInterval * this._timeScale;
      this.time += this.delta;
    }
  }
  
  function isPaused() {
    return this._clockState === this.C_PAUSED;
  }
  
  function reset() {
    this.time = 0;
    this.delta = 0;
  }
  
  function setTimeScale( scale ) {
    this._timeScale = scale;
  }
  
  function setIdealFrameInterval( interval ) {
    this._idealFrameInterval = interval;
  }
  
  Clock.prototype = {
     suspend: suspend,
     resume: resume,
     update: update,
     isPaused: isPaused,
     step: step,
     reset: reset,
     setTimeScale: setTimeScale,
     setIdealFrameInterval: setIdealFrameInterval
  };
  
  return Clock;
  
});