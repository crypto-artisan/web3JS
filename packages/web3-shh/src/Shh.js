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
 * @file Shh.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2017
 */

import {AbstractWeb3Module} from 'web3-core';

export default class Shh extends AbstractWeb3Module {
    /**
     * @param {AbstractProviderAdapter|EthereumProvider} provider
     * @param {ProvidersModuleFactory} providersModuleFactory
     * @param {Object} providers
     * @param {MethodController} methodController
     * @param {MethodModelFactory} methodModelFactory
     * @param {SubscriptionsFactory} subscriptionsFactory
     * @param {Network} net
     * @param {Object} options
     *
     * @constructor
     */
    constructor(
        provider,
        providersModuleFactory,
        providers,
        methodController,
        methodModelFactory,
        subscriptionsFactory,
        net,
        options
    ) {
        super(
            provider,
            providersModuleFactory,
            providers,
            methodController,
            methodModelFactory,
            options
        );

        this.subscriptionsFactory = subscriptionsFactory;
        this.net = net;
    }

    /**
     * Subscribe to whisper streams
     *
     * @method subscribe
     *
     * @param {string} method
     * @param {Object} options
     * @param {Function} callback
     *
     * @callback callback callback(error, result)
     * @returns {Subscription}
     */
    subscribe(method, options, callback) {
        if (method === 'messages') {
            return this.subscriptionsFactory.createShhMessagesSubscription(this, options).subscribe(callback);
        }

        throw new Error(`Unknown subscription: ${method}`);
    }

    /**
     * Extends setProvider method from AbstractWeb3Module.
     * This is required for updating the provider also in the sub package Net.
     *
     * @param {Object|String} provider
     * @param {Net} net
     *
     * @returns {Boolean}
     */
    setProvider(provider, net) {
        return !!(super.setProvider(provider, net) && this.net.setProvider(provider, net));
    }

    /**
     * Sets the defaultGasPrice property on the current object and the network module
     *
     * @property defaultGasPrice
     *
     * @param {String} value
     */
    set defaultGasPrice(value) {
        super.defaultGasPrice = value;
        this.net.defaultGasPrice = value;
    }

    /**
     * Sets the defaultGas property on the current object and the network module
     *
     * @property defaultGas
     *
     * @param {Number} value
     */
    set defaultGas(value) {
        super.defaultGas = value;
        this.net.defaultGas = value;
    }

    /**
     * Sets the transactionBlockTimeout property on the current object and the network module
     *
     * @property transactionBlockTimeout
     *
     * @param {Number} value
     */
    set transactionBlockTimeout(value) {
        super.transactionBlockTimeout = value;
        this.net.transactionBlockTimeout = value;
    }

    /**
     * Sets the transactionConfirmationBlocks property on the current object and the network module
     *
     * @property transactionConfirmationBlocks
     *
     * @param {Number} value
     */
    set transactionConfirmationBlocks(value) {
        super.transactionConfirmationBlocks = value;
        this.net.transactionConfirmationBlocks = value;
    }

    /**
     * Sets the transactionPollingTimeout property on the current object and the network module
     *
     * @property transactionPollingTimeout
     *
     * @param {Number} value
     */
    set transactionPollingTimeout(value) {
        super.transactionPollingTimeout = value;
        this.net.transactionPollingTimeout = value;
    }


    /**
     * Sets the defaultAccount property on the current object and the network module
     *
     * @property defaultAccount
     *
     * @param {String} value
     */
    set defaultAccount(value) {
        super.defaultAccount = value;
        this.net.defaultAccount = value;
    }

    /**
     * Sets the defaultBlock property on the current object and the network module
     *
     * @property defaultBlock
     *
     * @param value
     */
    set defaultBlock(value) {
        super.defaultBlock = value;
        this.net.defaultBlock = value;
    }
}
