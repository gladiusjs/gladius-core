/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

	return function( engine ) {

		var Input = engine.base.Service({
			type: 'Input',
			schedule: {
				update: {
					phase: 'INPUT'
				}
			},
			time: engine.scheduler.realTime
		},
		function( options ) {

			var that = this;

			this.update = function() {
			};

		});

		return Input;

	};

});