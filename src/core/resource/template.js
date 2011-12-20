/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    return function( engine ) {
        
        var Template = engine.base.Resource({
            type: 'Template',
            cache: null       
        },
        function( source ) {
            
            var _source = source;
            
            // Create and return a new entity tree from this template
            this.create = function( options ) {
                
                options = options || {};

                // Return an entity tree
                
                return "Entity tree!";
                
            };
            
        });
        
        return Template;

    };
});

