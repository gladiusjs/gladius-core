/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {
    
    var Graph = function( idProperty, edges ) {
        
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

            var srcId = src[idProperty],
            snkId = snk[idProperty];

            if( !_nodes[srcId] ) { 
                _nodes[srcId] = src;
                _descendants[srcId] = 0;
            }
            if( !_nodes[snkId] ) { 
                _nodes[snkId] = snk; 
                _descendants[snkId] = 0;
                _roots[snkId] = true;
            }            

            if( !_adjacencies[snkId] ) {
                _adjacencies[snkId] = {};
            }

            _adjacencies[snkId][srcId] = true;
            ++ _descendants[srcId];
            if( _roots[srcId] ) {
                delete _roots[srcId];
            }
        };

        this.unlink = function( src, snk ) {

            var srcId = src[idProperty],
            snkId = snk[idProperty];

            if( _adjacencies[snkId] && _adjacencies[snkId][srcId] ) {
                delete _adjacencies[snkId][srcId];
                -- _descendants[srcId];
                if( !Object.keys( _adjacencies[snkId] ).length ) {
                    delete _adjacencies[snkId];
                }
                if( !_descendants[srcId] ) {
                    _roots[srcId] = true;
                }
            }

        };

        this.insert = function( node ) {

            var nodeId = node[idProperty];
            
            if( !_nodes[nodeId] ) {
                _nodes[nodeId] = node;
                _descendants[nodeId] = 0;
                _roots[nodeId] = true;
            }

        };

        this.remove = function( node ) {

            var nodeId = node[idProperty],
            edges = _adjacencies[nodeId] || {};

            for( var srcId in edges ) {
                that.unlink( _nodes[srcId], _nodes[nodeId] );
            }

            if( _nodes[nodeId] ) {
                delete _nodes[nodeId];
                delete _descendants[nodeId];
            }

        };

        this.sort = function() {

            var L = [],
            S = Object.keys( _roots );

            var visit = function( snkId ) {                
                if( !_visited[snkId] ) {
                    _visited[snkId] = true;
                    var edges = _adjacencies[snkId];
                    for( var srcId in edges ) {
                        if( !_nodes[srcId] ) {  // This might be a dangling edge
                            delete edges[srcId];
                        } else {
                            visit( srcId );
                        }
                    }
                    L.push( snkId );
                }                
            };

            for( var i = 0, l = S.length; i < l; ++ i ) {
                visit( S[i] );
            }                                

            _visited = {};
            return L;

        };

    };


});