'use strict';

export default class Query {
  constructor(sql, parameters) {
    this.sql = sql;
    this.parameters = parameters;
  }
}

