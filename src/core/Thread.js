/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {

    var lang = require( './lang' );

    var threadLogic = function __thread( id ) {

        var log = function( message ) {
            self.postMessage({
                method: '__worker_log',
                thread: id,
                log: message
            });
        };
        
        var _dispatch = function ( request ) {
            var f = new Function( request.call );
            return f();
        };

        self.onmessage = function( event ) {
            var message = event.data;
            switch( message.method ) {
                case '__worker_dispatch':
                    var result = _dispatch( message.request );
                    self.postMessage({
                        method: '__worker_dispatch_complete',
                        thread: id,
                        result: result
                    });
                    break;
                case '__worker_start':
                    break;
                default:
                    log( 'ignoring unknown message from thread' );
                    break;
            }
        };

        self.onerror = function( error ) {
        };

        self.postMessage({
            method: '__worker_started',
            thread: id
        });

    };

    var Thread = function( options ) {

        options = options || {};

        var _id = options.id;
        var _pool = options.pool;
        var _request = null;
        var that = this;

        var _script = new BlobBuilder();
        _script.append( threadLogic.toString() );
        _script.append( '__thread(' + _id + ');' );
        var _scriptUrl = window.URL.createObjectURL( _script.getBlob() );
        var _worker = new Worker( _scriptUrl );

        _worker.onmessage = function( event ) {
            var message = event.data;
            switch( message.method ) {
                case '__worker_started':
                    console.log( 'thread' + message.thread + ' is running' );
                    _pool.ready( that );
                    break;
                /*
                case '__worker_terminated':
                    console.log( 'thread' + message.thread + ' terminated' );
                    break;
                */
                case '__worker_dispatch_complete':
                    console.log( 'thread' + message.thread + ' dispatch completed' );
                    _request.result = message.result;
                    that.dispatchComplete( _request );
                    break;
                case '__worker_log':
                    console.log( '[thread' + message.thread + '] ' + message.log );
                    break;
                default:
                    console.log( 'ignoring unknown message from thread' + message.thread );
            }
        };

        _worker.onerror = function( error ) {
        };

        this.dispatchRequest = function( options ) {
            options = options || {};

            _request = options;

            var f = options.call.toString();
            f = f.split( '\n' );
            f.remove( 0 );
            f.remove( f.length - 1 );
            f = f.join( '\n' );

            _worker.postMessage({
                method: '__worker_dispatch',
                request: {
                    call: f,
                    parameters: options.parameters
                }
            });
        };

        this.dispatchComplete = function( request ) {
            if( request.onComplete ) {
                request.onComplete( request.result );
            }
            _request = null;
            _pool.ready( that );
        };

        _worker.postMessage({
            method: '__worker_start'
        });

    };

    var ThreadPool = function( options ) {

        options = options || {};
        options.size = options.size || 1;

        var _threads = [];
        var _queuedRequests = [];
        var _readyThreads = [];
        var _nextID = 0;

        // External API
        this.call = function( options ) {
            if( _readyThreads.length > 0 ) {
                var thread = _readyThreads.shift();
                thread.dispatchRequest( options );
            } else {
                _queuedRequests.push( options );
            }
        };

        // Thread API
        this.ready = function( thread ) {
            // TD: make sure this is one of our threads, and that it's not on the ready queue
            if( _queuedRequests.length > 0 ) {
                var options = _queuedRequests.shift();
                thread.dispatchRequest( options );
            } else {
                _readyThreads.push( thread );
            }
        };

        for( var i = 0; i < options.size; ++ i ) {
            _threads.push( new Thread({
                id: _nextID ++,
                pool: this
            }) );
        }

    }

    return ThreadPool;

});
