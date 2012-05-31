/** @license
 * RequireJS plugin for loading JSON files
 * - depends on Text plugin and it was HEAVILY "inspired" by it as well.
 * Author: Miller Medeiros
 * Version: 0.2.1 (2012/04/17)
 * Released under the MIT license
 */
define(['text'], function(text){

  /*! JSON.minify()
  v0.1 (c) Kyle Simpson
  MIT License
   */
  function minify(json) {

    var tokenizer = /"|(\/\*)|(\*\/)|(\/\/)|\n|\r/g,
    in_string = false,
    in_multiline_comment = false,
    in_singleline_comment = false,
    tmp, tmp2, new_str = [], ns = 0, from = 0, lc, rc
    ;

    tokenizer.lastIndex = 0;

    while (tmp = tokenizer.exec(json)) {
      lc = RegExp.leftContext;
      rc = RegExp.rightContext;
      if (!in_multiline_comment && !in_singleline_comment) {
        tmp2 = lc.substring(from);
        if (!in_string) {
          tmp2 = tmp2.replace(/(\n|\r|\s)*/g,"");
        }
        new_str[ns++] = tmp2;
      }
      from = tokenizer.lastIndex;

      if (tmp[0] == "\"" && !in_multiline_comment && !in_singleline_comment) {
        tmp2 = lc.match(/(\\)*$/);
        if (!in_string || !tmp2 || (tmp2[0].length % 2) == 0) { // start of string with ", or unescaped " character found to end string
          in_string = !in_string;
        }
        from--; // include " character in next catch
        rc = json.substring(from);
      } else if (tmp[0] == "/*" && !in_string && !in_multiline_comment && !in_singleline_comment) {
        in_multiline_comment = true;
      } else if (tmp[0] == "*/" && !in_string && in_multiline_comment && !in_singleline_comment) {
        in_multiline_comment = false;
      } else if (tmp[0] == "//" && !in_string && !in_multiline_comment && !in_singleline_comment) {
        in_singleline_comment = true;
      } else if ((tmp[0] == "\n" || tmp[0] == "\r") && !in_string && !in_multiline_comment && in_singleline_comment) {
        in_singleline_comment = false;
      } else if (!in_multiline_comment && !in_singleline_comment && !(/\n|\r|\s/.test(tmp[0]))) {
        new_str[ns++] = tmp[0];
      }
    }
    new_str[ns++] = rc;
    return new_str.join("");
  };

  var CACHE_BUST_QUERY_PARAM = 'bust',
  CACHE_BUST_FLAG = '!bust',
  jsonParse = (typeof JSON !== 'undefined' && typeof JSON.parse === 'function')? JSON.parse : function(val){
    return eval('('+ val +')'); //quick and dirty
  },
  jsonMinify = minify,
  buildMap = {};

  function cacheBust(url){
    url = url.replace(CACHE_BUST_FLAG, '');
    url += (url.indexOf('?') < 0)? '?' : '&';
    return url + CACHE_BUST_QUERY_PARAM +'='+ Math.round(2147483647 * Math.random());
  }

  //API
  return {

    load : function(name, req, onLoad, config) {
      if ( config.isBuild && (config.inlineJSON === false || name.indexOf(CACHE_BUST_QUERY_PARAM +'=') !== -1) ) {
        //avoid inlining cache busted JSON or if inlineJSON:false
        onLoad(null);
      } else {
        text.get(req.toUrl(name), function(data){
          if (config.isBuild) {
            buildMap[name] = data;
            onLoad(data);
          } else {
            onLoad(jsonParse(jsonMinify(data)));
          }
        });
      }
    },

    normalize : function (name, normalize) {
      //used normalize to avoid caching references to a "cache busted" request
      return (name.indexOf(CACHE_BUST_FLAG) === -1)? name : cacheBust(name);
    },

    //write method based on RequireJS official text plugin by James Burke
    //https://github.com/jrburke/requirejs/blob/master/text.js
    write : function(pluginName, moduleName, write){
      if(moduleName in buildMap){
        var content = buildMap[moduleName];
        write('define("'+ pluginName +'!'+ moduleName +'", function(){ return '+ content +';});\n');
      }
    }

  };
});
