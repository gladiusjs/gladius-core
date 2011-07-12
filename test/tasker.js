/*global stop,console,start,expect,ok,module,Paladin,test,window*/
(function (window, document, undefined, Paladin) {

  var game;
  
  module("tasker", {
    setup: function () {

      function Game() {
        var counter = 0,
          task = Paladin.tasker.add( {
            callback: function() {        
              console.log( counter ++ );
              if( counter > 10 ) {
                ok(true, "tasker counted to 10");
                ok(Paladin.tasker.getTaskByName("Counter"),
                   "Counter is still in the tasks queue"); 
                start();
                return task.DONE;
              } else {
                return task.CONT;
              }
            },
            name: 'Counter'
            } );

        counter = 0;  
      }

      game = new Game();
    },
    teardown: function () {
      Paladin.tasker.terminate();
    }
  } );

  test("task counts to 10 and terminates", function () {
    expect(3);
    stop();
    Paladin.run();
    
    raises(Paladin.tasker.getTaskByName('Counter'),
           "Counter is no longer in the task queue");
  } ); 
 
})(window, document, undefined, Paladin);

