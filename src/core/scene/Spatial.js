/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  function SpatialComponent( paladin, position, rotation ) {

      var position = position ? position : [0, 0, 0];   // X, Y, Z
      var rotation = rotation ? rotation : [0, 0, 0];   // Roll, pitch, yaw
      var that = this;

      this.__defineGetter__( 'position', function() {
          return position;
      } );
      this.__defineSetter__( 'position', function( position ) {
          position[0] = position[0];
          position[1] = position[1];
          position[2] = position[2];
      } );
      this.__defineGetter__( 'rotation', function() {
          return rotation;
      } );
      this.__defineSetter__( 'rotation', function( rotation ) {
          rotation[0] = rotation[0];
          rotation[1] = rotation[1];
          rotation[2] = rotation[2];
      } );

      this.sceneObjects = {
          graphics: new paladin.graphics.SceneObject( {
              position: that.position,
              rotation: that.rotation
          } ),
          physics: null,
          sound: null
      };

  }
  SpatialComponent.prototype.setParent = function( newParentSpatial ) {
      newParentSpatial.sceneObjects.graphics.bindChild( this.sceneObjects.graphics );
      this.parent = newParentSpatial;
  };


  return SpatialComponent;
});
