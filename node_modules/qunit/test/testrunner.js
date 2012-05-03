var a = require('assert'),
    chainer = require('chainer'),
    _ = require('underscore');

var tr = require('../lib/testrunner'),
    log = require('../lib/log');

var fixtures = __dirname + '/fixtures',
    chain = chainer();

tr.options.log = {
    testing: true
};

// reset log stats every time .next is called
chain.next = function() {
    log.reset();
    return chainer.prototype.next.apply(this, arguments);
};

chain.add('base testrunner', function() {
    tr.run({
        code: fixtures + '/testrunner-code.js',
        tests: fixtures + '/testrunner-tests.js',
    }, function(err, res) {
          var stat = {
                  files: 1,
                  tests: 2,
                  assertions: 5,
                  failed: 2,
                  passed: 3
              };
        delete res.runtime;
        a.deepEqual(stat, res, 'base testrunner test');
        chain.next();
    });
});

chain.add('attach code to global', function() {
    tr.run({
        code: fixtures + '/child-code-global.js',
        tests: fixtures + '/child-tests-global.js',
    }, function(err, res) {
        var stat = {
                files: 1,
                tests: 1,
                assertions: 2,
                failed: 0,
                passed: 2
            };

        delete res.runtime;
        a.deepEqual(stat, res, 'attaching code to global works');
        chain.next();
    });
});

chain.add('attach code to a namespace', function() {
    tr.run({
        code: {
            path: fixtures + '/child-code-namespace.js',
            namespace: 'testns'
        },
        tests: fixtures + '/child-tests-namespace.js',
    }, function(err, res) {
          var stat = {
                  files: 1,
                  tests: 1,
                  assertions: 3,
                  failed: 0,
                  passed: 3
              };

        delete res.runtime;
        a.deepEqual(stat, res, 'attaching code to specified namespace works');
        chain.next();
    });
});

chain.add('async testing logs', function() {
    tr.run({
        code: fixtures + '/async-code.js',
        tests: fixtures + '/async-test.js',
    }, function(err, res) {
          var stat = {
                  files: 1,
                  tests: 2,
                  assertions: 4,
                  failed: 0,
                  passed: 4
              };

        delete res.runtime;
        a.deepEqual(stat, res, 'async code testing works');
        chain.next();
    });
});

chain.add(function() {
    console.log('\nAll tests done');
});

chain.start();

