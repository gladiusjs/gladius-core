## This is a port of QUnit unit testing framework to nodejs

http://github.com/jquery/qunit

## Features
 * the simplest API of the world, especially for asynchronous testing
 * you can write tests in TDD or BDD style depending on your task and test type
 * you can run tests in browser if there is no dependencies to node
 * you are using the same testing API for client and server side code
 * tests inside of one testfile run synchronous, but every testfile runs parallel
 * tests from each file run in its own spawned node process
 * usage via CLI or testrunner API
 * test coverage jscoverage is removed, node-bunker have to be implemented #26

## Installation

Using Node Package Manager:

    npm install qunit

From git:

    git clone https://github.com/kof/node-qunit.git
    git submodule init
    git submodule update

To install the latest release:

    npm install qunit

To install the latest stable release

    npm install qunit@stable

## API

http://docs.jquery.com/QUnit

### Setup
    // Add a test to run.
    test(name, expected, test)

    // Add an asynchronous test to run. The test must include a call to start().
    asyncTest(name, expected, test)

    // Specify how many assertions are expected to run within a test.
    expect(amount);

    // Separate tests into modules.
    module(name, lifecycle)

### Assertions
    // A boolean assertion, equivalent to JUnit's assertTrue. Passes if the first argument is truthy.
    ok(state, message)

    // A comparison assertion, equivalent to JUnit's assertEquals. Uses "==".
    equal(actual, expected, message)

    // A comparison assertion, equivalent to JUnit's assertEquals. Uses "==".
    notEqual(actual, expected, message)

    // A deep recursive comparison assertion, working on primitive types, arrays and objects.
    deepEqual(actual, expected, message)

    // A deep recursive comparison assertion, working on primitive types, arrays and objects, with the result inverted, passing // when some property isn't equal.
    notDeepEqual(actual, expected, message)

    // A comparison assertion. Uses "===".
    strictEqual(actual, expected, message)

    // A stricter comparison assertion then notEqual. Uses "===".
    notStrictEqual(actual, expected, message)

    // Assertion to test if a callback throws an exception when run.
    raises(actual, message)

### Asynchronous Testing
    // Start running tests again after the testrunner was stopped.
    start()

    // Stop the testrunner to wait to async tests to run. Call start() to continue.
    stop(timeout)

## Usage

### Command line

Read full cli api doc using "--help" or "-h":

    $ qunit -h

    $ qunit -c ./code.js -t ./tests.js

By default, code and dependencies are added to the global scope. To specify
requiring them into a namespace object, prefix the path or module name with the
variable name to be used for the namespace object, followed by a colon:

    $ qunit -c code:./code.js -d utils:utilmodule -t ./time.js

### via api

    var testrunner = require("qunit");

    Defaults:

        {
            // logging options
            log: {

                // log assertions overview
                assertions: true,

                // log expected and actual values for failed tests
                errors: true,

                // log tests overview
                tests: true,

                // log summary
                summary: true,

                // log global summary (all files)
                globalSummary: true,

                // log currently testing code file
                testing: true
            },

            // run test coverage tool
            coverage: false,

            // define dependencies, which are required then before code
            deps: null,

            // define namespace your code will be attached to on global['your namespace']
            namespace: null
        }


    // change any option for all tests globally
    testrunner.options.optionName = value;

    // or use setup function
    testrunner.setup({
        log: {
            summary: true
        }
    });


    // one code and tests file
    testrunner.run({
        code: "/path/to/your/code.js",
        tests: "/path/to/your/tests.js"
    }, callback);

    // require code into a namespace object, rather than globally
    testrunner.run({
        code: {path: "/path/to/your/code.js", namespace: "code"},
        tests: "/path/to/your/tests.js"
    }, callback);

    // one code and multiple tests file
    testrunner.run({
        code: "/path/to/your/code.js",
        tests: ["/path/to/your/tests.js", "/path/to/your/tests1.js"]
    }, callback);

    // array of code and test files
    testrunner.run([
        {
            code: "/path/to/your/code.js",
            tests: "/path/to/your/tests.js"
        },
        {
            code: "/path/to/your/code.js",
            tests: "/path/to/your/tests.js"
        }
    ], callback);

    // using testrunner callback
    testrunner.run({
        code: "/path/to/your/code.js",
        tests: "/path/to/your/tests.js"
    }, function(err, report) {
        console.dir(report);
    });

    // specify dependency
    testrunner.run({
        deps: "/path/to/your/dependency.js",
        code: "/path/to/your/code.js",
        tests: "/path/to/your/tests.js"
    }, callback);

    // dependencies can be modules or files
    testrunner.run({
        deps: "modulename",
        code: "/path/to/your/code.js",
        tests: "/path/to/your/tests.js"
    }, callback);

    // dependencies can required into a namespace object
    testrunner.run({
        deps: {path: "utilmodule", namespace: "utils"},
        code: "/path/to/your/code.js",
        tests: "/path/to/your/tests.js"
    }, callback);

    // specify multiple dependencies
    testrunner.run({
        deps: ["/path/to/your/dependency1.js", "/path/to/your/dependency2.js"],
        code: "/path/to/your/code.js",
        tests: "/path/to/your/tests.js"
    }, callback);

## Writing tests

QUnit API and code which have to be tested are already loaded and attached to the global context.

Because nodejs modules reserved "module" namespace we have to redefine it from QUnit namespace.

    module = QUnit.module;

Basically QUnit API can ba accessed directly from global object or optional via "QUnit" object.

    QUnit.test;

Some tests examples

    test("a basic test example", function() {
      ok(true, "this test is fine");
      var value = "hello";
      equals("hello", value, "We expect value to be hello");
    });

    module("Module A");

    test("first test within module", 1, function() {
      ok(true, "all pass");
    });

    test("second test within module", 2, function() {
      ok(true, "all pass");
    });

    module("Module B", {
        setup: function() {
            // do some initial stuff before every test for this module
        },
        teardown: function() {
            // do some stuff after every test for this module
        }
    });

    test("some other test", function() {
      expect(2);
      equals(true, false, "failing test");
      equals(true, true, "passing test");
    });

    module("Module C", {
        setup: function() {
            // setup a shared environment for each test
            this.options = {test: 123};
        }
    });

    test("this test is using shared environment", 1, function() {
      same({test:123}, this.options, "passing test");
    });

    test("this is an async test example", function() {
        expect(2);
        stop();
        setTimeout(function() {
            ok(true, "finished async test");
            strictEqual(true, true, "Strict equal assertion uses ===");
            start();
        }, 100);
    });

## Run tests

    $ make test

## Coverage

Jscoverage is removed due to a lot of installation problems and bad api,
node-bunker is planned to use but not implemented yet.
