/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    var requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
               window.setTimeout(callback, 1000/60);
           };
    })();

    require( 'CubicVR.js/CubicVR' );
    
    var CubicVR = this.CubicVR,

        Resource = require( '../core/resource' ),
        Mesh = require( './resource/mesh' ),

        MeshProceduralCube = require( './script/mesh/procedural/cube' );

    return function( engine ) {

        var math = engine.math;
        // var conf = engine.configurator.get( '/graphics' );
        
        var Graphics = function( options ) {

            var _scenes = [],
                _renderTask,
                _renderedFrames = 0,
                _this = this;


            engine.sceneAdded.subscribe( function( scene ) {
                _scenes.push( scene );
            });

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
                        } //if
                    } //for cameras
                } //for scenes

                ++_renderedFrames;
             
            }; //render

            var _stopRenderLoop = false;

            function renderLoop() {
                _this.render();
                if ( !_stopRenderLoop ) {
                    requestAnimFrame( renderLoop );
                } //if
            }

            this.startRenderLoop = function() {
                _stopRenderLoop = false;
                renderLoop();
            }; 

            this.stopRenderLoop = function() {
                _stopRenderLoop = true;
            };

            var _resources = {

                Light: null,
                Material: null,
                Mesh: Mesh,
                Shader: null,
                Texture: null

            };

            Object.defineProperty( this, "resource", {
                get: function() {
                    return _resources;
                }
            });

            Object.defineProperty( this, "renderedFrames", {
                get: function() {
                    return _renderedFrames;
                }
            });

            var _scripts = {

                mesh: {
                    cube: MeshProceduralCube
                }

            };

            Object.defineProperty( this, "script", {
                get: function() {
                    return _scripts;
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
