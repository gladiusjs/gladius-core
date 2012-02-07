/*global Sprite, viking, console, gladius*/
document.addEventListener( "DOMContentLoaded", function( e ){


    var printd = function( div, str ) {
        document.getElementById( div ).innerHTML = str + '<p>';
    };
    var cleard = function( div ) {
        document.getElementById( div ).innerHTML = '';
    };

    var canvas = document.getElementById( "test-canvas" );    
    var resources = {};

    var game = function( engine ) {
        var math = engine.math;

        var CubicVR = engine.graphics.target.context;

        var SpriteSheet = new engine.base.Resource({
          type: 'SpriteSheet'
        }, function( data ) {
          var options = { name: this.url };
          this.data = new Sprite(JSON.parse(data), options, viking);
          return;
        });
                        
        var run = function() {

            // Make a new space for our entities
            var space = new engine.core.Space();

            // Make some entities and arrange them
            var cubes = [];

            canvas = engine.graphics.target.element;

            cubes.push( new space.Entity({
                name: 'cube0',
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 0, 0, 0 ),
                        rotation: math.Vector3( 0, 0, 0 )
                    }),
                    new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    })
                ]
            }) );
  
            var camera = new space.Entity({
                name: 'camera',
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 0, 0, 10 )
                    }),
                    new engine.graphics.component.Camera({
                        active: true,
                        width: canvas.width,
                        height: canvas.height,
                        fov: 60
                    }),
                    new engine.graphics.component.Light({ intensity: 50 })
                ]
            });
            camera.find( 'Camera' ).target = math.Vector3( 0, 0, 0 );

            var task = new engine.scheduler.Task({
                schedule: {
                    phase: engine.scheduler.phases.UPDATE
                },
                callback: function() {
                    var delta = engine.scheduler.simulationTime.delta/1000;
                    cubes[0].find( 'Transform' ).rotation = math.matrix4.add([
                        cubes[0].find( 'Transform' ).rotation,
                        [ math.TAU * delta * 0.1, math.TAU * delta * 0.2, 0 ]
                    ]);
                }
            });
            
            // Start the engine!
            engine.run();

        };
        
        engine.core.resource.get(
            [
                {
                    type: engine.graphics.resource.Mesh,
                    url: 'procedural-mesh.js',                          
                    load: engine.core.resource.proceduralLoad,
                    onsuccess: function( mesh ) {
                        resources.mesh = mesh;
                    },
                    onfailure: function( error ) {
                    }
                },
                {
                    type: engine.graphics.resource.Material,
                    url: 'procedural-material.js',
                    load: engine.core.resource.proceduralLoad,
                    onsuccess: function( material ) {
                        resources.material = material;
                    },
                    onfailure: function( error ) {
                    }
                },
                {
                    type: SpriteSheet,
                    url: "thug1.sprite",
                    onsuccess: function( spriteSheet ) {
                      // XXXdmose spriteSheet is a Resource object, with one 
                      // "data" property which is the Sprite object itself.
                      // Need to talk with ack about this API, I feel the
                      // default loader should strip object and property in
                      // the caller and just pass the Sprite.
                      console.log("spriteSheet loaded");
/*                      var cubeArray = new BitmapCubeArray( 42, 42, nextBitWall.texture, 0 );
                      new Mesh ( cubeArray.mesh ); 
                      */ 
 
                    },
                    onfailure: function( error ) {
                      console.log("spriteSheet load error" + error);
                    }
                }
            ],
            {
                oncomplete: run
            }
        );

    };


    gladius.create(
            {
                debug: true,
                services: {
                    graphics: {
                        src: 'graphics/service',
                        options: {
                            canvas: canvas
                        }
                    }
                }
            },
            game
    );

});
