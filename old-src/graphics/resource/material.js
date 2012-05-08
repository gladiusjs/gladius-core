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

            // pass through the prepare function from CubicVR's object
            this.prepare = _cvrMaterial.prepare;
        });
  
        return Material;

    };

});
