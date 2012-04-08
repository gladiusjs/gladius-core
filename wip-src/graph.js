/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {

  /* Graph
   * 
   * Stores a set of nodes and a set of directed edges connecting them.
   * Supports inserting, removing, linking and unlinking nodes. Nodes are
   * stored in an associative array, so they can be any valid key value (i.e.,
   * not an object).
   * 
   */

  var Graph = function() {
    this._nodes = {};        // Nodes in the graph
    this._adjacencies = {};  // Adjacency list; Sink maps to sources
    this._descendants = {};  // Number of descendants for each node
    this._roots = {};        // List of nodes that have no ancestors
    this._cachedSort = null; // Cached copy of the sorted nodes
    this._cachedSize = 0;    // Cached size of the graph
  };

  function link( source, sink ) {
    if( !this._nodes[source] ) { 
      this._nodes[source] = true;
      this._descendants[source] = 0;
    }
    if( !this._nodes[sink] ) { 
      this._nodes[sink] = true; 
      this._descendants[sink] = 0;
      this._roots[sink] = true;
    }            

    if( !this._adjacencies[sink] ) {
      this._adjacencies[sink] = {};
    }

    this._adjacencies[sink][source] = true;
    ++ this._descendants[source];
    if( this._roots[source] ) {
      delete this._roots[source];
    }

    this._cachedSort = null;
  };

  function unlink( source, sink ) {
    if( this._adjacencies[sink] && this._adjacencies[sink][source] ) {
      delete this._adjacencies[sink][source];
      -- this._descendants[source];
      if( !Object.keys( this._adjacencies[sink] ).length ) {
        delete this._adjacencies[sink];
      }
      if( !this._descendants[source] ) {
        this._roots[source] = true;
      }
    }

    this._cachedSort = null;
  };

  function insert( node ) {
    if( !this._nodes[node] ) {
      this._nodes[node] = true;
      this._descendants[node] = 0;
      this._roots[node] = true;

      ++ this._cachedSize;
      this._cachedSort = null;
    }
  };

  function remove( node ) {
    var edges = this._adjacencies[node] || {};    

    if( this._nodes[node] ) {
      for( var source in edges ) {
        this.unlink( source, node );
      }

      delete this._nodes[node];
      delete this._descendants[node];

      -- this._cachedSize;
      this._cachedSort = null;
    }
  };

  function size() {
    return this._cachedSize;
  };

  function clear() {    
    this._nodes = {};
    this._adjacencies = {};
    this._descendants = {};
    this._roots = {};    
    this._cachedSort = null;
    this._cachedSize = 0;
  };

  function sort() {
    if( null === this._cachedSort ) {

      var L = [],
        S = Object.keys( _roots ),
        V = {},
        visited = {};            

      function visit( sink ) {
        if( V[sink] ) {
          this._cachedSort = null;
          throw new Error( "directed cycle detected" );
        }
        V[sink] = true;

        if( !visited[sink] ) {
          visited[sink] = true;
          var edges = this._adjacencies[sink];
          for( var source in edges ) {
            if( !this._nodes[source] ) {  // This might be a dangling edge
              delete edges[source];
            } else {
              visit( source );
            }
          }
          L.push( sink );
        }                
      };

      for( var i = 0, l = S.length; i < l; ++ i ) {
        visit( S[i] );
        V = {};
      }                                

      if( L.length < Object.keys( _nodes ).length ) {
        this._cachedSort = null;
        throw new Error( "directed cycle detected" );
      }

      this._cachedSort = L;
    }
    
    return _cachedSort.slice();
  };
  
  function hasNode( node ) {
    return this._nodes.hasOwnProperty( node );
  };
  
  function hasLink( source, sink ) {
    return this._adjacencies.hasOwnProperty( sink ) &&
           this._adjacencies[sink].hasOwnProperty( source );
  };

  Graph.prototype = {
      link: link,    
      unlink: unlink,    
      insert: insert,
      remove: remove,
      size: size,
      clear: clear,
      sort: sort,
      hasNode: hasNode,
      hasLink: hasLink
  };

  return Graph;

});