/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global module: false, gladius: false, stop: false, start: false,
  expect: false, asyncTest: false, ok: false, deepEqual: false, equal: false */

(function() {
    var engine = null;


    module('base/Resource', {

        setup : function() {
            stop();

            gladius.create({
                debug : true
            }, function(instance) {
                engine = instance;
                start();
            });
        },
        teardown : function() {
            engine = null;
        }
    });

    

}());