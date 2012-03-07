/*global gladius, console, Box2D */
document.addEventListener( "DOMContentLoaded", function( e ){

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
            var gravity = options.gravity || new Box2D.b2Vec2( 0, 0 );
            var world = new Box2D.b2World( gravity );
            var directions = {
                    up: new Box2D.b2Vec2( 0, 1 ),
                    down: new Box2D.b2Vec2( 0, -1 ),
                    left: new Box2D.b2Vec2( -1, 0 ),
                    right: new Box2D.b2Vec2( 1, 0 )
            };
            var rotations = {
                    cw: 1,
                    ccw: -1
            };
            
            this.update = function() {
                
                var component;
                
                var updateEvent = new engine.core.Event({
                    type: 'Update',
                    queue: false,
                    data: {
                        delta: that.time.delta
                    }
                });
                for( var componentType in that.components ) {
                    for( var entityId in that.components[componentType] ) {
                        component = that.components[componentType][entityId];
                        while( component.handleQueuedEvent() ) {}
                        updateEvent.dispatch( component );
                    }
                }
                
                // Box2D steps in seconds
                var deltaInSeconds = that.time.delta / 1000; 
                world.Step( deltaInSeconds, 2, 2 );
                
            };

            var Body = engine.base.Component({
                type: 'Body',
                depends: ['Transform']
            },
            function( options ) {
                options = options || {};  
                var that = this;
                var i;
                var moveSpeed = 1.0;
                var rotationSpeed = 1.0;
               
                // Create the body as a box2d object
                var body = world.CreateBody( options.bodyDefinition );
                body.CreateFixture( options.fixtureDefinition );
                body.SetLinearVelocity( new Box2D.b2Vec2( 0, 0 ) );
                
                var moveDirection = new Box2D.b2Vec2( 0, 0 );
                var moveEventStates = {
                        up: false,
                        down: false,
                        left: false,
                        right: false
                };
                
                var rotationDirection = 0;
                var rotationEventStates = {
                        cw: false,
                        ccw: false
                };
                
                this.onMoveStart = function( e ) {
                    var direction = directions[e.data.direction];
                    
                    if( moveEventStates[direction] ) {
                        return;
                    }
                    
                    moveDirection.Set( moveDirection.get_x() + direction.get_x(), 
                            moveDirection.get_y() + direction.get_y() );
                    moveEventStates[direction] = true;
                };
                
                this.onMoveStop = function( e ) {
                    var direction = directions[e.data.direction];
                    moveDirection.Set( moveDirection.get_x() - direction.get_x(), 
                            moveDirection.get_y() - direction.get_y() );
                    moveEventStates[direction] = false;
                };
                
                this.onRotateStart = function( e ) {
                    var rotation = rotations[e.data.direction];
                    
                    if( rotationEventStates[rotation] ) {
                        return;
                    }
                    
                    rotationDirection += rotation;
                    rotationEventStates[rotation] = true;
                };
                
                this.onRotateStop = function( e ) {
                    var rotation = rotations[e.data.direction];
                    rotationDirection -= rotation;
                    rotationEventStates[rotation] = false;
                };
                               
                var frameImpulse = new Box2D.b2Vec2( 0, 0 );
                this.onUpdate = function( e ) {
                    frameImpulse.Set( moveDirection.get_x(), moveDirection.get_y() );
                    frameImpulse.Normalize();
                    frameImpulse.Set( moveSpeed * frameImpulse.get_x(), moveSpeed * frameImpulse.get_y() );
                    body.ApplyLinearImpulse( frameImpulse, body.GetPosition() );
                    body.ApplyAngularImpulse( rotationSpeed * rotationDirection );
                    
                    var position2 = body.GetPosition();
                    var angle2 = body.GetAngle();
                    
                    // TD: This will cause the transform to emit an event that we handle below. Blech!
                    var transform = this.owner.find( 'Transform' );  
                    transform.position = math.Vector3( position2.get_x(), position2.get_y(), transform.position[2] );
                    transform.rotation = math.Vector3( transform.rotation[0], transform.rotation[1], angle2 );
                };
                               
                this.onComponentOwnerChanged = function( e ){
                    if( e.data.previous === null && this.owner !== null ) {
                        service.registerComponent( this.owner.id, this );
                        body.SetActive( true );
                        body.SetAwake( true );
                        var transform = this.owner.find( 'Transform' );
                        body.SetTransform( new Box2D.b2Vec2( transform.position[0], transform.position[1] ), transform.rotation[2] );
                    }
                    
                    if( this.owner === null && e.data.previous !== null ) {
                        service.unregisterComponent( e.data.previous.id, this );
                        body.SetActive( false );
                        body.SetAwake( false );
                    }
                };
                
                this.onEntityManagerChanged = function( e ) {
                    if( e.data.previous === null && e.data.current !== null && this.owner !== null ) {
                        service.registerComponent( this.owner.id, this );
                        body.SetActive( true );
                        body.SetAwake( true );
                        body.SetTransform( new Box2D.b2Vec2( transform.position[0], transform.position[1] ), transform.rotation[2] );
                    }
                    
                    if( e.data.previous !== null && e.data.current === null && this.owner !== null ) {
                        service.unregisterComponent( this.owner.id, this );
                        body.SetActive( false );
                        body.SetAwake( false );
                    }
                };
                
            });

            this.component = {
                Body: Body
            };
            
            var Box = function( hx, hy ) {
                var shape = new Box2D.b2PolygonShape();
                shape.SetAsBox( hx, hy );
                return shape;
            };
            
            var BodyDefinition = function( type, linearDamping, angularDamping ) {
                var bd = new Box2D.b2BodyDef();
                bd.set_type( type );                
                bd.set_linearDamping( linearDamping );
                bd.set_angularDamping( angularDamping );
                bd.set_position( new Box2D.b2Vec2( 0, 0 ) );
                bd.active = false;
                bd.awake = false;
                return bd;
            };
            BodyDefinition.bodyType = {
                STATIC: Box2D.b2_staticBody,
                KINEMATIC: Box2D.b2_kinematicBody,
                DYNAMIC: Box2D.b2_dynamicBody
            };
            
            var FixtureDefinition = function( shape, density ) {
                var fd = new Box2D.b2FixtureDef();
                fd.set_density( density );
                fd.set_shape( shape );
                return fd;
            };
            
            this.resource = {
                Box: Box,
                BodyDefinition: BodyDefinition,
                FixtureDefinition: FixtureDefinition
            };
            
        });
        engine.physics = new Physics({ gravity: new Box2D.b2Vec2( 0, 0 ) });
        
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
            
            var cubeBodyDefinition = engine.physics.resource.BodyDefinition(
                    engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,    // body type
                    0.9, // linear damping
                    0.9  // angular damping
                    );
            var cubeCollisionShape = engine.physics.resource.Box( 1, 1 );
            var cubeFixtureDefinition = engine.physics.resource.FixtureDefinition( cubeCollisionShape, 5.0 );
            
            // Make an obstacle that will collide with the player
            var obstacle = new space.Entity({
                name: 'obstacle',
                components: [
                             new engine.core.component.Transform(),
                             new engine.graphics.component.Model({
                                 mesh: resources.mesh,
                                 material: resources.material
                             }),
                             new engine.physics.component.Body({
                                 bodyDefinition: cubeBodyDefinition,
                                 fixtureDefinition: cubeFixtureDefinition
                             }),
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
                                        direction: 'up'
                                    }
                        }).dispatch( this.owner );
                        break;
                    case 'A': 
                        new engine.core.Event({
                            type: keyState === 'down' ? 'MoveStart' : 'MoveStop',
                                    data: {
                                        direction: 'left'                                                             
                                    }
                        }).dispatch( this.owner );
                        break;
                    case 'S': 
                        new engine.core.Event({
                            type: keyState === 'down' ? 'MoveStart' : 'MoveStop',
                                    data: {
                                        direction: 'down'                                                             
                                    }
                        }).dispatch( this.owner );
                        break;
                    case 'D': 
                        new engine.core.Event({
                            type: keyState === 'down' ? 'MoveStart' : 'MoveStop',
                                    data: {
                                        direction: 'right'                                                             
                                    }
                        }).dispatch( this.owner );
                        break;
                    case 'E':
                        new engine.core.Event({
                            type: keyState === 'down' ? 'RotateStart' : 'RotateStop',
                                    data: {
                                        direction: 'cw' // clockwise
                                    }
                        }).dispatch( this.owner );
                        break;
                    case 'Q':
                        new engine.core.Event({
                            type: keyState === 'down' ? 'RotateStart' : 'RotateStop',
                                    data: {
                                        direction: 'ccw' // counter-clockwise
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
                             new engine.physics.component.Body({
                                 bodyDefinition: cubeBodyDefinition,
                                 fixtureDefinition: cubeFixtureDefinition
                             }),
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
