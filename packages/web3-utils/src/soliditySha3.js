/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file soliditySha3.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

var _ = require('underscore');
var BN = require('bn.js');
var utils = require('./utils.js');


var _elementaryName = function (name) {
    /*jshint maxcomplexity:false */

    if (name.startsWith('int[')) {
        return 'int256' + name.slice(3);
    } else if (name === 'int') {
        return 'int256';
    } else if (name.startsWith('uint[')) {
        return 'uint256' + name.slice(4);
    } else if (name === 'uint') {
        return 'uint256';
    } else if (name.startsWith('fixed[')) {
        return 'fixed128x128' + name.slice(5);
    } else if (name === 'fixed') {
        return 'fixed128x128';
    } else if (name.startsWith('ufixed[')) {
        return 'ufixed128x128' + name.slice(6);
    } else if (name === 'ufixed') {
        return 'ufixed128x128';
    }
    return name;
};

// Parse N from type<N>
var _parseTypeN = function (type) {
    return parseInt(/^\D+(\d+).*$/.exec(type)[1], 10);
};

// Parse N from type[<N>]
var _parseTypeNArray = function (type) {
    var arraySize = /^\D+\d*\[(\d+)\]$/.exec(type);
    return arraySize ? parseInt(arraySize[1], 10) : null;
};

var _parseNumber = function (arg) {
    var type = typeof arg;
    if (type === 'string') {
        if (utils.isHex(arg)) {
            return new BN(arg.replace(/0x/i,''), 16);
        } else {
            return new BN(arg, 10);
        }
    } else if (type === 'number') {
        return new BN(arg);
    } else if (utils.isBigNumber(arg)) {
        return new BN(arg.toString(10));
    } else if (utils.isBN(arg)) {
        return arg;
    } else {
        throw new Error(arg +' is not a number');
    }
};

var _solidityPack = function (type, value, arraySize) {
    /*jshint maxcomplexity:false */

    var size, num;
    type = _elementaryName(type);


    if (type === 'bytes') {
        return value;
    } else if (type === 'string') {
        return utils.utf8ToHex(value);
    } else if (type === 'bool') {
        return value ? '01' : '00';
    } else if (type.startsWith('address')) {
        if(arraySize) {
            size = 64;
        } else {
            size = 40;
        }

        return utils.leftPad(value.toLowerCase(), size);
    } else if (type.startsWith('bytes')) {
        size = _parseTypeN(type);

        // must be 32 byte slices when in an array
        if(arraySize) {
            size = 32;
        }

        if (size < 1 || size > 32) {
            throw new Error('Invalid bytes<N> width: ' + size);
        }

        return utils.rightPad(value, size * 2);
    } else if (type.startsWith('uint')) {
        size = _parseTypeN(type);

        if ((size % 8) || (size < 8) || (size > 256)) {
            throw new Error('Invalid uint<N> width: ' + size);
        }

        num = _parseNumber(value);
        if (num.bitLength() > size) {
            throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength());
        }

        if(num.lt(new BN(0))) {
            throw new Error('Supplied uint '+ num.toString() +' is negative');
        }

        return size ? utils.leftPad(num.toString('hex'), size/8 * 2) : num;
    } else if (type.startsWith('int')) {

        size = _parseTypeN(type);
        if ((size % 8) || (size < 8) || (size > 256)) {
            throw new Error('Invalid int<N> width: ' + size);
        }

        num = _parseNumber(value);
        if (num.bitLength() > size) {
            throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength());
        }

        if(num.lt(new BN(0))) {
            return num.toTwos(size).toString('hex');
        } else {
            return size ? utils.leftPad(num.toString('hex'), size/8 * 2) : num;
        }

    } else {
        // FIXME: support all other types
        throw new Error('Unsupported or invalid type: ' + type);
    }
};


var _processSoliditySha3Args = function (arg) {
    /*jshint maxcomplexity:false */

    var type, value = '';
    var hexArg, arraySize;

    // if type is given
    if (_.isObject(arg) && (arg.hasOwnProperty('v') || arg.hasOwnProperty('t') || arg.hasOwnProperty('value') || arg.hasOwnProperty('type'))) {
        type = arg.t || arg.type;
        value = arg.v || arg.value;

        // otherwise try to guess the type
    } else {
        type = utils.toHex(arg, true);
        value = utils.toHex(arg);

        if (!type.startsWith('int') && !type.startsWith('uint')) {
            type = 'bytes';
        }
    }

    if ((type.startsWith('int') || type.startsWith('uint')) &&  typeof value === 'string' && !/^(-)?0x/i.test(value)) {
        value = new BN(value);
    }

    // get the array size
    if(_.isArray(value)) {
        arraySize = _parseTypeNArray(type);
        if(arraySize && value.length !== arraySize) {
            throw new Error(type +' is not matching the given array '+ JSON.stringify(value));
        } else {
            arraySize = value.length;
        }
    }


    if (_.isArray(value)) {
        hexArg = value.map(function (val) {
            return _solidityPack(type, val, arraySize).toString('hex').replace('0x','');//abi.encodeParam(arg.type, arg.value);
        });
        return hexArg.join('');
    } else {
        hexArg = _solidityPack(type, value, arraySize);//abi.encodeParam(arg.type, arg.value);
        return hexArg.toString('hex').replace('0x','');
    }

};

/**
 * Hashes solidity values to a sha3 hash using keccak 256
 *
 * @method soliditySha3
 * @return {Object} the sha3
 */
var soliditySha3 = function () {
    /*jshint maxcomplexity:false */

    var args = Array.prototype.slice.call(arguments);

    var hexArgs = _.map(args, _processSoliditySha3Args);

    // console.log(args, hexArgs);
    // console.log('0x'+ hexArgs.join(''));

    return utils.sha3('0x'+ hexArgs.join(''));
};


module.exports = soliditySha3;
