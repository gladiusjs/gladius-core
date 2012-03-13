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

    /*
     * * create a new body and attach it to an entity
     * * create a new body without passing in all parameters, make sure defaults work
     * * contact events are generated for begin and end
     * * transform is updated when physics moves the body
     * ** verify new position and rotation
     * * test different gravity
     */

}());