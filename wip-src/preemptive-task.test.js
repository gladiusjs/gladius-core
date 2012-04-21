define(
    [ "preemptive-task" ],
    function( PreemptiveTask ) {
      return function() {

        module( "PreemptiveTask", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "construct a new task", function() {
          expect( 0 );
          
          var task = new PreemptiveTask();
        });
        
      };
    }
);