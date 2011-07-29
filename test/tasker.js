/*global stop,console,start,expect,ok,module,Paladin,test,window*/
(function (window, document, Paladin, undefined) {

    var paladin,
    task;

    module("tasker", {
        setup: function () {

            paladin = new Paladin({ 
                graphics: {
                  canvas: document.getElementById('test-canvas')
                },
                setup: function ( paladin ) {
                  var counter = 0;
                    
                  task = paladin.tasker.add( {
                      callback: function() {        
                          if( ++ counter > 10 ) {
                              ok(true, "task counted to 10");
                                setTimeout(function(){
                                    ok(!paladin.tasker.hasTask(task),
                                       "task is not scheduled to run");
                                }, 0);                            
                                start();                           
                                return task.DONE;
                          } else {
                              ok(paladin.tasker.hasTask(task),
                                 "task is scheduled to run" );
                              return task.CONTINUE;
                          } //if
                      } //callback
                  } );
                } //setup
            }); //Paladin
        },
        teardown: function () {
            paladin.tasker.terminate();
        }
    } );

    asyncTest("task counts to 10 and terminates", function () {
        expect(12);
        paladin.run();
    } ); 

})(window, window.document, Paladin);
