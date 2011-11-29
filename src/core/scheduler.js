/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

        var Task = require( './task' );

        var Scheduler = function( options ) {

            options = options || {};            

            var _queue = [],
                _running = false,
                that = this;

            this.Task = function( options ) {
                options = options || {};
                options.manager = that;

                var task = new Task( options );

                return task;
            };

            this.run = function() {
                if( !_running ) {
                    _running = true;
                    dispatch();
                    _running = false;
                }
            };

            var dispatch = function() {
                var tasks = _queue;
                _queue = [];
                
                while( tasks.length > 0 ) {
                    var task = tasks.shift();
                    if( task && task.active ) {
                        task.scheduled = false;
                        task.callback();
                        if( task.active ) {
                            task.scheduled = true;
                            _queue.push( task );
                        }
                    }
                }

                if( _queue.length > 0 ) {
                    setTimeout( that.run, 0 );
                }
            };

            this.add = function( task ) { 
                if( !task.scheduled ) {
                    task.scheduled = true;
                    _queue.push( task );
                    setTimeout( that.run, 0 );
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
