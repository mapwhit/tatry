var should = require('should');
var tatry = require('../');

describe('tatry node module', function () {
  it('must have at least one test', function () {
    tatry();
    should.fail('Need to write tests.');
  });
});
