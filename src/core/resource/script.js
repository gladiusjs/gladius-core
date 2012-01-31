/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {
    
        var Script = new engine.base.Resource({
            type: 'Script'
        },
        function( data ) {
            
            data = data || {};
            data.text = data.text || '';
            data.parameters = data.parameters || [];

            var _script = new Function( data.parameters, data.text );
            
            Object.defineProperty( this, 'run', {
                get: function() {
                    return _script;
                }
            });
            
        });
        
        return Script;
        
    };
    
});

