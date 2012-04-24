if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {
  
  var MulticastDelegate = require( "common/multicast-delegate" );
  
  var C_STARTED = 0,
  C_PAUSED = 1;
  
  var Clock = function() {
    this.time = 0;
    this.delta = 0;
    this._timeScale = 1.0;
    this._idealFrameInterval = 1.0/30.0;
    
    this._clockState;
    this.signal = new MulticastDelegate();
    
    this.start();
  };
  
  function pause() {
    this._clockState = C_PAUSED;
  }
  
  function start() {
    this._clockState = C_STARTED;
  }
  
  function update( delta ) {
    if( C_PAUSED !== this._clockState ) {
      this.delta = delta * this._timeScale;
      this.time += this.delta;
      this.signal( this.delta ); // Dispatch time signal
    }
  }
  
  function step( count ) {
    count = undefined === count ? 1 : count;
    if( C_PAUSED === this._clockState ) {
      this.delta = count * this._idealFrameInterval * this._timeScale;
      this.time += this.delta;
      this.signal( this.delta );  // Dispatch time signal
    }
  }
  
  function isStarted() {
    return this._clockState === C_STARTED;
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
     pause: pause,
     start: start,
     update: update,
     isStarted: isStarted,
     step: step,
     reset: reset,
     setTimeScale: setTimeScale,
     setIdealFrameInterval: setIdealFrameInterval
  };
  
  return Clock;
  
});