if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {
  
  var MulticastDelegate = require( "common/multicast-delegate" );
  
  var C_STARTED = 0,
  C_PAUSED = 1;
  
  var Clock = function( delegate ) {
    this.time = 0;
    this.delta = 0;
    this._timeScale = 1.0;
    this._idealFrameInterval = 1.0/30.0;
    
    this._clockState = undefined;
    this.signal = new MulticastDelegate();
    this._delegate = delegate || null;

    this._delegateHandler = this.update.bind( this );
    if( this._delegate ) {
      this._delegate.subscribe( this._delegateHandler );
    }

    this._stepCount = 0;
    
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
    } else {
      this.delta = this._stepCount * this._idealFrameInterval * this._timeScale;
      this._stepCount = 0;
    }
    this.time += this.delta;
    this.signal( this.delta ); // Dispatch time signal
  }
  
  function step( count ) {
    if( C_PAUSED === this._clockState ) {
      this._stepCount += (undefined === count) ? 1 : count;
    }
  }
  
  function isStarted() {
    return this._clockState === C_STARTED;
  }
  
  function reset( delegate ) {
    if( delegate && delegate != this._delegate ) {
      this._delegate.unsubscribe( this._delegateHandler );  
      this._delegate = delegate || null;
      this._delegate.subscribe( this._delegateHandler );
    }
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