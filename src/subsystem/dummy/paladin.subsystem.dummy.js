(function (window, document, Paladin) {

  Paladin.Subsystem.register( "dummy", (function () {

    var init = false;

    return {
      start: function () {
        init = true;
      },
      stop: function () {
        init = false;
      },
      dummy: function () {
        return init;
      },
    };

  })());

})(window, document, Paladin);
