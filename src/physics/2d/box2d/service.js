/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global Box2D: false, define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    return function( engine ) {
        var math = engine.math;
        
        var Physics = engine.base.Service({
            type: 'Physics',
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
            var gravity = new Box2D.b2Vec2( options.gravity[0], options.gravity[1] ) || new Box2D.b2Vec2( 0, 0 );
            var world = new Box2D.b2World( gravity );
            this._b2World = world;
                         
            // TD: define getter/setter for gravity
            
            var contactListener = new Box2D.b2ContactListener();
            Box2D.customizeVTable( contactListener, [
                {
                    original: Box2D.b2ContactListener.prototype.BeginContact,
                    replacement: function( objPtr, contactPtr ) {
                        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );
                        var fixtureA = contact.GetFixtureA();
                        var fixtureB = contact.GetFixtureB();
                        var bodyA = fixtureA.GetBody();
                        var bodyB = fixtureB.GetBody();

                        new engine.core.Event({
                            type: 'ContactBegin',
                            data: {
                                entities: [bodyA.component.owner, bodyB.component.owner]
                            }
                        }).dispatch( [bodyA.component.owner, bodyB.component.owner] );                        
                    }
                },
                {
                    original: Box2D.b2ContactListener.prototype.EndContact,
                    replacement: function( objPtr, contactPtr ) {
                        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );
                        var fixtureA = contact.GetFixtureA();
                        var fixtureB = contact.GetFixtureB();
                        var bodyA = fixtureA.GetBody();
                        var bodyB = fixtureB.GetBody();

                        new engine.core.Event({
                            type: 'ContactEnd',
                            data: {
                                entities: [bodyA.component.owner, bodyB.component.owner]
                            }
                        }).dispatch( [bodyA.component.owner, bodyB.component.owner] );
                    }
                },
                {
                    original: Box2D.b2ContactListener.prototype.PreSolve,
                    replacement: function( objPtr, contactPtr, oldManifoldPtr ) {
                        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );
                    }
                },
                {
                    original: Box2D.b2ContactListener.prototype.PostSolve,
                    replacement: function( objPtr, contactPtr, oldManifoldPtr ) {
                        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );
                    }
                }
            ]);
            world.SetContactListener( contactListener );
            
            var directions = {
                    up: new Box2D.b2Vec2( 0, 1 ),
                    down: new Box2D.b2Vec2( 0, -1 ),
                    left: new Box2D.b2Vec2( -1, 0 ),
                    right: new Box2D.b2Vec2( 1, 0 )
            };
            var rotations = {
                    cw: -1,
                    ccw: 1
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
               
                // Create the body as a box2d object
                var body;
                if( options.bodyDefinition ) {
                    body = world.CreateBody( options.bodyDefinition );
                } else {
                    throw 'missing body definition';
                }
                if( options.fixtureDefinition ) {
                    body.CreateFixture( options.fixtureDefinition );
                }
                body.component = this;  // TD: this might be a bad idea
                body.SetLinearVelocity( new Box2D.b2Vec2( 0, 0 ) );
                
                Object.defineProperty(this, 'active', {
                  get: function getActive() {
                    return body.IsActive() ? true : false;
                  },
                  set: function setActive( val ) {
                    return body.SetActive( val ) ? true : false;
                  }
                });
                
                // exposed for testing purposes so that we can wrap it in a mock
                this._b2Body = body;
                this._service = service;
                
                var linearImpulse = new Box2D.b2Vec2( 0, 0 );
                this.onLinearImpulse = function( e ) {
                    var impulse = e.data.impulse;
                    linearImpulse.Set( impulse[0], impulse[1] );
                    body.ApplyLinearImpulse( linearImpulse, body.GetPosition() );
                    linearImpulse.Set( 0, 0 );
                };
                
                this.onAngularImpulse = function( e ) {
                    body.ApplyAngularImpulse( e.data.impulse );
                };               
                               
                this.onUpdate = function( e ) {
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
                    }
                    
                    if( this.owner !== null ) {
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
            
            var BodyDefinition = function( options ) {
                options = options || {};
                var bd = new Box2D.b2BodyDef();
                bd.set_type( options.hasOwnProperty( 'type' ) ? 
                        options.type : Box2D.b2_dynamicBody );
                bd.set_linearDamping( options.hasOwnProperty( 'linearDamping' ) ? 
                        options.linearDamping : 0 );
                bd.set_angularDamping( options.hasOwnProperty( 'angularDamping' ) ? 
                        options.angularDamping : 0 );
                bd.set_fixedRotation( options.hasOwnProperty( 'fixedRotation' ) ?
                        options.fixedRotation : false );
                bd.set_angularVelocity( options.hasOwnProperty( 'angularVelocity' ) ?
                        options.angularVelocity : 0 );
                bd.set_position( new Box2D.b2Vec2( 0, 0 ) );
                bd.set_active( false );
                bd.set_awake( false );
                return bd;
            };
            BodyDefinition.bodyType = {
                STATIC: Box2D.b2_staticBody,
                KINEMATIC: Box2D.b2_kinematicBody,
                DYNAMIC: Box2D.b2_dynamicBody
            };
            
            var FixtureDefinition = function( options ) {
                options = options || {};
                if( !options.hasOwnProperty( 'shape') ) {
                    throw 'missing shape';
                }
                var fd = new Box2D.b2FixtureDef();
                fd.set_density( options.hasOwnProperty( 'density' ) ? options.density : 1 );
                fd.set_shape( options.shape );
                return fd;
            };
            
            this.resource = {
                Box: Box,
                BodyDefinition: BodyDefinition,
                FixtureDefinition: FixtureDefinition
            };
            
        });
        
        return Physics;
        
    };

});