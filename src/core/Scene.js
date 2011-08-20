/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  var SpatialComponent = require( './SpatialComponent' );

  function Scene( paladin, options ) {
      options = options || {};
      this.graphics = new paladin.graphics.Scene( {
          fov: 60,
          resizable: true
      } );
      this.spatial = new SpatialComponent( paladin );
      this.children = [];

      this.graphics.bindSceneObject( this.spatial.sceneObjects.graphics );
      paladin.graphics.pushScene( this );

      this.setActiveCamera = function ( camera ) {
          this.graphics.setCamera( camera.camera );
      };
  }

  return Scene;

});
