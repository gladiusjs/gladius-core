/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

	var Queue = function( options ) {
		
		options = options || {};
		var that = this;
		var _queue = [];
		
		this.enqueue = function() {
			for( var i = 0, l = arguments.length; i < l; ++ i ) {
				_queue.push( arguments[i] );
			}
		};
		
		this.dequeue = function() {
			return _queue.shift();
		};
		
		Object.defineProperty( this, 'size', {
			get: function() {
				return _queue.length;
			},
			enumerable: true
		});
		
		Object.defineProperty( this, 'contents', {
			get: function() {
				return _queue.slice();
			},
			enumerable: true
		});
		
	};
	
	return Queue;
	
});