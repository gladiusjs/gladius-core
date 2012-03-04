/*global gladius, console, Box2D */
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
        
        var Physics = engine.base.Service({
            type: 'Physics',
            schedule: {
                update: {
                    phase: engine.scheduler.phases.UPDATE
                }
            },
            depends: [ 'Motion' ],
            time: engine.scheduler.simulationTime
        },
        function( options ) {

            var that = this;
            var service = this;
            var gravity = options.gravity || math.vector2.zero;
            
            this.update = function() {

                for( var componentType in that.components ) {
                    for( var entityId in that.components[componentType] ) {
                        while( that.components[componentType][entityId].handleQueuedEvent() ) {}
                    }
                }

            };

            var Body = engine.base.Component({
                type: 'Body',
                depends: ['Transform']
            },
            function( options ) {
                options = options || {};                
                var that = this;
                
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
                
                var body = new world.CreateBody( options.bodyDefinition );
                this.mesh = options.mesh || null;
                if( null != this.mesh ) {
                    body.CreateFixture( this.mesh );
                }
            });

            this.component = {
                Body: Body
            };
            
            var Box = function( hx, hy ) {
                var shape = new Box2D.b2PolygonShape();
                shape.setAsBox( hx, hy );
                return shape;
            };
            
            var BodyDefinition = function( type ) {
                var bd = new Box2D.b2BodyDef();
                bd.set_type( type );
                return bd;
            };
            BodyDefinition.bodyType = {
                STATIC: Box2D.b2_staticBody,
                KINEMATIC: Box2D.b2_kinematicBody,
                DYNAMIC: Box2D.b2_dynamicBody
            };
            
            this.resource = {
                Box: Box,
                BodyDefinition: BodyDefinition
            };
            
            var world = new Box2D.b2World( gravity );

        });
        engine.physics = new Physics();
        
        var MotionService = engine.base.Service({
            type: 'Motion',
            schedule: {
                update: {
                    phase: engine.scheduler.phases.UPDATE
                }
            },
            time: engine.scheduler.simulationTime
        },
        function( options ) {
            var that = this;
            var service = this;
            options = options || {};
            
            this.update = function() {
                var updateEvent = new engine.core.Event({
                    type: 'Update',
                    queue: false,
                    data: {
                        delta: that.time.delta
                    }
                });
                for( var componentType in that.components ) {
                    for( var entityId in that.components[componentType] ) {
                        var component = that.components[componentType][entityId];
                        while( component.handleQueuedEvent() ) {}
                        updateEvent.dispatch( component );
                    }
                }
            };
            
            var AutoPlanar = engine.base.Component({
                type: 'Motion',
                depends: ['Transform']
            },
            function( options ) {
                var that = this;
                var speed = options.speed || 1;
                var direction = math.Vector3( [1, 0, 0] );
                var displacement = 0;
                var maxDisplacement = 3;
                
                this.onUpdate = function( event ) {
                    var transform = this.owner.find( 'Transform' );
                    
                    var iVelocity = math.vector3.multiply( direction, speed * event.data.delta / 1000 );
                    transform.position = math.vector3.add( transform.position, iVelocity );
                    displacement += iVelocity[0];
                    if( Math.abs( displacement ) > maxDisplacement ) {
                        direction = math.vector3.multiply( direction, -1 );
                    }
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
            
            var Planar = engine.base.Component({
                type: 'Motion',
                depends: ['Transform']
            },
            function( options ) {
                var that = this;
                var speed = options.speed || 1;
                var _directions = {
                    UP: math.Vector3( 0, 1, 0 ),
                    LEFT: math.Vector3( -1, 0, 0 ),
                    RIGHT: math.Vector3( 1, 0, 0 ),
                    DOWN: math.Vector3( 0, -1, 0 )
                };
                var _move = null;
                
                this.onMoveStart = function( event ) {
                    _move = event.data.direction;
                };
                
                this.onMoveStop = function( event ) {
                    _move = null;
                };
                
                this.onUpdate = function( event ) {
                    var transform = this.owner.find( 'Transform' );

                    if( _move ) {
                        var displacement = math.vector3.multiply( _directions[_move], speed * event.data.delta / 1000 );   // scaled motion using time delta
                        transform.position = math.vector3.add( transform.position, displacement );
                    }
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
            
            var _components = {
                Planar: Planar,
                AutoPlanar: AutoPlanar
            };
            Object.defineProperty( this, 'component', {
                get: function() {
                    return _components;
                }
            });
        });
        engine.motion = new MotionService();

        var PlayerComponent = engine.base.Component({
            type: 'Player',
            depends: ['Transform']    // We're going to be moving stuff
        },
        function( options ) {

            options = options || {};
            var that = this;

            // This is a hack so that this component will have its message
            // queue processed
            var service = engine.logic; 
           
            this.onCollision = function( event ) {
                // console.log( that.owner.id, '<->', event.data.entity.id );
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

            canvas = engine.graphics.target.element;

            // Make an obstacle that will collide with the player
            var obstacle = new space.Entity({
                name: 'obstacle',
                components: [
                             new engine.core.component.Transform(),
                             new engine.graphics.component.Model({
                                 mesh: resources.mesh,
                                 material: resources.material
                             }),
                             new engine.motion.component.AutoPlanar()
                             ]
            });

            // Make a user-controllable object that can collide with the obstacle
            var playerKeyHandler = function(e) {
                if( this.owner ) {                                         
                    // If we have an owner, dispatch a game event for it to enjoy
                    var keyCode = e.data.code;
                    var keyState = e.data.state;
                    switch( keyCode ) {
                    case 'W':
                        new engine.core.Event({
                            type: keyState === 'down' ? 'MoveStart' : 'MoveStop',
                                    data: {
                                        direction: 'UP'
                                    }
                        }).dispatch( this.owner );
                        break;
                    case 'A': 
                        new engine.core.Event({
                            type: keyState === 'down' ? 'MoveStart' : 'MoveStop',
                                    data: {
                                        direction: 'LEFT'                                                             
                                    }
                        }).dispatch( this.owner );
                        break;
                    case 'S': 
                        new engine.core.Event({
                            type: keyState === 'down' ? 'MoveStart' : 'MoveStop',
                                    data: {
                                        direction: 'DOWN'                                                             
                                    }
                        }).dispatch( this.owner );
                        break;
                    case 'D': 
                        new engine.core.Event({
                            type: keyState === 'down' ? 'MoveStart' : 'MoveStop',
                                    data: {
                                        direction: 'RIGHT'                                                             
                                    }
                        }).dispatch( this.owner );
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
                             new engine.motion.component.Planar({ speed: 5 }),
                             new PlayerComponent()
                             ]
            });

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

    // We may be sharing a copy of require.js with Gladius if we're developing
    // If so, this next line guarantees that we have a configuration of
    // require.js that loads things relative to this directory 
    var localRequire = require.config({context: "local", baseUrl: "."});

    // pull in the bitwall-model code, and once we've got it, load our sprite,
    // and run the game!
    localRequire(['../../external/box2d.js/box2d'], function ( Box2D ) {


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
                    logic: 'logic/game/service'
                }
            },
            game
      );    

    });


});
