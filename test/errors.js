var chai = require('chai');
var assert = chai.assert;

var errors = require('../packages/web3-core-helpers/src/Errors.js');

describe('lib/web3/method', function() {
    describe('getCall', function() {
        for (var key in errors) {
            it('should return and error', function() {
                assert.instanceOf(errors[key](), Error);
            });
        }
    });
});
