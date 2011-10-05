/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null,
        logicScript = null;

    module( 'core/Logic', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
                engine = instance;

                logicScript = '';
                logicScript += 'log( "hello universe!" ); \n';
                logicScript += 'var numUpdates = 0; \n';
                logicScript += 'script.update = function() { \n';
                logicScript += '    ++numUpdates; \n';
                logicScript += '    log( "update " + numUpdates ); \n';
                logicScript += '    script.updates = numUpdates; \n';
                logicScript += '}; //update \n';
                logicScript += 'script.updates = 0; \n';

                start();
            });
        },

        teardown: function () {
            engine = null;
            logicScript = null;
        }
    });

    test( 'Construction', function () {
        expect( 1 );
        var logic = new engine.core.component.Logic({
        });
        logic.start();
        ok( undefined === logic.script && undefined === logic.updateFunction, "Empty logic component" );
    });

    test( 'Initialization from text', function () {
        expect( 2 );
        var logic = new engine.core.component.Logic({
            script: logicScript,
        });
        var script = logic.namespace.script;
        ok( script.updates === undefined, "Namespace does not contain an 'updates' var" );
        logic.start();
        ok( script.updates === 0, "'updates' initialized" );
    });

    test( 'Updating', function () {
        expect( 1 );
        var logic = new engine.core.component.Logic({
            script: logicScript,
        });
        var script = logic.namespace.script;
        logic.start();
        logic.update();
        logic.update();
        ok( script.updates === 2, "'updates' was updated correctly" );
    });

}());
