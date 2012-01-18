/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'lang' );

    return function( engine ) {

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

        };

        var Resource = function( options, c ) {

            options = options || {};

            var r = function( options ) {

                options = options || {};

                var _url = options.url || null,
                _script = options.script || null,
                _parameters = options.parameters || null;

                var _onsuccess = options.onsuccess || function() {},
                _onfailure = options.onfailure || function() {};

                var _cache = options.cache || this.cache;

                var _instance;
                if( _url ) {
                    if( _cache && _cache.contains( _url ) ) {
                        // Find the _instance in the cache and return it
                        _instance = _cache.find( _url );                        
                        _onsuccess( _instance );
                    } else {
                        // Fetch the _instance from its source
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
                            var response = JSON.parse( xhr.responseText );
                            if (c) {
                                _instance = new c( response );
                            } else {
                                _instance = response;
                            }
                            
                            if( _cache ) {
                                _cache.add( _instance );
                            }
                            _onsuccess( _instance );
                        };
                        xhr.send( null );
                    }
                    return;
                }
                if( !_instance && _script ) {
                    // Use the script to build an _instance of object
                    _instance = new c( _script.apply( null, _parameters ) );
                    if( _cache ) {
                        _cache.add( _instance );
                    }
                    _onsuccess( _instance );
                    return;
                }

            };
            r.prototype = new IResource( options );
            r.prototype.constructor = r;

            return r;

        };

        return Resource;

    };

});
