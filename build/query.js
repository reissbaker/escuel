'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Query = function Query(sql, parameters) {
  _classCallCheck(this, Query);

  this.sql = sql;
  this.parameters = parameters;
};

exports.default = Query;