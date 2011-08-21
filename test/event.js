/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, setTimeout: false,
 module, test, expect, ok, notEqual, QUnit, stop, start, asyncTest, console */

(function() {

  var p, entity1;

  module("events", {
    setup: function () {
      stop();

      // set up a game with some event listeners
      p = paladin.create({
        graphics: {
          canvas: document.getElementById('test-canvas')
        },
        setup: function ( paladin ) {
          entity1 = new paladin.Entity();
          entity1.count = 0;
          entity1.listen( {
            event: paladin.keyboardInput.Event( ['escape'], false ),
            callback: function escapeUp( parameters ) {
              console.log("entering escapeUp", parameters);
              ok(true, "escape-up event triggered");
              start();
            }
          } );

          entity1.listen( {
            event: paladin.mouseInput.Event( ['mouse1'], false ),
            callback: function mouse1Up( parameters ) {
              console.log("entering mouse1Up", parameters);
              ok(true, "mouse1-up event triggered");
              start();
            }
          } );

          /*
          entity1.listen( {
              event: paladin.touchInput.Event( [], false ),
              callback: function touchEnd( parameters ) {
                  console.log("entering touchEnd", parameters);
                  ok(true, "touch-end event triggered");
                  start();
                }
          } );
          */
        } //setup
      }, function (instance) {
        p = instance;
        p.run();
        start();
      }); //Paladin

    },

    teardown: function () {
      entity1.ignore( {event: p.mouseInput.Event( ['mouse1'], false )});
      entity1.ignore( {event: p.keyboardInput.Event( ['escape'], false )});
      p = null; // force as much to be GCed as we can
    }
  });

  /* Initialize a keyboard event for either Gecko or WebKit) */
  function newKbdEvent(charCode) {
    var evt = document.createEvent("KeyboardEvent");
    if ("initKeyEvent" in evt) {
      // vestigial DOM2 method still in use by Gecko
      evt.initKeyEvent("keyup", true, true, window, 0, 0, 0, 0,
                       charCode, charCode);
    } else {
      // otherwise assume DOM3
      evt.initKeyboardEvent("keyup", 0, 0, window, charCode);
    }
    return evt;
  }

  function simulateKeyEvent(charCode) {
    var canvas = document.getElementById( "test-canvas" );
    var evt = newKbdEvent(charCode.charCodeAt(0));
    var canceled = !canvas.dispatchEvent(evt);
    if (canceled) {
      // A handler called preventDefault
      console.log("simulated key event " + charCode + " canceled");
    }
  }

  function simulateClick() {
    var canvas = document.getElementById( "test-canvas" );
    var evt = document.createEvent("MouseEvent");
    evt.initMouseEvent("mouseup", true, true, window,
      1, 50, 50, 50, 50, false, false, false, false, 0, null);
    var canceled = !canvas.dispatchEvent(evt);
    if (canceled) {
      // A handler called preventDefault
      console.log("simulated mouseup event cancelled");
    }
  }

  function simulateTouch() {
      var canvas = document.getElementById( "test-canvas" );
      var evt = document.createEvent("TouchEvent");
      evt.initTouchEvent("touchend", true, true, window,
        1, 50, 50, 50, 50, false, false, false, false, 0, null);
      var canceled = !canvas.dispatchEvent(evt);
      if (canceled) {
        // A handler called preventDefault
        console.log("simulated touchend event cancelled");
      }
  }

  asyncTest("escape keypress fires an up event", function () {
    expect(1);
    simulateKeyEvent("\x1b");
  });

  asyncTest("mouse click fires an up event", function () {
    expect(1);
    simulateClick();
  });

  /***
   * FIXME(alan.kligman@gmail.com):
   * Disabled until we can create touch events manually.
   *
  asyncTest("touch fires an end event", function () {
      expect(1);
      simulateTouch();
  });
  */

}());
