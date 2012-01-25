/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global module: false, gladius: false, stop: false, start: false, test: false,
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

    asyncTest( 'construct a new resource type and an instance of it', 
           function() {
             expect(1);
             

             var Text = engine.base.Resource({
               type: 'Text',
               construct: function constructText( data ) {
                 this.value = data;
               }
             });
               
             Text({
               url: "data:text/plain,Hello%20World",
               onsuccess: function onTextSuccess( text ) {
                 deepEqual( text ,
                    { value: "Hello World" },
                    "text object constructed from data URL");
                 start();
               },
               onfailure: function onTextFailure( error ) {
                 ok(false, "onTextFailure improperly called with " + error);
                 start();
               }
             });
           });

    // TD: constructing new resource type without type param throws exception
        
    // TD: test that a type with a default loader invokes that loader
    
    // TD: test that default loader can be overridden with a closure when
    // creating an procedurally loaded instance of a given type
    
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

        // TD: this construction mode is wrong.  need to fix.
        var resource = new engine.base.Resource()(options);
     });

}());

     
     // TD: test data URLs, and commutativity/normalization of params:
     //
     // "data:gladius/script;core.script.test?x=1&y=2"
     // "data:gladius/script;core.script.test?y=2&x=1"
  
