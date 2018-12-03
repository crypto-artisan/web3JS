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
 * @file EthModuleFactory.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import MethodModelFactory from './MethodModelFactory';
import Eth from '../Eth';
import Contract from '../Contract';

export default class EthModuleFactory {
    /**
     * @param {AbstractProviderAdapter} provider
     * @param {ProvidersModuleFactory} providersModuleFactory
     * @param {Object} providers
     * @param {MethodModuleFactory} methodModuleFactory
     * @param {Accounts} accounts
     * @param {PromiEvent} PromiEvent
     * @param {Object} utils
     * @param {Object} formatters
     * @param {ContractModuleFactory} contractModuleFactory
     * @param {AbiCoder} abiCoder
     *
     * @constructor
     */
    constructor(
        provider,
        providersModuleFactory,
        providers,
        methodModuleFactory,
        accounts,
        PromiEvent,
        utils,
        formatters,
        contractModuleFactory,
        abiCoder
    ) {
        this.provider = provider;
        this.providersModuleFactory = providersModuleFactory;
        this.providers = providers;
        this.methodModuleFactory = methodModuleFactory;
        this.accounts = accounts;
        this.utils = utils;
        this.formatters = formatters;
        this.contractModuleFactory = contractModuleFactory;
        this.PromiEvent = PromiEvent;
        this.abiCoder = abiCoder;
    }

    /**
     * Returns an object of type Contract
     *
     * @method createContract
     *
     * @param abi
     * @param address
     * @param options
     *
     * @returns {Contract}
     */
    createContract(abi, address, options) {
        return new Contract(
            this.provider,
            this.providersModuleFactory,
            this.providers,
            this.methodModuleFactory,
            this.contractModuleFactory,
            this.PromiEvent,
            this.abiCoder,
            this.utils,
            this.formatters,
            this.accounts,
            abi,
            address,
            options
        );
    }

    /**
     * Returns an object of type Eth
     *
     * @method createEthModule
     *
     * @param {Network} net
     * @param {Personal} personal
     * @param {Iban} iban
     * @param {Ens} ens
     * @param {SubscriptionsFactory} subscriptionsFactory
     * @param {Object} options
     *
     * @returns {Eth}
     */
    createEthModule(net, personal, iban, ens, subscriptionsFactory, options) {
        return new Eth(
            this.provider,
            this.providersModuleFactory,
            this.providers,
            this.methodModuleFactory,
            this.createMethodModelFactory(this.accounts),
            this,
            net,
            this.accounts,
            personal,
            iban,
            this.abiCoder,
            ens,
            this.utils,
            this.formatters,
            subscriptionsFactory,
            options
        );
    }

    /**
     * Returns an object of type MethodModelFactory
     *
     * @method createMethodModelFactory
     *
     * @param {Accounts} accounts
     *
     * @returns {MethodModelFactory}
     */
    createMethodModelFactory(accounts) {
        return new MethodModelFactory(this.utils, this.formatters, accounts);
    }
}
