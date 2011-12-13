/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'core/lang' ),
    defaultSchedules = require( 'base/default-schedules' );

    return function( engine ) {

        var IService = function( options ) {

            options = options || {};

            var _type = options.type || undefined;
            Object.defineProperty( this, 'type', {
                get: function() {
                    return _type;
                }
            });

            var _depends = options.depends || [];
            Object.defineProperty( this, 'depends', {
                get: function() {
                    return _depends;
                }
            });

            var _schedule = options.schedule || defaultSchedules[_type];
            if( !_schedule ) {
                throw 'no schedule defined, and no default schedule for type ' + _type;
            }
            Object.defineProperty( this, 'schedule', {
                get: function() {
                    return _schedule;
                }
            });

            var _time = options.time || engine.scheduler.simulationTime;
            Object.defineProperty( this, 'time', {
                get: function() {
                    return _time;
                }
            });

        };

        var Service = function( options, c ) {

            option = options || {};

            var r = function( options ) {

                options = options || {};

                c.call( this, options );

                var callbackNames = Object.keys( this.schedule );
                var _tasks = {};
                for( var i = 0, l = callbackNames.length; i < l; ++ i ) {
                    var name = callbackNames[i];
                    _tasks[callbackNames[i]] = new engine.scheduler.Task({
                        schedule: this.schedule[name],
                        callback: this[name]
                    });
                };
                Object.defineProperty( this, 'tasks', {
                    get: function() {
                        return _tasks;
                    }
                });

            };
            r.prototype = new IService( options );
            r.prototype.constructor = r;

            return r;

        };

        return Service;

    };

});
