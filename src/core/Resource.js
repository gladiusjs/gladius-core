/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( options ) {

        var Resource = function( options ) {

            option = options || {};

            var _type = options.type || undefined;
            Object.defineProperty( this, 'type', {
                get: function() {
                    return _type;
                }
            });
            
            var _cache = options.cache || null;

            // Events

        };

        return Resource;

    };

});
