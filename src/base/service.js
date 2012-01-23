/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var lang = require( 'lang' ),
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
                
                var _components = {};
                Object.defineProperty( this, 'components', {
                    get: function() {
                        return _components;
                    }
                });
                
                var _registerComponent = function( id, component ) {
                    if( !_components.hasOwnProperty( component.type ) ) {
                        _components[component.type] = {};
                    }
                    _components[component.type][id] = component;
                };
                Object.defineProperty( this, 'registerComponent', {
                    get: function() {
                        return _registerComponent;
                    }
                });
                
                var _unregisterComponent = function( id, component ) {
                    if( _components.hasOwnProperty( component.type ) && 
                            _components[component.type].hasOwnProperty( id ) ) {
                        delete _components[component.type][id];
                    }
                };
                Object.defineProperty( this, 'unregisterComponent', {
                    get: function() {
                        return _unregisterComponent;
                    }
                });

                c.call( this, options );

                var callbackNames = Object.keys( this.schedule );
                var _tasks = {};
                for( var i = 0, l = callbackNames.length; i < l; ++ i ) {
                    var name = callbackNames[i];
                    _tasks[callbackNames[i]] = new engine.scheduler.Task({
                        schedule: this.schedule[name],
                        callback: this[name],
                        group: this.type,
                        depends: this.depends
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
