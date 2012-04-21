if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {
  
  var Timer = function( clock, expires, callback, data, context ) {
    this._clock = clock;
    this._callback = callback;
    this._data = data;
    this._context = context;
  };
  
});