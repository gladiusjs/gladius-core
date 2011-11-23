/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    require( 'CubicVR.js/CubicVR' );
    
    var CubicVR = this.CubicVR,

        Resource = require( '../core/resource' ),
        Mesh = require( './resource/mesh' ),

        MeshProceduralCube = require( './script/mesh/procedural/cube' );

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

            this.script = {

                mesh: {
                    cube: MeshProceduralCube
                }

            };

        }

        return Graphics;
        
    }
    
});
