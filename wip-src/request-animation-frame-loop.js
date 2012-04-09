define( function( require ) {

  if( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback, element ) {
      window.setTimeout( callback, 1000/60 );
    };
  }

  var RequestAnimationFrameLoop = function( callback ) {
    this.L_STARTED = 0;
    this.L_PAUSED = 1;
    this.L_CANCELLED = 2;
    this.L_FINISHED = 3;

    this.R_RUNNING = 0;
    this.R_IDLE = 1;

    this.loopState = this.L_PAUSED;
    this.runState = this.R_IDLE;

    this.callback = callback;
  };

  function _run() {
    this.runState = this.R_RUNNING;
    if( this.callback ) {
      var runAgain = this.callback();
      if( runAgain ) {
        this._pump();
      } else {
        this.suspend();
      }
    }
    this.runState = this.R_IDLE;
  };

  function _pump() {
    requestAnimationFrame( _run.bind( this ) );
  };

  function suspend() {
    this.loopState = this.L_PAUSED;
  };

  function resume() {
    if( !this.callback ) {
      throw new Error( "callback not defined" );
    }
    this.loopState = this.L_STARTED;
    if( this.runState === this.R_IDLE ) {      
      this._pump();
    }
  };

  RequestAnimationFrameLoop.prototype = {
      suspend: suspend,
      resume: resume,
      _pump: _pump
  };

  return RequestAnimationFrameLoop;

});