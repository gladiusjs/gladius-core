/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {
    
    var Graph = function() {

        var _nodes = {};
        var _adjacencies = {};
        var _descendants = {};
        var _roots = {};
        var _visited = {};
        var that = this;

        this.nodes = _nodes;
        this.adjacencies = _adjacencies;
        this.descendants = _descendants;
        this.roots = _roots;

        this.link = function( src, snk ) {

            if( !_nodes[src] ) { 
                _nodes[src] = true;
                _descendants[src] = 0;
            }
            if( !_nodes[snk] ) { 
                _nodes[snk] = true; 
                _descendants[snk] = 0;
                _roots[snk] = true;
            }            

            if( !_adjacencies[snk] ) {
                _adjacencies[snk] = {};
            }

            _adjacencies[snk][src] = true;
            ++ _descendants[src];
            if( _roots[src] ) {
                delete _roots[src];
            }
        };

        this.unlink = function( src, snk ) {

            if( _adjacencies[snk] && _adjacencies[snk][src] ) {
                delete _adjacencies[snk][src];
                -- _descendants[src];
                if( !Object.keys( _adjacencies[snk] ).length ) {
                    delete _adjacencies[snk];
                }
                if( !_descendants[src] ) {
                    _roots[src] = true;
                }
            }

        };

        this.insert = function( node ) {

            if( !_nodes[node] ) {
                _nodes[node] = true;
                _descendants[node] = 0;
                _roots[node] = true;
            }

        };

        this.remove = function( node ) {

            var edges = _adjacencies[node] || {};

            for( var src in edges ) {
                that.unlink( src, node );
            }

            if( _nodes[node] ) {
                delete _nodes[node];
                delete _descendants[node];
            }

        };

        this.sort = function() {

            var L = [],
            S = Object.keys( _roots ),
            V = {};
            
            var visit = function( snk ) {
                if( V[snk] ) {
                    throw 'directed cycle detected';
                }
                V[snk] = true;

                if( !_visited[snk] ) {
                    _visited[snk] = true;
                    var edges = _adjacencies[snk];
                    for( var src in edges ) {
                        if( !_nodes[src] ) {  // This might be a dangling edge
                            delete edges[src];
                        } else {
                            visit( src );
                        }
                    }
                    L.push( snk );
                }                
            };

            for( var i = 0, l = S.length; i < l; ++ i ) {
                visit( S[i] );
                V = {};
            }                                

            _visited = {};
            
            if( L.length < Object.keys( _nodes ).length ) {
                throw 'directed cycle detected';
            }
            
            return L;

        };

    };

});