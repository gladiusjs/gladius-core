/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {

    var lang = require( '../lang' );
    var Thread = require( './thread' );

    var Proxy = function( options ) {

        options = options || {};

        var _id = options.id;
        Object.defineProperty( this, 'id', {
            get: function() {
                return _id;
            }
        });
        var _pool = options.pool;
        var _ready = options.ready;
        var _request = null;
        var that = this;

        var _script = new BlobBuilder();
        _script.append( Thread.toString() );
        _script.append( '__thread(\'' + _id + '\');' );
        var _scriptUrl = window.URL.createObjectURL( _script.getBlob() );
        var _worker = new Worker( _scriptUrl );

        // Exposed functions are searched (by name) when looking for message handlers.
        var _exposed = {};
        var expose = function( f, alias ) {
            assert( f.name || alias );
            var name = f.name || alias;
            _exposed[ name ] = f;
        };

        var send = function( method, request ) {
            request = request || {};
            _worker.postMessage({
                method: method,
                request: request
            });
        };

        _worker.onmessage = function( event ) {
            var message = event.data;
            if( _exposed[ message.method ] ) {
                _exposed[ message.method ]( message.request );
            } else {
                console.log( 'ignoring unknown method ' + message.method + ' from worker' );
            }
        };

        _worker.onerror = function( error ) {
        };

        var handle_result = function __result( message ) {
            if( _request.onComplete ) {
                _request.onComplete( message.result );
            }
            _request = null;
        };
        expose( handle_result );

        var handle_ready = function __ready() {
            _ready( that );
        };
        expose( handle_ready );

        var handle_error = function __error( message ) {
        };
        expose( handle_error );

        var handle_log = function __log( message ) {
            console.log( '[thread:' + _id + '] ' + message.log );
        };
        expose( handle_log );

        this.dispatch = function( options ) {
            options = options || {};

            _request = options;

            var f = options.callable.toString();
            send( '__dispatch', {
                callable: f,
                parameters: options.parameters
            });
        };

        this.terminate = function() {
            _worker.terminate();
            window.URL.revokeObjectURL( _scriptUrl );
        };

        send( '__run' );
    };

    return Proxy;

});
