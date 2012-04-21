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

        test( "task run context is correct", function() {
          expect( 4 );

          var schedulerMock = sinon.mock( schedulerApi );
          function taskFunction() {
            equal( this, task, "this value is correct" );
            ok( this.isRunning, "task is running" );
          };
          var task = new PreemptiveTask( schedulerApi, taskFunction );
          
          ok( !task.isStarted(), "task is not started" );
          task.start();
          ok( task.isStarted(), "task is started" );
          task.run(); // Bypass the scheduler
        });

        test( "pause a running task", function() {
          expect( 1 );

          var schedulerMock = sinon.mock( schedulerApi );
          function taskFunction() { 
            this.pause(); 
          };
          var task = new PreemptiveTask( schedulerApi, taskFunction );

          task.start();
          task.run(); // Bypass the scheduler
          
          ok( task.result instanceof Error, 
              "exception thrown for task not in blocked state" );
        });

        test( "cancel a running task", function() {
          expect( 1 );

          var schedulerMock = sinon.mock( schedulerApi );
          function taskFunction() {
            task.cancel();
          };
          var task = new PreemptiveTask( schedulerApi, taskFunction );

          
          task.start();
          task.run(); // Bypass the scheduler
          
          ok( task.result instanceof Error, 
          "exception thrown for task not in blocked state" );
        });

      };
    }
);