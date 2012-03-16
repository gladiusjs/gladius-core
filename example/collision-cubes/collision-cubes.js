/*global gladius, console, Box2D */
document.addEventListener( "DOMContentLoaded", function( e ){

    var canvas = document.getElementById( "test-canvas" );    
    var resources = {};

    var game = function( engine ) {
        var math = engine.math;

        var CubicVR = engine.graphics.target.context;   
        
        var PlayerComponent = engine.base.Component({
            type: 'Player',
            depends: ['Transform'] // We're going to be moving stuff
        },
        function( options ) {

            options = options || {};
            var that = this;

            // This is a hack so that this component will have its message
            // queue processed
            var service = engine.logic;
           
            this.onContactBegin = function( event ) {
                console.log( 'START', this.owner.id, event.data.entities[0], '<->', event.data.entities[1] );
            };
            
            this.onContactEnd = function( event ) {
                console.log( 'END', this.owner.id, event.data.entities[0], '<->', event.data.entities[1] );
            };

            this.onUpdate = function( event ) {
            };

            // Boilerplate component registration; Lets our service know that we exist and want to do things
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
        
        var run = function() {

            // Make a new space for our entities
            var space = new engine.core.Space();            
            
            var cubeBodyDefinition = engine.physics.resource.BodyDefinition({
                    type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,    // body type
                    linearDamping: 0.7, // linear damping
                    angularDamping: 0.7  // angular damping
            });
            var cubeCollisionShape = engine.physics.resource.Box( 1, 1 );
            var cubeFixtureDefinition = engine.physics.resource.FixtureDefinition({
                    shape: cubeCollisionShape,
                    density: 5.0
            });
            
            // Make an obstacle that will collide with the player
            var obstacle = new space.Entity({
                name: 'obstacle',
                components: [
                             new engine.core.component.Transform({
                                 position: [0, 0, 0]
                             }),
                             new engine.graphics.component.Model({
                                 mesh: resources.mesh,
                                 material: resources.material
                             }),
                             new engine.physics.component.Body({
                                 bodyDefinition: cubeBodyDefinition,
                                 fixtureDefinition: cubeFixtureDefinition
                             })
                             ]
            });

            // Make a user-controllable object that can collide with the obstacle
            var playerKeyHandler = function(e) {
                if( this.owner ) {                                         
                    // If we have an owner, dispatch a game event for it to enjoy
                    var keyCode = e.data.code;
                    var keyState = e.data.state;
                    switch( keyCode ) {
                    case 'W':   // move up
                        if( 'down' === keyState ) {
                            new engine.core.Event({
                                type: 'LinearImpulse',
                                        data: {
                                            impulse: [0, 1]
                                        }
                            }).dispatch( this.owner );
                        }
                        break;
                    case 'A':   // move left
                        if( 'down' === keyState ) {
                            new engine.core.Event({
                                type: 'LinearImpulse',
                                        data: {
                                            impulse: [-10, 0]
                                        }
                            }).dispatch( this.owner );
                        }
                        break;
                    case 'S':   // move down
                        if( 'down' === keyState ) {
                            new engine.core.Event({
                                type: 'LinearImpulse',
                                        data: {
                                            impulse: [0, -10]
                                        }
                            }).dispatch( this.owner );
                        }
                        break;
                    case 'D':   // move right
                        if( 'down' === keyState ) {
                            new engine.core.Event({
                                type: 'LinearImpulse',
                                        data: {
                                            impulse: [10, 0]
                                        }
                            }).dispatch( this.owner );
                        }
                        break;
                    case 'E':
                        if( 'down' === keyState ) {
                            new engine.core.Event({
                                type: 'AngularImpulse',
                                        data: {
                                            impulse: -10 // clockwise
                                        }
                            }).dispatch( this.owner );
                        }
                        break;
                    case 'Q':
                        if( 'down' === keyState ) {
                            new engine.core.Event({
                                type: 'AngularImpulse',
                                        data: {
                                            impulse: 1 // counter-clockwise
                                        }
                            }).dispatch( this.owner );
                        }
                        break;
                    }
                }
            };
            var player = new space.Entity({
                name: 'player',
                components: [
                             new engine.core.component.Transform({
                                 position: math.Vector3( 3, 1.5, 0 ),
                                 rotation: math.Vector3( 0, 0, 0 )
                             }),
                             new engine.graphics.component.Model({
                                 mesh: resources.mesh,
                                 material: resources.material
                             }),
                             new engine.input.component.Controller({
                                 onKey: playerKeyHandler
                             }),
                             new engine.physics.component.Body({
                                 bodyDefinition: cubeBodyDefinition,
                                 fixtureDefinition: cubeFixtureDefinition
                             }),
                             new PlayerComponent()
                             ]
            });

            canvas = engine.graphics.target.element;
            var camera = new space.Entity({
                name: 'camera',
                components: [
                             new engine.core.component.Transform({
                                 position: math.Vector3( 0, 2, 10 )
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
            camera.find( 'Camera' ).target = obstacle.find( 'Transform' ).position;

            // Start the engine!
            engine.run();

        };

        engine.core.resource.get(
                [
                 {
                     type: engine.graphics.resource.Mesh,
                     url: 'procedural-mesh.js?size=2',                          
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
                 }],
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
                    },
                    input: {
                        src: 'input/service',
                        options: {

                        }
                    },
                    physics: {
                        src: 'physics/2d/box2d/service',
                        options: {
                            gravity: [0, 0]
                        }
                    },
                    logic: 'logic/game/service'
                }
            },
            game
    );

});
