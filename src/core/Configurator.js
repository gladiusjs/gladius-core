/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */


define( function ( require ) {
    
    /* Configurator
     *
     * Loads and stores configuration data. Allows external code to listen for
     * changes in configuration subtrees.
     *
     * Initially written by Hasan (northWind) Kamal-Al-Deen
     */

    var Configurator = function( engine, defaultConfiguration ) {

        var self = this;
        
        defaultConfiguration = defaultConfiguration || {};
        
        // Define tree object
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
                            parent.notify( self.name );
                        }
                        
                        _value = value;
                    }
                }
            });
            
            // Add a listener to this node's list of listeners
            self.addListener = function( clientId, listener ) {
                self.listeners[clientId] = listener;
            };
            
            // Remove an existing listener
            self.removeListener = function( clientId ) {
                if ( self.listeners[clientId] != undefined ) {
                    delete self.listeners[clientId];
                }
            }
        };
        
        // Client front-end functions
        
        // Get a value based on a given path
        self.get = function( path ) {
            var rv = '';
            
            if ( path.length > 0 ) {
                if ( path.length == 1 && path.charAt( 0 ) == '/' ) {
                    rv = self.node.value;
                } else {
                    
                    // Parse path and traverse the node tree
                    var pathElems = path.split('/');
                    var curNode = self.node;
                    var successful = true;
                    for ( var i = 0; successful && i < pathElems.length; ++ i ) {
                        var curElem = pathElems[i];
                        
                        if ( curElem != '' ) {
                            
                            // Look for name in children of current node
                            var nextNode = curNode.children[curElem];
                            if ( nextNode != undefined ) {
                                curNode = nextNode;
                            } else {
                                // Path leads nowhere, leave
                                successful = false;
                                break;
                            }
                        }
                    }
                    
                    if ( successful ) {
                        rv = curNode.value;
                    }
                }
            }
            
            return rv;
        };

        // Create internal tree
        // Associate client front end with tree root
        
        // Return client
    };

    return Configurator;
});
