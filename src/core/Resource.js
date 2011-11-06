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

                var object;
                if( _source ) {
                    if( _cache && _cache.contains( _source ) ) {
                        // Find the object in the cache
                    } else {
                        // Fetch the object from its source
                    }
                }
                if( !object && _constructor ) {
                    // Fetch the constructor
                }

/*
                if( _url && _cache && _cache.contains( _url ) ) {
                    _ok( _cache.find( _url ) );
                } else if( _load ) {
                    _load({
                        url: _url,
                        onComplete: function( object ) {
                            if( _url && _cache ) {
                                _cache.add({
                                    url: _url,
                                    object: _object
                                });
                            }
                            _ok( object );
                        },
                        onError: function() {
                            _error( 'unable to load resource' );
                        }
                    });
                } else {
                    _error( 'resource creation failed' );
                }
*/

            };

            return Resource;

        };

});
