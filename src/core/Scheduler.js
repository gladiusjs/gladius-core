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

            this.run = function() {
                while( _queue.length > 0 ) {
                    var task = _queue.shift();
                    if( task.active ) {
                        task.callback();
                        if( task.active ) {
                            _queue.push( task );
                        }
                        break;
                    }
                }

                setTimeout( that.run, 0 );
            };

            this.add = function( task ) { 
                task.active = true;
                _queue.push( task );
            };

            this.remove = function( task ) {
                task.active = false;
            };

        };

        return Scheduler;

});
