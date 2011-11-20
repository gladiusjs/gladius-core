/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

        var Task = require( './Task' );

        var Scheduler = function( options ) {               

            options = options || {};            

            var _queue = [],
                _nextTaskId = 0,
                _messageName = 'zero-timeout-message',
                _running = false,
                that = this;

            Object.defineProperty( this, 'nextTaskId', {
                get: function() {
                    return ++ _nextTaskId;
                }
            });

            this.Task = function( options ) {
                options = options || {};
                options.scheduler = that;

                var task = new Task( options );

                return task;
            };

            var handleMessage = function( event ) {
                if( event.source == window && event.data == _messageName ) {
                    event.stopPropagation();
                    if( !_running ) {
                        _running = true;
                        that.run();
                        _running = false;
                    }
                }
            };
            window.addEventListener( 'message', handleMessage, true );

            // Return the next runnable task, or null.
            var dequeue = function() {
                while( _queue.length > 0 ) {
                    var task = _queue.shift();
                    task.scheduled = false;
                    if( task.active ) {
                        return task;
                    }
                }
                return null;
            };

            this.run = function() {
                var task = dequeue();
                if( task ) {
                    task.callback();
                    if( task.active ) {
                        task.scheduled = true;
                        _queue.push( task );
                    }
                }

                if( _queue.length > 0 ) {
                    window.postMessage( _messageName, '*' );
                }
            };

            this.add = function( task ) { 
                if( !task.scheduled ) {
                    task.scheduled = true;
                    _queue.push( task );
                    window.postMessage( _messageName, '*' );
                }
            };

            this.remove = function( task ) {
                if( task.scheduled ) {
                    task.scheduled = false;
                }
            };

        };

        return Scheduler;

});
