'use strict';

const readers = require('./build/readers');

exports.file = readers.file;
exports.directory = readers.directory;

exports.transform = require('./build/util/transform');

exports.clients = {
  mock: require('./build/clients/mock-client'),
  pg: require('./build/clients/pg-client')
};

exports.pg = exports.clients.pg;

