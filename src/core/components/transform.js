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
    this._cachedAbsolute = math.matrix4.identity;
  };
  Transform.prototype = new Component();
  Transform.prototype.constructor = Transform;

  function matrix() {
    if( this._cachedIsValid ) {
      return this._cachedMatrix;
    } else {
      math.transform.fixed( this.position, this.rotation, this.scale, 
          this._cachedMatrix );
      this._cachedIsValid = true;
      return this._cachedMatrix;
    }
  }

  function setPosition( position ) {
    math.vector3.set( this.position, position );
    this._cachedIsValid = false;

    return this;
  }

  function setRotation(rotation) {
    math.vector3.set( this.rotation, rotation );
    this._cachedIsValid = false;

    return this;
  }

  function setScale(scale) {
    math.vector3.set( this.scale, scale );
    this._cachedIsValid = false;

    return this;
  }

  function absolute() {
    if( this.owner.parent && this.owner.parent.hasComponent( this.type ) ) {
      var parentTransform = this.owner.parent.findComponent( this.type );                            
      math.matrix4.multiply( [matrix(), parentTransform.absolute()], 
          this._absolute );
    } else {      
      this._absolute = matrix();
    }
    return this._absolute;
  }

  function relative() {
    throw new Error( "not implemented" );
  }

  var prototype = {
      setPosition: setPosition,
      setRotation: setRotation,
      setScale: setScale
  };
  extend( Transform.prototype, prototype );

  return Transform;

});