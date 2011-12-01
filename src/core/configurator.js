/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */


define( function ( require ) {

    require( './lang' );
    var ConfNode = require( './configurator/confnode' ),

    /* Configurator
     *
     * Loads and stores configuration data. Allows external code to listen for
     * changes in configuration subtrees.
     *
     * In Gladius, a configurator can be obtained in 3 ways.
     */
    Configurator = function( options ) {

        options = options || {};

        // Options
        var configuration           = options.configuration || {},
            logger                  = options.logger || function() {},

            // Should dbVersion be picked up from default.js too?
            dbVersion               = '0.01',
            dbName                  = 'Gladius_Configurator',
            objectStoreName         = 'StoredConfigurations',

        // Instance Variables
            that = this,
            canUseDB = true,
            rootConf = options.rootConf,

            // DB opening modes
            DB_READ_ONLY = 0,
            DB_READ_WRITE = 1,

            _injectDB = function( dbConsumer ) {
                // At the moment, indexedDB.open() fails on locally hosted pages on firefox
                // Use python -m SimpleHTTPServer 8000
                var req = indexedDB.open( dbName );

                req.onsuccess = function( event ) {
                    dbConsumer( req.result );
                };

                req.onerror = function( event ) {
                    dbConsumer();
                };
            },

            _ensureObjectStore = function( db, payload ) {
                if ( !db ) {
                    logger( "Gladius/Configurator-_ensureObjectStore: passed empty db value! Aborting.");
                    return;
                }

                var containsObjectStore = db.objectStoreNames.contains( objectStoreName ),
                    onerror = function( event ) {
                        logger( 'Gladius/Configurator-_ensureObjectStore: encountered error! Aborting.');
                    },

                    createObjectStore = function() {
                        var versionRequest = db.setVersion( dbVersion );
                        versionRequest.onerror = onerror;
                        versionRequest.onsuccess = function( event ) {
                            db.createObjectStore( objectStoreName );

                            payload();
                        };
                    };

                // If we don't have requisite object store, create it
                if ( containsObjectStore && db.version === dbVersion ) {
                    payload();
                } else {
                    // Downgrade db version if required
                    if ( db.version === '' ) {
                        createObjectStore();
                    } else {
                        var versionRequest = db.setVersion( '' );
                        versionRequest.onerror = onerror;
                        versionRequest.onsuccess = function( event ) {
                            // Delete object store if it's around
                            if ( containsObjectStore ) {
                                db.deleteObjectStore( objectStoreName );
                            }
                            createObjectStore();
                        };
                    }
                }
            },

            _injectObjectStore = function( mode, objectStoreConsumer ) {
                _injectDB( function( db ) {
                    _ensureObjectStore( db, function() {
                        objectStoreConsumer( db.transaction(
                                [objectStoreName],
                                mode == DB_READ_ONLY ?  IDBTransaction.READ_ONLY :
                                                        IDBTransaction.READ_WRITE
                            ).objectStore( objectStoreName )
                        );
                    });
                });
            },

            _getStoredJSON = function( jsonConsumer ) {
                _injectObjectStore( DB_READ_ONLY, function( objectStore ) {
                    var onerror = function( event ) {
                        jsonConsumer( {} );
                    };

                    if ( objectStore ) {
                        // Does objectStore have entry for this gameID?
                        var req = objectStore.get( rootConf.get( '/gladius/gameID' ) );
                        req.onsuccess = function( event ) {
                            // Did we find a value?
                            var result = req.result;
                            if ( result ) {
                                jsonConsumer( JSON.parse( unescape( result ) ) );
                            } else {
                                onerror();
                            }
                        };

                        // If not, give out empty json
                        req.onerror = onerror;
                    } else {
                        onerror();
                    }
                } );
            },

            _storeJSON = function( json, resultConsumer ) {
                _injectObjectStore( DB_READ_WRITE, function( objectStore ) {
                    var onerror = function( event ) {
                        resultConsumer( false );
                    };

                    if ( objectStore ) {
                        var req = objectStore.put(
                            escape( JSON.stringify( json ) ),
                            rootConf.get( '/gladius/gameID' )
                        );

                        req.onsuccess = function( event ) {
                            resultConsumer( true );
                        };

                        req.onerror = onerror;
                    } else {
                        onerror();
                    }
                } );
            };

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

        // Create a new configurator tied to the root node
        this.create = function( options ) {
            options = options || {};
            options.rootConf = options.rootConf || rootConf;
            return new Configurator( options );
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
                resultConf = this.create();

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
         * Returns a JSON representation of this configurator instance.
         */
        this.getJSON = function() {
            return this.node.getJSON();
        };

        /**
         * clear()
         * Recursively clears all configuration options.
         */
        this.clear = function() {
            this.node.clear();
        };

        /**
         * store( parameters )
         *
         *  Stores configuration options to local storage.
         *  Accepts an options object with named parameters.
         *
         *  Parameters:
         *  callback    <function>( configurator )
         *              If a callback is provided then it is called once the
         *              configuration has been stored. The callback function
         *              will be passed the configurator object.
         */
        this.store = function( parameters ) {

            var callback = parameters && parameters.callback,
                targetJSON = {},
                myJSON = this.getJSON(),
                parentPath = this.node.getParentPath(),
                targetStr = null;

            if ( canUseDB ) {
                for ( var jsonKey in myJSON ) {
                    if ( myJSON.hasOwnProperty( jsonKey ) ) {
                        targetJSON[parentPath + jsonKey] = myJSON[jsonKey];
                    }
                }

                // Load existing myJSON and merge/filter
                _getStoredJSON( function( json ) {
                    var jsonKeys = Object.keys( json );

                    // Log result of load
                    if ( jsonKeys.length === 0 ) {
                        logger( 'Gladius/Configurator-store: DB load failed or found no record, parent path: ' + that.node.getParentPath() + '/' );
                    }

                    for ( var i = 0, maxlen = jsonKeys.length; i < maxlen; ++i ) {
                        var loadedJSONKey = jsonKeys[i];
                        if ( loadedJSONKey.indexOf( parentPath ) !== 0 ) {
                            targetJSON[loadedJSONKey] = json[loadedJSONKey];
                        }
                    }

                    // Store
                    _storeJSON( targetJSON, function( storeResult ) {
                        // Log result of store
                        if ( !storeResult ) {
                            logger( 'Gladius/Configurator-store: DB write failed, parent path: ' + that.node.getParentPath() + '/' );
                        }

                        if ( callback ) {
                            callback( that );
                        }
                    });
                });
            } else {
                logger( "gladius/Configurator-store: DB access not available, did not store" );
                if ( callback ) {
                    callback( that );
                }
            }
        };

        /**
         * load( parameters )
         *
         *  Loads registry from local storage ( IndexedDB ). Accepts a
         *  parameters object.
         *
         *  Parameters:
         *  callback:   <function>( configurator )
         *              If a callback is provided then it is called once the
         *              configuration has been loaded. The callback will be
         *              passed the configurator object.
         *
         *  clear:      <boolean>
         *              If clear is true, this configurator's configuration
         *              options are cleared before new ones are loaded.
         *              If false, contents are not cleared prior and any
         *              colliding configuration options are overwritten,
         *              this is the default.
         */
        this.load = function( parameters ) {
            var callback = parameters && parameters.callback,
                clear = parameters && parameters.clear;

            if ( clear ) {
                this.clear();
            }

            if ( canUseDB ) {
                _getStoredJSON( function( json ) {
                    // Create the parent path
                    var parentPath = that.node.getParentPath(),
                        parentPathLen = parentPath.length;

                    // Log result of load
                    if ( Object.keys( json ).length === 0 ) {
                        logger( 'Gladius/Configurator-load: DB load failed or found no record, parent path: ' + that.node.getParentPath() + '/' );
                    }

                    // Find relevant values and set them
                    for ( var jsonKey in json ) {
                        if ( json.hasOwnProperty( jsonKey ) ) {
                            if ( jsonKey.indexOf( parentPath ) === 0 ) {

                                // Found valid string, set internal value
                                that.set(
                                    jsonKey.substr(
                                        parentPathLen,
                                        jsonKey.length - parentPathLen
                                    ),
                                    json[ jsonKey ]
                                );
                            }
                        }
                    }

                    // Call callback if provided
                    if ( callback ) {
                        callback( that );
                    }
                });
            } else {
                logger( "gladius/Configurator-load: DB access not available, did not load" );
                if ( callback ) {
                    callback( that );
                }
            }
        };

        // Returns true if db access is available
        Object.defineProperty( this, 'canUseDB', {
            get: function() {
                return canUseDB;
            }
        });

        // If we are the root conf then we need to do some testing
        if ( !rootConf ) {
            rootConf = this;
            this.node = new ConfNode( 'ROOT' );

            // Test IndexedDB availability
            try {
                window.indexedDB.open( '__test_db_name__9c8a4f3b-42b7-4aed-be48-772f0e1c61b4__' );
            } catch( e ) {
                canUseDB = false;
            }
        } else {
            this.node = rootConf.node;
            canUseDB = rootConf.canUseDB;
        }

        this.id = window.guid();

        // Load incoming configuration
        this.update( options.configuration );
    };

    // Taken from Mozilla's docs
    // https://developer.mozilla.org/en/IndexedDB/IDBDatabase
    // Taking care of the browser-specific prefixes.
    if ( !window.indexedDB ) {
        if ('webkitIndexedDB' in window) {
           window.indexedDB = window.webkitIndexedDB;
           window.IDBTransaction = window.webkitIDBTransaction;
        } else if ('mozIndexedDB' in window) {
           window.indexedDB = window.mozIndexedDB;
        }
    }

    return Configurator;
});
