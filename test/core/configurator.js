/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

/***
 * Configurator Test Suite
 *
 * A test suite for the Configurator subsystem.
 */

(function() {

    var engine = null,
        noDBMsg = 'DB access not available. Execute the tests in a server. Navigate into the gladius root directory and run: make test';

    module( 'core/Configurator', {
        setup: function () {
            stop();

            gladius.create( { debug: true, id: window.guid() }, function( instance ) {
                engine = instance;
                start();
            });
        },

        teardown: function () {
            engine = null;
        }
    });

    // Configurator should be automatically created by the Engine
    test( 'Construction', function() {
        expect( 1 );
        
        ok(
            engine.configurator,
            'Engine creates configurator'
        );
    });

    // Test Get/Set
    test( 'Get and set', function() {
        expect( 12 );
        
        var keyVals = [  
            ['/foo/bar/key1',   'val1', 'resetVal1'],
            ['/foo/bar/key2',   'val2', 'resetVal2'],
            ['/key3',           'val3', 'resetVal3'],
            ['/key4',           'val4', 'resetVal4']
        ];
        
        // All keys initially return the empty string
        for ( var i = 0, iMax = keyVals.length; i < iMax; ++ i ) {
            equal(
                engine.configurator.get(keyVals[i][0]),
                '',
                'Key ' + keyVals[i][0] + ' initially set to empty string'
            );
        }
        
        // Set all keys then test
        for ( var i = 0, iMax = keyVals.length; i < iMax; ++ i ) {
            engine.configurator.set( keyVals[i][0], keyVals[i][1] );
            
            var val = engine.configurator.get( keyVals[i][0] );
            
            equal(
                val,
                keyVals[i][1],
                'Value of key ' + keyVals[i][0] + ', expected ' + keyVals[i][1] + ', found ' + val
            );
            
            // Reset values then test
            engine.configurator.set( keyVals[i][0], keyVals[i][2] );
            
            val = engine.configurator.get( keyVals[i][0] );
            
            equal(
                val,
                keyVals[i][2],
                'Value of key ' + keyVals[i][0] + ' reset, expected ' + keyVals[i][2] + ', found ' + val
            );
        }
    });
    
    // Test JSON object loading
    test( 'Update and apply JSON object', function() {
        expect( 2 );
        
        var myJSON = {
            '/foo'      : 'value',
            '/foo/bar'  : 'otherValue'
        };
        
        engine.configurator.update( myJSON );
        
        equal( engine.configurator.get( '/foo' ), 'value', 'Retrieved value ' + myJSON['/foo'] + ' through key /foo' );
        equal( engine.configurator.get( '/foo/bar' ), 'otherValue', 'Retrieved value ' + myJSON['/foo/bar'] + ' through key /foo/bar' );
    });
    
    // Test default configuration loading
    test( 'Default configuration loading', function() {
        expect( 7 );
        
        var defaultConfig = {
            '/'             :   'firstVal',
            '/foo'          :   'secondVal',
            '/foo/bar'      :   'thirdVal',
            '/hello'        :   'fourthVal',
            '/hello/world'  :   'fifthVal',
            '/hello/world2' :   'sixthVal'
        },

        config = engine.configurator.create( { configuration: defaultConfig } );

        for ( var key in defaultConfig ) {
            if ( defaultConfig.hasOwnProperty( key ) ) {
                var val = config.get( key );
                equal( val, defaultConfig[key], 'Retrieve default configuration value, expected ' + defaultConfig[key] + ', found ' + val + ', through key ' + key);
            }
        }

        // Test that default.js is being loaded.
        notEqual( config.get( config.KEY_GAME_ID ), '', 'game id should not be empty' );
    });
    
    // Test getPath
    test( 'getPath and separator apprehension', function() {
        expect( 21 );

        var rootConfig = engine.configurator.create(),
            childConfigs = [],
            vals = [
                'first_val',
                'second_val',
                'third_val',
                'fourth_val',
                'fifth_val',
                'sixth_val'
            ];
        
        childConfigs.push( engine.configurator.getPath( '/foo' ) );
        childConfigs.push( engine.configurator.getPath( '/foo/bar' ) );
        
        equal( engine.configurator.get( '/foo' ), '', '/foo value through engine conf should be empty string' )
        equal( engine.configurator.get( '/foo/bar' ), '', '/foo/bar value through engine conf should be empty string' )
        equal( rootConfig.get( '/foo' ), '', '/foo value through new root conf should be empty string' )
        equal( rootConfig.get( '/foo/bar' ), '', '/foo/bar value through new root conf should be empty string' )
        equal( childConfigs[0].get( '/' ), '', '/ value through new /foo conf should be empty string' )
        equal( childConfigs[1].get( '/' ), '', '/ value through new /foo/bar conf should be empty string' )

        // We will test Configurator's ability to read and write through the
        // engine configurator, getPath() configurators and
        // engine.configurator.create() configurators

        // Set through engine configurator
        engine.configurator.set( '/foo', vals[0] );
        equal( rootConfig.get( '/foo' ), vals[0], 'Read value from /foo through root conf set through /foo in engine conf' );
        equal( childConfigs[0].get( '/' ), vals[0], 'Read value from / through /foo conf set through /foo in engine configurator' );

        // Set through engine configurator
        engine.configurator.set( '/foo/bar', vals[4] );
        equal( rootConfig.get( '/foo/bar' ), vals[4], 'Read value from /foo/bar through root conf set through /foo/bar in engine conf' );
        equal( childConfigs[1].get( '/' ), vals[4], 'Read value from / through /foo/bar conf set through /foo/bar in engine conf' );

        // Set through first child configurator
        childConfigs[0].set( '/bar', vals[1]);
        equal( rootConfig.get( '/foo/bar' ), vals[1], 'Read value from /foo/bar through root conf set through /bar in /foo conf' );
        equal( engine.configurator.get( '/foo/bar' ), vals[1], 'Read value from /foo/bar through engine conf set through /bar in /foo conf' );
        equal( childConfigs[1].get( '/' ), vals[1], 'Read value from / through /foo/bar conf set through /bar in /foo conf' );

        // Set through second child configurator
        childConfigs[1].set( '/', vals[2] )
        equal( rootConfig.get( '/foo/bar' ), vals[2], 'Read value from /foo/bar through root conf set through / in /foo/bar conf' );
        equal( engine.configurator.get( '/foo/bar' ), vals[2], 'Read value from /foo/bar through engine conf set through / in /foo/bar conf' );
        equal( childConfigs[0].get( '/bar' ), vals[2], 'Read value from /bar through /foo conf set through / in /foo/bar conf' );

        // Set through first child configurator
        childConfigs[0].set( '/', vals[3] );
        equal( rootConfig.get( '/foo' ), vals[3], 'Read value from /foo through root conf set through / in /foo conf' );
        equal( engine.configurator.get( '/foo' ), vals[3], 'Read value from /foo through engine conf set through / in /foo conf' );

        // Set through engine.configurator.create() constructed instance
        rootConfig.set( '/foo/bar', vals[5] );
        equal( engine.configurator.get( '/foo/bar' ), vals[5], 'Read value from /foo/bar through engine conf set through /foo/bar in root conf' );
        equal( childConfigs[0].get( '/bar' ), vals[5], 'Read value from /bar through /foo conf set through /foo/bar in root conf' );
        equal( childConfigs[1].get( '/' ), vals[5], 'Read value from / through /foo/bar conf set through /foo/bar in root conf' );
    });
    
    // Test listen/ignore
    test( 'Listen/ignore', function() {
        expect( 5 );
        
        // Test listen on creation -- listen-able path
        var testKey1 = '/listener/should/get/called',
            testKey2 = '/listener/should',
            testKey3 = '/listener',
            childConfig = engine.configurator.getPath( '/listener/should', function( path ) {
                var myTestKey = '/get/called';
                equal( path, myTestKey, '/listener/should listener found ' + path + ', expected ' + myTestKey );
                start();
            });
        stop();
        engine.configurator.set( testKey1, 'ALERT!' );
        
        // try again at /listener/should level
        childConfig.listen( function( path ) {
            var myTestKey = '/';
            equal( path, myTestKey, '/listener/should bound listener found ' + path + ', expected ' + myTestKey );
            start();
        });
        stop();
        engine.configurator.set( testKey2, 'ALERT!' );
        
        // ignored path
        childConfig.listen( function( path ) {
            ok( false, 'Listener called unexpectedly, received path ' + path );
        });
        engine.configurator.set( testKey3, 'NoOneShouldCareThatIWasSet:) -- 1' );
        
        // Test ignore after listen on creation
        childConfig.ignore();
        
        childConfig = engine.configurator.getPath( testKey2, function( path ) {
            ok( false, 'Ignored listener called incorrectly, received path ' + path );
        });
        childConfig.ignore();
        engine.configurator.set( testKey1, 'NoOneShouldCareThatIWasSet:) -- 2' );

        // Test listen post-creation
        childConfig.listen( function( path ) {
            var myTestKey = '/get/called';
            equal( path, myTestKey, 'Child-bound listener found ' + path + ', expected ' + myTestKey );
            start();
        });
        stop();
        engine.configurator.set( testKey1, 'ALERT!' );

        // Test ignore after listen post-creation
        childConfig.listen( function( path ) {
            ok( false, 'Ignored listener called incorrectly, received path ' + path );
        });
        childConfig.ignore()
        engine.configurator.set( testKey1, 'NoOneShouldCareThatIWasSet:) -- 3' );

        // Test that ignore will ignore the correct listener
        childConfig.listen( function( path ) {
            var myTestKey = '/get/called';
            equal( path, myTestKey, 'Child-bound listener found ' + path + ', expected ' + myTestKey );
            start();
        });

        var otherConfig = engine.configurator.getPath( testKey2, function( path ) {
                var myTestKey = '/get/called';
                equal( path, myTestKey, 'Child-bound listener found ' + path + ', expected ' + myTestKey );
                start();
            }),

            ignoredConfig = engine.configurator.getPath( testKey2, function( path ) {
                ok( false, 'Ignored listener called incorrectly, received path ' + path );
            });
        ignoredConfig.ignore();
        stop();
        stop();
        engine.configurator.set( testKey1, 'Listeners_0_and_1_should_care_that_I_was_set,_2_should_not' );
    });

    // Test getJSON
    test( 'getJSON', function() {
        expect( 5 );

        var config = engine.configurator.getPath( '/_getjson_test/');

        if ( !Object.keys ) {
            Object.keys = function( o ) {
                rv = Array();

                for ( var key in o ) {
                    if ( o.hasOwnProperty( key ) ) {
                        rv.push( key );
                    }
                }

                return rv;
            }
        }

        var json = config.getJSON();
        var jsonKeys = Object.keys( json );
        equal( 0, jsonKeys.length, 'JSON representation of configuration should be empty' );

        var jsonExpected = {
            '/foo/'         : 'fooVal',
            '/foo/bar1/'    : 'bar1Val',
            '/foo/bar2/'    : 'bar2Val',
            '/hello/'       : 'helloVal'
        };
        var expectedKeys = Object.keys( jsonExpected );
        for ( var i = 0, maxlen = expectedKeys.length; i < maxlen; ++i ) {
            config.set( expectedKeys[i], jsonExpected[expectedKeys[i]] );
        }
        var jsonActual = config.getJSON();
        for ( var i = 0, maxlen = expectedKeys.length; i < maxlen; ++i ) {
            equal(
                jsonActual[expectedKeys[i]],
                jsonExpected[expectedKeys[i]],
                'JSON representation of configuration should match expected JSON object, testing key: ' + expectedKeys[i] + ' expected: ' + jsonExpected[expectedKeys[i]] + ' got: ' + jsonActual[expectedKeys[i]]
            );
        }
    });

    // Test clear
    test( 'clear', function() {
        expect( 15 );

        var config = engine.configurator.getPath( '/_clear_test/' ),
            key1 = '/foo/bar',
            key2 = '/foo/bar2',
            key3 = '/',
            val1 = 'val1',
            val2 = 'val2',
            val3 = 'val3';

        var msg = function( key ) { return 'Initial value for key ' + key + ' should be empty' };
        equal( config.get( key1 ), '', msg( key1 ) );
        equal( config.get( key2 ), '', msg( key2 ) );
        equal( config.get( key3 ), '', msg( key3 ) );

        config.set( key1, val1 );
        config.set( key2, val2 );
        config.set( key3, val3 );

        msg = function( key, val ) { return 'Post-set, value for ' + key + ' should be ' + val };
        equal( config.get( key1 ), val1, msg( key1, val1 ) );
        equal( config.get( key2 ), val2, msg( key2, val2 ) );
        equal( config.get( key3 ), val3, msg( key3, val3 ) );

        config.clear();

        msg = function( key ) { return 'Post-clear, value for ' + key + ' should be empty' };
        equal( config.get( key1 ), '', msg( key1 ) );
        equal( config.get( key2 ), '', msg( key2 ) );
        equal( config.get( key3 ), '', msg( key3 ) );

        // Ensure that clearing deeper elements doesn't affect parent elements
        config.set( key1, val1 );
        config.set( key2, val2 );
        config.set( key3, val3 );

        msg = function( key, val ) { return 'Reset elements, value for ' + key + ' should be ' + val };
        equal( config.get( key1 ), val1, msg( key1, val1 ) );
        equal( config.get( key2 ), val2, msg( key2, val2 ) );
        equal( config.get( key3 ), val3, msg( key3, val3 ) );

        var config2 = config.getPath( '/foo' );
        config2.clear();

        msg = function( key, val ) { return 'Cleared /foo branch, value for key ' + key + ' should be ' + ( val ? val : 'empty' )};
        equal( config.get( key1 ), '', msg( key1, '' ) );
        equal( config.get( key2 ), '', msg( key2, '' ) );
        equal( config.get( key3 ), val3, msg( key3, val3 ) );
    });

    // Testing the case where a db is not available, this test simulates an
    // environment where db access is not available
    test( "no db environment", function() {
        expect( 4 );

        // Save current db accessor then step on it
        var oldOpen = window.indexedDB.open;
        window.indexedDB.open = function() {
            throw "For the purposes of testing, window.indexedDB.open has been stepped on and now throws this exception";
        };

        try {
            window.indexedDB.open( '__test_db_name__9c8a4f3b-42b7-4aed-be48-772f0e1c61b4__' );
            ok( false, 'window.indexedDB.open should have produced an exception but it did not!' );
        } catch ( e ) {
            ok( true, 'window.indexedDB.open produced an exception as expected' );
        }

        stop();
        // Create a new gladius instance under these conditions, configurator should not be able to open a db
        gladius.create( { debug: true, id: engine.id }, function( instance ) {
            start();

            equal( instance.configurator.canUseDB, false, 'Configurator canUseDB should be false' );

            // Ensure that calling load/store will cause error callbacks to be called
            var getErrorback = function ( funcName ) {
                    return function( errorMsg ) {
                        start();
                        ok( true, 'Error callback was called as expected for ' + funcName );
                    };
                },
                getCallback = function ( funcName ) {
                    return function( event ) {
                        start();
                        ok( false, 'Callback was called unexpectedly for ' + funcName );
                    };
                },

                loadError = getErrorback( 'load()' ),
                loadCallback = getCallback( 'load()' ),
                storeError = getErrorback( 'store()' ),
                storeCallback = getCallback( 'store()' );

            stop();
            instance.configurator.load( {
                callback: loadCallback,
                error: loadError
            });

            stop();
            instance.configurator.store( {
                callback: storeCallback,
                error: storeError
            });

            // Bring back the old open
            window.indexedDB.open = oldOpen;
        });
    });

    // Test load/store to/from local storage
    test( 'local store/load', function() {
        // Do not perform these tests if db access is not available
        if ( !engine.configurator.canUseDB ) {
            ok( false, noDBMsg );
            return;
        }

        expect( 40 );

        var testPath = '/_localstoreload_test/',
            config = engine.configurator.getPath( testPath ),
            key1 = '/foo/bar',
            key2 = '/foo/bar2',
            key3 = '/',
            key4 = '/other',
            val1 = 'val1',
            val2 = 'val2',
            val3 = 'val3',
            val4 = 'val4';

        // Clear keys
        stop();
        config.load( {
            error: function( msg ) {
                ok( false, 'Load errored out unexpectedly, msg: ' + msg );
                start();
            },
            callback: function() {
                config.clear();
                config.store( {
                    error: function ( msg ) {
                        ok( false, 'Store errored out unexpectedly, msg: ' + msg );
                        start();
                    },
                    callback: function() {
                        start();

                        var msg = function( key ) { return 'Initial value for key ' + key + ' should be empty' };
                        equal( config.get( key1 ), '', msg( key1 ) );
                        equal( config.get( key2 ), '', msg( key2 ) );
                        equal( config.get( key3 ), '', msg( key3 ) );

                        config.set( key1, val1 );
                        config.set( key2, val2 );
                        config.set( key3, val3 );

                        msg = function( key, val ) { return 'Post-set, value for key ' + key + ' should be ' + val };
                        equal( config.get( key1 ), val1, msg( key1, val1 ) );
                        equal( config.get( key2 ), val2, msg( key2, val2 ) );
                        equal( config.get( key3 ), val3, msg( key3, val3 ) );

                        stop();
                        config.store( {
                            error: function ( msg ) {
                                ok( false, 'Store errored out unexpectedly, msg: ' + msg );
                                start();
                            },
                            callback: function() {
                                config.clear();
                                start();

                                msg = function( key ) { return 'Post-store-and-clear, value for key ' + key + ' should be empty'}
                                equal( config.get( key1 ), '', msg( key1 ) );
                                equal( config.get( key2 ), '', msg( key2 ) );
                                equal( config.get( key3 ), '', msg( key3 ) );

                                // Load values back then test
                                config.set( key4, val4 );

                                equal( config.get( key4 ), val4, 'Set prior to destructive load, value for key ' + key4 + ' should be ' + val4 );
                                stop();
                                config.load( {
                                    clear: true,
                                    error: function( msg ) {
                                        ok( false, 'Load errored out unexpectedly, msg: ' + msg );
                                        start();
                                    },
                                    callback: function() {
                                        start();

                                        equal( config.get( key4 ), '', 'Post-destructive-load, value for key ' + key4 + ' should be empty' );

                                        msg = function( key, val ) { return 'Post-destructive-load, value for key ' + key + ' should be ' + val };
                                        equal( config.get( key1 ), val1, msg( key1, val1 ) );
                                        equal( config.get( key2 ), val2, msg( key2, val2 ) );
                                        equal( config.get( key3 ), val3, msg( key3, val3 ) );

                                        // Now load values non-destructively
                                        config.clear();

                                        msg = function( key ) { return 'Post-clear, value for key ' + key + ' should be empty' };
                                        equal( config.get( key1 ), '', msg( key1 ) );
                                        equal( config.get( key2 ), '', msg( key2 ) );
                                        equal( config.get( key3 ), '', msg( key3 ) );
                                        equal( config.get( key4 ), '', msg( key4 ) );

                                        config.set( key4, val4 );
                                        equal( config.get( key4 ), val4, 'Set prior to non-destructive load, value for key ' + key4 + ' should be ' + val4 );

                                        stop();
                                        config.load( {
                                            error: function( msg ) {
                                                ok( false, 'Load errored out unexpectedly, msg: ' + msg );
                                                start();
                                            },
                                            callback: function() {
                                                start();

                                                equal( config.get( key4 ), val4, 'Post-non-destructive-load, value for key ' + key4 + ' should have persisted to be ' + val4 );

                                                msg = function( key, val ) { return 'Post-non-destructive-load, value for key ' + key + ' should be ' + val };
                                                equal( config.get( key1 ), val1, msg( key1, val1 ) );
                                                equal( config.get( key2 ), val2, msg( key2, val2 ) );
                                                equal( config.get( key3 ), val3, msg( key3, val3 ) );

                                                // Now attempt to load from second engine instance
                                                stop();

                                                var engine2 = null, config2 = null;
                                                gladius.create( { debug: true, id: engine.id }, function( instance ) {
                                                    engine2 = instance;
                                                    config2 = engine2.configurator.getPath( testPath );
                                                    start();

                                                    msg = function( key, val ) { return 'Created gladius2, initial value for key ' + key + ' should be ' + val };
                                                    equal( config2.get( key1 ), val1, msg( key1, val1 ) );
                                                    equal( config2.get( key2 ), val2, msg( key2, val2 ) );
                                                    equal( config2.get( key3 ), val3, msg( key3, val3 ) );

                                                    engine2 = null;
                                                    config2 = null;

                                                    // Now test that local storage can be overwritten
                                                    equal( config.get( key2 ), val2, 'Back to gladius1, value for key ' + key2 + ' should be ' + val2 );

                                                    config.set( key2, val3 );

                                                    equal( config.get( key2 ), val3, 'Value updated prior to local storage overwrite, value for key ' + key2 + ' should be ' + val3 );
                                                    stop();
                                                    config.store( {
                                                        error: function ( msg ) {
                                                            ok( false, 'Store errored out unexpectedly, msg: ' + msg );
                                                            start();
                                                        },
                                                        callback: function() {
                                                            start();
                                                            config.clear();

                                                            msg = function( key ) { return 'Post-local-storage-overwrite-and-clear, value for key ' + key + ' should be empty' };
                                                            equal( config.get( key1 ), '', msg( key1 ) );
                                                            equal( config.get( key2 ), '', msg( key2 ) );
                                                            equal( config.get( key3 ), '', msg( key3 ) );

                                                            stop();
                                                            config.load( {
                                                                error: function( msg ) {
                                                                    ok( false, 'Load errored out unexpectedly, msg: ' + msg );
                                                                    start();
                                                                },
                                                                callback: function() {
                                                                    start();

                                                                    msg = function( key, val ) { return 'Post-load, value for key ' + key + ' should be ' + val };
                                                                    equal( config.get( key1 ), val1, msg( key1, val1 ) );
                                                                    equal( config.get( key2 ), val3, msg( key2, val3 ) );
                                                                    equal( config.get( key3 ), val3, msg( key3, val3 ) );

                                                                    // Test that parent element values aren't affected by deeper element loads
                                                                    var config3 = config.getPath( key2 );
                                                                    config.clear();

                                                                    msg = function( key ) { return 'Post-clear, value for key ' + key + ' should be empty' }
                                                                    equal( config.get( key1 ), '', msg( key1 ) );
                                                                    equal( config.get( key2 ), '', msg( key2 ) );
                                                                    equal( config.get( key3 ), '', msg( key3 ) );

                                                                    stop();
                                                                    config3.load( {
                                                                        error: function( msg ) {
                                                                            ok( false, 'Load errored out unexpectedly, msg: ' + msg );
                                                                            start();
                                                                        },
                                                                        callback: function() {
                                                                            start();

                                                                            msg = function( key, val ) { return 'Post-load-through-conf-rooted-at ' + key2 + ', value for key ' + key + ' should be ' + ( val ? val : 'empty' ) };
                                                                            equal( config.get( key1 ), '', msg( key1, '' ) );
                                                                            equal( config.get( key2 ), val3, msg( key2, val3 ) );
                                                                            equal( config.get( key3 ), '', msg( key3, '' ) );
                                                                        }
                                                                    } );
                                                                }
                                                            } );
                                                        }
                                                    } );
                                                });
                                            }
                                        } );
                                    }
                                } );
                            }
                        } );
                    }
                } );
            }
        });
    });

    // Store preserves unaffected config data
    test( 'merge store', function() {
        // Do not perform these tests if db access is not available
        if ( !engine.configurator.canUseDB ) {
            ok( false, noDBMsg );
            return;
        }

        expect( 12 );

        var testPath = '/_mergestore_test/',
            config = engine.configurator.getPath( testPath ),
            key1 = '/foo/fixed',
            key2 = '/foo/volatile',
            key3 = '/foo/volatile/key1',
            val1 = 'val1',
            val2 = 'val2',
            val3 = 'val3';

        // Clear keys
        stop();
        config.load( {
            error: function( msg ) {
                ok( false, 'Load errored out unexpectedly, msg: ' + msg );
                start();
            },
            callback: function() {
                config.clear();
                config.store( {
                    error: function ( msg ) {
                        ok( false, 'Store errored out unexpectedly, msg: ' + msg );
                        start();
                    },
                    callback: function() {
                        start();

                        var msg = function( key ) { return 'Initial value for key ' + key + ' should be empty' };
                        equal( config.get( key1 ), '', msg( key1 ) );
                        equal( config.get( key2 ), '', msg( key2 ) );
                        equal( config.get( key3 ), '', msg( key3 ) );

                        config.set( key1, val1 );
                        config.set( key2, val2 );
                        config.set( key3, val3 );

                        msg = function( key, val ) { return 'Post-set, value for key ' + key + ' should be ' + val };
                        equal( config.get( key1 ), val1, msg( key1, val1 ) );
                        equal( config.get( key2 ), val2, msg( key2, val2 ) );
                        equal( config.get( key3 ), val3, msg( key3, val3 ) );

                        stop();
                        config.store( {
                            error: function ( msg ) {
                                ok( false, 'Store errored out unexpectedly, msg: ' + msg );
                                start();
                            },
                            callback: function() {
                                config.load( {
                                    clear: true,
                                    error: function( msg ) {
                                        ok( false, 'Load errored out unexpectedly, msg: ' + msg );
                                        start();
                                    },
                                    callback: function() {
                                        start();

                                        equal( config.get( key1 ), val1, 'Post-store-and-destructive-load, value for key ' + key1 + ' should be ' + val1 );
                                        var volatileConfig = config.getPath( key2 ),
                                            key4 = '/',
                                            key5 = '/key1',
                                            val4 = 'val4',
                                            val5 = 'val5';
                                        volatileConfig.set( key4, val4 );
                                        volatileConfig.set( key5, val5 );

                                        msg = function( key, val ) { return 'Created volatile conf at path ' + key2 + ', value for key ' + key + ' set through volatile conf should be ' + val };
                                        equal( volatileConfig.get( key4 ), val4, msg( key4, val4 ) );
                                        equal( volatileConfig.get( key5 ), val5, msg( key5, val5 ) );

                                        stop();
                                        volatileConfig.store( {
                                            error: function ( msg ) {
                                                ok( false, 'Store errored out unexpectedly, msg: ' + msg );
                                                start();
                                            },
                                            callback: function() {
                                                config.load( {
                                                    clear: true,
                                                    error: function( msg ) {
                                                        ok( false, 'Load errored out unexpectedly, msg: ' + msg );
                                                        start();
                                                    },
                                                    callback: function() {
                                                        start();

                                                        msg = function( key, val ) { return 'Post-store-through-volatile-conf-and-load-through-conf, value for key ' + key + ' retrieved through conf should be ' + val}
                                                        equal( config.get( key1 ), val1, msg( key1, val1 ) );
                                                        equal( config.get( key2 ), val4, msg( key2, val4 ) );
                                                        equal( config.get( key3 ), val5, msg( key3, val5 ) );
                                                    }
                                                } );
                                            }
                                        } );
                                    }
                                } );
                            }
                        } );
                    }
                } );
            }
        } );
    });
}());
