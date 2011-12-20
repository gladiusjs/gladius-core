/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    require( 'CubicVR.js/CubicVR' );

    var Resource = require( '../../core/resource' );
    var CubicVR = this.CubicVR;

    return function( context ) {
      // source.points
      // source.faces
      // source.uv
      var Mesh = function( source ) {
          
          source = source || {};

          this._cvr = {};

          var _cvrMesh = new context.Mesh( source );
          this._cvr.mesh = _cvrMesh;

          this.prepare = function( options ) {
            if( options.material ) {
                var cvrMaterial = options.material._cvr.material;
                _cvrMesh.setFaceMaterial( cvrMaterial );
            } //if
            _cvrMesh.prepare();
          }; //prepare

      };

      return new Resource({
        type: 'Mesh',
        object: Mesh
      });
    };

});
