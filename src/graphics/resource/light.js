/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine, context ) {
        
        var Light = new engine.base.Resource({
            type: 'Light'
        },
        function( data ) {

            // just apply all the properties of the source obj
            // to this resource object (very simply)
            for( var prop in data ) {
                if( data.hasOwnProperty( prop ) ) {
                    this[ prop ] = data[ prop ];
                } //if
            } //for

        });

        return Light;

    };

});
