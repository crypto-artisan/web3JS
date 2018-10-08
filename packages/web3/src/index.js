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
 * @file index.js
 * @authors: Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

var ProvidersPackage = require('web3-core-providers');
var EthPackage = require('web3-eth');
var PersonalPackage = require('web3-eth-personal');
var Utils = require('web3-utils');
var ShhPackage = require('web3-shh');
var BzzPackage = require('web3-bzz');
var NetworkPackage = require('web3-net');
var version = require('../package.json').version;

/**
 * @param {Object|String} provider
 * @param {Net} net
 *
 * @constructor
 */
var Web3 = function Web3(provider, net) {
    this.version = version;

    if (typeof provider === 'undefined') {
        throw new Error('No provider given as constructor parameter!');
    }

    var currentProvider = ProvidersPackage.resolve(provider, net);

    Object.defineProperty(this, 'currentProvider', {
        get: function () {
            return currentProvider;
        },
        set: function () {
            throw Error('The property currentProvider is an read-only property!');
        }
    });

    if (!this.currentProvider) {
        throw new Error('Invalid provider given as constructor parameter!');
    }

    this.utils = Utils;
    this.eth = EthPackage.createEth(this.currentProvider);
    this.shh = ShhPackage.createShh(this.currentProvider);
    this.bzz = BzzPackage.createBzz(this.currentProvider);

};

/**
 * Sets the provider for all packages
 *
 * @method setProvider
 *
 * @param {Object|String} provider
 * @param {Net} net
 */
Web3.prototype.setProvider = function (provider, net) {
    if (typeof this.currentProvider.clearSubscriptions !== 'undefined') {
        this.currentProvider.clearSubscriptions();
    }

    this.currentProvider = ProvidersPackage.resolve(provider, net);
    this.eth.setProvider(provider, net);
    this.shh.setProvider(provider, net);
    // this.bzz.setProvider(provider, net); TODO: check the provider handling in swarm.js
};

Web3.givenProvider = ProvidersPackage.detect();

Web3.version = version;

Web3.utils = Utils;

Web3.modules = {
    Eth: function (provider, net) {
        return EthPackage.createEth(ProvidersPackage.resolve(provider, net));
    },
    Net: function (provider, net) {
        return NetworkPackage.createNetwork(ProvidersPackage.resolve(provider, net));
    },
    Personal: function (provider, net) {
        return PersonalPackage.createPersonal(ProvidersPackage.resolve(provider, net));
    },
    Shh: function (provider, net) {
        return ShhPackage.createShh(ProvidersPackage.resolve(provider, net));
    },
    Bzz: function (provider, net) {
        return new BzzPackage.createBzz(ProvidersPackage.resolve(provider, net));
    }
};

Web3.providers = {
    HttpProvider: ProvidersPackage.HttpProvider,
    WebsocketProvider: ProvidersPackage.WebsocketProvider,
    IpcProvider: ProvidersPackage.IpcProvider
};

module.exports = Web3;

