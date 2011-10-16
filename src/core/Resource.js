/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

        var Resource = function( options ) {

            option = options || {};

            var _type = options.type || undefined;
            Object.defineProperty( this, 'type', {
                get: function() {
                    return _type;
                }
            });

            var _cache = options.cache || null;
            Object.defineProperty( this, 'cache', {
                get: function() {
                    return _cache;
                }
            });

            var _load = options.load || null;
            Object.defineProperty( this, 'load', {
                get: function() {
                    return _load;
                }
            });

            // Events

        };

        return Resource;

});
