/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
 test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false,
 asyncTest: false, equal: false */

( function() {

    var engine = null;    

    module('physics/2d/box2d', {
        setup : function() {
            stop();

            var canvas = document.getElementById("test-canvas");
            gladius.create({
                debug : true,
                services : {
                    physics : {
                        src : 'physics/2d/box2d/service',
                        options : {
                            gravity : [0, 0]
                        }
                    }
                }
            }, function(instance) {
                engine = instance;
                start();
            });
        },
        teardown : function() {
            engine = null;
        }
    });
    
    test( 'body definition, default parameters', function() {
        expect( 7 );
        
        var bodyDefinition = engine.physics.resource.BodyDefinition();
        equal( bodyDefinition.get_type(), 
                engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
                'correct default type' );
        equal( bodyDefinition.get_linearDamping(), 0, 
                'correct default linear damping' );
        equal( bodyDefinition.get_angularDamping(), 0, 
                'correct default angular damping' );
        equal( bodyDefinition.get_fixedRotation(), 0,
                'correct default fixed rotation' );
        
        var position = bodyDefinition.get_position();
        deepEqual( [position.get_x(), position.get_y()], [0, 0], 
                'correct default position' );
        
        ok( bodyDefinition.get_active() == false, 
                'correct default active state' );
        ok( bodyDefinition.get_awake() == false,
                'correct default awake state' );
    });
    
    test( 'body definition, all parameters passed', function() {
        expect( 4 );
        
        var bodyDefinition = engine.physics.resource.BodyDefinition({
            type: engine.physics.resource.BodyDefinition.bodyType.STATIC,
            linearDamping: 10,
            angularDamping: 20,
            fixedRotation: true
        });
        equal( bodyDefinition.get_type(), 
                engine.physics.resource.BodyDefinition.bodyType.STATIC,
                'correct type' );
        equal( bodyDefinition.get_linearDamping(), 10, 
                'correct linear damping' );
        equal( bodyDefinition.get_angularDamping(), 20, 
                'correct angular damping' );
        equal( bodyDefinition.get_fixedRotation(), 1, 
                'correct fixed rotation' );
    });
    
    test( 'construct a body', function() {
        expect( 5 );
        
        var bodyDefinition = engine.physics.resource.BodyDefinition({
                type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC
        });        
        ok( bodyDefinition, 'body definition is returned' );
        
        var box = engine.physics.resource.Box( 1, 1 );        
        ok( box, 'box is returned' );
        
        var fixtureDefinition = engine.physics.resource.FixtureDefinition({ 
            shape: box
        });
        ok( fixtureDefinition, 'fixture definition is returned' );
        
        var body = new engine.physics.component.Body({
            bodyDefinition: bodyDefinition,
            fixtureDefinition: fixtureDefinition
        });
        ok( body, 'body is returned' );
        
        var space = new engine.core.Space();        
        var entity = new space.Entity({
            components: [
                         new engine.core.component.Transform(),
                         body
                         ]
        });
        equal( body, entity.find( 'Body' ), 'body is added to the entity' );
    });
    
    test( 'construct a body, no fixture definition', function() {
        expect( 3 );
        
        var bodyDefinition = engine.physics.resource.BodyDefinition({
                type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC
        });        
        ok( bodyDefinition, 'body definition is returned' );
              
        var body = new engine.physics.component.Body({
            bodyDefinition: bodyDefinition
        });
        ok( body, 'body is returned' );
        
        var space = new engine.core.Space();        
        var entity = new space.Entity({
            components: [
                         new engine.core.component.Transform(),
                         body
                         ]
        });
        equal( body, entity.find( 'Body' ), 'body is added to the entity' );
    });
    
    test( 'construct a body, no body definition', function() {
        expect( 1 );
                     
        try {
            var body = new engine.physics.component.Body();
        } catch( e ) {
            equal( e, 'missing body definition', 'exception raised' );
        }
    });
    
    test( 'body definition, defaults for unspecified parameters', function() {
        expect( 4 );
                     
        var bodyDefinition = engine.physics.resource.BodyDefinition({
            type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC
        });        
        equal( bodyDefinition.get_type(), engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
                'default type is correct');
        equal( bodyDefinition.get_linearDamping(), 0, 'defualt linear damping is correct' );
        equal( bodyDefinition.get_angularDamping(), 0, 'default angular damping is correct' );
        equal( bodyDefinition.get_fixedRotation(), 0, 'default fixed rotation is correct' );
    });
    
    /*
    test( 'contact start and end events are generated', function() {
        expect( 0 );
        
        var bodyDefinition = engine.physics.resource.BodyDefinition({
            type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC
        });    
    
        var box = engine.physics.resource.Box( 0.5, 0.5 );        
    
        var fixtureDefinition = engine.physics.resource.FixtureDefinition({ 
            shape: box
        });
    
        var space = new engine.core.Space();        
        var entity1 = new space.Entity({
            components: [
                         new engine.core.component.Transform({
                             position: [-3, 0, 0]
                         }),
                         new engine.physics.component.Body({
                             bodyDefinition: bodyDefinition,
                             fixtureDefinition: fixtureDefinition
                         })
                         ]
        });
        var entity2 = new space.Entity({
            components: [
                         new engine.core.component.Transform({
                             position: [3, 0, 0]
                         }),
                         new engine.physics.component.Body({
                             bodyDefinition: bodyDefinition,
                             fixtureDefinition: fixtureDefinition
                         })
                         ]
        });        
    });
    */
    
    /* TD: tests to write
     * * fixture definition, default parameters
     * * fixture definition, all parameters
     * * body definition, default parameters
     * * body definition, all parameters
     * * body {position, active, awake} set when it's added to an entity
     * * contact events are generated for begin and end
     * * transform is updated when physics moves the body
     * ** verify new position and rotation
     * * test different gravity
     */

}());