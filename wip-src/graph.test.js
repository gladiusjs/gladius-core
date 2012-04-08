define(
    [ "graph" ],
    function( Graph ) {
      return function() {

        module( "Graph", {
          setup: function() {},
          teardown: function() {}
        });

        test( "construct a new graph", function() {
          expect( 1 );

          var graph = new Graph();
          equal( graph.size(), 0, "new graph is empty" );
        });
        
        test( "add and remove a node", function() {
          expect( 4 );
          
          var graph = new Graph();
          
          graph.insert( 0 );
          equal( graph.size(), 1, "correct size after insert" );
          ok( graph.hasNode( 0 ), "graph has inserted node" );
          graph.remove( 0 );
          equal( graph.size(), 0, "correct size after remove" );
          ok( !graph.hasNode( 0 ), "graph doesn't have node" );
        });
        
        test( "link and unlink a node", function() {
          expect( 2 );
          
          var graph = new Graph();
          
          graph.insert( 0 );
          graph.insert( 1 );
          graph.link( 0, 1 );
          ok( graph.hasLink( 0, 1 ), "graph has link" );
          graph.unlink( 0, 1 );
          ok( !graph.hasLink( 0, 1 ), "graph doesn't have link" );
        });
        
        test( "removing a source node removes related links", function() {
          expect( 2 );
          
          var graph = new Graph();
          
          graph.insert( 1 );
          graph.insert( 0 );
          graph.link( 1, 0 );
          ok( graph.hasLink( 1, 0 ), "graph has link" );
          graph.remove( 1 );
          ok( !graph.hasLink( 1, 0 ), "graph doesn't have link" );
        });
        
        test( "removing a sink node removes related links", function() {
          expect( 2 );
          
          var graph = new Graph();
          
          graph.insert( "0" );
          graph.insert( "1" );
          graph.link( "0", "1" );
          ok( graph.hasLink( "0", "1" ), "graph has link" );
          graph.remove( "1" );
          ok( !graph.hasLink( "0", "1" ), "graph doesn't have link" );
        });
        
      };
    }
);