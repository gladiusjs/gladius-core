/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var ResourceBase = function( options ) {

        options = options || {};

        var _type = options.type || undefined;
        if( undefined === _type ) {
            throw 'missing type parameter';
        }
        Object.defineProperty( this, 'type', {
            get: function() {
                return _type;
            }
        });

        var _construct = options.construct || null;
        Object.defineProperty( this, 'construct', {
            get: function() {
                return _construct;
            }
        });

    };
    
    return function( options, construct ) {
        var Resource = function( options ) {            
            construct.call( this, options );
        };
        Resource.prototype = new ResourceBase( options );
        Resource.constructor = Resource;
        
        return Resource;
    };

});
