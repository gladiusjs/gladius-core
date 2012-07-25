define(
    [ "core/components/transform",
      "core/entity",
      "_math" ],
    function( Transform, Entity, math ) {
      return function() {

        module( "Transform", {
          setup: function() {},
          teardown: function() {}
        });
        
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

        test( "set position using assignment", function() {
          expect( 4 );

          var transform = new Transform();
          transform.position = [1, 2, 3];

          ok( transform.position instanceof math.Vector3, "position is a Vector3" );
          ok( transform.position.equal( [1, 2, 3] ), "position is correct" );
          var expectedLocalMatrix;
          var expectedWorldMatrix;
          expectedLocalMatrix = new math.transform.translate( [1, 2, 3] );
          expectedWorldMatrix = expectedLocalMatrix;

          ok( math.matrix4.equal( transform.localMatrix(), expectedLocalMatrix ), "local matrix is correct" );
          ok( math.matrix4.equal( transform.worldMatrix(), expectedWorldMatrix ), "world matrix is correct" );
        });

        test( "set rotation using assignment", function(){
          expect( 4 );

          var transform = new Transform();
          transform.rotation = [1, 2, 3];

          ok( transform.rotation instanceof math.Vector3, "rotation is a Vector3" );
          ok( transform.rotation.equal( [1, 2, 3] ), "rotation is correct" );
          var expectedLocalMatrix;
          var expectedWorldMatrix;
          expectedLocalMatrix = new math.transform.rotate( [1, 2, 3] );
          expectedWorldMatrix = expectedLocalMatrix;
          ok( math.matrix4.equal( transform.localMatrix(), expectedLocalMatrix ), "local matrix is correct" );
          ok( math.matrix4.equal( transform.worldMatrix(), expectedWorldMatrix ), "world matrix is correct" );
        });

        test( "set scale using assignment", function(){
          expect( 4 );

          var transform = new Transform();
          transform.scale = [1, 2, 3];

          ok( transform.scale instanceof math.Vector3, "position is a Vector3" );
          ok( transform.scale.equal( [1, 2, 3] ), "position is correct" );
          var expectedLocalMatrix;
          var expectedWorldMatrix;
          expectedLocalMatrix = new math.transform.scale( [1, 2, 3] );
          expectedWorldMatrix = expectedLocalMatrix;

          ok( math.matrix4.equal( transform.localMatrix(), expectedLocalMatrix ), "local matrix is correct" );
          ok( math.matrix4.equal( transform.worldMatrix(), expectedWorldMatrix ), "world matrix is correct" );
        });

        test( "set position using component assignment", function() {
          expect( 4 );

          var transform = new Transform();
          transform.position.x = 1;
          transform.position.y = 2;
          transform.position.z = 3;

          ok( transform.position instanceof math.Vector3, "position is a Vector3" );
          ok( transform.position.equal( [1, 2, 3] ), "position is correct" );
          var expectedLocalMatrix;
          var expectedWorldMatrix;
          expectedLocalMatrix = new math.transform.translate( [1, 2, 3] );
          expectedWorldMatrix = expectedLocalMatrix;

          ok( math.matrix4.equal( transform.localMatrix(), expectedLocalMatrix ), "local matrix is correct" );
          ok( math.matrix4.equal( transform.worldMatrix(), expectedWorldMatrix ), "world matrix is correct" );
        });

        test( "set rotation using component assignment", function() {
          expect( 4 );

          var transform = new Transform();
          transform.rotation.x = 1;
          transform.rotation.y = 2;
          transform.rotation.z = 3;

          ok( transform.rotation instanceof math.Vector3, "rotation is a Vector3" );
          ok( transform.rotation.equal( [1, 2, 3] ), "rotation is correct" );
          var expectedLocalMatrix;
          var expectedWorldMatrix;
          expectedLocalMatrix = new math.transform.rotate( [1, 2, 3] );
          expectedWorldMatrix = expectedLocalMatrix;

          ok( math.matrix4.equal( transform.localMatrix(), expectedLocalMatrix ), "local matrix is correct" );
          ok( math.matrix4.equal( transform.worldMatrix(), expectedWorldMatrix ), "world matrix is correct" );
        });

        test( "set scale using component assignment", function() {
          expect( 4 );

          var transform = new Transform();
          transform.scale.x = 1;
          transform.scale.y = 2;
          transform.scale.z = 3;

          ok( transform.scale instanceof math.Vector3, "scale is a Vector3" );
          ok( transform.scale.equal( [1, 2, 3] ), "scale is correct" );
          var expectedLocalMatrix;
          var expectedWorldMatrix;
          expectedLocalMatrix = new math.transform.scale( [1, 2, 3] );
          expectedWorldMatrix = expectedLocalMatrix;

          ok( math.matrix4.equal( transform.localMatrix(), expectedLocalMatrix ), "local matrix is correct" );
          ok( math.matrix4.equal( transform.worldMatrix(), expectedWorldMatrix ), "world matrix is correct" );
        });

        test( "create a compound transform (position, rotation, scale)", function() {
          expect( 2 );

          var position = [1,2,3];
          var rotation = [4,5,6];
          var scale = [7,8,9];
          var transform = new Transform( position, rotation, scale );

          var expectedMatrix = math.transform.compound(undefined, position, rotation, scale);
          ok(math.matrix4.equal( transform.localMatrix(), expectedMatrix), "local matrix is correct");
          ok(math.matrix4.equal( transform.worldMatrix(), expectedMatrix), "world matrix is correct");
        });

        test( "local transform of a direction", function() {
          expect( 1 );

          var position = [1,2,3];
          var rotation = [4,5,6];
          var scale = [7,8,9];
          var transform = new Transform( position, rotation, scale );
          var direction = [0.5, 0.9, 28];

          var resultingDirection = transform.directionToLocal(direction);
          var expectedDirection = math.matrix4.multiply(math.transform.rotate(transform.rotation.buffer), math.transform.translate(direction));
          expectedDirection = [expectedDirection[3], expectedDirection[7], expectedDirection[11]];
          ok(math.vector3.equal( resultingDirection, expectedDirection), "Direction is correct");
        });

        test( "world transform of a direction", function() {
          expect( 1 );

          var position1 = [1,2,3];
          var rotation1 = [4,5,6];
          var scale1 = [7,8,9];
          var position2 = [10,11,12];
          var rotation2 = [13,14,15];
          var scale2 = [16,17,18];
          var transform1 = new Transform( position1, rotation1, scale1 );
          var transform2 = new Transform( position2, rotation2, scale2 );

          var entity1 = new Entity("entity1", [transform1]);
          var entity2 = new Entity("entity2", [transform2], [], entity1);
          var direction = [0.5, 0.9, 28];

          var resultingDirection = transform2.directionToWorld(direction);
          var expectedDirection = math.matrix4.multiply(transform2.worldRotation(),
                                                        math.transform.translate(direction));
          expectedDirection = [expectedDirection[3], expectedDirection[7], expectedDirection[11]];
          ok(math.vector3.equal( resultingDirection, expectedDirection), "Direction is correct");
        });

        test( "world rotation", function() {
          expect(1);
          var position1 = [1,2,3];
          var rotation1 = [4,5,6];
          var scale1 = [7,8,9];
          var position2 = [10,11,12];
          var rotation2 = [13,14,15];
          var scale2 = [16,17,18];
          var position3 = [19,20,21];
          var rotation3 = [22,23,24];
          var scale3 = [25,26,27];
          var transform1 = new Transform( position1, rotation1, scale1 );
          var transform2 = new Transform( position2, rotation2, scale2 );
          var transform3 = new Transform( position3, rotation3, scale3 );

          var entity1 = new Entity("entity1", [transform1]);
          var entity2 = new Entity("entity2", [transform2], [], entity1);
          var entity3 = new Entity("entity3", [transform3], [], entity2);

          var expectedWorldRotation = math.matrix4.multiply(math.transform.rotate(rotation1),
                                                            math.transform.rotate(rotation2));
          expectedWorldRotation = math.matrix4.multiply(expectedWorldRotation,
                                                            math.transform.rotate(rotation3));
          var actualWorldRotation = transform3.worldRotation();

          ok(math.matrix4.equal(expectedWorldRotation, actualWorldRotation), "world rotation is correct");
        });

        test( "create a transform tree", function() {
          expect( 6 );

          var position1 = [1,2,3];
          var rotation1 = [4,5,6];
          var scale1 = [7,8,9];
          var position2 = [10,11,12];
          var rotation2 = [13,14,15];
          var scale2 = [16,17,18];
          var position3 = [19,20,21];
          var rotation3 = [22,23,24];
          var scale3 = [25,26,27];
          var transform1 = new Transform( position1, rotation1, scale1 );
          var transform2 = new Transform( position2, rotation2, scale2 );
          var transform3 = new Transform( position3, rotation3, scale3 );

          var entity1 = new Entity("entity1", [transform1]);
          var entity2 = new Entity("entity2", [transform2], [], entity1);
          var entity3 = new Entity("entity3", [transform3], [], entity2);

          var expected1 = math.transform.compound( undefined, position1, rotation1, scale1 );
          var expected2 = math.transform.compound( undefined, position2, rotation2, scale2 );
          var expected3 = math.transform.compound( undefined, position3, rotation3, scale3 );

          var worldMatrix2 = math.matrix4.multiply(transform1.worldMatrix(), expected2);
          var worldMatrix3 = math.matrix4.multiply(transform2.worldMatrix(), expected3);

          ok(math.matrix4.equal(transform1.worldMatrix(), expected1),
            "first world matrix is correct");
          ok(math.matrix4.equal(transform2.worldMatrix(), worldMatrix2),
            "second world matrix is correct");
          ok(math.matrix4.equal(transform3.worldMatrix(), worldMatrix3),
            "third world matrix is correct");

          ok(math.matrix4.equal(transform1.localMatrix(), expected1),
            "first local matrix is correct");
          ok(math.matrix4.equal(transform2.localMatrix(), expected2),
            "second local matrix is correct");
          ok(math.matrix4.equal(transform3.localMatrix(), expected3),
            "third local matrix is correct");
        });
      };
    }
);