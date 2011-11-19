/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    var CubicVR = require( 'CubicVR.js/CubicVR' ),

        Resource = require( '../core/resource' ),
        Scene = require( '../core/scene' ),
        Mesh = require( './resource/mesh' );

   
    return function( engine ) {

        var math = engine.math;
        // var conf = engine.configurator.get( '/graphics' );
        
        var Graphics = function( options ) {

            var _scenes = [],
                _renderTask,
                _renderedFrames = 0,
                _this = this;

            this.render = function( options ) {

                for( var si = 0, sl = _scenes.length; si < sl; ++si ) {
                    var scene = _scenes[ si ],
                        cameras = scene.findAllWith( 'Camera' ),
                        models = scene.findAllWith( 'Model' );
                    for( var ci = 0, cl = cameras.length; ci < cl; ++ci ) {
                        var camera = cameras [ ci ];
                        if( camera.active ) {
                            for( var mi = 0, ml = models.length; mi < ml; ++mi ) {
                                // render( camera, models[ mi ] )
                            } //for models
                        }
                    } //for cameras
                } //for scenes

                ++_renderedFrames;
             
            }; //render

            this.resource = {

                Light: null,
                Material: null,
                Mesh: Mesh,
                Shader: null,
                Texture: null

            };

            engine.sceneAdded.bind( function( scene ) {
                _scenes.push( scene );
            });

            _renderTask = engine.scheduler.Task({
                callback: function() {
                    _this.render();
                }
            });

            Object.defineProperty( this, "renderedFrames", {
                get: function() {
                    return _renderedFrames;
                }
            });

            Object.defineProperty( this, "scenes", {
                get: function() {
                    return _scenes;
                }
            });
     
        }

        return Graphics;
        
    }
    
});
