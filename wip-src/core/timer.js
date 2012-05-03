if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var T_STARTED = 0,
  T_PAUSED = 1;

  var Timer = function( delegate, delay, callback, data ) {
    this._delegate = delegate;
    this._callback = callback;
    this._data = data;
    this._delay = delay;
    this.elapsed = 0;
    this._timerState = undefined;
    
    this.start();
  };
  
  function update( delta ) {
    if( T_PAUSED !== this._timerState ) {
      this.elapsed += delta;
      
      if( this.elapsed >= this._delay ) {
        this._callback( this._data );
        this.pause();
      }
    }
  }
  
  function start() {
    this._timerState = T_STARTED;
    this._delegate.subscribe( this.update );
  }
  
  function pause() {
    this._timerState = T_PAUSED;
    this._delegate.unsubscribe( this.update );
  }
  
  function isStarted() {
    return this._timerState === T_STARTED;
  }
  
  function reset() {
    this.elapsed = 0;
    this.start();
  }
  
  Timer.prototype = {
      start: start,
      pause: pause,
      update: update,
      isStarted: isStarted,
      reset: reset
  };
  
  return Timer;

});