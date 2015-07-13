'use strict';

var _ = require('underscore');

exports.snakeToCamel = function snakeToCamel(data) {
  return renameKeys(data, stringSnakeToCamel);
};

exports.camelToSnake = function camelToSnake(data) {
  return renameKeys(data, stringCamelToSnake);
};

/*
 * Key Renaming
 * -----------------------------------------------------------------------------
 */

function renameKeys(data, transform) {
  if(!data) return data;

  var renamed = {};
  _.each(_.pairs(data), function(pair) {
    var key = pair[0],
        value = pair[1];
    renamed[transform(key)] = value;
  });
  return renamed;
}


/*
 * String Transforms
 * -----------------------------------------------------------------------------
 */

function stringSnakeToCamel(string) {
  var char = '',
      chars = [],
      capitalize = false;
  for(var i = 0; i < string.length; i++) {
    char = string[i];
    if(char === '_' && i !== 0 && i !== string.length - 1) {
      char = string[++i].toUpperCase();
    }

    chars.push(char);
  }

  return chars.join('');
}

function stringCamelToSnake(string) {
  var char = '',
      chars = [];

  for(var i = 0; i < string.length; i++) {
    char = string[i];
    if(char.toLowerCase() !== char && char.toUpperCase() === char && i !== 0) {
      chars.push('_');
      char = char.toLowerCase();
    }

    chars.push(char);
  }

  return chars.join('');
}
