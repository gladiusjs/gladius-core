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
    
    /*
     * * create a new body and attach it to an entity
     * * create a body without a fixture definition (should work)
     * * create a body without a body definition (should fail)
     * * create a new body without passing in all parameters, make sure defaults work
     * * contact events are generated for begin and end
     * * transform is updated when physics moves the body
     * ** verify new position and rotation
     * * test different gravity
     */

}());