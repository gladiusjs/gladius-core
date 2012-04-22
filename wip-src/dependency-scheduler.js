if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  "use strict";

  var Graph = require( "common/graph" );

  var DependencyScheduler = function() {
    this.current = null;
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
    return this._schedule.shift();
  }
  
  function hasNext() {
    return this._schedule && this._schedule.length > 0;
  }

  function insert( task, taskId, schedule ) {
    var i, l;
    this._graph.insert( task );

    if( schedule ) {
      if( schedule.tags ) {
        var tags = schedule.tags;
        for( i = 0, l = schedule.tags.length; i < l; ++ i ) {
          this._graph.link( task.id, tags[i] );
        }
      }
      
      if( schedule.depends ) {
        var depends = schedule.depends;
        for( i = 0, l = depends.length; i < l; ++ i ) {
          this._graph.link( depends[i], task.id );
        }
      }
    }
    
    return this;
  }

  function remove( taskId ) {
    if( !task.isStarted() || !this._graph.hasNode( task.id ) ) {
      throw new Error( "task is not scheduled to run" );
    } else if( this !== task._scheduler ) {
      throw new Error( "task is not associated with this scheduler" );
    };
    
    this._graph.remove( task.id );
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