define(
    [ "core/components/transform", 
      "_math" ],
    function( Transform, math ) {
      return function() {

        module( "Transform", {
          setup: function() {},
          teardown: function() {}
        });

        /* Tests to write:
         * X construct a transform, no paramaters
         * X construct a transform, position only
         * X construct a transform, rotation only
         * X construct a transform, scale only
         * - set position, rotation, scale using assignment, check local & world matrix
             transform.position = [1, 2, 3]
         * - set position, rotation, scale components, check local & world matrix
             transform.position.x = 1
           - create a compound transform (position, rotation, scale), check local & world matrix
           - create a transform tree, check local & world matrix for all transforms
         */
        
        test( "construct a transform, no parameters", function() {
          expect( 6 );

          var transform = new Transform();

          ok( transform.position instanceof math.Vector3, "position is a Vector3" );
          ok( transform.rotation instanceof math.Vector3, "rotation is a Vector3" );
          ok( transform.scale instanceof math.Vector3, "scale is a Vector3" );
          ok( transform.position.equal( math.vector3.zero ), "position is zero" );
          ok( transform.rotation.equal( math.vector3.zero ), "rotation is zero" );
          ok( transform.scale.equal( math.vector3.one ), "scale is one" );
        });

        test( "construct a transform, position only", function() {
          expect( 3 );

          var transform = new Transform( [1, 2, 3] );

          ok( transform.position.equal( [1, 2, 3] ), "position is correct" );
          ok( transform.rotation.equal( math.vector3.zero ), "rotation is zero" );
          ok( transform.scale.equal( math.vector3.one ), "scale is one" );
        });

        test( "construct a transform, rotation only", function() {
          expect( 3 );

          var transform = new Transform( null, [1, 2, 3] );

          ok( transform.position.equal( math.vector3.zero ), "position is zero" );
          ok( transform.rotation.equal( [1, 2, 3] ), "rotation is correct" );
          ok( transform.scale.equal( math.vector3.one ), "scale is one" );
        });

        test( "construct a transform, scale only", function() {
          expect( 3 );

          var transform = new Transform( null, null, [2, 3 ,4] );

          ok( transform.position.equal( math.vector3.zero ), "position is zero" );
          ok( transform.rotation.equal( math.vector3.zero ), "rotation is correct" );
          ok( transform.scale.equal( [2, 3, 4] ), "scale is correct" );
        });

        test( "set position, assignment", function() {
          expect( 4 );

          var transform = new Transform();
          transform.position = [1, 2, 3];

          ok( transform.position instanceof math.Vector3, "position is a Vector3" );
          ok( transform.position.equal( [1, 2, 3] ), "position is correct" );
          var expectedLocalMatrix = expectedWorldMatrix = new math.transform.position( [1, 2, 3] );

          ok( math.matrix4.equal( transform.localMatrix(), expectedLocalMatrix ), "local matrix is correct" );
          ok( math.matrix4.equal( transform.worldMatrix(), expectedWorldMatrix ), "world matrix is correct" );
        });
       
      };
    }
);