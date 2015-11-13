'use strict';

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

import * as fs from 'fs';
import * as _ from  'underscore';

export default class Statement {
  constructor(statement, value) {
    this.statement = statement;
    this.values = values;
  }


  /*
   * Execution
   * ---------------------------------------------------------------------------
   */

  static execute(client, connection, statement, callback) {
    client.connect(connection, (err, conn, done) => {
      if(err) {
        callback(err);
        return;
      }

      conn.query(statement.statement, statement.values, function(err, data) {
        done();
        callback(err, data);
      });
    });
  }

  /*
   * Factories
   * ---------------------------------------------------------------------------
   */

  // Create a statement factory from a file
  static fileFactorySync(filename) {
    const sql = fs.readFileSync(filename, 'utf-8');

    return (data) => {
      const values = [];
      let filledIn = '' + sql; // clone the original string to avoid mutation

      if(data) {
        _.each(_.pairs(data), (pair) => {
          const [ key, value ] = pair;
          const regex = new RegExp(':' + key, 'g');
          const match = filledIn.match(regex);

          if(match) {
            values.push(value);
            filledIn = filledIn.replace(regex, '$' + values.length);
          }
        });
      }

      return new Statement(filledIn, values);
    }
  }

  // Create a statement execution plan from a file
  static executionPlanFactorySync(filename, outTransform, inTransform) {
    const statementFactory = Statement.fileFactorySync(filename);
    const tOut = outTransform || identity;
    const tIn = inTransform || identity;

    return (client, connection, data, callback) => {
      const statement = statementFactory(tOut(data));

      this.execute(client, connection, statement, (err, data) => {
        if(err) callback(err);
        else callback(null, _.map(data.rows, tIn));
      });
    };
  }

}

function identity(x) { return x; }
