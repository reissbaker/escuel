'use strict'

/*
 * A mock database client for testing
 */

;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MockClient = exports.MockClient = (function () {
  function MockClient() {
    _classCallCheck(this, MockClient);

    this.reset();
  }

  _createClass(MockClient, [{
    key: 'stubNextConnectionRows',
    value: function stubNextConnectionRows(rows) {
      this._stubbedData.rows = rows;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this._stubbedData = { rows: [] };
    }
  }, {
    key: 'connect',
    value: function connect(connection, callback) {
      var _this = this;

      process.nextTick(function () {
        var connection = new Connection(_this._stubbedData);
        _this.reset();

        callback(null, connection, mockDone);
      });
    }
  }]);

  return MockClient;
})();

function mockDone() {}

var Connection = (function () {
  function Connection(stubbedData) {
    _classCallCheck(this, Connection);

    this._stubbedData = stubbedData;
  }

  _createClass(Connection, [{
    key: 'query',
    value: function query(statement, vars, callback) {
      var _this2 = this;

      process.nextTick(function () {
        callback(null, _this2._stubbedData);
      });
    }
  }]);

  return Connection;
})();