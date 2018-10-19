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

import * as ProvidersPackage from 'web3-providers';
import {MethodController} from 'web3-core-method';
import {formatters} from 'web3-core-helpers';
import Utils from 'web3-utils';
import NetworkModuleFactory from "./factories/NetworkModuleFactory";

/**
 * Creates the Network Object
 *
 * @method Network
 *
 * @param {AbstractProviderAdapter|EthereumProvider} provider
 *
 * @returns {Network}
 */
export const Network = (provider) => {
    return new NetworkModuleFactory(Utils, formatters).createNetworkModule(
        provider,
        ProvidersPackage,
        new MethodController(),
    )
};
