/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {

    var thread = function __thread( id ) {

        var console = {

                log: function() {
                    var message = Array.prototype.slice.call( arguments ).join( ' ' );
                    send( '__log', {
                        log: message
                    });
                }

        };

        // TD: propagate exceptions back to the main thread
        var assert = function( condition, message ) {
        };

        // Exposed functions are searched (by name) when looking for message handlers.
        var _exposed = {};
        var expose = function( f, alias ) {
            assert( f.name || alias );
            var name = f.name || alias;
            _exposed[ name ] = f;
        };

        var send = function( method, request ) {
            request = request || {};
            self.postMessage({
                method: method,
                thread: id,
                request: request
            });
        };

        self.onmessage = function( event ) {
            var message = event.data;
            if( _exposed[ message.method ] ) {
                _exposed[ message.method ]( message.request );
            } else {
                console.log( 'ignoring unknown method ' + message.method + ' from thread' );
            }
        };

        // TD: implement some error handling
        self.onerror = function( error ) {
        };

        var handle_dispatch = function __dispatch( message ) {
            // TD: Try/catch here to handle errors
            // Create a new function from the serialized data, wrap it to provide some additional parameters, then call it
            var f = new Function( ['console', 'assert', 'parameters'], 'var f = ' + message.callable + '; return f.apply( null, parameters );' );
            var result = f.apply( null, [ console, assert, message.parameters ] );
            send( '__result', {
                result: result
            });
            send( '__ready' );
        };
        expose( handle_dispatch, '__dispatch' );

        var handle_run = function __run( message ) {
            _id = message.id;
        };
        expose( handle_run, '__run' );

        send( '__ready' );

    };

    return thread;

});
