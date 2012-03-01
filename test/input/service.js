/*global gladius:false, module:false, expect:false, ok:false, stop:false, 
  test:false, start:false, console:false, asyncTest:false, window:false,
  equal:true */
( function() {

  var engine;
  var canvas;

  module('input/service', {
    setup : function() {
      stop();

      canvas = document.getElementById("test-canvas");
      gladius.create({
        debug : true,
        services : {
          input : {
            src : 'input/service',
            options : {
            }
          }
        }
      }, function(instance) {
        engine = instance;
        start();
      });
    },
    teardown : function() {
      engine = null;
    }
  });

  test( 'Construction', function() {
    expect( 2 );
    
    ok( engine.input, 'input subsystem exists' );

    var controller = new engine.input.component.Controller();
    ok( controller, "input Controller creation works" );
  });
  
  asyncTest( 'key event reception', function () {
    expect( 2 );
    
    var inputController = new engine.input.component.Controller({
        onKey: function testInputOnKey(e) {
          console.log("key event received: " + e);
          equal(e.data.code, "A", "'A' event received by onKey function"); 
          equal(e.data.state, 'down', 
                "'A' event had the correct state of 'down'"); 
          start();
          return;                                    
        }
    });
 
    var space = new engine.core.Space();
    var entity = new space.Entity({
                                name: 'test',
                                components: [inputController]
                                
    });      

    // start the engine
    engine.run();
    
    // inject a fake keystroke
    var e = document.createEvent("KeyboardEvent");
    if ('initKeyboardEvent' in e) {
      // currently known to fail on webkit browsers because of webkit bug 13368
      e.initKeyboardEvent("keydown", true, true,
      document.defaultView, "U+0041", e.DOM_KEY_LOCATION_STANDARD,
      "", false, "");
    } else {
      e.initKeyEvent("keydown",
                     true, // canBubble
                     true, // cancelable
                     document.defaultView, // view
                     false, false, false, false, "A".charCodeAt(0), 0);
    }
                         
    if (!document.dispatchEvent(e)) {
      console.log("event canceled");
      ok(false, "someone unexpectedly cancelled our event!");
    }
  });
  
}());
