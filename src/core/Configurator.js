/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */


define( function ( require ) {
    
    /* Configuration Node
     * 
     * Structure for storing configuration settings
     */
    var ConfNode = function( name, parent ) {
        
        var self = this;
        
        self.name = name;
        self.parent = parent;
        self.children = {};
        self.listeners = {};
        
        // Node's configuration value
        var _value = '';
        Object.defineProperty( self, 'value', {
            get: function() {
                return _value;
            },
            
            set: function( value ) {
                if ( _value !==  value ) {  // Additionally check if incoming value is string?
                
                    // Meaningful change, notify parent
                    if ( parent ) {
                        parent.notify( self.name, '/', value );
                    }
                    
                    _value = value;
                }
            }
        });
        
        // Traverse the node tree given a path
        self.traverse = function( path, doCreatePath ) {
            
            var rv;
            
            if ( path.length == 1 && path.charAt( 0 ) == '/' ) {
                rv = self;
            } else {
                
                // Parse path and traverse the node tree
                var pathElems = path.split('/');
                var curNode = self;
                var successful = true;
                for ( var i = 0; successful && i < pathElems.length; ++ i ) {
                    var curElem = pathElems[i];
                    
                    if ( curElem !== '' ) {
                        
                        // Look for name in children of current node
                        var nextNode = curNode.children[curElem];
                        if ( nextNode !== undefined ) {
                            curNode = nextNode;
                        } else if ( doCreatePath ) {
                            nextNode = new ConfNode( curElem, curNode );
                            curNode.children[curElem] = nextNode;
                            curNode = nextNode;
                        } else {
                            // Path leads nowhere, leave
                            successful = false;
                            break;
                        }
                    }
                }
                
                if ( successful ) {
                    rv = curNode;
                }
            }
            
            return rv;
        };
        
        // Notifies us that a value stored somewhere in the subtree rooted by
        // this node has changed.
        self.notify = function ( childName, path, newVal ) {
            
            if ( self.parent ) {
                // Clean last slash if present
                if ( path.length == 1 && path.charAt( 0 ) == '/' ) {
                    path = '';
                }
                
                // Build up the path
                path = '/' + childName + path;
                
                // Call all of our listeners
                for ( var key in self.listeners ) {
                    // is hasOwnProperty desired here? Seems unnecessary
                    self.listeners[key]( path );
                }
                
                self.parent.notify( self.name, path, newVal );
            }
        };
    };
    
    /**
     * More or less unique id generator
     *
     * Borrowed from Sagi Shkedy's Technical Blog
     * http://blog.shkedy.com/2007/01/createing-guids-with-client-side.html
     */
    var _incCounter = 0;
    function uniqueId() {
        
        var result, i, j;
        result = '';
        
        for(j=0; j<32; j++)
        {
            if( j == 8 || j == 12|| j == 16|| j == 20) {
                result = result + '-';
            }
            
            i = Math.floor(Math.random()*16).toString(16).toUpperCase() + _incCounter;
            result = result + i;
            
            ++ _incCounter;
        }
        
        return result;
    }
    
    /* Configurator
     *
     * Loads and stores configuration data. Allows external code to listen for
     * changes in configuration subtrees.
     *
     * Initially written by Hasan (northWind) Kamal-Al-Deen
     */
    var Configurator = function( defaultConfiguration ) {
        
        var self = this;
        
        var init = function() {
            var self = this;
            
            self.constructor = Configurator;    // TODO: FIXME Dirty Dirty Hack
            self.id = uniqueId();
            
            // Get a value based on a given path
            self.get = function( path ) {
                var rv = '';
                
                var targetNode = self.node.traverse( path );
                
                if ( targetNode !== undefined ) {
                    rv = targetNode.value;
                }
                
                return rv;
            };
            
            // Set a value based on a given path
            self.set = function( path, value ) {
                var targetNode = self.node.traverse( path, true );
                
                targetNode.value = value;
            };
            
            // Update configuration with given json object
            self.update = function( json ) {
                for ( var key in json ) {
                    if (json.hasOwnProperty( key )) {   // Performance Note: perhaps protecting against the prototype is not required?
                        self.set( key, json[key] );
                    }
                }
            };
            
            // Get a new configurator client for a node reachable using the given path.
            // If provided, associate listenerFunc with the newly created configurator client.
            self.getPath = function( path, listenerFunc ) {
                var targetNode = self.node.traverse( path, true ),
                    rv = new init();
                
                rv.node = targetNode;
                
                if ( listenerFunc ) {
                    targetNode.listeners[rv.id] = listenerFunc;
                }
                
                return rv;
            };
            
            // Remove listener currently associated with client.
            self.ignore = function() {
                var curListener = self.node.listeners[self.id];
                if ( curListener ) {
                    delete self.node.listeners[self.id];
                }
            };
            
            // Set listener function for this client. If another listener is
            // associated with this client then that listener is first removed.
            self.listen = function( listenerFunc ) {
                if ( listenerFunc ) {
                    self.ignore();
                    
                    self.node.listeners[self.id] = listenerFunc;
                }
            };
        };
        
        init.apply(self);
        
        self.node = new ConfNode( 'ROOT', undefined );  // Associate client front end with tree root
        
        defaultConfiguration = defaultConfiguration || {};
        
        // Load default configuration
        self.update( defaultConfiguration );
    };

    return Configurator;
});
