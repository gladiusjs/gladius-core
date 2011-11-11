/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var Resource = require( '../../core/resource' );
    var CubicVR = require( 'CubicVR.js/CubicVR' );

    // source.points
    // source.faces
    // source.uv
    var Mesh = function( source ) {
        
        source = source || {};

        var _cvrMesh = new CubicVR.Mesh( source );
        
    };

    return new Resource({
        type: 'Mesh',
        object: Mesh
    });

});
