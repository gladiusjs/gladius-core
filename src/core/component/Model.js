/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  var Component = require( './Component' );

  function Model( paladin, options ) {
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
  Model.prototype = new Component( {} );
  Model.prototype.constructor = Model;
  
  /* Note:
   * These should be getter/setter methods.
   */
  Model.prototype.setMesh = function( mesh ) {
      this.mesh = mesh;
      this.object.obj = mesh;
  };
  Model.prototype.setMaterial = function( material ) {
      this.material = material;
  };

  return Model;
});
