if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var math = require( "_math" );
  var extend = require( "common/extend" );
  var Component = require( "base/component" );

  var Transform = function( position, rotation, scale ) {
    Component.call( this, "Transform", null, [] );

    this.position = position ? new math.Vector3( position ) : math.vector3.zero;
    this.rotation = rotation ? new math.Vector3( rotation ) : math.vector3.zero;
    this.scale = scale ? new math.Vector3( scale ) : math.vector3.one;
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
      // debugger;
      this._cachedMatrix = math.transform.fixed( this.position, this.rotation, 
        this.scale );
      this._cachedIsValid = true;
      return this._cachedMatrix;
    }
  }

  function setPosition( position ) {
    math.vector3.set( this.position, position[0], position[1], position[2] );
    this._cachedIsValid = false;

    return this;
  }

  function setRotation( rotation ) {
    math.vector3.set( this.rotation, rotation[0], rotation[1], rotation[2] );
    this._cachedIsValid = false;

    return this;
  }

  function setScale( scale ) {
    math.vector3.set( this.scale, scale[0], scale[1], scale[2] );
    this._cachedIsValid = false;

    return this;
  }

  function absolute() {
    if( this.owner && this.owner.parent && 
        this.owner.parent.hasComponent( "Transform" ) ) {
      var parentTransform = this.owner.parent.findComponent( this.type );                            
      this._cachedAbsolute = math.matrix4.multiply( [matrix.call( this ), parentTransform.absolute()] );
    } else {
      this._cachedAbsolute = matrix.call( this );
    }
    return this._cachedAbsolute;
  }

  function relative() {
    throw new Error( "not implemented" );
  }

  var prototype = {
      setPosition: setPosition,
      setRotation: setRotation,
      setScale: setScale,
      absolute: absolute,
      relative: relative
  };
  extend( Transform.prototype, prototype );

  return Transform;

});