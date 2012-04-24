define( function ( require ) {
  
  var Loop = require( "request-animation-frame-loop" );
  var Clock = require( "clock" );
  var Scheduler = require( "dependency-scheduler" );
  var FunctionTask = require( "function-task" );
  var Timer = require( "timer" );
  
  function simulationLoop() {
    // Increment frame counter
    this.frame += 1;
    
    // Update internal timestamp
    var timestamp = Date.now();
    var delta = timestamp - this.cachedTimestamp;
    this.cachedTimestamp = timestamp;
    
    // Update system clocks
    this._realClock.update( delta );
    this._simulationClock.update( delta );
    
    // Update scheduler and run all tasks
    this._scheduler.update();
    while( this._scheduler.hasNext() ) {
      this._scheduler.next().run();
    }
  }
  
  function suspend() {
    this._simulationClock.pause();
    this._realClock.pause();
  };
  
  function resume() {
    this._realClock.start();
    this._simulationClock.start();
  }

  var Engine = function() {
    this._loop = new Loop( simulationLoop );
    this.frame = 0;
    
    // 
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
      suspend: suspend,
      resume: resume
  };
  
  return Engine;
  
});