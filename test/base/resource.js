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

    // Some day we can do even better by using mocks and ensuring that any HTTP
    // status code < 200 or > 299 fails.
    asyncTest( 'ensure onfailure gets called on loading non-existent file',
                function () {
                  
        expect(1);             
    
        var options = {
            url : "no-such-url-exists",

            onsuccess : function itemOnSuccess(item) {
                ok( false, "non-existent file load shouldn't call onsuccess" );
                start();
            },

            onfailure : function itemOnFailure(error) {
                ok( true, "non-existent file load should call onfailure");

                // TD should check format of error once we decide it

                start();                
            }
        };

        // it was WAY too painful to figure out the syntax
        // to trigger the intended semantics here; having two partial
        // constructors that take different options is confusing.
        // this object model needs simplifying.
        var resource = new engine.base.Resource()(options);
     });
     
     // TD: test data URLs, and commutativity/normalization of params:
     //
     // "data:gladius/script;core.script.test?x=1&y=2"
     // "data:gladius/script;core.script.test?y=2&x=1"
  
     // TD: test that result not populated before oncomplete is called and 
     // result returned on async completion
     
     // TD test loading of a resource when passing a constructor for the
     // for processing the returned JSON:
     //
     // var resource = new engine.base.Resource(someConstructor)(options)
}());
