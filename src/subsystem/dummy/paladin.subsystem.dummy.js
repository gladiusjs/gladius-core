(function (window, document, Paladin) {

  Paladin.subsystem.register( "dummy", (function () {

    var init = false;

    return {
      start: function () {
        init = true;
      },
      dummy: function () {
        return init;
      }
    };

  })());

})(window, document, Paladin);
