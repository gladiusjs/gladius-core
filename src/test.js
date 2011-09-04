var Base = function() {
    
    var _nextId = 0;
    Object.defineProperty( this, 'nextId', {
        get: function() {
            return ++ _nextId;
        }
    });

};

var Sub1 = function() {
    function P() {
        console.log( "!" );
    };
 
    return P;
};
Sub1.prototype = new Base();
Sub1.prototype.constructor = Sub1();

var objects = [];
for( var i = 0; i < 10; ++ i ) {
    objects[i] = new Sub1();    
}