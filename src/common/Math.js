/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  var mjs = require( 'external/mjs' );

  var Math = function( engine, options ) {

    this.Vector3 = function( x, y, z ) {
        return V3.$( x, y, z );
    }; 

    this.Matrix4 = function( m00, m01, m02, m03, m04, m05, m06, m07,
                             m08, m09, m10, m11, m12, m13, m14, m15 ) {
        return M4x4.$( m00, m01, m02, m03, m04, m5, m06, m07,
                       m08, m09, m10, m11, m12, m13, m14, m15 );
    };

    Object.defineProperty( this, 'FLOAT_ARRAY_TYPE', {
        get: function() {
            return MJS_FLOAT_ARRAY_TYPE;
        }
    });

  }

  return Math;

});
