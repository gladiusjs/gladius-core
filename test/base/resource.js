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
    
    // TD: write a test for the default loader; should handle xhr and data URI
    

    asyncTest( 'construct a new resource type and an instance of it', 
           function() {
             expect(1);             

             var myCustomResourceFactory = new engine.base.ResourceFactory({
               type: 'MyCustomResourceType',
               construct: function ( data ) {
                 this.value = data;
               }
             });
               
             myCustomResourceFactory.get({
               url: "data:,Hello%20World",
               onsuccess: function onMyCustomResourceTypeSuccess( instance ) {
                 equal( instance.value,
                    "Hello World",
                    "MyCustomResourceType object constructed from data URL");
                 start();
               },
               onfailure: function onMyCustomResourceTypeFailure( error ) {
                 ok(false, "onfailure should not be invoked");
                 start();
               }
             });
           });
   
    // Some day we can do even better by using mocks and ensuring that any HTTP
    // status code < 200 or > 299 fails.
    asyncTest( 'ensure onfailure gets called on loading non-existent file',
                function () {
                  
        expect(1);
        
        var myCustomResourceFactory = new engine.base.ResourceFactory({
            type: 'MyCustomResourceType',
            construct: function constructMyCustomResourceType( data ) {
              this.value = data;
            }
          });
        
        myCustomResourceFactory.get({
            url: "no-such-url-exists",
            onsuccess: function onMyCustomResourceTypeSuccess( MyCustomResourceType ) {
                ok( false, "non-existent file load shouldn't call onsuccess" );
                start();            },
            onfailure: function onMyCustomResourceTypeFailure( error ) {
                ok( true, "onfailure is invoked");
                start();
            }
          });
    
     });
    
    test( 'custom resource without type throws an exception',
      function () {
              
        expect(1);
    
        raises( function() {
            var myCustomResourceFactory = new engine.base.ResourceFactory({
                construct: function constructMyCustomResourceType( data ) {
                    this.value = data;
                }
            });
        }, function( exception ) {
            return exception == "missing type parameter";
        }, 'base resource throws exception for missing type parameter');

      });
    
    asyncTest( 'default load function is invoked', 
            function() {
              expect(3);
              
              var testUrl = 'test-url';

              var myCustomResourceFactory = new engine.base.ResourceFactory({
                type: 'MyCustomResourceType',
                load: function loadMyCustomResourceType( url, onsuccess, onfailure ) {
                    equal( url, testUrl, 'url is passed into load function' );
                    onsuccess( url );
                },
                construct: function constructMyCustomResourceType( data ) {
                  equal( data, testUrl, 'data returned by load is correct' );
                  this.value = data;
                }
              });
                
              myCustomResourceFactory.get({
                url: testUrl,
                onsuccess: function onMyCustomResourceTypeSuccess( instance ) {
                  equal( instance.value,
                         testUrl,
                        "instance object is constructed from loaded data");
                  start();
                },
                onfailure: function onMyCustomResourceTypeFailure( error ) {
                  ok(false, "onfailure should not be invoked");
                  start();
                }
              });
            });
        
    asyncTest( 'default load function can be overridden and alternate load is invoked', 
            function() {
              expect(3);
              
              var testUrl = 'test-url';
              var overrideUrl = 'override-url';

              var myCustomResourceFactory = new engine.base.ResourceFactory({
                type: 'MyCustomResourceType',
                load: function loadMyCustomResourceType( url, onsuccess, onfailure ) {
                    ok( false, 'default load function should not be invoked' );
                    onsuccess( url );
                },
                construct: function constructMyCustomResourceType( data ) {
                  equal( data, overrideUrl, 'data returned by load is correct' );
                  this.value = data;
                }
              });
                
              myCustomResourceFactory.get({
                url: testUrl,
                load: function loadMyCustomResourceType( url, onsuccess, onfailure ) {
                    onsuccess( overrideUrl );
                },
                onsuccess: function onMyCustomResourceTypeSuccess( instance ) {
                  equal( MyCustomResourceType ,
                     { value: overrideUrl },
                     "MyCustomResourceType object is constructed from loaded data");
                  start();
                },
                onfailure: function onMyCustomResourceTypeFailure( error ) {
                  ok(false, "onfailure should not be invoked");
                  start();
                }
              });
            });
    
    asyncTest( 'onfailure is invoked when load fails', 
            function() {
              expect(1);
              
              var testUrl = 'test-url';

              var MyCustomResourceType = engine.base.Resource({
                type: 'MyCustomResourceType',
                load: function loadMyCustomResourceType( url, onsuccess, onfailure ) {
                    onfailure( "an exception" );
                },
                construct: function constructMyCustomResourceType( data ) {
                  ok( false, 'construct is not invoked when load throws an exception' );
                }
              });
                
              MyCustomResourceType({
                url: testUrl,
                onsuccess: function onMyCustomResourceTypeSuccess( MyCustomResourceType ) {
                    ok( false, 'onsuccess should not be invoked when load throws an exception');
                    start();
                },
                onfailure: function onMyCustomResourceTypeFailure( error ) {
                  ok(true, "onfailure is invoked");
                  start();
                }
              });
            });
    
    asyncTest( 'onfailure is invoked when load returns undefined', 
            function() {
              expect(1);
              
              var testUrl = 'test-url';

              var MyCustomResourceType = engine.base.Resource({
                type: 'MyCustomResourceType',
                load: function loadMyCustomResourceType( url, onsuccess, onfailure ) {
                    onsuccess( undefined );
                },
                construct: function constructMyCustomResourceType( data ) {
                  ok( false, 'construct is not invoked when load returns undefined' );
                }
              });
                
              MyCustomResourceType({
                url: testUrl,
                onsuccess: function onMyCustomResourceTypeSuccess( MyCustomResourceType ) {
                    ok( false, 'onsuccess should not be invoked when load returns undefined');
                    start();
                },
                onfailure: function onMyCustomResourceTypeFailure( error ) {
                  ok(true, "onfailure is invoked");
                  start();
                }
              });
            });
  
    asyncTest( 'onfailure is invoked when construct fails', 
            function() {
              expect(1);
              
              var testUrl = 'test-url';

              var MyCustomResourceType = engine.base.Resource({
                type: 'MyCustomResourceType',
                load: function loadMyCustomResourceType( url, onsuccess, onfailure ) {
                    onsuccess( url );
                },
                construct: function constructMyCustomResourceType( data ) {
                    throw "an exception";
                }
              });
                
              MyCustomResourceType({
                url: testUrl,
                onsuccess: function onMyCustomResourceTypeSuccess( MyCustomResourceType ) {
                    ok( false, 'onsuccess should not be invoked when construct throws an exception');
                    start();
                },
                onfailure: function onMyCustomResourceTypeFailure( error ) {
                  ok(true, "onfailure is invoked");
                  start();
                }
              });
            });
   
}());
