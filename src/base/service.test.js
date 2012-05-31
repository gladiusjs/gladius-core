define(
    [ "base/service" ],
    function( Service ) {
      return function() {

        module( "Service", {
          setup: function() {
            this.schedulerApi = {
                insert: function() {},
                remove: function() {}
            };

            this.schedulerMock = sinon.mock( this.schedulerApi );
          },
          teardown: function() {}
        });

        test( "create a service type", function() {
          expect( 4 );

          var schedulerApi = this.schedulerApi;
          var schedulerMock = this.schedulerMock;

          var schedules = {
              "foo": {
                "tags": ["foo"]
              }
          };
          var testService;

          var TestService = function( scheduler ) {
            Service.call( this, scheduler, schedules );
          };
          TestService.prototype = new Service();
          TestService.prototype.constructor = TestService;
          TestService.prototype.foo = function foo() {
            equal( this, testService, "context is correct" );
          };

          testService = new TestService( schedulerApi );
          equal( testService._schedules, schedules, "schedules is correct" );
          deepEqual( testService.dependsOn, [], "depends on is empty list" );
          ok( testService._tasks.hasOwnProperty( "foo" ), "task exists" );
          testService._tasks["foo"].run();
        });

        test( "create a service type with missing scheduler target",
            function() {
          expect( 1 );
          
          var schedulerApi = this.schedulerApi;
          var schedulerMock = this.schedulerMock;

          var schedules = {
              "foo": {
                "tags": ["foo"]
              }
          };
          var testService;

          var TestService = function( scheduler ) {
            Service.call( this, scheduler, schedules );
          };
          TestService.prototype = new Service();
          TestService.prototype.constructor = TestService;
          
          raises( function() {
            testService = new TestService( schedulerApi );
          }, Error, "exception thrown for missing scheduler target" );
        });

      };
    }
);