/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

	var lang = require( './lang' );
    
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
        
        var _priority = options.priority || {};
        lang.extend( _priority, {
        	phase: 'Update',
        	before: [],
        	after: []
        });
        Object.defineProperty( this, 'priority', {
        	get: function() {
        		return _priority;
        	}
        });
    	
    };

    var Service = function( options, c ) {
        
        option = options || {};
        
        var r = function( options ) {

        	options = options || {};
        	
        	// TD: Make a task for this service
        	      	
        	c.call( this, options );
        	
        };
        r.prototype = new IService( options );
        r.prototype.constructor = r;
        
        return r;
        
    };

    return Service;

});
