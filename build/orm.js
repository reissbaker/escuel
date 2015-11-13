'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.file = file;
exports.directory = directory;

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _fs = require('fs');

var _underscore = require('underscore');

var _ = _interopRequireWildcard(_underscore);

var _statement = require('./statement');

var _statement2 = _interopRequireDefault(_statement);

var _transform = require('./transform');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function file(args) {
  var filename = args.filename;
  var connection = args.connection;
  var client = args.client;

  var executionPlan = _statement2.default.executionPlanFactorySync(filename, _transform.camelToSnake, _transform.snakeToCamel);

  return function (data, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    var overrideConn = opts.connection;
    var overrideClient = opts.client;

    var chosenClient = overrideClient || client;

    var conn = overrideConn || defaultConn;
    var computedConn = typeof conn === 'function' ? conn(data) : conn;

    executionPlan(chosenClient, computedConn, data, callback);
  };
};

function directory(args) {
  var directory = args.directory;
  var connection = args.connection;
  var fileWhitelist = args.fileWhitelist;
  var connectionOverrides = args.connectionOverrides;

  var files = findSQLFiles(sqlDir, fileWhitelist);

  return _.reduce(files, function (sqlModule, file) {
    var basename = path.basename(file, '.sql');
    var connection = connectionOverrides[basename] || defaultConn;

    sqlModule[basename] = defn(path.join(sqlDir, file), connection);

    return sqlModule;
  }, {});
};

function findSQLFiles(directory, whitelist) {
  var files = (0, _fs.readdirSync)(directory);
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