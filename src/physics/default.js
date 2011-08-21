/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {

  var enums = {
    frustum: {
      LEFT: 0,
      RIGHT: 1,
      T: 2,
      B: 3,
      NEAR: 4,
      FAR: 5
    },
    octree: {
      T_NW: 0,
      T_NE: 1,
      T_SE: 2,
      T_SW: 3,
      B_NW: 4,
      B_NE: 5,
      B_SE: 6,
      B_SW: 7
    }
  };

  var bases = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];

  function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  }

  var aabbMath = {
    engulf: function (aabb, point) {
      if (aabb[0][0] > point[0]) {
        aabb[0][0] = point[0];
      }
      if (aabb[0][1] > point[1]) {
        aabb[0][1] = point[1];
      }
      if (aabb[0][2] > point[2]) {
        aabb[0][2] = point[2];
      }
      if (aabb[1][0] < point[0]) {
        aabb[1][0] = point[0];
      }
      if (aabb[1][1] < point[1]) {
        aabb[1][1] = point[1];
      }
      if (aabb[1][2] < point[2]) {
        aabb[1][2] = point[2];
      }
    },
    reset: function (aabb, point) {
      if (point === undefined) {
        point = [0,0,0];
      } //if
      aabb[0][0] = point[0];
      aabb[0][1] = point[1];
      aabb[0][2] = point[2];
      aabb[1][0] = point[0];
      aabb[1][1] = point[1];
      aabb[1][2] = point[2];
    },
    size: function (aabb) {
      var x = aabb[0][0] < aabb[1][0] ? aabb[1][0] - aabb[0][0] : aabb[0][0] - aabb[1][0];
      var y = aabb[0][1] < aabb[1][1] ? aabb[1][1] - aabb[0][1] : aabb[0][1] - aabb[1][1];
      var z = aabb[0][2] < aabb[1][2] ? aabb[1][2] - aabb[0][2] : aabb[0][2] - aabb[1][2];
      return [x,y,z];
    },
    containsPoint: function ( aabb, point ) {
      return point[0] <= aabb[1][0] &&
             point[1] <= aabb[1][1] &&
             point[2] <= aabb[1][2] &&
             point[0] >= aabb[0][0] &&
             point[1] >= aabb[0][1] &&
             point[2] >= aabb[0][2];
    },
    overlaps: function ( aabb1, aabb2 ) {
      // thanks flipcode! http://www.flipcode.com/archives/2D_OBB_Intersection.shtml

      for ( var axis=0; axis<3; ++axis ) {
        var t = dot(aabb1[0], bases[axis]);
        var tmin = 1000000000000000000, tmax = -1000000000000000;

        //unrolled
        t = dot([aabb2[0][0], aabb2[0][1], aabb2[0][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[1][0], aabb2[0][1], aabb2[0][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[0][0], aabb2[1][1], aabb2[0][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[1][0], aabb2[1][1], aabb2[0][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[0][0], aabb2[0][1], aabb2[1][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[1][0], aabb2[0][1], aabb2[1][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[0][0], aabb2[1][1], aabb2[1][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[1][0], aabb2[1][1], aabb2[1][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;

        var origin1 = dot( aabb1[0], bases[axis] ),
            origin2 = dot( aabb1[1], bases[axis] );
        if ( ( tmin > origin2 ) || tmax < origin1 ) {
          return false;
        }
      } //for
      return true;
    },
    intersectsAABB: function ( aabb1, aabb2 ) {
      if ( aabbMath.containsPoint( aabb1, aabb2[0] ) || aabbMath.containsPoint( aabb1, aabb2[1] ) ) {
        return true;
      }
      return aabbMath.overlaps( aabb1, aabb2 ) || aabbMath.overlaps( aabb2, aabb1 );
    }
  };

  var planeMath = {
    classifyPoint: function (plane, pt) {
      var dist = (plane[0] * pt[0]) + (plane[1] * pt[1]) + (plane[2] * pt[2]) + (plane[3]);
      if (dist < 0) {
        return -1;
      }
      else if (dist > 0) {
        return 1;
      }
      return 0;
    },
    normalize: function (plane) {
      var mag = Math.sqrt(plane[0] * plane[0] + plane[1] * plane[1] + plane[2] * plane[2]);
      plane[0] = plane[0] / mag;
      plane[1] = plane[1] / mag;
      plane[2] = plane[2] / mag;
      plane[3] = plane[3] / mag;
    }
  };

  var sphereMath = {
    intersectsSphere: function ( sphere1, sphere2 ) {
      var diff = [ sphere2[0] - sphere1[0], sphere2[1] - sphere1[1], sphere2[2] - sphere1[2] ],
        mag = diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2],
        sqrtRad = sphere2[3] + sphere1[3];
          // no need to sqrt here
      return mag <= sqrtRad*sqrtRad;
    },
    intersectsAABB: function ( sphere, aabb ) {
      var min = aabb[0],
          max = aabb[1];
      max = [ max[0] - dims[0], max[1] - dims[1], max[2] - dims[2] ];
      min = [ min[0] - dims[0], min[1] - dims[1], min[2] - dims[2] ];
      max = max[0]*max[0] + max[1]*max[1] + max[2]*max[2];
      min = min[0]*min[0] + min[1]*min[1] + min[2]*min[2];
      var sqr = sphere[3]*sphere[3];
      return max > sqr && min > sqr;
    }
  };

  function OcNode ( options ) {
    options = options || {};
    this.type = options.type;
    this.inserted = options.inserted || function () {};
    this.aabb = options.aabb;
    this.object = options.object;
    if ( options.object ) {
      this.bindObject( options.object );
    }
    this.destroy = function () {
      that.leaves = undefined;
      that.commonRoot = undefined;
    };

  }

  function Octree ( options ) {
    options = options || {};
    var dirty = false,
        children = [],
        depth = options.depth || 0,
        size = options.size || 0,
        position = options.position || [0,0,0],
        nodes = [],
        sphere = position.slice().concat( Math.sqrt( 3*size/2*size/2 ) ),
        aabb = [[0,0,0],[0,0,0]],
        root = options.root,
        that = this;

    var halfSize = size/2;
    aabbMath.engulf( aabb, [position[0] + halfSize, position[1] + halfSize, position[2] + halfSize] );
    aabbMath.engulf( aabb, [position[0] - halfSize, position[1] - halfSize, position[2] - halfSize] );

    this.destroy = function () {
      for ( var i=0, l=nodes.length; i<l; ++i ) {
        nodes[i].destroy();
      } //for
      children[0] = children[1] = children[2] = children[3] = children[4] = children[5] = children[6] = children[7] = undefined;
      root = undefined;
      position = undefined;
      nodes = undefined;
      sphere = undefined;
      aabb = undefined;
    };

    this.removeNode = function ( node ) {
      var idx = nodes.indexOf( node );
      if ( idx > -1 ) {
        node.remove();
        nodes.splice( idx, 1 );
        that.dirtyLineage();
      } //if
    };

    this.dirtyLineage = function () {
      if ( root ) {
        root.dirtyLineage();
      }
    };

    this.dirty = function ( val ) {
      if ( val ) {
        dirty = val;
      }
      return dirty;
    };

    this.cleanUp = function () {
      var numKeeping = 0;
      for (var i=0, l=children.length; i<l; ++i) {
        if ( children[i] ) {
          var child = children[i],
              keep = true;
          if (child.dirty() === true) {
            keep = child.cleanUp();
          } //if
          if (!keep) {
            child = children[i] = undefined;
          } else {
            ++numKeeping;
          }
        } //if
      } //for
      return ! ( nodes.length === 0 && ( numKeeping === 0 || children.length === 0 ) );
    };

    function $insertNode( node, root ) {
      node.inserted();
      nodes.push( node );
      node.leaves.push( that );
      node.commonRoot = root;
      aabbMath.engulf( node.aabb, aabb[0] );
      aabbMath.engulf( node.aabb, aabb[1] );
    }

    this.insertNode = function ( node ) {
      if ( maxDepth === 0 ) {
        $insertNode( node, root );
        return;
      } //if

      var p = position,
          aabb = node.aabb,
          min = aabb[0],
          max = aabb[1],
          tNW = min[0] < p[0] && min[1] < p[1] && min[2] < p[2],
          tNE = max[0] > p[0] && min[1] < p[1] && min[2] < p[2],
          bNW = min[0] < p[0] && max[1] > p[1] && min[2] < p[2],
          bNE = max[0] > p[0] && max[1] > p[1] && min[2] < p[2],
          tSW = min[0] < p[0] && min[1] < p[1] && max[2] > p[2],
          tSE = max[0] > p[0] && min[1] < p[1] && max[2] > p[2],
          bSW = min[0] < p[0] && max[1] > p[1] && max[2] > p[2],
          bSE = max[0] > p[0] && max[1] > p[1] && max[2] > p[2],
          numInserted = 0;

      if ( tNW && tNE && bNW && bNE && tSW && tSE && bSW && bSE ) {
        $insertNode( node, that );
      }
      else {
        var newSize = size/2,
            offset = size/4,
            x = p[0], y = p[1], z = p[2];

        var news = [
          [ tNW, enums.octree.T_NW, [ x - offset, y - offset, z - offset ] ],
          [ tNE, enums.octree.T_NE, [ x + offset, y - offset, z - offset ] ],
          [ bNW, enums.octree.B_NW, [ x - offset, y + offset, z - offset ] ],
          [ bNE, enums.octree.B_NE, [ x + offset, y + offset, z - offset ] ],
          [ tSW, enums.octree.T_SW, [ x - offset, y - offset, z + offset ] ],
          [ tSE, enums.octree.T_SE, [ x + offset, y - offset, z + offset ] ],
          [ bSW, enums.octree.B_SW, [ x - offset, y + offset, z + offset ] ],
          [ bSE, enums.octree.B_SE, [ x + offset, y + offset, z + offset ] ]
        ];

        for ( var i=0; i<8; ++i ) {
          if ( news[i][0] ) {
            if ( !children[ news[i][1] ] ) {
              children[ news[i][1] ] = new Octree({
                size: newSize,
                depth: depth -1,
                root: that,
                position: news[i][2]
              });
            }
            children[ news[i][1] ].insert( node );
            ++numInserted;
          } //if
        }

        if ( numInserted > 1 || !node.commonRoot ) {
          node.commonRoot = that;
        }

      } //if
    };

  } //Octree

  function physics( options ) {

    options = options || {};

    var Sphere = this.Sphere = function ( options ) {
      var dims = [0,0,0,0];

      this.intersectsSphere = function ( otherSphere ) {
        return sphereMath.intersectsSphere( dims, otherSphere.getDims() );
      };
      this.intersectsAABB = function ( aabb ) {
        return sphereMath.intersectsAABB( dims, aabb.getExtents() );
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
    }; //Sphere

    var AABB = this.AABB = function ( options ) {
      var extents = [[0,0,0],[0,0,0]];

      this.setExtents = function ( newDims ) {
        if ( ! ( newDims instanceof Array ) ) {
          var max = newDims.max || [0,0,0],
              min = newDims.min || [0,0,0];

          extents = [ min.slice(), max.slice() ];
        }
        else {
          extents = [ newDims[ 0 ].slice(), newDims[ 1 ].slice() ];
        } //if
      };

      this.intersectsAABB = function ( aabb ) {
        return aabbMath.intersectsAABB( aabb.getExtents(), extents );
      };

      this.getExtents = function () {
        return extents;
      };

      this.setExtents( options );
    }; //AABB

    var numBodies = 0;
    var Body = this.Body = function ( options ) {
      options = options || {};
      var that = this;

      var layer = 0,
          id = numBodies++;

      this.getId = function () {
        return id;
      };

      var vel = options.velocity || [0, 0, 0];
      var acc = options.acceleration || [0, 0, 0];

      this.setVelocity = function ( v ) {
        vel = v;
      };
      this.setAcceleration = function ( a ) {
        acc = a;
      };

      this.getVelocity = function () {
        return vel;
      };
      this.getAcceleration = function () {
        return accel;
      };

      var aabb = new AABB({
        min: options.aabb ? options.aabb[0] : undefined,
        max: options.aabb ? options.aabb[1] : undefined
      });

      var extents = aabb.getExtents(),
          diff = [extents[1][0]-extents[0][0], extents[1][1]-extents[0][1], extents[1][2]-extents[0][2]],
          mag = Math.sqrt(diff[0]*diff[0]+diff[1]*diff[1]+diff[2]*diff[2]);

      var sphere = new Sphere({
        position: [extents[0][0] + diff[0]/2, extents[0][1] + diff[1]/2, extents[0][2] + diff[2]/2],
        radius: mag/2
      });

      this.getSphere = function () {
        return sphere;
      };
      this.getAABB = function () {
        return aabb;
      };

      this.moveAABB = function ( extents ) {
        aabb.setExtents( extents );
        var diff = [extents[1][0]-extents[0][0], extents[1][1]-extents[0][1], extents[1][2]-extents[0][2]],
            mag = Math.sqrt(diff[0]*diff[0]+diff[1]*diff[1]+diff[2]*diff[2]);

        sphere.setDims([extents[0][0] + diff[0]/2, extents[0][1] + diff[1]/2, extents[0][2] + diff[2]/2, mag/2]);

      };

      this.onCollision = options.onCollision;

      this.testCollision = function ( otherBody ) {
        var otherSphere = otherBody.getSphere();
        if ( otherSphere.intersectsSphere( sphere ) ) {
          var otherAABB = otherBody.getAABB();
          if ( otherAABB.intersectsAABB( aabb ) ) {
            return true;
          } //if
        } //if
        return false;
      };

      this.advance = function ( time ) {
        if ( !time ) return;
        vel[0] += acc[0]*time;
        vel[1] += acc[1]*time;
        vel[2] += acc[2]*time;
        var vx = vel[0]*time,
            vy = vel[1]*time,
            vz = vel[2]*time;
        var sphereDims = sphere.getDims();
        var aabbDims = aabb.getExtents();
        sphereDims[0] += vx;
        sphereDims[1] += vy;
        sphereDims[2] += vz;
        aabbDims[0][0] += vx;
        aabbDims[0][1] += vy;
        aabbDims[0][2] += vz;
        aabbDims[1][0] += vx;
        aabbDims[1][1] += vy;
        aabbDims[1][2] += vz;
      };

      this.setLayer = function ( l ) {
        layer = l;
      };

      this.getLayer = function () {
        return layer;
      };

      this.collisions = [];

      this.externalObject = undefined;

    };

    var Universe = this.Universe = function ( options ) {
      options = options || {};

      var bodies = [],
          that = this;

      this.addBody = function ( body ) {
        if ( bodies.indexOf( body ) === -1 ) {
          bodies.push( body );
        }
        return body;
      };

      this.removeBody = function ( body ) {
        var idx = bodies.indexOf( body );
        if ( idx > -1 ) {
          bodies.splice( idx, 1 );
        }
        return body;
      };

      this.getCollisions = function () {
        var collisions = [],
          i, j, l;
         // TODO [secretrobotron]: the worst (use the octree)
        for ( i=0, l=bodies.length; i<l; ++i ) {
          bodies[i].collisions = [];
        }
        for ( i=0, l=bodies.length; i<l; ++i ) {
          for ( j=0; j<l; ++j ) {
            if (  bodies[i] !== bodies[j] &&
                  bodies[i].collisions.indexOf( bodies[j] ) === -1 &&
                  bodies[i].testCollision( bodies[j] )
              ) {
              bodies[i].collisions.push( bodies[j] );
              bodies[j].collisions.push( bodies[i] );
              collisions.push( [ bodies[i], bodies[j] ] );
            } //if
          } //for
        } //for
        return collisions;
      };

      this.advance = function ( time ) {
        for ( var i=0, l=bodies.length; i<l; ++i ) {
          bodies[i].advance( time );
        }
        return that.getCollisions();
      }; //advance
    };

  }

  return physics;
});
