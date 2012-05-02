if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  
  var _Math = require( "lib/_math" );
  
  var MulticastDelegate = require( "common/multicast-delegate" );
  var Loop = require( "core/request-animation-frame-loop" );
  var Clock = require( "core/clock" );
  var Scheduler = require( "core/dependency-scheduler" );
  var FunctionTask = require( "core/function-task" );
  var Timer = require( "core/timer" );
  var Event = require( "core/event" );
  
  var Component = require( "base/component" );
  var Service = require( "base/service" );
  
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
    this.Event = Event;

    // Convenient constructors bound to each of the engine timers by default
    this.RealTimer = Timer.bind( this, this.realClock.signal );
    this.SimulationTimer = Timer.bind( this, this.simulationClock.signal );
    
    // Base prototypes, useful for extending the engine at runtime
    this.base = {
        Component: Component,
        Service: Service
    };
    
    // Registered extensions go in here; They are also exposed as properties
    // on the engine instance
    this._extensions = {};
  };
  
  function suspend() {
    this._loop.suspend();
    
    return this;
  }
  
  function resume() {
    this._loop.resume();
    
    return this;
  }
  
  function attach( callback ) {
    this._monitor.subscribe( callback );
    
    return this;
  }
  
  function detach( callback ) {
    this._monitor.unsubscribe( callback );
    
    return this;
  }
  
  function isRunning() {
    return this._loop.isStarted();
  }
  
  function registerExtension( extension, options ) {
    this._extensions[extension.name] = extension;
    
    return this;
  }
  
  function unregisterExtension( extension ) {
    if( this._extensions.hasOwnProperty( extension.name ) ) {
      delete this._extensions[extension.name];
    }
    
    return this;
  }
  
  function findExtension( name ) {
    if( this._extensions.hasOwnProperty( name ) ) {
      return this._extensions[name];
    }
    
    return undefined;
  }
  
  function hasExtension( name ) {
    return this._extensions.hasOwnProperty( name );
  }
  
  Engine.prototype = {
      isRunning: isRunning,
      suspend: suspend,
      resume: resume,
      attach: attach,
      detach: detach,
      registerExtension: registerExtension,
      unregisterExtension: unregisterExtension,
      findExtension: findExtension,
      hasExtension: hasExtension
  };
  
  return Engine;
  
});