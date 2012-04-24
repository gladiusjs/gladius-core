define( function ( require ) {
  
  var Loop = require( "request-animation-frame-loop" );
  var Clock = require( "clock" );
  var Scheduler = require( "dependency-scheduler" );
  var FunctionTask = require( "function-task" );
  var Timer = require( "timer" );
  
  function simulationLoop() {
    var timestamp = Date.now();
    var delta = timestamp - this.cachedTimestamp;
    this.cachedTimestamp = timestamp;
    
    this._realClock.update( delta );
    this._simulationClock.update( delta );
    
    this._scheduler.update();
    while( this._scheduler.hasNext() ) {
      this._scheduler.next().run();
    }
  }

  var Engine = function() {
    this._loop = new Loop( simulationLoop );
    this._realClock = new Clock();
    this._simulationClock = new Clock();
    this._scheduler = new Scheduler();
    
    // Bind the scheduler to the task constructor
    this.FunctionTask = FunctionTask.bind( this, this._scheduler );
 
    this.Timer = Timer;

    // Convenient constructors bound to each of the engine timers by default
    this.RealTimer = Timer.bind( this, this._realClock.signal );
    this.SimulationTimer = Timer.bind( this, this._simulationClock.signal );
  };
  
  Engine.prototype = {
      run: null,
      suspend: null,
      resume: null
  };
  
  return Engine;
  
});