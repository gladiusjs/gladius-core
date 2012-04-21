define( function ( require ) {

  var guid = require( "common/guid" );
  var when = require( "../external/when" );

  var Complete = function( value ) {
    if( !(this instanceof Complete ) ) {
      return new Complete( value );
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

  var PreemptiveTask = function( scheduler, thunk, schedule ) {
    this.id = guid();
    this._thunk = thunk;
    this._taskState = T_PAUSED;
    this._runState = R_RESOLVED;
    this._scheduler = scheduler;
    if( !this._scheduler || !this._scheduler.hasOwnProperty( "insert" ) ||
        !this._scheduler.hasOwnProperty( "remove" ) ) {
      throw new Error( "invalid scheduler" );
    }
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
  }

  function pause() {
    if( this._runState === R_RUNNING ) {
      throw new Error( "task can only be paused while blocked" );
    }
    this._taskState = T_PAUSED;
    this._scheduler.remove( this );      
    return this;
  }

  function cancel( schedule ) {
    this._schedule = schedule || this._schedule;
    if( this._runState === R_RUNNING ) {
      throw new Error( "tasks can only be cancelled while blocked" );
    }
    this._taskState = T_CANCELLED;
    this._scheduler.insert( this, this._schedule );
    return this;
  }

  function isStarted() {
    return this._taskState === T_STARTED;
  }

  function isRunning() {
    return this._runState === R_RUNNING;
  }

  // TD: this will need to change for cooperative tasks
  // TD: most of this prototype can be factored into a Task base
  function run() {
    var task = this;
    var result = task._result;
    task.result = undefined;
    try{
      task._runState = R_RUNNING;
      if( task._taskState === T_CANCELLED ) {
        task._runState = R_RESOLVED;
        task._taskState = T_CLOSED;
      } else if( task._taskState === T_STARTED ) {
        // Run the task
        result = task._thunk.call( task );
        task._runState = R_BLOCKED;

        // Process the result
        if( result instanceof Complete ) {
          task.result = Complete.value;
          task._runState = R_RESOLVED;
          task._deferred.resolve( task.result );
        } else {
          task.result = when( result,
          // callback
          function( value ) {
            task.result = value;
            task._runState = R_RESOLVED;
            if( task._threadState === T_STARTED ) {
              task.scheduler.insert( task, task._schedule );
            }
          },
          // errback
          function( error ) {
            task.result = error;
            task._runState = R_REJECTED;
            if( task._threadState === T_STARTED ) {
              task._scheduler.insert( task, task._schedule );
            }
          }
          );
        }
      }
    } catch( exception ) {
      task.result = exception;
      task._runState = R_REJECTED;
      task._deferred.reject( exception );
    }
  }

  function toString() {
    return "[object PreemptiveTask " + this.id + " ]";
  }

  PreemptiveTask.prototype = {
      pause: pause,
      start: start,
      cancel: cancel,
      isStarted: isStarted,
      isRunning: isRunning,
      run: run
  };
  
  return PreemptiveTask;

} );