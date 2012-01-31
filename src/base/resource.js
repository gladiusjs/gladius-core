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

    var defaultLoad = function( url, onsuccess, onfailure ) {
        if( url.match('^data:') ) {
            onsuccess( decodeDataURI( url ) );
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open( 'GET', url, true );
            xhr.onreadystatechange = function() {
                if( 4 != xhr.readyState ) {
                    return;
                }
                if ( xhr.status < 200 || xhr.status > 299 ) {
                    onfailure( xhr.statusText );
                    return;
                }
                onsuccess( xhr.responseText );
            };
            xhr.send( null );
        }
    };

    return function( engine ) {

        var BaseResource = function( options ) {

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

            var _cache = options.cache || null;
            Object.defineProperty( this, 'cache', {
                get: function() {
                    return _cache;
                }
            });
            
            var _load = options.load || defaultLoad;
            Object.defineProperty( this, 'load', {
                get: function() {
                    return _load;
                }
            });
            
            var _construct = options.construct || null;
            Object.defineProperty( this, 'construct', {
                get: function() {
                    return _construct;
                }
            });

        };

        var Resource = function( options ) {

            options = options || {};
            var resourceFactory = function( options ) {
                
                options = options || {};
                var load = options.load || this.load;
                var construct = options.construct || this.construct;
                var _url = options.url || null;             

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
                        load( _url,
                            function loadSuccess( data ) {                            
                                if( undefined === data ) {
                                    _onfailure( 'load returned with not data' );
                                    return;
                                }
                            
                                instance = new construct( data );
                            
                                if( _cache ) {
                                    _cache.add( instance );
                                }
                                _onsuccess( instance );
                            },
                            function loadFailure( error ) {
                                _onfailure( 'load failed: ' + error );
                            }
                        );
                    }
                }
                return;
            };

            resourceFactory.prototype = new BaseResource( options );
            resourceFactory.prototype.constructor = resourceFactory;

            return resourceFactory;

        };

        return Resource;

    };

});
