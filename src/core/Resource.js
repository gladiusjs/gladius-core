/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

        var Resource = function( options ) {

            option = options || {};

            var _type = options.type || undefined;
            var _cache = options.cache || null;
            var _load = options.load || null;

            var Constructor = function( options ) {
            
                options = options || {};

                var _url = options.url || null;

                var _ok = options.ok || function( instance ) {};
                var _error = options.error || function( error ) {};

                _cache = options.cache || _cache; 
                _load = options.load || _load;

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

            };

            return Constructor;

        };

        return Resource;

});
