/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'lang' );

    var IResource = function( options ) {

        options = options || {};

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
        
        var _resourceConstructor = options.resourceConstructor || function() {};
        Object.defineProperty( this, 'resourceConstructor', {
            get: function() {
                return _resourceConstructor;
            }
        });

    };

    var Resource = function( options, c ) {

        option = options || {};
        
        var r = function( options ) {

            options = options || {};
            
            var _source = options.source || null,
            _script = options.script || null,
            _parameters = options.parameters || null;
        
            var _onComplete = options.onComplete || function() {},
            _onError = options.onError || function() {};

            c.call( this, options );

        };
        r.prototype = new IResource( options );
        r.prototype.constructor = r;

        return r;

    };

    return Resource;

});
