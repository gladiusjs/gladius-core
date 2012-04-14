define( function( require ) {

  var Loop = function( callback ) {
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
      this.callback();
      if( this.L_STARTED === this.loopState ) {
        this._pump();
      } else {
        this.suspend();
      }
    }
    this.runState = this.R_IDLE;
  };

  function _pump() {
    throw new Error( "not implemented for base prototype" );
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

  Loop.prototype = {
      suspend: suspend,
      resume: resume,
      _pump: _pump,
      _run: _run
  };

  return Loop;

});