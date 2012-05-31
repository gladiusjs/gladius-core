define(
    [ "core/dependency-scheduler" ],
    function( DependencyScheduler ) {
      "use strict";
      return function() {

        module( "DependencyScheduler", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "create a new scheduler", function() {
          expect( 4 );
          
          var scheduler = new DependencyScheduler();
          ok( scheduler, "scheduler is created" );
          equal( scheduler.size(), scheduler._phases.length, "initial size is correct" );
          ok( !scheduler.hasNext(), "has next task is false" );
          equal( scheduler.next(), undefined, 
              "next is undefined for empty scheduler" );
        });
        
        test( "schedule some independent tasks", function() {
          expect( 12 );
          
          var scheduler = new DependencyScheduler();
          scheduler.insert( "A", "0" );
          scheduler.insert( "B", "1" );
          scheduler.insert( "C", "2" );
          equal( scheduler.size(), scheduler._phases.length + 3, "size is correct after insert" );
          ok( !scheduler.hasNext(), "has next task is false before update" );
          equal( scheduler.next(), undefined, 
              "next task is undefined before update" );
          scheduler.update();
          ok( scheduler.hasNext(), "has next task is true after update" );
          
          while( scheduler.hasNext() ) {
            ok( scheduler.next(), "next task is returned" );
          }
          equal( scheduler.size(), scheduler._phases.length + 3, "size is correct" );
          equal( scheduler.next(), undefined, "next task is undefined" );
          
          scheduler.clear();
          equal( scheduler.size(), scheduler._phases.length, "size is correct after clear" );
          ok( !scheduler.hasNext(), "has next task is false" );
          equal( scheduler.next(), undefined, 
              "next is undefined for empty scheduler" );
        });
        
        // TD: add tests to verify correct ordering of task dependencies
        // TD: add tests to verify correct handling of tags
        
      };
    }
);        