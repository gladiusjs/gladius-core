/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global module: false, gladius: false, stop: false, start: false,
  expect: false, asyncTest: false, ok: false, deepEqual: false, equal: false */

(function() {
    var engine = null;


    module('core/Cache', {

        setup : function() {
            stop();

            gladius.create({
                debug : true
            }, function(instance) {
                engine = instance;
                start();
            });
        },
        teardown : function() {
            engine = null;
        }
    });
    
    test( 'Construction', function() {
        expect( 2 );
        
        var cache = new engine.base.cache.Cache();
        ok( cache, 'can construct a simple cache' );
        equal( cache.size, 0, 'cache is initially empty' );
    });

    test( 'Add and clear', function() {
        expect( 6 );
        
        var testKey1 = 'http://www.example1.com/test',
            testKey2 = 'http://www.example2.com/test',
            testValue1 = 'Example content!',
            testValue2 = 'Example content@',
            testTag = 'TEST';

        var cache = new engine.base.cache.Cache();

        cache.add({
            tag: testTag,
            key: testKey1,
            value: testValue1
        });
        
        cache.add({
            tag: testTag,
            key: testKey2,
            value: testValue2
        });
        
        equal( cache.size, 2, 'cache size is correct after add' );
        ok( cache.contains( testKey1 ), 'cache contains test key 1' );
        equal( cache.find( testKey1 ), testValue1, 'cached value is correct for test key 1' );
        ok( cache.contains( testKey2 ), 'cache contains test key 2' );
        equal( cache.find( testKey2 ), testValue2, 'cached value is correct for test key 2' );
        
        cache.clear();
        
        equal( cache.size, 0, 'cache is empty after clear' );
                
    });
    
    test( 'Multiple disjoint tags', function() {
        expect( 8 );
        
        var testKey1 = 'http://www.example1.com/test',
        testKey2 = 'http://www.example2.com/test',
        testValue1 = 'Example content!',
        testValue2 = 'Example content@',
        testTag1 = 'TEST1',
        testTag2 = 'TEST2';
        
        var cache = new engine.base.cache.Cache();

        cache.add({
            tag: testTag1,
            key: testKey1,
            value: testValue1
        });
        
        cache.add({
            tag: testTag2,
            key: testKey2,
            value: testValue2
        });
        
        equal( cache.size, 2, 'cache size is correct after add' );
        ok( cache.contains( testKey1 ), 'cache contains test key 1' );
        equal( cache.find( testKey1 ), testValue1, 'cached value is correct for test key 1' );
        ok( cache.contains( testKey2 ), 'cache contains test key 2' );
        equal( cache.find( testKey2 ), testValue2, 'cached value is correct for test key 2' );
        
        cache.clear({ tag: testTag1 });
        
        equal( cache.size, 1, 'cache contains remaining tagged entries after clear' );
        ok( cache.contains( testKey2 ), 'cache contains test key 2' );
        equal( cache.find( testKey2 ), testValue2, 'cached value is correct for test key 2' );        
    });
    
    test( 'Multiple intersecting tags', function() {
        expect( 2 );
        
        var testKey = 'http://www.example1.com/test',
        testValue = 'Example content!',
        testTag1 = 'TEST1',
        testTag2 = 'TEST2';
        
        var cache = new engine.base.cache.Cache();

        cache.add({
            tag: testTag1,
            key: testKey,
            value: testValue
        });
        
        cache.add({
            tag: testTag2,
            key: testKey,
            value: testValue
        });
        
        equal( cache.size, 1, 'cache contains a single entry' );
        cache.clear({ tag: testTag1 });
        equal( cache.find( testKey ), testValue, 'value is still cached after clear on tag 1' );
        equal( cache.size, 1, 'cache has correct size after clear on tag 1' );
        
    });
    
    test( 'Update value', function() {
        expect( 1 );
        
        var testKey = 'http://www.example1.com/test',
        testValue1 = 'Example content!',
        testValue2 = 'Example content@',
        testTag1 = 'TEST1',
        testTag2 = 'TEST2';
        
        var cache = new engine.base.cache.Cache();

        cache.add({
            tag: testTag1,
            key: testKey,
            value: testValue1
        });
        
        cache.add({
            tag: testTag2,
            key: testKey,
            value: testValue2
        });
        
        equal( cache.find( testKey ), testValue2, 'value for test key is updated' );
    });

}());