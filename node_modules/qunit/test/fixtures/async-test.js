test('a', 2, function(){
    stop();

    setTimeout(function() {
        ok(true, 'test a1');
        ok(true, 'test a2');
        start();
    }, 10000);
})

test('b', 2, function(){
    stop();

    setTimeout(function() {
        ok(true, 'test b1');
        ok(true, 'test b2');
        start();
    }, 10);
})
