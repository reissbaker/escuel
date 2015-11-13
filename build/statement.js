'use strict'

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

;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _underscore = require('underscore');

var _ = _interopRequireWildcard(_underscore);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Statement = (function () {
  function Statement(statement, value) {
    _classCallCheck(this, Statement);

    this.statement = statement;
    this.values = values;
  }

  /*
   * Execution
   * ---------------------------------------------------------------------------
   */

  _createClass(Statement, null, [{
    key: 'execute',
    value: function execute(client, connection, statement, callback) {
      client.connect(connection, function (err, conn, done) {
        if (err) {
          callback(err);
          return;
        }

        conn.query(statement.statement, statement.values, function (err, data) {
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

  }, {
    key: 'fileFactorySync',
    value: function fileFactorySync(filename) {
      var sql = fs.readFileSync(filename, 'utf-8');

      return function (data) {
        var values = [];
        var filledIn = '' + sql; // clone the original string to avoid mutation

        if (data) {
          _.each(_.pairs(data), function (pair) {
            var _pair = _slicedToArray(pair, 2);

            var key = _pair[0];
            var value = _pair[1];

            var regex = new RegExp(':' + key, 'g');
            var match = filledIn.match(regex);

            if (match) {
              filledIn = filledIn.replace(regex, '$' + (values.length + 1));
              values.push(value);
            }
          });
        }

        return new Statement(filledIn, values);
      };
    }

    // Create a statement execution plan from a file

  }, {
    key: 'executionPlanFactorySync',
    value: function executionPlanFactorySync(filename, outTransform, inTransform) {
      var _this = this;

      var statementFactory = Statement.fileFactorySync(filename);
      var tOut = outTransform || identity;
      var tIn = inTransform || identity;

      return function (client, connection, data, callback) {
        var statement = statementFactory(tOut(data));

        _this.execute(client, connection, statement, function (err, data) {
          if (err) callback(err);else callback(null, _.map(data.rows, tIn));
        });
      };
    }
  }]);

  return Statement;
})();

exports.default = Statement;

function identity(x) {
  return x;
}