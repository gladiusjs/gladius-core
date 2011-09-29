/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'Configurator', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
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
    
    // Test default configuration loading
    test( 'Default configuration loading', function() {
        var defaultConfig = {
            '/'             :   'firstVal',
            '/foo'          :   'secondVal',
            '/foo/bar'      :   'thirdVal',
            '/hello'        :   'fourthVal',
            '/hello/world'  :   'fifthVal',
            '/hello/world2' :   'sixthVal'
        };
        
        // didn't use Object.keys, not sure which browsers implement it
        var keys = [];
        for ( var p in defaultConfig ) {
            if ( defaultConfig.hasOwnProperty( p )) {
                keys.push(p);
            }
        }
        
        expect( keys.length );
        
        // For now assuming that Configurator() is accessible
        var config = new Configurator( defaultConfig );
        
        for ( var key in keys ) {
            var val = config.get( key );
            equal( defaultConfig[key], val, 'Retrieve default configuration value, expected ' + defaultConfig[key] + ', found ' + val + ', through key ' + key);
        }
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
        for ( var i = 0; i < keyVals.length; ++ i ) {
            equal(
                engine.configurator.get(keyVals[i][0]),
                '',
                'Key ' + keyVals[i][0] + ' initially set to empty string'
            );
        }
        
        // Set all keys then test
        for ( var i = 0; i < keyVals.length; ++ i ) {
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
    
    // Test getPath
    test( 'getPath and separator apprehension', function() {
        
        var childConfigs = [];
        
        childConfigs.push( engine.configurator.getPath( '/foo' ) );
        childConfigs.push( engine.configurator.getPath( '/foo/bar' ) );
        
        expect( 10 );
        
        equal( engine.configurator.get( '/foo' ), '' )
        equal( engine.configurator.get( '/foo/bar' ), '' )
        equal( childConfigs[0].get( '/' ), '' )
        equal( childConfigs[1].get( '/' ), '' )
        
        // Set through engine configurator to first child
        var first_val = 'first_val';
        engine.configurator.set( '/foo', first_val );
        equal( first_val, childConfigs[0].get( '/' ), 'Read value from first child configurator set through engine configurator' );
        
        // Set through engine configurator to second child
        var fifth_val = 'fifth_val';
        engine.configurator.set( '/foo/bar', fifth_val );
        equal( fifth_val, childConfigs[1].get( '/' ), 'Read value from second child configurator set through engine configurator' );
        
        // Set through first child configurator
        var second_val = 'second_val';
        childConfigs[0].set( '/bar', second_val)
        equal( second_val, childConfigs[1].get( '/' ), 'Read value from second child configurator set through first child configurator' );
        
        // Set through second child configurator
        var third_val = 'third_val';
        childConfigs[1].set( '/', third_val )
        equal( third_val, childConfigs[0].get( '/bar' ), 'Read value from first child configurator set through second child configurator' );
        equal( third_val, engine.configurator.get( '/foo/bar' ), 'Read value from engine configurator set through second child configurator' );
        
        // Set through first child configurator
        var fourth_val = 'fourth_val';
        childConfigs[0].set( '/', fourth_val );
        equal( fourth_val, engine.configurator.get( '/foo', fourth_val ), 'Read value from engine configurator set through first child configurator' );
    });
    
    // Test listen/ignore
    test( 'Listen/ignore', function() {
        // Test listen on creation -- listen-able path
        var testKey1 = '/listener/should/get/called';
        var childConfig = engine.configurator.getPath( '/listener/should', function( path ) {
            var myTestKey = '/get/called';
            equal( myTestKey, path, 'Root-bound listener found ' + path + ', expected ' + myTestKey);
            start();
        });
        stop();
        engine.configurator.set( testKey1, 'ALERT!' );
        
        // ignored path
        var testKey2 = '/listener';
        engine.configurator.set( testKey2, 'IF_YOU_SEE_ME_THEN_SOMETHING_BROKE' );
        
        
        // NON WORKING CODE
        // Test ignore after listen on creation
        var testKey2 = '/listener/should/not/get/called';
        childConfig.ignore();
        
        childConfig = engine.configurator.getPath( '/', function( path ) {
            ok(false, 'Ignored listener called incorrectly')
        });
        childConfig.ignore();
        engine.configurator.set( testKey2, 'BAR' );
        
        
    });
    // Test load
    // Test store
}());
