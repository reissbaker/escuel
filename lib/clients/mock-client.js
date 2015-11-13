'use strict';

/*
 * A mock database client for testing
 */

export class MockClient {
  constructor() {
    this.reset();
  }

  stubNextConnectionRows(rows) {
    this._stubbedData.rows = rows;
  }

  reset() {
    this._stubbedData = { rows: [] };
  }

  connect(connection, callback) {
    process.nextTick(() => {
      const connection = new Connection(this._stubbedData);
      this.reset();

      callback(null, connection, mockDone);
    });
  }
}

function mockDone() {}

class Connection {
  constructor(stubbedData) {
    this._stubbedData = stubbedData;
  }

  query(statement, vars, callback) {
    process.nextTick(() => {
      callback(null, this._stubbedData);
    });
  }
}
