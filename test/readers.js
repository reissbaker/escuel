const expect = require('chai').expect;
const readers = require('../build/readers');

describe('file', () => {
  it('loads a file and returns an fn that populates it', () => {
    const reader = readers.file('./test/mock-data/select.sql');
    expect(reader()).to.equal("SELECT * FROM test;\n");
  });

  it('runs files through underscore templating', () => {
    const reader = readers.file('./test/mock-data/template.sql');
    const string = reader({ test: true });
    expect(string.match(/WHERE/)).to.be.ok;
  });
});

describe('directory', () => {
  it('loads an entire directory', () => {
    const orm = readers.directory('./test/mock-data/');
    expect(orm.select()).to.equal('SELECT * FROM test;\n');
    expect(orm.template({ test: true })).to.match(/WHERE/);
  });

  it('ignores non-whitelisted files if there\'s a whitelist', () => {
    const orm = readers.directory('./test/mock-data/', {
      fileWhitelist: [ 'select' ]
    });

    expect(orm.select).to.be.ok;
    expect(orm.template).to.not.be.ok;
  });

  it('works with files in a whitelist with .sql extensions', () => {
    const orm = readers.directory('./test/mock-data/', {
      fileWhitelist: [ 'select.sql' ]
    });

    expect(orm.select).to.be.ok;
  });
});
