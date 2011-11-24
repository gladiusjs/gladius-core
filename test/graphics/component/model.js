/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'graphics/component/Model', {
        setup: function () {
            stop();

            gladius.create({
                debug: true, 
                services: {
                    graphics: 'graphics/service'
                }
              }, function( instance ) {       
                engine = instance;
                start();
            });
        },

        teardown: function () {
            engine = null;
        }
    });

    asyncTest( 'Attach Mesh', function () {
        expect( 1 );

        var model;

        engine.graphics.resource.Mesh({
            script: engine.graphics.script.mesh.cube,
            onComplete: function( instance ) {
                model = new engine.graphics.component.Model({
                    mesh: instance
                });
                equal( instance._cvr.mesh, model.mesh._cvr.mesh, "Model's mesh is correct" );
                start();
            }
        });

    });

}());
