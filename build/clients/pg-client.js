'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = configure;
exports.connect = connect;
exports.queryBuilder = queryBuilder;

var _underscore = require('underscore');

var _ = _interopRequireWildcard(_underscore);

var _pg = require('pg');

var pg = _interopRequireWildcard(_pg);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultTransformIn = function defaultTransformIn(x) {
  return x;
};
var defaultTransformOut = function defaultTransformOut(x) {
  return x;
};

function configure(opts) {
  var dataTransform = opts.dataTransform;

  defaultTransformIn = dataTransform.in || defaultTransformIn;
  defaultTransformOut = dataTransform.out || defaultTransformOut;
}

function connect(conString, callback) {
  pg.connect(conString, function (err, client, done) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, new PostgresConnection(client), done);
  });
}

var PostgresConnection = (function () {
  function PostgresConnection(client) {
    _classCallCheck(this, PostgresConnection);

    this.client = client;
  }

  _createClass(PostgresConnection, [{
    key: 'query',
    value: function query(fileReader) {
      var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var callback = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];

      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }

      var _opts = opts;
      var _opts$dataTransform = _opts.dataTransform;
      var dataTransform = _opts$dataTransform === undefined ? {} : _opts$dataTransform;

      var inT = dataTransform.in || defaultTransformIn;
      var outT = dataTransform.out || defaultTransformOut;

      var transformed = inT(data);
      var builtQuery = queryBuilder(fileReader(transformed), transformed);

      this.client.query(builtQuery.sql, builtQuery.parameters, function (err, result) {
        if (err) {
          callback(err);
          return;
        }

        callback(null, outT(result.rows));
      });
    }
  }]);

  return PostgresConnection;
})();

function queryBuilder(string, data) {
  return function () {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var parameters = [];
    var filledIn = '' + string;

    _.each(_.pairs(data), function (pair) {
      var _pair = _slicedToArray(pair, 2);

      var key = _pair[0];
      var value = _pair[1];

      var regex = new RegExp('$' + key, 'g');
      var match = filledIn.match(regex);

      if (match) {
        parameters.push(value);
        filledIn = filledIn.replace(regex, '$' + parameters.length);
      }
    });

    return new Query(filledIn, parameters);
  };
}