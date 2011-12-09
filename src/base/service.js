/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

	var lang = require( 'core/lang' );

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

			var _schedule = options.schedule || {};
			lang.extend( _schedule, {
				phase: 'UPDATE',
				before: [],
				after: []
			});
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
				
				var _task = new engine.scheduler.Task({
					priority: this.schedule.phase,		// TD: pass the entire schedule in rather than just the phase
					callback: this.update
				});
				Object.defineProperty( this, 'task', {
					get: function() {
						return _task;
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
