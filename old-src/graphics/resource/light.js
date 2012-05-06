/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine, context ) {
        
        var Light = new engine.base.Resource({
            type: 'Light'
        },
        function( data ) {

            this._cvr = {};

            var _cvrLight = new context.Light( data );
            this._cvr.light = _cvrLight;
            
        });

        return Light;

    };

});
