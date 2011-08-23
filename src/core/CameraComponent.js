/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  var Component = require( './Component' );

  function CameraComponent( paladin, options ) {
      options = options || {};
      this.object = new paladin.subsystem.graphics.SceneObject();
      this.camera = options.camera || new paladin.subsystem.graphics.Camera({
          targeted: options.targeted
      });
      this.camera.setParent( this.object );
      this.entity = null;
      if (options.position) {
          this.object.position = options.position;
      }
      if (options.rotation) {
          this.object.rotation = options.rotation;
      }
  }
  CameraComponent.prototype = new Component( {
      type: 'graphics',
      subtype: [ 'camera' ],
      requires: [ 'spatial' ]
  } );
  CameraComponent.prototype.constructor = CameraComponent;
  CameraComponent.prototype.onAdd = function( entity ) {
      entity.spatial.sceneObjects.graphics.bindChild( this.object );
      this.entity = entity;
  };
  CameraComponent.prototype.onRemove = function( entity ) {
      /* Note(alan.kligman@gmail.com):
       * Not implemented.
       */
  };

  return CameraComponent;

});
