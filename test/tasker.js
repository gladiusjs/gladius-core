/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, setTimeout: false,
 module, test, expect, ok, notEqual, QUnit, stop, start, asyncTest */

(function() {
    var task, p;

    module("tasker", {
        setup: function () {

            stop();
            paladin.create({
                graphics: {
                  canvas: document.getElementById('test-canvas')
                },
                setup: function ( paladin ) {
                  var counter = 0;

                  task = paladin.tasker.add( {
                      callback: function() {
                          if( ++ counter > 10 ) {
                              ok(true, "task counted to 10");
                                setTimeout(function(){
                                    ok(!paladin.tasker.hasTask(task),
                                       "task is not scheduled to run");
                                }, 0);
                                start();
                                return task.DONE;
                          } else {
                              ok(paladin.tasker.hasTask(task),
                                 "task is scheduled to run" );
                              return task.CONTINUE;
                          } //if
                      } //callback
                  } );
                } //setup
            }, function(instance) {
                p = instance;
                start();
            }); //Paladin
        },
        teardown: function () {
            p.tasker.terminate();
        }
    } );

    asyncTest("task counts to 10 and terminates", function () {
        expect(12);
        p.run();
    } );

}());
