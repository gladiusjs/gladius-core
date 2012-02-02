/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global module: false, gladius: false, stop: false, start: false, test: false,
  expect: false, asyncTest: false, ok: false, deepEqual: false, equal: false,
  raises: false */

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
      
    test( 'construct a new resource type and an instance of it', 
           function() {
             expect(1);                          
             
             var MyCustomResource = new engine.base.Resource({
                 type: 'MyCustomResourceType'
             },
             function( data ) {
                 this.value = data;
             });

             var myCustomResourceInstance = new MyCustomResource( 'Hello world!' );
             
             equal( myCustomResourceInstance.value, 'Hello world!', 'construct is invoked for MyCustomResource' );
           });
   
  
    test( 'custom resource without type throws an exception',
      function () {
              
        expect(1);
    
        raises( function() {
            var MyCustomResource = new engine.base.Resource({},
                function constructMyCustomResourceType( data ) {
                    this.value = data;
                }
            );
        }, function( exception ) {
            return exception == "missing type parameter";
        }, 'base resource throws exception for missing type parameter');

      });
  
    test( 'exception is thrown when construct fails', 
            function() {
              expect(1);
              
              var MyCustomResource = new engine.base.Resource({
                type: 'MyCustomResourceType'
              },
              function constructMyCustomResourceType( data ) {
                  throw "construct failed";
              });
              
              raises( function() {
                  var myCustomResourceInstance = new MyCustomResource( 'Hello world!' );
              }, function( exception ) {
                  return exception == "construct failed";
              }, 'base resource throws exception when construct fails');
            });
                       
}());
