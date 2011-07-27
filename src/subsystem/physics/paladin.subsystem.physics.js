(function (window, document, Paladin) {

  function sphereIntersectsSphere = function ( sphere1, sphere2 ) {
    var dims = sphere1.getDims(),
        otherDims = sphere2.getDims(),
        diff = [ otherDims[0] - dims[0], otherDims[1] - dims[1], otherDims[2] - dims[2] ],
        mag = diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2],
        sqrtRad = otherDims[3] + dims[3];
        // no need to sqrt here
    return mag <= sqrtRad*sqrtRad;
  }

  function AABBIntersectsSphere = function ( aabb, sphere ) {
    var dims = sphere.getDims(),
        extents = aabb.getExtents(),
        max = extents[0],
        min = extents[1];
    max = [ max[0] - dims[0], max[1] - dims[1], max[2] - dims[2] ];
    min = [ min[0] - dims[0], min[1] - dims[1], min[2] - dims[2] ];
    max = max[0]*max[0] + max[1]*max[1] + max[2]*max[2];
    min = min[0]*min[0] + min[1]*min[1] + min[2]*min[2];
    return dims[3]*dims[3];
  }

  function AABBIntersectsAABB = function ( aabb1, aabb2 ) {
  }


  Paladin.subsystem.register( "dummy", function ( options ) {
  
    options = options || {};

    var dims = [0, 0, 0, 0];

    var SphereBody = this.SphereBody = function ( options ) {
      this.intersectsSphere = function ( otherSphere ) {
        return sphereIntersectsSphere( this, otherSphere );
      };
      this.intersectsAABB = function ( aabb ) {
        return AABBIntersectsSphere( aabb, this );
      };
      this.getDims = function () {
        return dims;
      };
      this.setDims = function ( newDims ) {
        if ( ! ( newDims instanceof Array ) ) {
          var position = newDims.position || [0,0,0],
              radius = newDims.radius || 0;

          dims = position.slice().concat(radius);
        }
        else {
          dims = newDims.slice();
        } //if
      };

      this.setDims( options );
    }; //SphereBody

    var AABB = this.AABB = function ( options ) {
      var extents = [[0,0,0],[0,0,0]];

      this.setExtents = function ( newDims ) {
        if ( ! ( newDims instanceof Array ) ) {
          var max = newDims.max || [0,0,0],
              min = newDims.min || [0,0,0];

          extents = [ max.slice(), min.slide() ];
        }
        else {
          extents = [ newDims[ 0 ].slice(), newDims[ 1 ].slice() ];
        } //if
      };

      this.getExtents = function () {
        return extents;
      };

      this.setExtents( options );
    }; //AABB

  });

})(window, document, Paladin);
