'use strict';

import * as _ from 'underscore';

export function snakeToCamel(data) {
  return renameKeys(data, stringSnakeToCamel);
}

export function camelToSnake(data) {
  return renameKeys(data, stringCamelToSnake);
}

/*
 * Key Renaming
 * -----------------------------------------------------------------------------
 */

function renameKeys(data, transform) {
  if(!data) return data;

  var renamed = {};

  _.each(_.pairs(data), (pair) => {
    const [ key, value ] = pair;
    renamed[transform(key)] = value;
  });

  return renamed;
}


/*
 * String Transforms
 * -----------------------------------------------------------------------------
 */

function stringSnakeToCamel(string) {
  const chars = [];

  for(let i = 0; i < string.length; i++) {
    let char = string[i];
    if(char === '_' && i !== 0 && i !== string.length - 1) {
      char = string[++i].toUpperCase();
    }

    chars.push(char);
  }

  return chars.join('');
}

function stringCamelToSnake(string) {
  const chars = [];

  for(let i = 0; i < string.length; i++) {
    let char = string[i];
    if(char.toLowerCase() !== char && char.toUpperCase() === char && i !== 0) {
      chars.push('_');
      char = char.toLowerCase();
    }

    chars.push(char);
  }

  return chars.join('');
}
