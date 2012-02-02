/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false,
 assert: false */

define( function( require ) {

    var lang = require( 'lang' );
    var Proxy = require( './proxy');

    var Pool = function( options ) {

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
        };

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
            var id = lang.guid();
            _threads[id] = new Proxy({
                id: id,
                pool: this,
                ready: ready
            });
        }

    };

    return Pool;

});
