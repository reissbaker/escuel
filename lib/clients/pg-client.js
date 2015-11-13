'use strict';

import * as _ from 'underscore';
import * as pg from 'pg';

let defaultTransformIn = (x) => x;
let defaultTransformOut = (x) => x;

export function configure(opts) {
  const { dataTransform } = opts;
  defaultTransformIn = dataTransform.in || defaultTransformIn;
  defaultTransformOut = dataTransform.out || defaultTransformOut;
}

export function connect(conString, callback) {
  pg.connect(conString, (err, client, done) => {
    if(err) {
      callback(err);
      return;
    }

    callback(null, new PostgresConnection(client), done);
  });
}

class PostgresConnection {
  constructor(client) {
    this.client = client;
  }

  query(fileReader, data = {}, opts = {}, callback = () => {}) {
    if(typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    const { dataTransform = {} } = opts;
    const inT = dataTransform.in || defaultTransformIn;
    const outT = dataTransform.out || defaultTransformOut;

    const transformed = inT(data);
    const builtQuery = queryBuilder(fileReader(transformed), transformed);

    this.client.query(builtQuery.sql, builtQuery.parameters, (err, result) => {
      if(err) {
        callback(err);
        return;
      }

      callback(null, outT(result.rows));
    });
  }
}

export function queryBuilder(string, data) {
  return (data = {}) => {
    const parameters = [];
    let filledIn = '' + string;

    _.each(_.pairs(data), (pair) => {
      const [ key, value ] = pair;
      const regex = new RegExp('$' + key, 'g');
      const match = filledIn.match(regex);

      if(match) {
        parameters.push(value);
        filledIn = filledIn.replace(regex, '$' + parameters.length);
      }
    });

    return new Query(filledIn, parameters);
  };
}
