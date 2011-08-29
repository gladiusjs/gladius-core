/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  var Component = require( './Component' );

  function Body( paladin, options ) {
      options = options || {};
      var mesh = options.mesh || null;
      var velocity = options.velocity || null;
  }
  Body.prototype = new Component( {} );
  Body.prototype.constructor = Body;

  /* Note:
   * These should be getter/setter methods.
   */
  Body.prototype.setMesh = function( mesh ) {
      this.mesh = mesh;
      this.object.obj = mesh;
  };
  Body.prototype.setVelocity = function( material ) {
      this.velocity = velocity;
  };

  return Body;
});
