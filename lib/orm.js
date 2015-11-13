'use strict';

import * as path from 'path';
import { readdirSync } from 'fs';
import * as _ from 'underscore';
import Statement from './statement';
import { camelToSnake, snakeToCamel } from './transform';

export function file(args) {
  const { filename, connection, client } = args;

  const executionPlan = Statement.executionPlanFactorySync(
    filename, camelToSnake, snakeToCamel
  );

  return (data, opts, callback) => {
    if(typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    const overrideConn = opts.connection;
    const overrideClient = opts.client;

    const chosenClient = overrideClient || client;

    const conn = overrideConn || defaultConn;
    const computedConn = typeof conn === 'function' ? conn(data) : conn;

    executionPlan(chosenClient, computedConn, data, callback);
  };
};

export function directory(args) {
  const { directory, connection, fileWhitelist, connectionOverrides } = args;

  const files = findSQLFiles(sqlDir, fileWhitelist);

  return _.reduce(files, (sqlModule, file) => {
    const basename = path.basename(file, '.sql');
    const connection = connectionOverrides[basename] || defaultConn;

    sqlModule[basename] = defn(path.join(sqlDir, file), connection);

    return sqlModule;
  }, {});
};

function findSQLFiles(directory, whitelist) {
  const files = readdirSync(directory);
  const filtering = whitelist != null;
  const whiteset = _.reduce((whitelist || []), (set, basename) => {
    set[basename] = true;
    return set;
  }, {});

  return _.filter(files, (filename) => {
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
