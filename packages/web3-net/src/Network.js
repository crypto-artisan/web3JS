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
 * @file Network.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import {AbstractWeb3Module} from 'web3-core';

export default class Network extends AbstractWeb3Module {

    /**
     * @param {AbstractProviderAdapter|EthereumProvider} provider
     * @param {ProvidersPackage} providersPackage
     * @param {MethodController} methodController
     * @param {MethodModelFactory} methodModelFactory
     * @param {Object} formatters
     * @param {Object} utils
     *
     * @constructor
     */
    constructor(
        provider,
        providersPackage,
        methodController,
        methodModelFactory,
        formatters,
        utils
    ) {
        super(provider, providersPackage, methodController, methodModelFactory);
        this.formatters = formatters;
        this.utils = utils;
    }

    /**
     * Determines to which network web3 is currently connected
     *
     * @method getNetworkType
     *
     * @param {Function} callback
     *
     * @callback callback(error, result)
     * @returns {Promise<String|Error>}
     */
    getNetworkType(callback) {
        let id;

        return this.getId().then(givenId => {
            id = givenId;

            return this.getBlock(0, false);
        }).then(genesis => {
            let returnValue = 'private';
            switch (genesis) {
                case genesis.hash === '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3' && id === 1:
                    returnValue = 'main';
                    break;
                case genesis.hash === '0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303' && id === 2:
                    returnValue = 'morden';
                    break;
                case genesis.hash === '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d' && id === 3:
                    returnValue = 'ropsten';
                    break;
                case genesis.hash === '0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177' && id === 4:
                    returnValue = 'rinkeby';
                    break;
                case genesis.hash === '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9' && id === 42:
                    returnValue = 'kovan';
                    break;
            }

            if (_.isFunction(callback)) {
                callback(null, returnValue);
            }

            return returnValue;
        }).catch(err => {
            if (_.isFunction(callback)) {
                callback(err);

                return;
            }

            throw err;
        });
    }
}
