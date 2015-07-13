var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    sql = require('./sql'),
    transform = require('./transform');

function defn(filename, defaultConn) {
  function tOut(data) { return transform.camelToSnake(data); }
  function tIn(data) { return transform.snakeToCamel(data); }

  var definition = sql.define(filename, tOut, tIn);

  return function sqlFunctionWrapper(data, overrideConn, callback) {
    if(typeof data === 'function') {
      callback = data;
      data = {};
      overrideConn = null;
    } else if(typeof overrideConn === 'function') {
      callback = overrideConn;
      overrideConn = null;
    }

    var computedConn,
        conn = overrideConn || defaultConn;

    if(typeof conn === 'function') computedConn = conn(data);
    else computedConn = conn;

    definition(computedConn, data, callback);
  };
};

function findSQLFiles(directory, whitelist) {
  var files = fs.readdirSync(directory),
      filtering = whitelist != null,
      whiteset = _.reduce((whitelist || []), function(set, basename) {
        set[basename] = true;
        return set;
      }, {});

  return _.filter(files, function(filename) {
    // Ignore non-SQL files
    if(!filename.match(/\.sql$/)) return false;
    // Ignore hidden files
    if(filename[0] === '.') return false;
    // Ignore filtered files
    if(filtering) return _.has(whiteset, path.basename(filename, '.sql'));
    // Include everything else
    return true;
  });
}

function define(sqlDir, defaultConn, hash) {
  hash = hash || {};
  var files = findSQLFiles(sqlDir, hash.only),
      override = hash.override || {};

  return _.reduce(files, function(module, file) {
    var basename = path.basename(file, '.sql'),
        connection = override[basename] || defaultConn;
    module[basename] = defn(path.join(sqlDir, file), connection);
    return module;
  }, {});
};

module.exports = {
  defn: defn,
  define: define
};
