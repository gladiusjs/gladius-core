/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {
    
    var Graph = function() {

        var _nodes = {};
        var _adjacencies = {};
        var _descendants = {};
        var _roots = {};
        var _cache = null;
        var _cacheIsValid = false;
        var that = this;
        
        Object.defineProperty( this, 'size', {
            get: function() {
                return Object.keys( _nodes ).length;
            }
        });

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
            
            _cacheIsvalid = false;
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
            
            _cacheIsValid = false;

        };

        this.insert = function( node ) {

            if( !_nodes[node] ) {
                _nodes[node] = true;
                _descendants[node] = 0;
                _roots[node] = true;
            }
            
            _cacheIsValid = false;

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
            
            _cacheIsValid = false;

        };
        
        this.clear = function() {
            _nodes = {};
            _adjacencies = {};
            _descendants = {};
            _roots = {};
            _cache = [];
            _cacheIsValid = true;
        };

        this.sort = function() {
            
            if( _cacheIsValid ) {
                return _cache.slice();
            }

            var L = [],
            S = Object.keys( _roots ),
            V = {},
            visited = {};            
            
            var visit = function( snk ) {
                if( V[snk] ) {
                    throw 'directed cycle detected';
                }
                V[snk] = true;

                if( !visited[snk] ) {
                    visited[snk] = true;
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
           
            if( L.length < Object.keys( _nodes ).length ) {
                throw 'directed cycle detected';
            }
            
            _cache = L;
            _cacheIsValid = true;
            return _cache.slice();

        };

    };
    
    return Graph;

});