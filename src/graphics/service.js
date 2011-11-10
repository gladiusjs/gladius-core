/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    var CubicVR = require( 'CubicVR.js/CubicVR' ),

        Resource = require( '../core/Resource' ),
        Mesh = require( './resource/Mesh' );
   
    return function( engine ) {
        
        var math = engine.math;
        // var conf = engine.configurator.get( '/graphics' );
        
        var Graphics = function( options ) {
            
            this.render = function( options ) {
             
            }

            this.resource = {

                Light: null,
                Material: null,
                Mesh: Mesh,
                Shader: null,
                Texture: null

            };

        }

        return Graphics;
        
    }
    
});
