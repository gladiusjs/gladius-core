/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    /* Component
     *
     * A component provides contains data and logic for a specific game function.
     */

    var Component = function( engine, options ) {
    
        return function( type, Func, depends, provides ) {            
            return function( options ) {
                var component = new Func( options );

                Object.defineProperty( component, 'type', {
                    get: function() {
                        return type;
                    }
                });

                Object.defineProperty( component, 'depends', {
                    get: function() {
                        return depends;
                    }
                });

                Object.defineProperty( component, 'provides', {
                    get: function() {
                        return provides;
                    }
                });
            
                return component;
            };
        };

    }

    return Component;

});
