/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine ) {
    
        var Script = engine.base.Resource({
            type: 'Script',
            cache: null
        },
        function( source ) {

            source = source || {};
            source.text = source.text || '';
            source.parameters = source.parameters || [];

            /*jshint evil:true */
            var _script = new Function( source.parameters, source.text );
            
            Object.defineProperty( this, 'run', {
                get: function() {
                    return _script;
                }
            });
            
        });
        
        return Script;
        
    };
    
});

