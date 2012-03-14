/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
 test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false,
 asyncTest: false, equal: false */

( function() {

    var engine = null;    

    module('graphics/service', {
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
        expect( 3 );
                     
        var bodyDefinition = engine.physics.resource.BodyDefinition({
            type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC
        });        
        equal( bodyDefinition.get_type(), engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
                'default type is correct');
        equal( bodyDefinition.get_linearDamping(), 0, 'defualt linear damping is correct' );
        equal( bodyDefinition.get_angularDamping(), 0, 'default angular damping is correct' );
    });
    
    /*
     * * contact events are generated for begin and end
     * * transform is updated when physics moves the body
     * ** verify new position and rotation
     * * test different gravity
     */

}());