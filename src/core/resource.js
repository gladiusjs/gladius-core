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
                    var _script = options.script || null;
                    var _parameters = options.parameters || {};
                }

                var _onComplete = options.onComplete || function( instance ) {};
                var _onError = options.onError || function( error ) {};

                _cache = options.cache || _cache; 

                var instance;
                if( _source ) {
                    if( _cache && _cache.contains( _source ) ) {
                        // Find the instance in the cache and return it
                        instance = _cache.find( _source );                        
                        _onComplete( instance );
                    } else {
                        // Fetch the instance from its source
                        var xhr = new XMLHttpRequest();
                        xhr.open( 'GET', _source, true );
                        xhr.onreadystatechange = function() {
                            if( 4 != xhr.readyState ) {
                                return;
                            }
                            var response = JSON.parse( xhr.responseText );
                            instance = new _object( response );
                            if( _cache ) _cache.add( instance );
                            _onComplete( instance );
                        };
                        xhr.send( null );
                    }
                    return;
                }
                if( !instance && _script ) {
                    // Use the script to build an instance of object
                    instance = new _object( _script.apply( null, _parameters ) );
                    if( _cache ) _cache.add( instance );
                    _onComplete( instance );
                    return;
                }
            };

            return Resource;

        };

});
