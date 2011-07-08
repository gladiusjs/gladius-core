/*global text,expect,ok,module,notEqual,Paladin,test,window,start,stop,console*/
(function (window, document, undefined, Paladin) {

  var game;

  module("Paladin event subsystem", {
    setup: function () {

      // set up a game with some event listeners
      function Game() {
  
        var entity1 = new Paladin.Entity();
        entity1.count = 0;
        entity1.listen( {
          event: 'escape-up',
          callback: function( parameters ) {
            ok(true, "escape-up event triggered");
            start();
          }
        } );

        entity1.listen( {
          event: 'mouse1-up',
          callback: function( parameters ) {
            ok(true, "mouse1-up event triggered");
            start();
          }
        } );
         
        this.run = function () {
          Paladin.run();
        };
      }

      game = new Game();

    },

    teardown: function () {
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
    if(canceled) {
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
      console.log("mouseup event cancelled");
    }
  }


  test("escape keypress fires an up event", function () {
    expect(1);
    stop();
    game.run();
    simulateKeyEvent("\x1b");
    Paladin.tasker.terminate();
  });

  test("mouse click fires an up event", function () { 
    expect(1);
    stop();
    game.run();
    simulateClick();
    Paladin.tasker.terminate();
  });

})(window, document, undefined, Paladin);
