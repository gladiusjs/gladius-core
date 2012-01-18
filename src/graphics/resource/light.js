/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine, context ) {
        
        var Light = engine.base.Resource({
            type: 'Light',
            cache: null
        },
        function( source ) {

            source = source || {};

            // just apply all the properties of the source obj
            // to this resource object (very simply)
            for( var prop in source ) {
                if( source.hasOwnProperty( prop ) ) {
                    this[ prop ] = source[ prop ];
                } //if
            } //for

        });

        return Light;

    };

});
