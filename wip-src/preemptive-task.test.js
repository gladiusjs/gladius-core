define(
    [ "preemptive-task" ],
    function( PreemptiveTask ) {
      return function() {

        module( "PreemptiveTask", {
          setup: function() {},
          teardown: function() {}
        });

        var schedulerApi = {
            insert: function() {},
            remove: function() {}
        };

        var invalidSchedulerApi = {
            foo: function() {},
            bar: function() {}
        };

        test( "start a task", function() {
          expect( 1 );

          var schedulerMock = sinon.mock( schedulerApi );
          schedulerMock.expects( "insert" ).once();

          function taskFunction() {};          
          var task = new PreemptiveTask( schedulerApi, taskFunction );

          task.start();

          ok( schedulerMock.verify(), "scheduler invocations verified" );
        });

        test( "create a task with invalid scheduler", function() {
          expect( 1 );
          
          var invalidSchedulerMock = sinon.mock( invalidSchedulerApi );

          function taskFunction() {};

          raises( function() {
            var task = new PreemptiveTask( invalidSchedulerApi, taskFunction );  
          }, Error, "exception thrown for invalid scheduler" );
        });
        
        test( "start a task that's already started", function() {
          expect( 1 );
          
          var schedulerMock = sinon.mock( schedulerApi );
          function taskFunction() {};
          var task = new PreemptiveTask( schedulerApi, taskFunction );
          
          task.start();
          raises( function() {
            task.start();  
          }, Error, "exception thrown for task already started" );
        });
        
      };
    }
);