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

                    var oldVal = _value;

                    // Set to new value before notifying
                    _value = value;
                    this.notify( '/', value, oldVal );
                }
            }
        });
        
        // Notifies us that a value stored somewhere in the subtree rooted by
        // this node has changed.
        this.notify = function ( path, newVal, oldVal ) {

            // Tell our listeners
            for ( var key in this.listeners ) {
                if ( this.listeners.hasOwnProperty( key ) ) {
                    this.listeners[key]( path, newVal, oldVal );
                }
            }

            // Pass up the notification
            if ( this.parent ) {

                // Build up the path
                if ( path.length === 1 && path === '/' ) {
                    path = path + this.name;
                } else {
                    path = '/' + this.name + path;
                }

                this.parent.notify( path, newVal, oldVal );
            }
        };
        
        // Traverse the node tree given a path
        this.traverse = function( path, doCreatePath ) {
            
            var rv;
            
            if ( path.length === 1 && path.charAt( 0 ) === '/' ) {
                rv = this;
            } else {
                
                // Parse path and traverse the node tree
                var pathElems = path.split('/'),
                    curNode = this,
                    successful = true;
                    
                for ( var i = 0, iMax = pathElems.length; successful && i < iMax; ++ i ) {
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

        // Serializes this node and all of its children as JSON
        this.getJSON = function() {
            var rv = {};

            if ( _value !== '' ) {
                rv['/'] = _value;
            }

            for ( var childKey in this.children ) {
                if ( this.children.hasOwnProperty( childKey ) ) {
                    var child = this.children[childKey],
                        childJSON = child.getJSON(),
                        childJSONKeys = Object.keys( childJSON );

                    for ( var k = 0, kmaxlen = childJSONKeys.length; k < kmaxlen; ++k ) {
                        rv['/' + child.name + childJSONKeys[k]] =
                            childJSON[childJSONKeys[k]];
                    }
                }
            }

            return rv;
        };
    };
    
    /* Configurator
     *
     * Loads and stores configuration data. Allows external code to listen for
     * changes in configuration subtrees.
     *
     * In Gladius, a configurator can be obtained in 3 ways:
     *      1) engine.configurator
     *              Engine instance, can be used directly.
     *
     *      2) < Configurator_Instance >.getPath( ... )
     *              Returns a new Configurator instance rooted at a given path
     *              relative to the engine instance registry root.
     *
     *      3) engine.core.Configurator( defaultConfig )
     *              Returns a new instance rooted at the registry root for
     *              the engine instance being used. If a JSON object is passed
     *              into defaultConfig, the registry values contained within it
     *              are merged with the engine instance registry.
     *
     *              This is akin to calling:
     *                 var newConfInstance = engine.configurator.getPath( '/' );
     *                 newConfInstance.update( myJSON );
     *
     * Initially written by Hasan (northWind) Kamal-Al-Deen
     */
    var Configurator = function( engine, defaultConfiguration ) {
        
        defaultConfiguration = defaultConfiguration || {};
        
        var self = this;
        
        // Pickup or initialize registry tree
        this.node = engine.rootConfNode ?
            engine.rootConfNode :
            ( engine.rootConfNode = new ConfNode( 'ROOT' ) );
        
        this.id = engine.nextGUID;
        
        // Get a value based on a given path
        this.get = function( path ) {
            var rv = '',
                targetNode = this.node.traverse( path );
            
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
                if ( json.hasOwnProperty( key ) ) {
                    this.set( key, json[key] );
                }
            }
        };
        
        /**
         * Get a new configurator client for a node reachable using the given path.
         * If provided, associate listenerFunc with the newly created configurator client.
         * The listener func should accept upto 3 parameters:
         *      path, newVal, oldVal
         *      path -- the relative path to the changed value
         *      newVal -- the value the given path has been set to
         *      oldVal -- the prior value of the given path
         */
        this.getPath = function( path, listenerFunc ) {
            var targetNode = this.node.traverse( path, true ),
                rv = new Configurator( engine, {} );

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
        // See getPath() for listenerFunc parameter descriptions.
        this.listen = function( listenerFunc ) {
            if ( listenerFunc ) {
                this.ignore();
                
                this.node.listeners[this.id] = listenerFunc;
            }
        };

        // Load/Store Specifcations

        /**
         * getJSON()
         *
         *     - Returns a JSON representation of this configurator instance.
         */
        this.getJSON = function() {
            return this.node.getJSON();
        };

        /**
         * clear()
         *  - Recursively clears all configuration options.
         */

        /**
         * store()
         *
         *  - Stores configuration options to local storage.
         */

        /**
         * load( [ clearBeforeLoad ][ , URL [ , callback ] ] )
         *
         *  - Loads registry either from a url or from local storage ( cookie )
         *      - If clearBeforeLoad is true, this configurator's configuration
         *          options are cleared before new ones are loaded
         *          - If false, contents are not cleared prior and any colliding
         *               configuration options are overwritten, this is the default.
         *      - If a URL is provided then an asynchronous XHR request is made
         *          to the given URL. The function expects a JSON object result.
         *          - If a callback is provided, it will be called when the
         *              JSON object has been retrieved and the configurator
         *              has been updated.
         *              - The callback should accept the configurator instance
         *                  as its only parameter.
         *          - If no URL is provided then configuration is loaded from
         *              local storage. This is a blocking/synchronous operation.
         */

        // Load default configuration
        this.update( defaultConfiguration );
    };

    return Configurator;
});
