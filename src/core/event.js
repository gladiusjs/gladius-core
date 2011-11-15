/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( options ) {

        var _id = window.guid();
        var _subscribers = {};
        var _handlerProperty = '__handlerId';

        // Bind the handler to an id, if it doesn't already have one
        var prepareHandler = function( handler ) {
            if( !handler.hasOwnProperty( _handlerProperty ) ) {
                var id = window.guid();
                Object.defineProperty( handler, _handlerProperty, {
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
            if( !_subscribers[handler[_handlerProperty]] ) {
                _subscribers[handler[_handlerProperty]] = handler;
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
            if( handler.hasOwnProperty( _handlerProperty ) &&
                    _subscribers[handler[_handlerProperty]] ) {
                delete _subscribers[handler[_handlerProperty]];
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
