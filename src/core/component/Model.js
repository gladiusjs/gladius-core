/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  var Component = require( './Component' );

  function ModelComponent( paladin, options ) {
      options = options || {};
      this.object = new paladin.graphics.SceneObject( { mesh: options.mesh } );
      this.mesh = options.mesh || null;
      this.material = options.material || null;
      this.entity = null;

      if (options.position) {
          this.object.position = options.position;
      }
      if (options.rotation) {
          this.object.rotation = options.rotation;
      }
  }
  ModelComponent.prototype = new Component( {
      type: 'graphics',
      subtype: [ 'model' ],
      requires: [ 'spatial' ]
  } );
  ModelComponent.prototype.constructor = ModelComponent;
  ModelComponent.prototype.onAdd = function( entity ) {
      entity.spatial.sceneObjects.graphics.bindChild( this.object );
      this.entity = entity;
  };
  ModelComponent.prototype.onRemove = function( entity ) {
      /* Note(alan.kligman@gmail.com):
       * Not implemented.
       */
  };
  ModelComponent.prototype.setMesh = function( mesh ) {
      this.mesh = mesh;
      this.object.obj = mesh;
  };
  ModelComponent.prototype.setMaterial = function( material ) {
      this.material = material;
  };

  return ModelComponent;
});
