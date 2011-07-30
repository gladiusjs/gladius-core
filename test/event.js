/*global text,expect,ok,module,notEqual,Paladin,test,window,start,stop,console,asyncTest*/
(function (window, document, Paladin, undefined) {

  var paladin, entity1;

  module("events", {
    setup: function () {

      // set up a game with some event listeners
      paladin = new Paladin({
        graphics: {
          canvas: document.getElementById('test-canvas')
        },
        setup: function ( paladin ) {
          entity1 = new paladin.Entity();
          entity1.count = 0;
          entity1.listen( {
            event: 'escape-up',
            callback: function escapeUp( parameters ) {
              console.log("entering escapeUp");
              ok(true, "escape-up event triggered");
              start();
            }
          } );

          entity1.listen( {
            event: 'mouse1-up',
            callback: function mouse1Up( parameters ) {
              console.log("entering mouse1Up");
              ok(true, "mouse1-up event triggered");
              start();
            }
          } );
        } //setup
      }); //Paladin

    },

    teardown: function () {
      entity1.ignore( {event: 'mouse1-up'});
      entity1.ignore( {event: 'escape-up'});
      paladin = null; // force as much to be GCed as we can
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
    var evt = newKbdEvent(charCode.charCodeAt(0));
    var canceled = !window.dispatchEvent(evt);
    if (canceled) {
      // A handler called preventDefault
      console.log("simulated key event " + charCode + " canceled");
    }
  } 

  function simulateClick() {
    var evt = document.createEvent("MouseEvent");
    evt.initMouseEvent("mouseup", true, true, window,
      1, 50, 50, 50, 50, false, false, false, false, 0, null);
    var canceled = !document.documentElement.dispatchEvent(evt);
    if (canceled) {
      // A handler called preventDefault
      console.log("simulated mouseup event cancelled");
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

})(window, window.document, Paladin);
