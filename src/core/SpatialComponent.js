/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  var Component = require( './Component' );

  function SpatialComponent( paladin, position, rotation ) {

      this._position = position ? position : [0, 0, 0];   // X, Y, Z
      this._rotation = rotation ? rotation : [0, 0, 0];  // Roll, pitch, yaw

      this.__defineGetter__( 'position', function() {
          return this._position;
      } );
      this.__defineSetter__( 'position', function( position ) {
          this._position[0] = position[0];
          this._position[1] = position[1];
          this._position[2] = position[2];
      } );
      this.__defineGetter__( 'rotation', function() {
          return this._rotation;
      } );
      this.__defineSetter__( 'rotation', function( rotation ) {
          this._rotation[0] = rotation[0];
          this._rotation[1] = rotation[1];
          this._rotation[2] = rotation[2];
      } );

      this.sceneObjects = {
          graphics: new paladin.graphics.SceneObject( {
              position: this.position,
              rotation: this.rotation
          } ),
          physics: null,
          sound: null
      };

  }
  SpatialComponent.prototype = new Component( {
      type: 'core',
      subtype: [ 'spatial' ]
  } );
  SpatialComponent.prototype.constructor = SpatialComponent;
  SpatialComponent.prototype.setParent = function( newParentSpatial ) {
      newParentSpatial.sceneObjects.graphics.bindChild( this.sceneObjects.graphics );
      this.parent = newParentSpatial;
  };


  return SpatialComponent;
});
