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
      if( this._position.modified ) {
        // Update local position
        this._position.modified = false;
      }
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

    this._cachedLocalMatrix = new math.Matrix4( math.matrix4.identity );
    this._cachedLocalMatrixIsValid = false;
    this._cachedWorldMatrix = new math.Matrix4( math.matrix4.identity );
    this._cachedWorldMatrixIsvalid = false;
  };
  Transform.prototype = new Component();
  Transform.prototype.constructor = Transform;

  // Return the relative transform
  function computeLocalMatrix() {
    if( this._cachedLocalMatrixIsValid ) {
      return this._cachedLocalMatrix;
    } else {
      math.transform.compound( this.position.buffer, this.rotation.buffer, this.scale.buffer, this._cachedLocalMatrix.buffer);
      this._cachedLocalMatrixIsValid = true;
      return this._cachedLocalMatrix;
    }
  }

  // Return the world transform
  function computeWorldMatrix() {
    if( this.owner && this.owner.parent && 
        this.owner.parent.hasComponent( "Transform" ) ) {
      var parentTransform = this.owner.parent.findComponent( "Transform" );                            
      math.matrix4.multiply( computeLocalMatrix.call( this).buffer, parentTransform.worldMatrix().buffer,
        this._cachedWorldMatrix.buffer );
    } else {
      math.matrix4.set( this._cachedWorldMatrix.buffer, computeLocalMatrix.call( this).buffer );
    }
    return this._cachedWorldMatrix;
  }

  var prototype = {
      worldMatrix: computeWorldMatrix,
      localMatrix: computeLocalMatrix,
      toWorldDirection: undefined,
      toLocalDirection: undefined,
      toWorldPoint: undefined,
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