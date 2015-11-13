'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.snakeToCamel = snakeToCamel;
exports.camelToSnake = camelToSnake;

var _underscore = require('underscore');

var _ = _interopRequireWildcard(_underscore);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function snakeToCamel(data) {
  return renameKeys(data, stringSnakeToCamel);
}

function camelToSnake(data) {
  return renameKeys(data, stringCamelToSnake);
}

/*
 * Key Renaming
 * -----------------------------------------------------------------------------
 */

function renameKeys(data, transform) {
  if (!data) return data;

  var renamed = {};

  _.each(_.pairs(data), function (pair) {
    var _pair = _slicedToArray(pair, 2);

    var key = _pair[0];
    var value = _pair[1];

    renamed[transform(key)] = value;
  });

  return renamed;
}

/*
 * String Transforms
 * -----------------------------------------------------------------------------
 */

function stringSnakeToCamel(string) {
  var chars = [];

  for (var i = 0; i < string.length; i++) {
    var char = string[i];
    if (char === '_' && i !== 0 && i !== string.length - 1) {
      char = string[++i].toUpperCase();
    }

    chars.push(char);
  }

  return chars.join('');
}

function stringCamelToSnake(string) {
  var chars = [];

  for (var i = 0; i < string.length; i++) {
    var char = string[i];
    if (char.toLowerCase() !== char && char.toUpperCase() === char && i !== 0) {
      chars.push('_');
      char = char.toLowerCase();
    }

    chars.push(char);
  }

  return chars.join('');
}