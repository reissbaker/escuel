'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.file = file;
exports.directory = directory;

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _underscore = require('underscore');

var _ = _interopRequireWildcard(_underscore);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function file(filename) {
  var fileContents = fs.readFileSync(filename, 'utf-8');
  var template = _.template(fileContents);

  return function () {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    return template(data);
  };
};

function directory(directory) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var fileWhitelist = opts.fileWhitelist;

  var files = findSQLFiles(directory, fileWhitelist);

  return _.reduce(files, function (sqlModule, filepath) {
    var basename = path.basename(filepath, '.sql');

    sqlModule[basename] = file(path.join(directory, filepath));

    return sqlModule;
  }, {});
};

function findSQLFiles(directory, whitelist) {
  var files = fs.readdirSync(directory);
  var filtering = whitelist != null;
  var whiteset = _.reduce(whitelist || [], function (set, basename) {
    set[basename] = true;
    return set;
  }, {});

  return _.filter(files, function (filename) {
    // Ignore non-SQL files
    if (!filename.match(/\.sql$/)) return false;
    // Ignore hidden files
    if (filename[0] === '.') return false;
    // Ignore filtered files
    if (filtering) return _.has(whiteset, path.basename(filename, '.sql'));
    // Include everything else
    return true;
  });
}