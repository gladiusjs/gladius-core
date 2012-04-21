if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  /* Graph
   * 
   * Stores a set of nodes and a set of directed edges connecting them.
   * Supports inserting, removing, linking and unlinking nodes. Nodes are
   * assumed to be strings.
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

    return this;
  }

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
    } else {
      throw new Error( "no such link: ", source, "->", sink );
    }

    this._cachedSort = null;

    return this;
  }

  function insert( node ) {
    if( !this._nodes[node] ) {
      this._nodes[node] = true;
      this._descendants[node] = 0;
      this._roots[node] = true;

      ++ this._cachedSize;
      this._cachedSort = null;
    }

    return this;
  }

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
    } else {
      throw new Error( "no such node: ", node );
    }

    return this;
  }

  function size() {
    return this._cachedSize;
  }

  function clear() {    
    this._nodes = {};
    this._adjacencies = {};
    this._descendants = {};
    this._roots = {};    
    this._cachedSort = null;
    this._cachedSize = 0;

    return this;
  }

  function sort() {
    var graph = this;
    var sorted = [],
    roots = Object.keys( this._roots ),
    visited = [];

    function visit( sink, visitedStack ) {
      if( -1 !== visitedStack.indexOf( sink ) ) {
        throw new Error( "directed cycle detected" );
      }
      visitedStack.push( sink );

      if( -1 === visited.indexOf( sink ) ) {
        visited.push( sink );
        var edges = graph._adjacencies[sink];
        for( var source in edges ) {
          if( !graph._nodes[source] ) {  // This might be a dangling edge
            delete edges[source];
          } else {
            visit( source, visitedStack );              
          }
        }
        sorted.push( sink );
      }
      visitedStack.pop();
    }

    if( null === this._cachedSort ) {
      for( var i = 0, l = roots.length; i < l; ++ i ) {
        visit( roots[i], [] );
      }             

      if( sorted.length < Object.keys( this._nodes ).length ) {
        throw new Error( "directed cycle detected" );
      }

      this._cachedSort = sorted;
    }

    return this._cachedSort.slice();

  }

  function hasNode( node ) {
    return this._nodes.hasOwnProperty( node );
  }

  function hasLink( source, sink ) {
    if( !this.hasNode( source ) ) { // This might be a dangling edge
      this.unlink( source, sink );
      return false;
    }
    return this._adjacencies.hasOwnProperty( sink ) &&
    this._adjacencies[sink].hasOwnProperty( source );
  }

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