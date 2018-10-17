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
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

import {version} from './package.json';
import Personal from './Personal';
import {MethodController} from 'web3-core-method';
import {Network} from 'web3-net';
import ProvidersPackage from 'web3-providers';
import Utils from 'web3-utils';
import {formatters} from 'web3-core-helpers';
import MethodModelFactory from './factories/MethodModelFactory';

export default {
    version,

    /**
     * Returns the Personal object
     *
     * @method Personal
     *
     * @param {AbstractProviderAdapter|EthereumProvider} provider
     *
     * @returns {Personal}
     */
    Personal: (provider) => {
        return new Personal(
            provider,
            ProvidersPackage,
            new MethodController(),
            new MethodModelFactory(Utils, formatters),
            new Network(provider),
            Utils,
            formatters
        );
    }
};
