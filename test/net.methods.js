var chai = require('chai');
var assert = chai.assert; 
var web3 = require('../index.js');
var u = require('./helpers/test.utils.js');

describe('web3', function() {
    describe('net', function() {
        u.propertyExists(web3.net, 'listening');
        u.propertyExists(web3.net, 'peerCount');
    });
});
