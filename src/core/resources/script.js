define(function(require) {
    var Script = function(data) {


      if (data === undefined){
        throw new Error("script body is undefined");
      }

      /*jslint evil:true */
      var g = new Function([], 'var f = ' + data + '; return f.apply( null, Array.prototype.slice.call(arguments) );');
      return g;
    };
    return Script;

});
