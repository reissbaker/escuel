'use strict';

import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'underscore';

export function file(filename) {
  const fileContents = fs.readFileSync(filename, 'utf-8');
  const template = _.template(fileContents);

  return (data = {}) => template(data);
};

export function directory(directory, opts = {}) {
  const { fileWhitelist } = opts;

  const files = findSQLFiles(directory, fileWhitelist);

  return _.reduce(files, (sqlModule, filepath) => {
    const basename = path.basename(filepath, '.sql');

    sqlModule[basename] = file(path.join(directory, filepath));

    return sqlModule;
  }, {});
};

function findSQLFiles(directory, whitelist) {
  const files = fs.readdirSync(directory);
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
