if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var math = require( "_math" );
  var extend = require( "common/extend" );
  var Component = require( "base/component" );

  var Transform = function( position, rotation, scale ) {
    Component.call( this, "Transform", null, [] );

    // Local position
    this._position = position ? new math.Vector3( position ) : new math.Vector3( math.vector3.zero );
    this.__defineGetter__( "position", function() {
      return this._position;
    });
    this.__defineSetter__( "position", function( value ) {
      this._position.set( value );
      this._cachedLocalMatrixIsValid = false;
      this._cachedWorldMatrixIsvalid = false;
    });

    // Local rotation
    this._rotation = rotation ? new math.Vector3( rotation ) : new math.Vector3( math.vector3.zero );
    this.__defineGetter__( "rotation", function() {
      return this._rotation;
    });
    this.__defineSetter__( "rotation", function( value ) {
      this._rotation.set( value );
      this._cachedLocalMatrixIsValid = false;
      this._cachedWorldMatrixIsvalid = false;
    });
    this._rotationMatrix = new math.transform.rotate( this._rotation );
    this._rotationMatrixIsValid = true;

    // Local scale
    this._scale = scale ? new math.Vector3( scale ) : new math.Vector3( math.vector3.one );
    this.__defineGetter__( "scale", function() {
      return this._scale;
    });
    this.__defineSetter__( "scale", function( value ) {
      this._scale.set( value );
      this._cachedLocalMatrixIsValid = false;
      this._cachedWorldMatrixIsvalid = false;
    });

    this._cachedLocalMatrix = new math.T();
    this._cachedLocalMatrixIsValid = false;
    this._cachedWorldMatrix = new math.T();
    this._cachedWorldMatrixIsvalid = false;
  };
  Transform.prototype = new Component();
  Transform.prototype.constructor = Transform;

  // Return the relative transform
  function computeLocalMatrix() {
    if( this._cachedLocalMatrixIsValid && !this.position.modified && !this.rotation.modified && !this.scale.modified) {
      return this._cachedLocalMatrix;
    } else {
      math.transform.set(this._cachedLocalMatrix, this.position.buffer, this.rotation.buffer, this.scale.buffer);
      this._cachedLocalMatrixIsValid = true;
      this.position.modified = false;
      this.rotation.modified = false;
      this.scale.modified = false;
      return this._cachedLocalMatrix;
    }
  }

  // Return the world transform
  function computeWorldMatrix() {
    if( this.owner && this.owner.parent && 
        this.owner.parent.hasComponent( "Transform" ) ) {
      var parentTransform = this.owner.parent.findComponent( "Transform" );                            
      math.matrix4.multiply( parentTransform.worldMatrix(), computeLocalMatrix.call( this),
        this._cachedWorldMatrix );
    } else {
      math.matrix4.set( this._cachedWorldMatrix, computeLocalMatrix.call( this) );
    }
    return this._cachedWorldMatrix;
  }

  function computeWorldRotation(){
    if( this.owner && this.owner.parent &&
      this.owner.parent.hasComponent( "Transform" ) ) {
      return math.matrix4.multiply(this.owner.parent.findComponent( "Transform").worldRotation(),
                                   math.transform.rotate(this._rotation.buffer));
    }else{
      return math.transform.rotate(this._rotation.buffer);
    }
  }

  function directionToWorld(direction, result) {
    result = result || new math.V3();
    var transformedDirection = math.matrix4.multiply(
      computeWorldRotation.call(this),
      math.transform.translate( direction ));
    math.vector3.set(result, transformedDirection[3], transformedDirection[7], transformedDirection[11]);
    return result;
  }

  function directionToLocal(direction, result) {
    result = result || new math.V3();
    var transformedDirection = math.matrix4.multiply(
      math.transform.rotate(this._rotation.buffer),
      math.transform.translate( direction ));
    math.vector3.set(result, transformedDirection[3], transformedDirection[7], transformedDirection[11]);
    return result;
  }

  function toWorldPoint() {
    var worldMatrix = computeWorldMatrix.call(this);
    return [worldMatrix[3], worldMatrix[7], worldMatrix[11]];
  }

  var prototype = {
    worldMatrix: computeWorldMatrix,
    localMatrix: computeLocalMatrix,
    directionToLocal: directionToLocal,
    directionToWorld: directionToWorld,
    worldRotation: computeWorldRotation,
    toWorldPoint: toWorldPoint,
    toLocalPoint: undefined,
    lookAt: undefined,
    target: undefined,
    // Direction constants
    forward: new math.Vector3( 0, 0, 1 ),
    backward: new math.Vector3( 0, 0, -1 ),
    left: new math.Vector3( -1, 0, 0 ),
    right: new math.Vector3( 1, 0, 0 ),
    up: new math.Vector3( 0, 1, 0 ),
    down: new math.Vector3( 0, -1, 0 )
  };
  extend( Transform.prototype, prototype );

  return Transform;

});