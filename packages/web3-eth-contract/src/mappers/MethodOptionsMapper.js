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
 * @file MethodOptionsMapper.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

function MethodOptionsMapper(utils, formatters) {
    this.utils = utils;
    this.formatters = formatters;
}

/**
 * Sets the default options where it is required
 *
 * @param {Contract} contract
 * @param {Object} options
 *
 * @returns {Object}
 */
MethodOptionsMapper.prototype.map = function (contract, options) {
    var gasPrice = null;
    if (options.gasPrice) {
        gasPrice = String(options.gasPrice);
    }

    var from = null;
    if (options.from) {
        from = this.utils.toChecksumAddress(this.formatters.inputAddressFormatter(options.from))
    }

    options.data = options.data || contract.options.data;

    options.from = from || contract.options.from;
    options.gasPrice = gasPrice || contract.options.gasPrice;
    options.gas = options.gas || options.gasLimit || contract.options.gas;

    delete options.gasLimit;

    return options;
};

module.exports = MethodOptionsMapper;
