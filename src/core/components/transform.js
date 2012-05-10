if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var math = require( "core-lib/_math" );
  var extend = require( "common/extend" );
  var Component = require( "base/component" );

  var Transform = function( position, rotation, scale ) {
    this.position = position ? new math.Vector2( position ) : math.vector2.zero;
    this.rotation = rotation ? new math.Vector2( rotation ) : math.vector2.zero;
    this.scale = scale ? new math.Vector2( scale ) : math.vector2.one;
    this._cachedMatrix = math.matrix4.identity;
    this._cachedIsValid = false;
  };
  Transform.prototype = new Component();
  Transform.prototype.constructor = Transform;

  function matrix() {
    if( this._cachedIsValid ) {
      return _cachedMatrix;
    } else {
      math.transform.fixed( this.position, this.rotation, this.scale, 
          this._cachedMatrix );
      this._cachedIsValid = true;
      return this._cachedMatrix;
    }
  }
  
  function setPosition() {
    
  }
  
  function setRotation() {
    
  }

  var prototype = {

  };
  extend( Transform.prototype, prototype );

  return Transform;

});