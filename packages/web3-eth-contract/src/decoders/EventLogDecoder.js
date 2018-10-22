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
 * @file EventLogDecoder.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

export default class EventLogDecoder {
    /**
     * @param {AbiCoder} abiCoder
     * @param {Object} formatters
     *
     * @constructor
     */
    constructor(abiCoder, formatters) {
        this.abiCoder = abiCoder;
        this.formatters = formatters;
    }

    /**
     * Decodes the event subscription response
     *
     * @method decoder
     *
     * @param {AbiItemModel} abiItemModel
     * @param {Object} response
     *
     * @returns {Object}
     */
    decode(abiItemModel, response) {
        let argTopics = response.topics;
        if (abiItemModel.anonymous) {
            argTopics = response.topics.slice(1);
        }

        response.returnValues = this.abiCoder.decodeLog(abiItemModel.getInputs(), response.data, argTopics);
        response.event = abiItemModel.name;
        response.signature = abiItemModel.signature;
        response.raw = {
            data: response.data,
            topics: response.topics
        };

        if (abiItemModel.anonymous || !response.topics[0]) {
            response.signature = null;
        }

        delete response.returnValues.__length__;
        delete response.data;
        delete response.topics;

        return response;
    }
}
