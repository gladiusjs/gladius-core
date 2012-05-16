define(
    [ "core/components/transform", 
      "_math" ],
    function( Transform, math ) {
      return function() {

        module( "Transform", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "contruct a new transform", function() {
          expect( 5 );

          var transform = new Transform();
          ok( transform instanceof Transform, "transform is created" );

          ok( math.vector3.equal( transform.position, math.vector3.zero ), 
            "default position is correct" );
          ok( math.vector3.equal( transform.rotation, math.vector3.zero ),
            "default rotation is correct" );
          ok( math.vector3.equal( transform.scale, math.vector3.one ),
            "default scale is correct" );
          ok( math.matrix4.equal( transform.absolute(), math.matrix4.identity ),
            "default absolute matrix is correct" );
        });

        test( "set position", function() {
          expect( 2 );

          var transform = new Transform( new math.Vector3( 1, 2, 3 ) );

          ok( math.vector3.equal( transform.position, 
            new math.Vector3( 1, 2, 3 ) ), 
            "position is correct" );
          transform.setPosition( [4, 5, 6] );
          ok( math.vector3.equal( transform.position, 
            new math.Vector3( 4, 5, 6 ) ),
            "position is correct" );
        });

        test( "set rotation", function() {
          expect( 2 );

          var transform = new Transform( undefined, new math.Vector3( 1, 2, 3 ) );

          ok( math.vector3.equal( transform.rotation, 
            new math.Vector3( 1, 2, 3 ) ), 
            "rotation is correct" );
          transform.setRotation( [4, 5, 6] );
          ok( math.vector3.equal( transform.rotation, 
            new math.Vector3( 4, 5, 6 ) ),
            "rotation is correct" );
        });

        test( "set scale", function() {
          expect( 2 );

          var transform = new Transform( undefined, undefined, 
            new math.Vector3( 1, 2, 3 ) );

          ok( math.vector3.equal( transform.scale, 
            new math.Vector3( 1, 2, 3 ) ), 
            "scale is correct" );
          transform.setScale( [4, 5, 6] );
          ok( math.vector3.equal( transform.scale, 
            new math.Vector3( 4, 5, 6 ) ),
            "scale is correct" );
        });

        test( "compound transform", function() {
          expect( 1 );

          var transform = new Transform( [1, 2, 3], [4, 5, 6], [7, 8, 9] );

          ok( math.matrix4.equal( transform.absolute(), 
            [1.9065481424331665, -0.554817259311676, 6.712470054626465, 0, 
             4.11338472366333, -6.6430840492248535, -1.7174100875854492, 0, 
             7.3196282386779785, 4.96370792388916, -1.668725848197937, 0, 
             1, 2, 3, 1]), "absolute transform is correct" );
        });
        
      };
    }
);