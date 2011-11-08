/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {

    var lang = require( './lang' );

    var threadWorker = function __thread( id ) {

        var console = {

            log: function() {
                var message = Array.prototype.slice.call( arguments ).join( '\n' );
                send( '__log', {
                    log: message
                });
            }

        }

        var assert = function( message ) {
            
        };

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

        self.onerror = function( error ) {
        };

        var handle_dispatch = function __dispatch( message ) {
            // TD: Try/catch here to handle errors
            var f = new Function( message.call );
            var result = f();
            send( '__result', {
                result: result
            });
        };
        expose( handle_dispatch );

        var handle_run = function __run() {                
        };
        expose( handle_run );

        var handle_terminate = function __terminate() {
        };
        expose( handle_terminate );

        send( '__ready' );
        console.log( 'started' );

    };

    var Thread = function( options ) {

        options = options || {};

        var _id = options.id;
        var _pool = options.pool;
        var _request = null;
        var that = this;

        var _script = new BlobBuilder();
        _script.append( threadWorker.toString() );
        _script.append( '__thread(\'' + _id + '\');' );
        var _scriptUrl = window.URL.createObjectURL( _script.getBlob() );
        var _worker = new Worker( _scriptUrl );

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
            handle_ready();
        };
        expose( handle_result );

        var handle_ready = function __ready() {
            _pool.ready( that );
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

            var f = options.call.toString();
            f = f.split( '\n' );
            f.remove( 0 );
            f.remove( f.length - 1 );
            f = f.join( '\n' );

            send( '__dispatch', {
                call: f,
                parameters: options.parameters
            });
        };

        send( '__run' )
    };

    var ThreadPool = function( options ) {

        options = options || {};
        options.size = options.size || 1;

        var _threads = [];
        var _queuedRequests = [];
        var _readyThreads = [];

        // External API
        this.call = function( options ) {
            if( _readyThreads.length > 0 ) {
                var thread = _readyThreads.shift();
                thread.dispatch( options );
            } else {
                _queuedRequests.push( options );
            }
        };

        // Thread API
        this.ready = function( thread ) {
            // TD: make sure this is one of our threads, and that it's not on the ready queue
            if( _queuedRequests.length > 0 ) {
                var options = _queuedRequests.shift();
                thread.dispatch( options );
            } else {
                _readyThreads.push( thread );
            }
        };

        for( var i = 0; i < options.size; ++ i ) {
            _threads.push( new Thread({
                id: window.guid(),
                pool: this
            }) );
        }

    }

    return ThreadPool;

});
