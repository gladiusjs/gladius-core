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
        
        var Text = engine.base.Resource({
            type: 'Text',
            construct: function constructText( data ) {
              this.value = data;
            }
          });
        
        Text({
            url: "no-such-url-exists",
            onsuccess: function onTextSuccess( text ) {
                ok( false, "non-existent file load shouldn't call onsuccess" );
                start();            },
            onfailure: function onTextFailure( error ) {
                ok( true, "onfailure is invoked");
                start();
            }
          });
    
     });
    
    test( 'custom resource without type throws an exception',
      function () {
              
        expect(1);
    
        raises( function() {
            var Text = engine.base.Resource({
                construct: function constructText( data ) {
                    this.value = data;
                }
            });
        }, function( exception ) {
            return exception.message == "missing type parameter";
        }, 'base resource throws exception for missing type parameter');

      });
    
    asyncTest( 'default load function is invoked', 
            function() {
              expect(3);
              
              var testUrl = 'test-url';

              var Text = engine.base.Resource({
                type: 'Text',
                load: function loadText( url ) {
                    equal( url, testUrl, 'url is passed into load function' );
                    return url;
                },
                construct: function constructText( data ) {
                  equal( data, testUrl, 'data returned by load is correct' );
                  this.value = data;
                }
              });
                
              Text({
                url: testUrl,
                onsuccess: function onTextSuccess( text ) {
                  deepEqual( text ,
                     { value: testUrl },
                     "text object is constructed from loaded data");
                  start();
                },
                onfailure: function onTextFailure( error ) {
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

              var Text = engine.base.Resource({
                type: 'Text',
                load: function loadText( url ) {
                    ok( false, 'default load function should not be invoked' );
                    return url;
                },
                construct: function constructText( data ) {
                  equal( data, overrideUrl, 'data returned by load is correct' );
                  this.value = data;
                }
              });
                
              Text({
                url: testUrl,
                load: function loadText( url ) {
                    return overrideUrl;
                },
                onsuccess: function onTextSuccess( text ) {
                  deepEqual( text ,
                     { value: overrideUrul },
                     "text object is constructed from loaded data");
                  start();
                },
                onfailure: function onTextFailure( error ) {
                  ok(false, "onfailure should not be invoked");
                  start();
                }
              });
            });
    
    asyncTest( 'onfailure is invoked when load throws an exception', 
            function() {
              expect(1);
              
              var testUrl = 'test-url';

              var Text = engine.base.Resource({
                type: 'Text',
                load: function loadText( url ) {
                    throw "an exception";
                    return url;
                },
                construct: function constructText( data ) {
                  ok( false, 'construct is not invoked when load throws an exception' );
                  this.value = data;
                }
              });
                
              Text({
                url: testUrl,
                onsuccess: function onTextSuccess( text ) {
                    ok( false, 'onsuccess should not be invoked when load throws an exception');
                    start();
                },
                onfailure: function onTextFailure( error ) {
                  ok(true, "onfailure is invoked");
                  start();
                }
              });
            });
    
    asyncTest( 'onfailure is invoked when load returns undefined', 
            function() {
              expect(1);
              
              var testUrl = 'test-url';

              var Text = engine.base.Resource({
                type: 'Text',
                load: function loadText( url ) {
                    return undefined;
                },
                construct: function constructText( data ) {
                  ok( false, 'construct is not invoked when load returns undefined' );
                  this.value = data;
                }
              });
                
              Text({
                url: testUrl,
                onsuccess: function onTextSuccess( text ) {
                    ok( false, 'onsuccess should not be invoked when load returns undefined');
                    start();
                },
                onfailure: function onTextFailure( error ) {
                  ok(true, "onfailure is invoked");
                  start();
                }
              });
            });
  
    asyncTest( 'onfailure is invoked when construct throws an exception', 
            function() {
              expect(1);
              
              var testUrl = 'test-url';

              var Text = engine.base.Resource({
                type: 'Text',
                load: function loadText( url ) {
                    return url;
                },
                construct: function constructText( data ) {
                    throw "an exception";
                }
              });
                
              Text({
                url: testUrl,
                onsuccess: function onTextSuccess( text ) {
                    ok( false, 'onsuccess should not be invoked when construct throws an exception');
                    start();
                },
                onfailure: function onTextFailure( error ) {
                  ok(true, "onfailure is invoked");
                  start();
                }
              });
            });
   
}());

     
     // TD: test data URLs, and commutativity/normalization of params:
     //
     // "data:gladius/script;core.script.test?x=1&y=2"
     // "data:gladius/script;core.script.test?y=2&x=1"
  
