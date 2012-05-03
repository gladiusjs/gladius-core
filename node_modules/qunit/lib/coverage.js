var bunker = require('bunker'),
    fs = require('fs');

exports.instrument = function(path) {
    var src = fs.readFileSync(path, 'utf-8'),
        newSrc = bunker(src).compile();

    fs.renameSync(src, '__' + src);
    fs.writeFileSync(path, newSrc, 'utf-8');
};


exports.restore = function(path) {
    // do it only if the original file exist
    if (fs.statSync('__' + path).isFile()) {
        fs.unlinkSync(path);
        fs.renameSync('__' + path, path);
    }

};
