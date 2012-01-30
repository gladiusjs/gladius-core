/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'lang' );

    var decodeDataURI = function( uri ) {
        var components = uri.match( ':.*,' )[0].slice( 1, -1 ).split( ';' );
        var contentType = components[0],
        encoding = components[1],
        base64 = components[2];
        var data = decodeURIComponent( uri.match( ',.*' )[0].slice( 1 ) );

        switch( contentType ) {
        case '':
        case 'text/plain':
            return data;
        default:
            throw 'unknown content type: ' + contentType;
        }
    };

    var defaultLoad = function( url ) {
        if( url.match('^data:') ) {
            return decodeDataURI( url );
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open( 'GET', _url, true );
            xhr.onreadystatechange = function() {
                if( 4 != xhr.readyState ) {
                    return;
                }
                if ( xhr.status < 200 || xhr.status > 299 ) {
                    _onfailure( xhr.statusText ) ;
                    return;
                }
                return xhr.responseText;
            };
            xhr.send( null );
        }
    };

    return function( engine ) {

        var BaseResource = function( options ) {

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

        };

        var Resource = function( options ) {

            options = options || {};
            var defaultTypeLoad = options.load || defaultLoad;
            var construct = options.construct;

            var r = function( options ) {

                options = options || {};

                var _url = options.url || null,
                load = options.load || defaultTypeLoad;              

                var _onsuccess = options.onsuccess || function() {},
                _onfailure = options.onfailure || function() {};

                var _cache = options.cache || this.cache;

                if( _url ) {
                    var instance;
                    if( _cache && _cache.contains( _url ) ) {
                        // Find the _instance in the cache and return it
                        instance = _cache.find( _url );                        
                        _onsuccess( instance );
                    } else {
                        var data = load( _url );

                        if( undefined === data ) {
                            // TD: call onfailure
                        };

                        var instance = new construct( data );

                        if( _cache ) {
                            _cache.add( instance );
                        }
                        _onsuccess( instance );
                    };
                }
                return;
            };

            r.prototype = new BaseResource( options );
            r.prototype.constructor = r;

            return r;

        };

        return Resource;

    };

});
