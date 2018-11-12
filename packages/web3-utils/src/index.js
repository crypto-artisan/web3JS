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
 * @file Utils.js
 * @author Marek Kotewicz <marek@parity.io>
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

import isObject from 'underscore-es/isObject';
import isString from 'underscore-es/isString';
import isArray from 'underscore-es/isArray';
import isFunction from 'underscore-es/isFunction';
import * as utils from './Utils';

export {soliditySha3} from './SoliditySha3';
export randomHex from 'randomhex';
export * from './Utils';

export const unitMap = {
    noether: '0',
    wei: '1',
    kwei: '1000',
    Kwei: '1000',
    babbage: '1000',
    femtoether: '1000',
    mwei: '1000000',
    Mwei: '1000000',
    lovelace: '1000000',
    picoether: '1000000',
    gwei: '1000000000',
    Gwei: '1000000000',
    shannon: '1000000000',
    nanoether: '1000000000',
    nano: '1000000000',
    szabo: '1000000000000',
    microether: '1000000000000',
    micro: '1000000000000',
    finney: '1000000000000000',
    milliether: '1000000000000000',
    milli: '1000000000000000',
    ether: '1000000000000000000',
    kether: '1000000000000000000000',
    grand: '1000000000000000000000',
    mether: '1000000000000000000000000',
    gether: '1000000000000000000000000000',
    tether: '1000000000000000000000000000000'
};

/**
 * Fires an error in an event emitter and callback and returns the eventemitter
 *
 * @method _fireError
 *
 * @param {Object} error a string, a error, or an object with {message, data}
 * @param {Object} emitter
 * @param {Function} reject
 * @param {Function} callback
 *
 * @returns {Object} the emitter
 */
export const _fireError = (error, emitter, reject, callback) => {
    // add data if given
    if (isObject(error) && !(error instanceof Error) && error.data) {
        if (isObject(error.data) || isArray(error.data)) {
            error.data = JSON.stringify(error.data, null, 2);
        }

        error = `${error.message}\n${error.data}`;
    }

    if (isString(error)) {
        error = new Error(error);
    }

    if (isFunction(callback)) {
        callback(error);
    }
    if (isFunction(reject)) {
        // suppress uncatched error if an error listener is present
        // OR suppress uncatched error if an callback listener is present
        if (
            (emitter && (isFunction(emitter.listeners) && emitter.listeners('error').length > 0)) ||
            isFunction(callback)
        ) {
            emitter.catch(() => {});
        }
        // reject later, to be able to return emitter
        setTimeout(() => {
            reject(error);
        }, 1);
    }

    if (emitter && isFunction(emitter.emit)) {
        // emit later, to be able to return emitter
        setTimeout(() => {
            emitter.emit('error', error);
            emitter.removeAllListeners();
        }, 1);
    }

    return emitter;
};

/**
 * Should be used to create full function/event name from json abi
 *
 * @method _jsonInterfaceMethodToString
 *
 * @param {Object} json
 *
 * @returns {String} full function/event name
 */
export const _jsonInterfaceMethodToString = (json) => {
    if (isObject(json) && json.name && json.name.indexOf('(') !== -1) {
        return json.name;
    }

    return `${json.name}(${_flattenTypes(false, json.inputs).join(',')})`;
};

/**
 * Should be used to flatten json abi inputs/outputs into an array of type-representing-strings
 *
 * @method _flattenTypes
 *
 * @param {Boolean} includeTuple
 * @param {Object} puts
 *
 * @returns {Array} parameters as strings
 */
export const _flattenTypes = (includeTuple, puts) => {
    // console.log("entered _flattenTypes. inputs/outputs: " + puts)
    const types = [];

    puts.forEach((param) => {
        if (typeof param.components === 'object') {
            if (param.type.substring(0, 5) !== 'tuple') {
                throw new Error('components found but type is not tuple; report on GitHub');
            }
            let suffix = '';
            const arrayBracket = param.type.indexOf('[');
            if (arrayBracket >= 0) {
                suffix = param.type.substring(arrayBracket);
            }
            const result = _flattenTypes(includeTuple, param.components);
            // console.log("result should have things: " + result)
            if (isArray(result) && includeTuple) {
                // console.log("include tuple word, and its an array. joining...: " + result.types)
                types.push(`tuple(${result.join(',')})${suffix}`);
            } else if (!includeTuple) {
                // console.log("don't include tuple, but its an array. joining...: " + result)
                types.push(`(${result.join(',')})${suffix}`);
            } else {
                // console.log("its a single type within a tuple: " + result.types)
                types.push(`(${result})`);
            }
        } else {
            // console.log("its a type and not directly in a tuple: " + param.type)
            types.push(param.type);
        }
    });

    return types;
};

/**
 * Should be called to get ascii from it's hex representation
 *
 * @method hexToAscii
 *
 * @param {String} hex
 *
 * @returns {String} ascii string representation of hex value
 */
export const hexToAscii = (hex) => {
    if (!utils.isHexStrict(hex)) throw new Error('The parameter must be a valid HEX string.');

    let str = '';

    let i = 0;
    const l = hex.length;

    if (hex.substring(0, 2) === '0x') {
        i = 2;
    }
    for (; i < l; i += 2) {
        const code = parseInt(hex.substr(i, 2), 16);
        str += String.fromCharCode(code);
    }

    return str;
};

/**
 * Should be called to get hex representation (prefixed by 0x) of ascii string
 *
 * @method asciiToHex
 *
 * @param {String} str
 *
 * @returns {String} hex representation of input string
 */
export const asciiToHex = (str) => {
    if (!str) return '0x00';
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        const n = code.toString(16);
        hex += n.length < 2 ? `0${n}` : n;
    }

    return `0x${hex}`;
};

/**
 * Returns value of unit in Wei
 *
 * @method getUnitValue
 *
 * @param {String} unit the unit to convert to, default ether
 *
 * @returns {BN} value of the unit (in Wei)
 * @throws error if the unit is not correct
 */
export const getUnitValue = (unit) => {
    unit = unit ? unit.toLowerCase() : 'ether';
    if (!unitMap[unit]) {
        throw new Error(
            `This unit "${unit}" doesn't exist, please use the one of the following units${JSON.stringify(
                unitMap,
                null,
                2
            )}`
        );
    }
    return unit;
};

/**
 * Takes a number of wei and converts it to any other ether unit.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method fromWei
 *
 * @param {Number|String} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert to, default ether
 *
 * @returns {String|Object} When given a BN object it returns one as well, otherwise a number
 */
export const fromWei = (number, unit) => {
    unit = getUnitValue(unit);

    if (!utils.isBN(number) && !isString(number)) {
        throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.');
    }

    return utils.isBN(number) ? ethjsUnit.fromWei(number, unit) : ethjsUnit.fromWei(number, unit).toString(10);
};

/**
 * Takes a number of a unit and converts it to wei.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method toWei
 *
 * @param {Number|String|BN} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert from, default ether
 *
 * @returns {String|Object} When given a BN object it returns one as well, otherwise a number
 */
export const toWei = (number, unit) => {
    unit = getUnitValue(unit);

    if (!utils.isBN(number) && !isString(number)) {
        throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.');
    }

    return utils.isBN(number) ? ethjsUnit.toWei(number, unit) : ethjsUnit.toWei(number, unit).toString(10);
};

/**
 * Converts to a checksum address
 *
 * @method toChecksumAddress
 *
 * @param {String} address the given HEX address
 *
 * @returns {String}
 */
export const toChecksumAddress = (address) => {
    if (typeof address === 'undefined') return '';

    if (!/^(0x)?[0-9a-f]{40}$/i.test(address))
        throw new Error(`Given address "${address}" is not a valid Ethereum address.`);

    address = address.toLowerCase().replace(/^0x/i, '');
    const addressHash = utils.sha3(address).replace(/^0x/i, '');
    let checksumAddress = '0x';

    for (let i = 0; i < address.length; i++) {
        // If ith character is 9 to f then make it uppercase
        if (parseInt(addressHash[i], 16) > 7) {
            checksumAddress += address[i].toUpperCase();
        } else {
            checksumAddress += address[i];
        }
    }

    return checksumAddress;
};

// aliases
export const keccak256 = utils.sha3;
export const toDecimal = utils.hexToNumber;
export const fromDecimal = utils.numberToHex;
export const hexToString = utils.hexToUtf8;
export const toUtf8 = utils.hexToUtf8;
export const stringToHex = utils.utf8ToHex;
export const fromUtf8 = utils.utf8ToHex;
export const toAscii = hexToAscii;
export const fromAscii = asciiToHex;
export const padLeft = utils.leftPad;
export const padRight = utils.rightPad;
