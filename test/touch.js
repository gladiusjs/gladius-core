(function ( window, document, CubicVR, Paladin ) {

function Game() {

    var paladin = new Paladin( {debug: true} );

    
    
    this.run = function () {
      paladin.run();
    };

};

document.addEventListener('DOMContentLoaded', function (e) {
    var game = new Game();
    game.run();
}, false);

})(window, document, CubicVR, Paladin);
