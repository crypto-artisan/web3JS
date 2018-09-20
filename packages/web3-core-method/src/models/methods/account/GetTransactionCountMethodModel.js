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
 * @file GetTransactionCountMethodModel.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

var AbstractMethodModel = require('../../../../lib/models/AbstractMethodModel');

/**
 * @param {Utils} utils
 * @param {Object} formatters
 *
 * @constructor
 */
function GetTransactionCountMethodModel(utils, formatters) {
    AbstractMethodModel.call(this, 'eth_getTransactionCount', 2, utils, formatters);
}

/**
 * This method will be executed before the effective execution.
 *
 * @method beforeExecution
 *
 * @param {Object} web3Package
 */
GetTransactionCountMethodModel.prototype.beforeExecution = function (web3Package) {
    this.parameters[0] = this.formatters.inputAddressFormatter(this.parameters[0]);
    this.parameters[1] = this.formatters.inputDefaultBlockNumberFormatter(this.parameters[1], web3Package);
};

/**
 * This method will be executed after the RPC request.
 *
 * @method afterExecution
 *
 * @param {Object} response
 *
 * @returns {Number}
 */
GetTransactionCountMethodModel.prototype.afterExecution = function (response) {
    return this.utils.hexToNumber(response);
};

GetTransactionCountMethodModel.prototype = Object.create(AbstractMethodModel.prototype);
GetTransactionCountMethodModel.prototype.constructor = GetTransactionCountMethodModel;

module.exports = GetTransactionCountMethodModel;
