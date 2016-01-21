var chai = require('chai');
var assert = chai.assert;
var Method = require('../lib/web3/method');

describe('lib/web3/method', function () {
    describe('formatOutput', function () {
        it('should format plain output', function () {
            
            // given
            var formatter = function (arg) {
                return arg + '*';
            };
            
            var method = new Method({
                outputFormatter: formatter
            });
            var args = '1';
            var expectedArgs = '1*';

            // when
            var result = method.formatOutput(args);

            // then
            assert.deepEqual(result, expectedArgs);
        });

        it('should format output arrays with the same formatter', function () {
            
            // given
            var formatter = function (arg) {
                return arg + '*';
            };
            
            var method = new Method({
                outputFormatter: formatter
            });
            var args = ['1','2','3'];
            var expectedArgs = ['1*', '2*', '3*'];

            // when
            var result = method.formatOutput(args);

            // then
            assert.deepEqual(result, expectedArgs);
        });
        
        it('should do nothing if there is no formatter', function () {

            // given
            var method = new Method({});
            var args = [1,2,3];

            // when
            var result = method.formatOutput(args);
            
            // then
            assert.deepEqual(result, args);
        });
    });
});

