/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine, context ) {

        var Material = new engine.base.Resource({
            type: 'Material'
        },
        function( data ) {

            this._cvr = {};

            var _cvrMaterial = new context.Material( data );
            this._cvr.material = _cvrMaterial;

            this.prepare = function( options ) {
                var _cvrMaterial;
                if ( options.material ) {
                    _cvrMaterial = options.material._cvr.material;
                    _cvrMesh.setFaceMaterial( _cvrMaterial );
                } //if
                _cvrMaterial.prepare();
            }; //prepare

        });
        
        return Material;

    };

});
