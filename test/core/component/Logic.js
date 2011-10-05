/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'core/Logic', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
                engine = instance;
                start();
            });
        },

        teardown: function () {
            engine = null;
        }
    });

    test( 'Construction', function () {
        expect( 1 );
        var logic = new engine.core.component.Logic({
        });
        logic.start();
        ok( undefined === logic.script && undefined === logic.updateFunction, "Empty logic component" );
    });

    test( 'Initialization', function () {
        expect( 2 );
        var logic = new engine.core.component.Logic({
            script: document.getElementById( 'logic-script-1' ),
        });
        var script = logic.namespace.script;
        ok( script.updates === undefined, "Namespace does not contain an 'updates' var" );
        logic.start();
        ok( script.updates === 0, "'updates' initialized" );
    });

    test( 'Updating', function () {
        expect( 1 );
        var logic = new engine.core.component.Logic({
            script: document.getElementById( 'logic-script-1' ),
        });
        var script = logic.namespace.script;
        logic.start();
        logic.update();
        logic.update();
        ok( script.updates === 2, "'updates' was updated correctly" );
    });

}());
