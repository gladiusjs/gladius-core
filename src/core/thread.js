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

        self.onerror = function( error ) {
        };

        var handle_dispatch = function __dispatch( message ) {
            // TD: Try/catch here to handle errors
            var f = new Function( ['console', 'assert', 'parameters'], 'var f = ' + message.call + '; return f.apply( null, parameters );' );
            var result = f.apply( null, [ console, assert, message.parameters ] );
            send( '__result', {
                result: result
            });
            send( '__ready' );
        };
        expose( handle_dispatch );

        var handle_run = function __run() {                
        };
        expose( handle_run );

        send( '__ready' );

    };

    var Thread = function( options ) {

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
        _script.append( threadWorker.toString() );
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

            var f = options.call.toString();
            send( '__dispatch', {
                call: f,
                parameters: options.parameters
            });
        };

        this.terminate = function() {
            _worker.terminate();
            window.URL.revokeObjectURL( _scriptUrl );
        };

        send( '__run' );
    };

    var ThreadPool = function( options ) {

        options = options || {};
        options.size = options.size || 1;

        var _threads = {};
        var _queuedRequests = [];
        var _readyThreads = [];
        var _terminate = false;

        var ready = function( thread ) {
            assert( _threads[thread.id], 'thread ' + thread.id + ' does not belong to this thread pool' );
            if( _terminate ) {
                thread.terminate();
                delete _threads[thread.id];
                return;
            }

            if( _queuedRequests.length > 0 ) {
                var options = _queuedRequests.shift();
                thread.dispatch( options );
            } else {
                _readyThreads.push( thread );
            }
        };

        // External API

        // Dispatch work to this pool; Will be picked up by the first available thread
        this.dispatch = function( options ) {
            assert( !_terminate, 'call invoked on terminated thread pool' );
            if( _readyThreads.length > 0 ) {
                var thread = _readyThreads.shift();
                thread.dispatch( options );
            } else {
                _queuedRequests.push( options );
            }
        };

        // Terminate this pool; force: true terminate immediately
        this.terminate = function( options ) {
            options = options || {};
            options.force = options.force || false;
            this._ready = [];
            if( options.force ) {
                for( var i = 0, l = _threads.length; i < l; ++ i ) {
                    _threads[i].terminate();
                }
            }
        };

        // Change the number of threads in the pool
        var resize = function( size ) {
            // TD: not implemented
        }

        Object.defineProperty( this, 'size', {
            get: function() {
                return _threads.length;
            },
            set: function( value ) {
                var size = _threads.length;
                resize( value );
                return size;
            }
        });

        for( var i = 0; i < options.size; ++ i ) {
            var id = window.guid();
            _threads[id] = new Thread({
                id: id,
                pool: this,
                ready: ready
            });
        }

    }

    return ThreadPool;

});
