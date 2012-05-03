var path = require('path'),
    fs = require('fs'),
    vm = require('vm'),
    _ = require('underscore'),
    trace = require('tracejs').trace;

var options = JSON.parse(process.argv[2]),
    qunitPath = path.join(__dirname, '..', 'deps/qunit/qunit/qunit.js'),
    currentModule = path.basename(options.code.path, '.js'),
    currentTest,
    qunitCode,
    sandbox;

// globals needed by qunit
sandbox = {
    require: require,
    exports: {},
    window: {setTimeout: setTimeout},
    console: console,
    clearTimeout: clearTimeout
};

try {
    qunitCode = fs.readFileSync(qunitPath, 'utf-8');
} catch( err ) {
    console.error('You are missing upstream QUnit library in deps/qunit');
    console.error('Using, maybe you forgot to update the submodules:');
    console.error('git submodule init && git submodule update');
    process.exit(1);
}


vm.runInNewContext(
    '(function(){'+ qunitCode +'}.call(window))',
    sandbox,
    qunitPath
);

// make qunit api global, like it is in the browser
_.extend(global, sandbox.exports);

/**
 * Require a resource.
 * @param {Object} res
 */
function load(res) {
    var requirePath = res.path.replace(/\.js$/, '');

    // test resource can define'namespace'to expose its exports as a named object
    if (res.namespace) {
        global[res.namespace] = require(requirePath);
    } else {
        _.extend(global, require(requirePath));
    }
}

/**
 * Calculate coverage stats using bunker
 */
function calcCoverage() {

}

/**
 * Callback for each started test.
 * @param {Object} test
 */
QUnit.testStart(function(test) {
    // currentTest is undefined while first test is not done yet
    currentTest = test.name;

    // use last module name if no module name defined
    currentModule = test.module || currentModule;
});

/**
 * Callback for each assertion.
 * @param {Object} data
 */
QUnit.log(function(data) {
    data.test = this.config.current.testName;
    data.module = currentModule;
    process.send({
        event: 'assertionDone',
        data: data
    });
});

/**
 * Callback for one done test.
 * @param {Object} test
 */
QUnit.testDone(function(data) {
    // use last module name if no module name defined
    data.module = data.module || currentModule;

    process.send({
        event: 'testDone',
        data: data
    });
});

/**
 * Callback for all done tests in the file.
 * @param {Object} res
 */
QUnit.done(_.debounce(function(data) {
    if (options.coverage) {
        data.coverage = calcCoverage();
    }

    process.send({
        event: 'done',
        data: data
    });
}, 1000));

/**
 * Provide better stack traces
 */
var error = console.error;
console.error = function(obj) {
    // log full stacktrace
    if (obj && obj.stack) {
        obj = trace(obj);
    }

    return error.apply(this, arguments);
};

// require deps
options.deps.forEach(load);

// require code
load(options.code);

// require tests
options.tests.forEach(load);
