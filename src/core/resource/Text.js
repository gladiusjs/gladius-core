/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {

        var Resource = require( '../Resource' );
        
        var Text = function( options ) {

            option = options || {};

            var _ok = options.ok || function( instance ) {};
            var _error = options.error || function( error ) {};
            
            var _cache = options.cache || this.cache;
            var _load = options.load || this.load;
            var _url = options.url || null;
            var _object;

            if( _url && _cache && _cache.contains( _url ) ) {
                _object = _cache.find( _url );
                _ok( _object );
            } else if( _load ) {
                _object = _load( _url );
                if( _url && _cache ) {
                    _cache.add({
                        url: _url,
                        object: _object
                    });
                }
                _ok( _object );
            } else {
                _error( 'resource creation failed' );
            }

        };
        Text.prototype = new Resource({
            type: 'Text',
            cache: null,
            load: function( url ) {
                console.log( 'loading: ' + url );
                return {};
            }
        });
        Text.prototype.constructor = Text;
        
        return Text;
        
    };

});
