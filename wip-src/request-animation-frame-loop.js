define( function( require ) {
  
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
    this.runState = R_RUNNING;
    if( this.callback ) {
      var runAgain = callback();
      if( runAgain ) {
        _pump();
      } else {
        this.suspend();
      }
    }
    this.runState = R_IDLE;
  };
  
  function _pump() {
    requestAnimationFrame( _process );
  };
  
  function suspend() {
    this.loopState = this.L_PAUSED;
  };
  
  function resume() {
    this.loopState = this.L_STARTED;
    if( this.runState === this.R_IDLE ) {
      _pump();
    }
  };
  
  RequestAnimationFrameLoop.prototype = {
    suspend: suspend,
    resume: resume,
    isActive: isActive,
    isRunning: isRunning
  };
  
  return RequestAnimationFrameLoop;
  
});