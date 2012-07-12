if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Graph = require( "common/graph" );

  var defaultPhases = [
    "@input",
    "@update",
    "@render"
  ];

  var DependencyScheduler = function( phases ) {
    this.current = null;
    this._tasks = {};
    this._graph = new Graph();
    this._schedule = null;

    this._phases = phases || defaultPhases;
    this.clear();
  };
  
  function update() {
    var i, l;
    var sortedGraph = this._graph.sort();
    this._schedule = [];
    for( i = 0, l = sortedGraph.length; i < l; ++ i ) {
      if( this._tasks.hasOwnProperty( sortedGraph[i] ) ) {
        this._schedule.push( sortedGraph[i] );
      }
    }
    return this;
  }
  
  function next() {
    if( !this._schedule ) {
      return undefined;
    }
    var taskId = this._schedule.shift();
    var task = this._tasks[taskId];
    this.remove( taskId );
    return task;
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
          var tag = tags[i];
          if( tag[0] === '@' ) {
            this._graph.link( task.id, tag );
          } else {
            this._graph.link( tag, task.id );
          }
        }
      }
      
      if( schedule.dependsOn ) {
        var dependsOn = schedule.dependsOn;
        for( i = 0, l = dependsOn.length; i < l; ++ i ) {
          this._graph.link( task.id, dependsOn[i] );
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

    // Set up scheduler phases
    var i;
    for( i = 0; i < this._phases.length; ++ i ) {
      this._graph.insert( this._phases[i] );
      if( i > 0 ) {
        this._graph.link( this._phases[i-1], this._phases[i] );
      }
    }
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