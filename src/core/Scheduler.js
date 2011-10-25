/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

        var Task = require( './Task' );

        var Scheduler = function( options ) {               

            options = options || {};            

            var _queue = [],
                _nextTaskId = 0,
                that = this;

            Object.defineProperty( this, 'nextTaskId', {
                get: function() {
                    return _nextTaskId ++;
                }
            });

            this.Task = function( options ) {
                options = options || {};
                options.scheduler = that;

                var task = new Task( options );

                return task;
            };

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

                setTimeout( that.run, 0 );
            };

            this.add = function( task ) { 
                if( !task.scheduled ) {
                    task.scheduled = true;
                    _queue.push( task );
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
