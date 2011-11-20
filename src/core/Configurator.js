/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */


define( function ( require ) {

    /* Configuration Node
     * 
     * Structure for storing configuration settings
     */
    var ConfNode = function( name, parent ) {

        var that = this;

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

            var targetNode;

            if ( path.length === 1 && path.charAt( 0 ) === '/' ) {
                targetNode = this;
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
                    targetNode = curNode;
                }
            }

            return targetNode;
        };

        // Serializes this node and all of its children as JSON
        this.getJSON = function() {
            var resultJSON = {},
                children = this.children;

            if ( _value !== '' ) {
                resultJSON['/'] = _value;
            }

            for ( var childKey in children ) {
                if ( children.hasOwnProperty( childKey ) ) {
                    var child = children[childKey],
                        childJSON = child.getJSON(),
                        childJSONKeys = Object.keys( childJSON );

                    for ( var k = 0, kmaxlen = childJSONKeys.length; k < kmaxlen; ++k ) {
                        resultJSON['/' + child.name + childJSONKeys[k]] =
                            childJSON[childJSONKeys[k]];
                    }
                }
            }

            return resultJSON;
        };

        // Clears this node and all child nodes
        this.clear = function() {
            var children = this.children;

            this.value = '';

            for ( var childKey in children ) {
                if ( children.hasOwnProperty( childKey ) ) {
                    children[childKey].clear();
                }
            }
        };

        // Builds a parent path for this node
        this.getParentPath = function() {
            resultPath = '';

            var node = this;
            while ( node && node.parent ) {
                resultPath = '/' + node.name + resultPath;
                node = node.parent;
            }

            return resultPath;
        };
    };

    return function( engine ) {

        /* Configurator
         *
         * Loads and stores configuration data. Allows external code to listen for
         * changes in configuration subtrees.
         *
         * In Gladius, a configurator can be obtained in 3 ways.
         */
        var Configurator = function( options ) {

            options = options || {};

            if ( !options.defaultConfiguration )    options.defaultConfiguration = {};
            if ( !options.cookieName )              options.cookieName =  engine.options.cookieName;
            if ( !options.cookieLifetime )          options.cookieLifetime = engine.options.cookieLifetime;

            var that = this,
                _getStoredJSON = function( callback ) {
                    var cookie = window.gladiusCookie.readCookie( options.cookieName );
                    if ( !cookie ) {
                        cookie = '{}';
                    }

                    callback( JSON.parse( unescape( cookie ) ) );
                },

                _storeJSON = function( json, callback ) {
                    // Stringify JSON
                    var targetStr = escape( JSON.stringify( json ) );    // paranoid

                    // Store
                    window.gladiusCookie.createCookie( options.cookieName, targetStr, options.cookieLifetime );

                    if ( callback ) {
                        callback();
                    }
                };

            // Pickup or initialize registry tree
            this.node = engine.rootConfNode ?
                engine.rootConfNode :
                ( engine.rootConfNode = new ConfNode( 'ROOT' ) );

            this.id = engine.nextGUID;

            // Get a value based on a given path
            this.get = function( path ) {
                var resultVal = '',
                    targetNode = this.node.traverse( path );

                if ( targetNode !== undefined ) {
                    resultVal = targetNode.value;
                }

                return resultVal;
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
                    resultConf = new Configurator( engine, {
                        cookieName: options.cookieName,
                        cookieLifetime: options.cookieLifetime
                    } );

                resultConf.node = targetNode;

                if ( listenerFunc ) {
                    targetNode.listeners[resultConf.id] = listenerFunc;
                }

                return resultConf;
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
            this.clear = function() {
                this.node.clear();
            };

            /**
             * store()
             *
             *  - Stores configuration options to local storage.
             *      - If a callback is provided then it is called once the
             *          configuration has been loaded.
             *          - The callback will be passed the configurator object
             */
            this.store = function( callback ) {
                var targetJSON = {},
                    myJSON = this.getJSON(),
                    parentPath = this.node.getParentPath(),
                    targetStr = null;

                for ( var jsonKey in myJSON ) {
                    if ( myJSON.hasOwnProperty( jsonKey ) ) {
                        targetJSON[parentPath + jsonKey] = myJSON[jsonKey];
                    }
                }

                // Load existing myJSON and merge/filter
                _getStoredJSON( function( loadedJSON ) {
                    var loadedJSONKeys = Object.keys( loadedJSON );

                    for ( var i = 0, maxlen = loadedJSONKeys.length; i < maxlen; ++i ) {
                        var loadedJSONKey = loadedJSONKeys[i];
                        if ( loadedJSONKey.indexOf( parentPath ) !== 0 ) {
                            targetJSON[loadedJSONKey] = loadedJSON[loadedJSONKey];
                        }
                    }

                    // Store
                    _storeJSON( targetJSON, function() {
                        if ( callback ) {
                            callback( that );
                        }
                    });
                });
            };

            /**
             * load( [ callback( configurator ) ][, clearBeforeLoad ] )
             *
             *  - Loads registry from local storage ( IndexedDB )
             *      - If a callback is provided then it is called once the
             *          configuration has been loaded.
             *          - The callback will be passed the configurator object
             *      - If clearBeforeLoad is true, this configurator's configuration
             *          options are cleared before new ones are loaded
             *          - If false, contents are not cleared prior and any colliding
             *               configuration options are overwritten, this is the default.
             */
            this.load = function( callback, clearBeforeLoad ) {
                if ( clearBeforeLoad ) {
                    this.clear();
                }

                _getStoredJSON( function( loadedJSON ) {
                    // Create the parent path
                    var parentPath = that.node.getParentPath(),
                        parentPathLen = parentPath.length;

                    // Find relevant values and set them
                    for ( var jsonKey in loadedJSON ) {
                        if ( loadedJSON.hasOwnProperty( jsonKey ) ) {
                            if ( jsonKey.indexOf( parentPath ) === 0 ) {

                                // Found valid string, set internal value
                                that.set(
                                    jsonKey.substr(
                                        parentPathLen,
                                        jsonKey.length - parentPathLen
                                    ),
                                    loadedJSON[ jsonKey ]
                                );
                            }
                        }
                    }

                    // Call callback if provided
                    if ( callback ) {
                        callback( that );
                    }
                });
            };

            // Load default configuration
            this.update( options.defaultConfiguration );
        };

        return Configurator;
    };
});
