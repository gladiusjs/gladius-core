/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    return function( engine, service ) {

        var math = engine.math;
        var Component = require( 'base/component' );
        var lang = require( 'lang' );

        return Component({
            type: 'Controller'
        },
        function( options ) {
            lang.extend(this, options);

            /*this.onKey = function( e ) {
                console.log( e.type, e.data );
                // Look for an event mapping and dispatch to entity.
            };*/
            
            this.onComponentOwnerChanged = function( e ){
                if( e.data.previous === null && this.owner !== null ) {
                    service.registerComponent( this.owner.id, this );
                }
                
                if( this.owner === null && e.data.previous !== null ) {
                    service.unregisterComponent( e.data.previous.id, this );
                }
            };
            
            this.onEntityManagerChanged = function( e ) {
                if( e.data.previous === null && e.data.current !== null && this.owner !== null ) {
                    service.registerComponent( this.owner.id, this );
                }
                
                if( e.data.previous !== null && e.data.current === null && this.owner !== null ) {
                    service.unregisterComponent( this.owner.id, this );
                }
            };
        });
       
    
    };
    
});