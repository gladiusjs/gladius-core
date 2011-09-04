/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  var mjs = require( 'external/mjs' );

  var Math = function( engine, options ) {

    this.Vector3 = V3;
    this.Matrix4 = M4x4;

  }

  return Math;

});
