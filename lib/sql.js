/*
 * SQL Persistence
 * =============================================================================
 *
 * This library defines a few functions to make it easy to interact with SQL
 * statements stored in files, load them at runtime, and execute them.
 *
 * It assumes you're using Postgres, but the API doesn't expose any
 * Postgres-specific features; it just uses Postgres-style param substitution
 * when generating queries.
 */

'use strict';

var fs = require('fs'),
    pg = require('pg'),
    _ = require('underscore');


/*
 * PostgreSQL Client Injection
 * -----------------------------------------------------------------------------
 *
 * Defaults to the `pg` client, but allows you to provide your own
 * API-compatible version. Useful especially for test environments.
 */

var dbClient = pg;
function client(c) { if(c) dbClient = c; return dbClient; };
function resetClient() { dbClient = pg; };


/*
 * Statement Class
 * -----------------------------------------------------------------------------
 *
 * Defines SQL statements to be sent to Postgres.
 */

function Statement(statement, values) {
  this.statement = statement;
  this.values = values;
};


/*
 * SQL Statement Loading
 * -----------------------------------------------------------------------------
 */

function fromSQLSync(filename) {
  var sql = fs.readFileSync(filename, 'utf-8');
  return function(data) {
    var filledIn = '' + sql,
        values = [];

    if(data) {
      _.each(_.pairs(data), function(pair) {
        var key = pair[0],
            value = pair[1],
            regex = new RegExp(':' + key, 'g'),
            match = filledIn.match(regex);

        if(match) {
          filledIn = filledIn.replace(regex, '$' + (values.length + 1));
          values.push(value);
        }
      });
    }

    return new Statement(filledIn, values);
  };
};


/*
 * SQL Statement Execution
 * -----------------------------------------------------------------------------
 */

function execute(connection, statement, callback) {
  dbClient.connect(connection, function(err, conn, done) {
    if(err) {
      callback(err);
      return;
    }
    conn.query(statement.statement, statement.values, function(err, data) {
      done();
      callback(err, data);
    });
  });
};


/*
 * SQL Persistence Function Definition
 * -----------------------------------------------------------------------------
 */

function define(filename, tOut, tIn) {
  var statement = fromSQLSync(filename),
      identity = function(x) { return x; };

  tOut = tOut || identity;
  tIn = tIn || identity;

  return function sqlFunction(connection, data, callback) {
    var s = statement(tOut(data));
    execute(connection, s, function(err, data) {
      if(err) callback(err);
      else callback(null, _.map(data.rows, tIn));
    });
  };
};

/*
 * Exports
 * -----------------------------------------------------------------------------
 */

module.exports = {
  client: client,
  resetClient: resetClient,
  Statement: Statement,
  fromSQLSync: fromSQLSync,
  execute: execute,
  define: define
};
