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
        
        this.name = name;
        this.parent = parent;
        this.children = {};
        this.listeners = {};
        
        // Node's configuration value
        var _value = '';
        Object.defineProperty( this, 'value', {
            get: function() {
                return _value;
            },
            
            set: function( value ) {
                if ( _value !==  value ) {  // Additionally check if incoming value is string?
                
                    // Meaningful change, notify parent
                    if ( parent ) {
                        parent.notify( this.name, '/', value );
                    }
                    
                    _value = value;
                }
            }
        });
        
        // Traverse the node tree given a path
        this.traverse = function( path, doCreatePath ) {
            
            var rv;
            
            if ( path.length == 1 && path.charAt( 0 ) == '/' ) {
                rv = this;
            } else {
                
                // Parse path and traverse the node tree
                var pathElems = path.split('/');
                var curNode = this;
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
        this.notify = function ( childName, path, newVal ) {
            
            if ( this.parent ) {
                // Clean last slash if present
                if ( path.length == 1 && path.charAt( 0 ) == '/' ) {
                    path = '';
                }
                
                // Build up the path
                path = '/' + childName + path;
                
                // Call all of our listeners
                for ( var key in this.listeners ) {
                    // is hasOwnProperty desired here? Seems unnecessary
                    this.listeners[key]( path );
                }
                
                this.parent.notify( this.name, path, newVal );
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
            
            this.constructor = Configurator;    // TODO: FIXME Dirty Dirty Hack
            this.id = uniqueId();
            
            // Get a value based on a given path
            this.get = function( path ) {
                var rv = '';
                
                var targetNode = this.node.traverse( path );
                
                if ( targetNode !== undefined ) {
                    rv = targetNode.value;
                }
                
                return rv;
            };
            
            // Set a value based on a given path
            this.set = function( path, value ) {
                var targetNode = this.node.traverse( path, true );
                
                targetNode.value = value;
            };
            
            // Update configuration with given json object
            this.update = function( json ) {
                for ( var key in json ) {
                    if (json.hasOwnProperty( key )) {   // Performance Note: perhaps protecting against the prototype is not required?
                        this.set( key, json[key] );
                    }
                }
            };
            
            // Get a new configurator client for a node reachable using the given path.
            // If provided, associate listenerFunc with the newly created configurator client.
            this.getPath = function( path, listenerFunc ) {
                var targetNode = this.node.traverse( path, true ),
                    rv = new init();
                
                rv.node = targetNode;
                
                if ( listenerFunc ) {
                    targetNode.listeners[rv.id] = listenerFunc;
                }
                
                return rv;
            };
            
            // Remove listener currently associated with client.
            this.ignore = function() {
                var curListener = this.node.listeners[this.id];
                if ( curListener ) {
                    delete this.node.listeners[this.id];
                }
            };
            
            // Set listener function for this client. If another listener is
            // associated with this client then that listener is first removed.
            this.listen = function( listenerFunc ) {
                if ( listenerFunc ) {
                    this.ignore();
                    
                    this.node.listeners[this.id] = listenerFunc;
                }
            };
        };
        
        init.apply(this);
        
        this.node = new ConfNode( 'ROOT', undefined );  // Associate client front end with tree root
        
        defaultConfiguration = defaultConfiguration || {};
        
        // Load default configuration
        this.update( defaultConfiguration );
    };

    return Configurator;
});
