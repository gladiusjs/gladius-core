if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var Loop = function( callback, context ) {
    this.L_STARTED = 0;
    this.L_PAUSED = 1;
    this.L_CANCELLED = 2;
    this.L_FINISHED = 3;

    this.R_RUNNING = 0;
    this.R_IDLE = 1;

    this._loopState = this.L_PAUSED;
    this._runState = this.R_IDLE;    

    this.callback = callback;
    this.context = context || this;
  };

  function _run() {
    this._runState = this.R_RUNNING;
    if( this.callback ) {
      this.callback.call( this.context );
      if( this.L_STARTED === this._loopState ) {
        this._pump();
      } else {
        this.suspend();
      }
    }
    this._runState = this.R_IDLE;
  }

  function _pump() {
    throw new Error( "not implemented for base prototype" );
  }

  function suspend() {
    this._loopState = this.L_PAUSED;
  }

  function resume() {
    if( !this.callback ) {
      throw new Error( "callback not defined" );
    }
    this._loopState = this.L_STARTED;
    if( this._runState === this.R_IDLE ) {      
      this._pump();
    }
  }
  
  function isStarted() {
    return this._loopState === this.L_STARTED;
  }

  Loop.prototype = {
      suspend: suspend,
      resume: resume,
      _pump: _pump,
      _run: _run,
      isStarted: isStarted
  };

  return Loop;

});