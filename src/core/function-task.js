if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var guid = require( "common/guid" );
  var when = require( "when" );

  var Complete = function( value ) {
    if( !( this instanceof Complete ) ) {
      return new Complete( value );
    }
    this.value = value;
  };
  
  var DefaultSchedule = function() {
    if( !( this instanceof DefaultSchedule ) ) {
      return new DefaultSchedule();
    }
    this.tags = [];
    this.dependsOn = [];
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

  var FunctionTask = function( scheduler, thunk, schedule, context ) {
    this.id = guid();
    this._thunk = thunk;
    this._taskState = T_PAUSED;
    this._runState = R_RESOLVED;
    this._scheduler = scheduler;
    this._schedule = schedule || DefaultSchedule();
    this.result = undefined;
    this._deferred = when.defer();
    this.then = this._deferred.promise.then;
    this._context = context || this;
  };

  function start( schedule ) {
    this._schedule = schedule || this._schedule;
    if( this._taskState !== T_PAUSED ) {
      throw new Error( "task is already started or completed" );
    }
    this._taskState = T_STARTED;
    if( this._runState !== R_BLOCKED ) {
      this._scheduler.insert( this, this.id, this._schedule );
    }
    return this;
  }

  function pause() {
    if( this._runState === R_RUNNING ) {
      throw new Error( "task can only be paused while blocked" );
    }
    this._taskState = T_PAUSED;
    this._scheduler.remove( this.id );      
    return this;
  }

  function cancel() {
    if( this._runState === R_RUNNING ) {
      throw new Error( "tasks can only be cancelled while blocked" );
    }
    this._taskState = T_CANCELLED;
    this._scheduler.insert( this, this.id );
    return this;
  }

  function isStarted() {
    return this._taskState === T_STARTED;
  }

  function isRunning() {
    return this._runState === R_RUNNING;
  }
  
  function isComplete() {
    return this._taskState === T_CLOSED;
  }

  // TD: this will need to change for cooperative tasks
  // TD: most of this prototype can be factored into a Task base
  function run() {
    var task = this;
    var result = task.result;
    task.result = undefined;
    task._scheduler.current = task;
    
    try{
      task._runState = R_RUNNING;
      if( task._taskState === T_CANCELLED ) {
        task._runState = R_RESOLVED;
        task._taskState = T_CLOSED;
        task._scheduler.remove( task.id );
      } else if( task._taskState === T_STARTED ) {
        // Run the task
        result = task._thunk.call( this._context, result );
        task._runState = R_BLOCKED;

        // Process the result
        if( result instanceof Complete ) {
          task.result = result.value;
          task._taskState = T_CLOSED;
          task._runState = R_RESOLVED;
          task._deferred.resolve( task.result );
        } else {
          task.result = when( result,
            // callback
            function( value ) {
              task.result = value;
              task._runState = R_RESOLVED;
              if( task._taskState === T_STARTED ) {
                task._scheduler.insert( task, task.id, task._schedule );
              }
            },
            // errback
            function( error ) {
              task.result = error;
              task._runState = R_REJECTED;
              if( task._taskState === T_STARTED ) {
                task._scheduler.insert( task, task.id, task._schedule );
              }
            }
          );
        }
      } else {
        throw Error( "task is not runnable" );
      }
    } catch( exception ) {
      task.result = exception;
      task._taskState = T_CLOSED;
      task._runState = R_REJECTED;
      task._deferred.reject( exception );
      console.log( "Task", task.id, ": ", exception.stack );
    }
    
    task._scheduler.current = null;
    return this;
  }

  function toString() {
    return "[object FunctionTask " + this.id + "]";
  }

  FunctionTask.prototype = {
      pause: pause,
      start: start,
      cancel: cancel,
      isStarted: isStarted,
      isRunning: isRunning,
      isComplete: isComplete,
      toString: toString,
      run: run,
      when: when,
      Complete: Complete
  };
  
  return FunctionTask;

} );