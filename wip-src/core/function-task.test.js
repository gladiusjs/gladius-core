define(
    [ "core/function-task" ],
    function( FunctionTask ) {
      return function() {

        module( "FunctionTask", {
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

          function taskFunction() {}          
          var task = new FunctionTask( schedulerApi, taskFunction );

          task.start();

          ok( schedulerMock.verify(), "scheduler invocations verified" );
        });

        test( "start a task that's already started", function() {
          expect( 1 );

          var schedulerApi = this.schedulerApi;
          var schedulerMock = this.schedulerMock;
          function taskFunction() {}
          var task = new FunctionTask( schedulerApi, taskFunction );

          task.start();
          raises( function() {
            task.start();  
          }, Error, "exception thrown for task already started" );
        });

        test( "task run context is correct", function() {
          expect( 7 );

          var schedulerApi = this.schedulerApi;
          function taskFunction() {
            equal( this, task, "this value is correct" );
            ok( this.isRunning, "task is running" );
          }
          var task = new FunctionTask( schedulerApi, taskFunction );
          
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
          }
          var task = new FunctionTask( schedulerApi, taskFunction );

          task.start();
          task.run(); // Bypass the scheduler
          
          ok( task.result instanceof Error, 
              "exception thrown for task not in blocked state" );
        });

        test( "cancel a running task", function() {
          expect( 1 );

          var schedulerApi = this.schedulerApi;
          function taskFunction() {
            task.cancel();
          }
          var task = new FunctionTask( schedulerApi, taskFunction );
          
          task.start();
          task.run(); // Bypass the scheduler
          
          ok( task.result instanceof Error, 
          "exception thrown for task not in blocked state" );
        });

        test( "complete a task", function() {
          expect( 2 );
          stop();
          
          // Simple scheduler
          var scheduler = {
              insert: function( task ) {
                task.run();
              },
              remove: function() {}
          };
          
          function taskFunction( counter ) {
            counter = counter || 0;
            counter += 1;
            if( counter === 2 ) {
              return this.Complete( counter );
            } else {
              ok( true, "function invoked" );
              return counter;
            }
          }
          var task = new FunctionTask( scheduler, taskFunction );

          task.then( function( result ) {
            equal( result, 2, "result is correct" );
            start();
          });
          task.start();
        });
        
        test( "task to string", function() {
          expect( 1 );
          
          var task = new FunctionTask( null, null );
          equal( task.toString(), "[object FunctionTask " + task.id + "]",
              "string is correct" );
        });

      };
    }
);