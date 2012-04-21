define(
    [ "preemptive-task" ],
    function( PreemptiveTask ) {
      return function() {

        module( "PreemptiveTask", {
          setup: function() {
            this.schedulerApi = {
                insert: function() {},
                remove: function() {}
            };

            this.invalidSchedulerApi = {
                foo: function() {},
                bar: function() {}
            };
            
            this.schedulerMock = sinon.mock( this.schedulerApi );
            this.invalidSchedulerMock = sinon.mock( this.invalidSchedulerApi );
          },
          teardown: function() {
            this.schedulerApi = undefined;
            this.schedulerMock = undefined;
          }
        });

        test( "start a task", function() {
          expect( 1 );

          var schedulerApi = this.schedulerApi;
          var schedulerMock = this.schedulerMock;
          schedulerMock.expects( "insert" ).once();

          function taskFunction() {};          
          var task = new PreemptiveTask( schedulerApi, taskFunction );

          task.start();

          ok( schedulerMock.verify(), "scheduler invocations verified" );
        });

        test( "create a task with invalid scheduler", function() {
          expect( 1 );

          var invalidSchedulerApi = this.invalidSchedulerApi;
          var invalidSchedulerMock = this.invalidSchedulerMock;

          function taskFunction() {};

          raises( function() {
            var task = new PreemptiveTask( invalidSchedulerApi, taskFunction );  
          }, Error, "exception thrown for invalid scheduler" );
        });

        test( "start a task that's already started", function() {
          expect( 1 );

          var schedulerApi = this.schedulerApi;
          var schedulerMock = this.schedulerMock;
          function taskFunction() {};
          var task = new PreemptiveTask( schedulerApi, taskFunction );

          task.start();
          raises( function() {
            task.start();  
          }, Error, "exception thrown for task already started" );
        });

        test( "task run context is correct", function() {
          expect( 7 );

          var schedulerApi = this.schedulerApi;
          var schedulerMock = this.schedulerMock;
          function taskFunction() {
            equal( this, task, "this value is correct" );
            ok( this.isRunning, "task is running" );
          };
          var task = new PreemptiveTask( schedulerApi, taskFunction );
          
          ok( !task.isRunning(), "task is not running" );
          ok( !task.isStarted(), "task is not started" );
          task.start();
          ok( task.isStarted(), "task is started" );
          task.run(); // Bypass the scheduler
          ok( !task.isRunning(), "task is not running" );
          ok( task.isStarted(), "task is started" );
        });

        test( "pause a running task", function() {
          expect( 1 );

          var schedulerApi = this.schedulerApi;
          var schedulerMock = this.schedulerMock;
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

          var schedulerApi = this.schedulerApi;
          var schedulerMock = this.schedulerMock;
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