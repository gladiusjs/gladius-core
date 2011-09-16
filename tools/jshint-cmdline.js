/*jshint indent: 4, strict: false */
/*global require: false, process: false, console: false */

// Read js file
var JSHINT = require('./jshint').JSHINT,
    fs = require('fs'),
    jsfile = fs.readFileSync(process.argv[2], 'utf8'),
    i, e;

if (!JSHINT(jsfile, {})) {
  console.log('jshint: Found ' + JSHINT.errors.length + ' errors.\n');
  for (i = 0; i < JSHINT.errors.length; i += 1) {
    e = JSHINT.errors[i];
    if (e) {
      console.log('Lint at line ' + e.line + ' character ' + e.character + ': ' + e.reason);
      console.log((e.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
      console.log('');
    }
  }
} else {
  console.log("jshint: No problems found.");
}
