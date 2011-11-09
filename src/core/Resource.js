/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

        return function( options ) {

            option = options || {};

            var _type = options.type || undefined;
            var _cache = options.cache || null;
            var _object = options.object;

            var Resource = function( options ) {
            
                options = options || {};

                var _source = options.source || null;
                if( !_source ) {
                    var _constructor = options.constructor || null;
                    var _parameters = options.parameters || {};
                }

                var _onComplete = options.inComplete || function( resource ) {};
                var _onError = options.onError || function( error ) {};

                _cache = options.cache || _cache; 

                var instance;
                if( _source ) {
                    if( _cache && _cache.contains( _source ) ) {
                        // Find the instance in the cache and return it
                    } else {
                        // Fetch the instance from its source
                        var xhr = new XMLHttpRequest();
                        xhr.open( 'GET', url, true );
                        xhr.onreadystatechange = function() {
                            if( 4 != xhr.readyState ) {
                                return;
                            }
                            var response = JSON.parseString( xhr.responseText );
                            instance = new _object( response.source );
                            _onComplete( _instance );
                        };
                        xhr.send( null );
                    }
                }
                if( !instance && _constructor ) {
                    // Use the constructor to build an instance of object
                }

                if( _cache && instance ) {
                    // Cache the instance that we fetched or constructed
                }

            };

            return Resource;

        };

});
