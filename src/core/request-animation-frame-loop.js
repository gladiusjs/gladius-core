if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  if( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback, element ) {
      window.setTimeout( callback, 1000/60 );
    };
  }
  
  var Loop = require( "core/loop" );

  var RequestAnimationFrameLoop = function( callback, context ) {
    Loop.call( this, callback, context );
  };

  function _pump() {
    requestAnimationFrame( this._run.bind( this ) );
  }
  
  RequestAnimationFrameLoop.prototype = new Loop();
  RequestAnimationFrameLoop.prototype._pump = _pump;
  RequestAnimationFrameLoop.prototype.constructor = RequestAnimationFrameLoop;

  return RequestAnimationFrameLoop;

});