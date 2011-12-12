/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

	return function( engine ) {

		var Network = engine.base.Service({
			type: 'Network',
			schedule: {
				receive: {
					phase: 'INPUT'
				},
				send: {
					phase: 'RENDER'
				}
			},
			time: engine.scheduler.realTime
		},
		function( options ) {

			var that = this;

			this.receive = function() {
			};
			
			this.send = function() {
				
			};

		});

		return Network;

	};

});