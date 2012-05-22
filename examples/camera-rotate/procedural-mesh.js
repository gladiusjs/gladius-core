function proc( options ) {

  options = options || {};
  options.size = options.size || 1.0;
  var point = options.size / 2.0;

  var mesh =
  {
    points: [
      [ point, -point,  point],
      [ point,  point,  point],
      [-point,  point,  point],
      [-point, -point,  point],
      [ point, -point, -point],
      [ point,  point, -point],
      [-point,  point, -point],
      [-point, -point, -point]
    ],
    faces: [
      [0, 1, 2, 3],
      [7, 6, 5, 4],
      [4, 5, 1, 0],
      [5, 6, 2, 1],
      [6, 7, 3, 2],
      [7, 4, 0, 3]
    ],
    uv: [
      [ [0, 1], [1, 1], [1, 0], [0, 0] ],
      [ [0, 1], [1, 1], [1, 0], [0, 0] ],
      [ [0, 1], [1, 1], [1, 0], [0, 0] ],
      [ [0, 1], [1, 1], [1, 0], [0, 0] ],
      [ [0, 1], [1, 1], [1, 0], [0, 0] ],
      [ [0, 1], [1, 1], [1, 0], [0, 0] ]
    ],
    uvmapper: {
            projectionMode: "cubic",
            scale: [1, 1, 1]
    }
  };

  return mesh;

}
