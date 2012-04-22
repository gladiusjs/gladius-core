if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  "use strict";

  var Graph = require( "graph" );

  var DependencyScheduler = function() {
    this.current = null;
    this._graph = new Graph();
  };

  function next() {
    
  }
  
  function hasNext() {
    
  }

  function insert( task, schedule ) {
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
  }

  function remove( task ) {
    if( !task.isStarted() || !this._graph.hasNode( task.id ) ) {
      throw new Error( "task is not scheduled to run" );
    } else if( this !== task._scheduler ) {
      throw new Error( "task is not associated with this scheduler" );
    };
    
    this._graph.remove( task.id );
  }

  function size() {
    return this._graph.size();
  }

  DependencyScheduler.prototype = {
      next: next,
      insert: insert,
      remove: remove,
      size: size,
      hasNext: hasNext
  };

  return DependencyScheduler;

} );