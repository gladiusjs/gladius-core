if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  
  var Scheduler = function() {
    this.current = null;
  };
  
  function next() {
    
  }
  
  function insert( task ) {
    
  }
  
  function remove( task ) {
    
  }
  
  function size() {
    
  }
  
  Scheduler.prototype = {
    next: next,
    insert: insert,
    remove: remove,
    size: size
  };
  
  return Scheduler;
  
} );