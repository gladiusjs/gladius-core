if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {
  
  var Timer = function( clock, delay, callback, data ) {
    this._clock = clock;
    this._callback = callback;
    this._data = data;
    this._delay = delay;
    this.elapsed = 0;
  };
  
});