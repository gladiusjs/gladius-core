/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  
    require( 'CubicVR.js/CubicVR' );
    
    var CubicVR = this.CubicVR,

        Mesh = require( './resource/mesh' ),
        Material = require( './resource/material' ),
        LightResource = require( './resource/light' ),
        Target = require( './target' ),

        Model = require( './component/model' ),
        Camera = require( './component/camera' ),
        Light = require( './component/light' ),

        MeshProceduralCube = require( './script/mesh/procedural/cube' );
        SampleColorMaterial = require( './script/material/procedural/sample' );
        SampleLight = require( './script/light/procedural/sample' );

    return function( engine ) {

        var math = engine.math;
        // var conf = engine.configurator.get( '/graphics' );
        
        var Graphics = engine.base.Service({
          type: 'Graphics',
          time: engine.scheduler.realTime
        },
        function( options ) {

            options = options || {};

            var _target = new Target({
                element: options.canvas
            });
        
            Object.defineProperty( this, "target", {
                enumerable: true,
                configurable: false,
                get: function() {
                    return _target;
                }
            });

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
                    lights,
                    gl = _target.context.GLCore.gl;

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                for( var si = 0, sl = _scenes.length; si < sl; ++si ) {
                    scene = _scenes[ si ];
                    cameras = scene.findAllWith( 'Camera' );
                    models = scene.findAllWith( 'Model' );
                    lights = scene.findAllWith( 'Light' );

                    var cvrLights = [];
                    for( var li = 0, ll = lights.length; li < ll; ++li ) {
                        var lightComponent = lights[ li ].find( 'Light' ); 
                        lightComponent.prepareForRender();
                        cvrLights.push( lightComponent._cvr.light );
                    } //for lights

                    for( var ci = 0, cl = cameras.length; ci < cl; ++ci ) {
                        camera = cameras[ ci ].find( 'Camera' );

                        if( camera.active ) {
                            for( var mi = 0, ml = models.length; mi < ml; ++mi ) {
                              
                                model = models[ mi ].find( 'Model' );
                                transform = models[ mi ].find( 'Transform' );
                                camera.prepareForRender();
                                _target.context.renderObject(
                                    model.mesh._cvr.mesh,
                                    camera._cvr.camera,
                                    transform.absolute,
                                    cvrLights 
                                );

                            } //for models
                        } //if

                    } //for cameras

                } //for scenes

                ++_renderedFrames;
             
            }; //render

            var _resources = {

                Light: LightResource( engine ),
                Material: Material( engine, _target.context ),
                Mesh: Mesh( engine, _target.context ),
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
                },
                light: {
                    sample: SampleLight
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

                Model: Model( engine, _this, _target.context ),
                Camera: Camera( engine, _this, _target.context ),
                Light: Light( engine, _this, _target.context )

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
