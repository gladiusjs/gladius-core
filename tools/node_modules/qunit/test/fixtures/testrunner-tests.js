test('myMethod test', function() {
    equal(myMethod(), 123, 'myMethod returns right result');
    equal(myMethod(), 321, 'this should trigger an error');
})

test('myAsyncMethod test', function() {
    ok(true, 'myAsyncMethod started');
    stop();

    myAsyncMethod(function(data) {
        equal(data, 123, 'myAsyncMethod returns right result');
        equal(data, 321, 'this should trigger an error');
        start();
    });
})