if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Graph = require( "common/graph" );

  var DependencyScheduler = function() {
    this.current = null;
    this._tasks = {};
    this._graph = new Graph();
    this._schedule = null;
  };
  
  function update() {
    this._schedule = this._graph.sort();
    return this;
  }
  
  function next() {
    if( !this._schedule ) {
      return undefined;
    }
    var taskId = this._schedule.shift();
    return this._tasks[taskId];
  }
  
  function hasNext() {
    return this._schedule && this._schedule.length > 0;
  }

  function insert( task, taskId, schedule ) {
    var i, l;
    this._tasks[taskId] = task;
    this._graph.insert( taskId );

    if( schedule ) {
      if( schedule.tags ) {
        var tags = schedule.tags;
        for( i = 0, l = schedule.tags.length; i < l; ++ i ) {
          this._graph.link( task.id, tags[i] );
        }
      }
      
      if( schedule.dependsOn ) {
        var dependsOn = schedule.dependsOn;
        for( i = 0, l = dependsOn.length; i < l; ++ i ) {
          this._graph.link( dependsOn[i], task.id );
        }
      }
    }
    
    return this;
  }

  function remove( taskId ) {
    if( !this._graph.hasNode( taskId ) ) {
      throw new Error( "task is not scheduled to run" );
    }
    
    this._graph.remove( taskId );
    delete this._tasks[taskId];
    return this;
  }

  function size() {
    return this._graph.size();
  }
  
  function clear() {
    this._schedule = null;
    this._graph.clear();
  }

  DependencyScheduler.prototype = {
      next: next,
      insert: insert,
      remove: remove,
      size: size,
      hasNext: hasNext,
      update: update,
      clear: clear
  };

  return DependencyScheduler;

} );