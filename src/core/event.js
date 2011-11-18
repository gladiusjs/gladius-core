/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( options ) {

        var _id = window.guid();
        var _subscribers = {};

        // Bind the handler to an id, if it doesn't already have one
        var prepareHandler = function( handler ) {
            if( !handler.hasOwnProperty( '__id' ) ) {
                var id = window.guid();
                Object.defineProperty( handler, '__id', {
                    get: function() {
                        return id;
                    },
                    enumerable: false
                });
            }
            return handler;
        };

        var dispatch = function( options ) {
            var handlerIds = Object.keys( _subscribers );
            for( var i = 0, l = handlerIds.length; i < l; ++ i ) {
                var id = handlerIds[i];
                _subscribers[id]( options );
            }
        };

        // Bind a callback to this event
        var bind = function( handler ) {
            handler = prepareHandler( handler );
            if( !_subscribers[handler.__id] ) {
                _subscribers[handler.__id] = handler;
            }
        };
        Object.defineProperty( dispatch, 'bind', {
            get: function() {
                return bind;
            },
            enumerable: false
        });

        // Unbind a callback from this event
        var unbind = function( handler ) {
            if( handler.hasOwnProperty( '__id' ) &&
                    _subscribers[handler.__id] ) {
                delete _subscribers[handler.__id];
            }
        };
        Object.defineProperty( dispatch, 'unbind', {
            get: function() {
                return unbind;
            },
            enumerable: false
        });

        return dispatch;

    };

});
