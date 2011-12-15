/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    require( 'CubicVR.js/CubicVR' );

    var Resource = require( '../../core/resource' );
    var CubicVR = this.CubicVR;

    var Material = function( source ) {
        
        source = source || {};

        this._cvr = {};

        var _cvrMaterial = new CubicVR.Material( source );
        this._cvr.material = _cvrMaterial;

        this.prepare = function( options ) {
            var _cvrMaterial;
            if ( options.material ) {
                _cvrMaterial = options.material._cvr.material;
                _cvrMesh.setFaceMaterial( _cvrMaterial );
            } //if
            _cvrMaterial.prepare();
        }; //prepare

    };

    return new Resource({
        type: 'Material',
        object: Material
    });

});
