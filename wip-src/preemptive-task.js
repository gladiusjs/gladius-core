define( function ( require ) {

  var guid = require( "common/guid" );
  var when = require( "../external/when" );
  
  var Complete = function( value ) {
    if( !(this instanceof Complete ) ) {
      return new Complete( value );
    }
    this.value = value;
  };
  
  var Continue = function( value ) {
    if( !(this instanceof Continue ) ) {
      return new Continue( value );
    }
    this.value = value;
  };
  
  var Wait = function( value ) {
    if( !(this instanceof Wait ) ) {
      return new Wait( value );
    }
    this.value = value;
  };
  
  // Task states
  var T_STARTED = 0,
      T_PAUSED = 1,
      T_CANCELLED = 2,
      T_CLOSED = 3;
  
  // Run states
  var R_RUNNING = 0,
      R_BLOCKED = 1,
      R_RESOLVED = 2,
      R_REJECTED = 3;

  var Task = function( scheduler, schedule, thunk ) {
    this.id = guid();
    this._thunk = thunk;
    this._taskState = T_PAUSED;
    this._runState = R_RESOLVED;
    this._scheduler = scheduler;
    this._schedule = schedule || undefined;
    this.result = undefined;
    this._deferred = when.defer();
    this.then = this._deferred.promise;
    this.when = when;
  };
  
  function start( schedule ) {
    this._schedule = schedule || this._schedule;
    if( this._taskState !== T_PAUSED ) {
      throw new Error( "task is already started or completed" );
    }
    this._taskState = T_STARTED;
    if( this._runState !== R_BLOCKED ) {
      this._scheduler.insert( this, this._schedule );
    }
    return this;
  };

  function pause() {
    if( this._runState !== R_BLOCKED ) {
      throw new Error( "task can only be paused while blocked" );
    }
    this._taskState = T_PAUSED;
    this._scheduler.remove( this );      
    return this;
  };
  
  function cancel( schedule ) {
    this._schedule = schedule || undefined;
    if( this._taskState !== R_BLOCKED ) {
      throw new Error( "tasks can only be cancelled while blocked" );
    }
    this._taskState = T_CANCELLED;
    this._scheduler.insert( this, this._schedule );
    return this;
  };

  function isStarted() {
    return this._taskState === T_STARTED;
  };

  function isRunning() {
    return this._runState === R_RUNNING;
  };

  // TD: this will need to change for cooperative tasks
  function _run() {
    var result = this._result;
    this.result = undefined;
    try{
      this._runState = R_RUNNING;
      if( this._taskState === T_CANCELLED ) {
        this._runState = R_RESOLVED;
        this._taskState = T_CLOSED;
      } else if( this._taskState === T_STARTED ) {
        result = this._thunk.call( this );
        this._runState = R_BLOCKED;
        
        if( result instanceof Continue ) {
          this._runState = R_RESOLVED;
          this.result = Continue.value;
          if( this._threadState === T_STARTED ) {
            this._scheduler.insert( this, this._schedule );
          }
        } else if( result instanceof Wait ) {
          this._runState = R_BLOCKED;          
        } else if( result instanceof Complete ) {
          this._runState = R_RESOLVED;
          this._taskState = R_CLOSED;
        } else {
          
        }
      }
    } catch( exception ) {
      
    }
  };

  function toString() {
    return "[object PreemptiveTask " + this.id + " ]";
  };

  Task.prototype = {
    pause: pause,
    start: start,
    cancel: cancel,
    isStarted: isStarted,
    isRunning: isRunning,
    _run: _run
  };

} );