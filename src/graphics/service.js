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
        Material = require( './resource/material' ),

        Model = require( './component/model' ),
        Camera = require( './component/camera' ),

        MeshProceduralCube = require( './script/mesh/procedural/cube' );
        SampleColorMaterial = require( './script/material/procedural/sample' );

    return function( engine ) {

        var math = engine.math;
        // var conf = engine.configurator.get( '/graphics' );
        
        var Graphics = engine.base.Service({
          type: 'Graphics',
          schedule: {
            update: {
              phase: engine.scheduler.phases.RENDER,
            }
          },
          time: engine.scheduler.realTime
        },
        function( options ) {

            var _scenes = [],
                _renderedFrames = 0,
                _canRender = false,
                _this = this;

            engine.spaceAdded.subscribe( function( scene ) {
                _scenes.push( scene );
            });

            this.render = function( options ) {

                var scene,
                    cameras,
                    camera,
                    models,
                    model,
                    transform,
                    gl = CubicVR.GLCore.gl;

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                for( var si = 0, sl = _scenes.length; si < sl; ++si ) {
                    scene = _scenes[ si ];
                    cameras = scene.findAllWith( 'Camera' );
                    models = scene.findAllWith( 'Model' );

                    for( var ci = 0, cl = cameras.length; ci < cl; ++ci ) {
                        camera = cameras[ ci ].find( 'Camera' );

                        if( camera.active ) {
                            for( var mi = 0, ml = models.length; mi < ml; ++mi ) {
                              
                                model = models[ mi ].find( 'Model' );
                                transform = models[ mi ].find( 'Transform' );
                                CubicVR.renderObject(
                                    model.mesh._cvr.mesh,
                                    camera._cvr.camera,
                                    transform.absolute
                                );

                            } //for models
                        } //if

                    } //for cameras

                } //for scenes

                ++_renderedFrames;
             
            }; //render

            var handleAnimFrame = function() {
              _canRender = true;
              requestAnimFrame( handleAnimFrame );
            };
            requestAnimFrame( handleAnimFrame );

            this.update = function() {
              if (_canRender) {
                _this.render();
                _canRender = false;
              } //if
            }; //update

            var _resources = {

                Light: null,
                Material: Material,
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
                },
                material: {
                    sample: SampleColorMaterial
                }

            };

            Object.defineProperty( this, 'script', {
                get: function() {
                    return _scripts;
                }
            });

            Object.defineProperty( this, 'scenes', {
                get: function() {
                    return _scenes;
                }
            });

            var _components = {

                Model: Model( engine ),
                Camera: Camera( engine )

            };

            Object.defineProperty( this, 'component', {
                get: function() {
                    return _components;
                }
            });

        });

        return Graphics;
        
    }
    
});
