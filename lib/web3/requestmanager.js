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
 * @file requestmanager.js
 * @author Jeffrey Wilcke <jeff@ethdev.com>
 * @author Marek Kotewicz <marek@ethdev.com>
 * @author Marian Oancea <marian@ethdev.com>
 * @author Fabian Vogelsteller <fabian@ethdev.com>
 * @author Gav Wood <g@ethdev.com>
 * @date 2014
 */

var Jsonrpc = require('./jsonrpc');
var utils = require('../utils/utils');
var errors = require('./errors');

/**
 * It's responsible for passing messages to providers
 * It's also responsible for polling the ethereum node for incoming messages
 * Default poll timeout is 1 second
 * Singleton
 */
var RequestManager = function (provider) {
    this.setProvider(provider);
    this.subscriptions = {};
};

/**
 * Should be used to synchronously send request
 *
 * @method send
 * @param {Object} data
 * @return {Object}
 */
RequestManager.prototype.send = function (data) {
    if (!this.provider) {
        console.error(errors.InvalidProvider());
        return null;
    }

    var payload = Jsonrpc.getInstance().toPayload(data.method, data.params);
    var result = this.provider.send(payload);

    if (!Jsonrpc.getInstance().isValidResponse(result)) {
        throw errors.InvalidResponse(result);
    }

    return result.result;
};

/**
 * Should be used to asynchronously send request
 *
 * @method sendAsync
 * @param {Object} data
 * @param {Function} callback
 */
RequestManager.prototype.sendAsync = function (data, callback) {
    if (!this.provider) {
        return callback(errors.InvalidProvider());
    }
    var payload = Jsonrpc.getInstance().toPayload(data.method, data.params);
    this.provider.sendAsync(payload, function (err, result) {        
        if (err) {
            return callback(err);
        }

        if (!Jsonrpc.getInstance().isValidResponse(result)) {
            return callback(errors.InvalidResponse(result));
        }

        callback(null, result.result);
    });
};

/**
 * Should be called to asynchronously send batch request
 *
 * @method sendBatch
 * @param {Array} batch data
 * @param {Function} callback
 */
RequestManager.prototype.sendBatch = function (data, callback) {
    if (!this.provider) {
        return callback(errors.InvalidProvider());
    }

    var payload = Jsonrpc.getInstance().toBatchPayload(data);
    this.provider.sendAsync(payload, function (err, results) {
        if (err) {
            return callback(err);
        }

        if (!utils.isArray(results)) {
            return callback(errors.InvalidResponse(results));
        }

        callback(err, results);
    }); 
};


/**
 * Waits for notifications
 *
 * @method addSubscription
 * @param {String} id           the subscription id
 * @param {Function} callback   the callback to call for incoming notifications
 */
RequestManager.prototype.addSubscription = function (name, type, id, callback) {
    if(this.provider.on) {
        this.subscriptions[id] = {
            callback: callback,
            type: type,
            name: name
        };

    } else {
        throw new Error('This provider doesn\'t support subscriptions', this.provider);
    }
};

/**
 * Waits for notifications
 *
 * @method removeSubscription
 * @param {String} id           the subscription id
 * @param {Function} callback   fired once the subscription is removed
 */
RequestManager.prototype.removeSubscription = function (id, callback) {
    var _this = this;

    if(this.subscriptions[id]) {

        this.sendAsync({
            method: this.subscriptions[id].type + '_unsubscribe',
            params: [id]
        }, function(err, result){

            if(!err) {
                delete _this.subscriptions[id];
            }

            if(utils.isFunction(callback))
                callback(err, result);
        });

    }
};

/**
 * Should be used to set provider of request manager
 *
 * @method setProvider
 * @param {Object}
 */
RequestManager.prototype.setProvider = function (p) {
    var _this = this;

    // reset the old one before changing
    if(this.provider)
        this.reset();

    this.provider = p;

    // listen to incoming notifications
    if(this.provider && this.provider.on) {
        this.provider.on('notification', function(err, result){
            if(!err) {
                if(_this.subscriptions[result.params.subscription] && _this.subscriptions[result.params.subscription].callback)
                    _this.subscriptions[result.params.subscription].callback(null, result.params.result);
            }
        });
    }
};

/**
 * Should be called to reset the polling mechanism of the request manager
 *
 * @method reset
 */
RequestManager.prototype.reset = function (keepIsSyncing) {
    var _this = this;


    // uninstall all subscriptions
    Object.keys(this.subscriptions).forEach(function(id){
        if(!keepIsSyncing || _this.subscriptions[id].name !== 'syncing')
            _this.removeSubscription(id);
    });


    //  reset notification callbacks etc.
    if(this.provider.reset)
        this.provider.reset();
};

module.exports = RequestManager;
