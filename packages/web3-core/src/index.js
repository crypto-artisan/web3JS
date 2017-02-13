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
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */


var requestManager = require('web3-requestManager');
var extend = require('./extend.js');

module.exports = {
    packageInit: function (pkg, args) {
        args = Array.prototype.slice.call(args);

        if (!pkg) {
            throw new Error('You need to instantiate using the "new" keyword.');
        }

        // if (!args[0]) {
        //     throw new Error('You must pass in a provider as argument!');
        // }

        // make write only property of pkg.provider
        Object.defineProperty(pkg, 'currentProvider', {
            get: function () {
                return pkg._provider;
            },
            set: function () {
                return pkg._provider;
            },
            enumerable: true
        });

        // inherit from web3 umbrella package
        if (args[0] && args[0]._requestManager) {
            pkg._requestManager = args[0]._requestManager;
            pkg._provider =  args[0].provider;

        // set requestmanager on package
        } else {
            pkg._requestManager = new requestManager.Manager(args[0]);
            pkg._provider =  args[0];
        }

        // add providers
        pkg.providers = requestManager.Manager.providers;

        // add set Provider function
        pkg.setProvider = function (provider) {
            pkg._requestManager.setProvider(provider);
            pkg._provider = provider;
            return true;
        };

        // add reset function
        pkg.reset = function (keepIsSyncing) {
            pkg._requestManager.reset(keepIsSyncing);
            return true;
        };

        // attach batch request creation
        pkg.BatchRequest = requestManager.BatchManager.bind(null, pkg);

        // attach extend function
        pkg.extend = extend(pkg);
    },
    addProviders: function (pkg) {
        pkg.providers = requestManager.Manager.providers;
    }
};

