if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {
  
  var guid = require( "common/guid" );
  var Entity = require( "entity" );
  var Clock = require( "clock" );
  
  var Space = function( clock, Partition ) {
    // This will normally be the system simulation clock, but for a UI space
    // it might be the realtime clock instead.
    this.clock = new Clock( clock.signal );
    this.id = guid();
    this.size = 0;
    
    this._entities = {};
    this._nameIndex = {};
    if( Partition ) {
      this._positionIndex = new Partition();
    } else {
      this._positionIndex = undefined;
    }
  };
  
  function add( entity ) {
    
  }
  
  Space.prototype = {
      add: null,
      remove: null,
      removeAll: null,
      find: null,
      findAll: null,
  };
  
  return Space;
  
});