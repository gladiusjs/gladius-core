define( function ( require ) {
  
  var MulticastDelegate = require( "common/multicast-delegate" );
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
    this.realClock.update( delta );
    this.simulationClock.update( delta );
    
    // Update scheduler and run all tasks
    this._scheduler.update();
    while( this._scheduler.hasNext() ) {
      this._scheduler.next().run();
    }
    
    // Run monitor callbacks
    if( this._monitor.size > 0 ) {
      this._monitor( this );
    }
  }
  
  function suspend() {
    this._loop.suspend();
  }
  
  function resume() {
    this._loop.resume();
  }
  
  function attach( callback ) {
    this._monitor.subscribe( callback );
  }
  
  function detach( callback ) {
    this._monitor.unsubscribe( callback );
  }
  
  function isRunning() {
    return this._loop.isStarted();
  }

  var Engine = function() {
    this._loop = new Loop( simulationLoop, this );
    this.frame = 0;
    this._monitor = new MulticastDelegate();

    // System clocks
    this.realClock = new Clock();
    this.simulationClock = new Clock();
    
    this._scheduler = new Scheduler();
    
    // Bind the scheduler to the task constructor
    this.FunctionTask = FunctionTask.bind( this, this._scheduler );
 
    this.Timer = Timer;

    // Convenient constructors bound to each of the engine timers by default
    this.RealTimer = Timer.bind( this, this.realClock.signal );
    this.SimulationTimer = Timer.bind( this, this.simulationClock.signal );
  };
  
  Engine.prototype = {
      isRunning: isRunning,
      suspend: suspend,
      resume: resume,
      attach: attach,
      detach: detach
  };
  
  return Engine;
  
});