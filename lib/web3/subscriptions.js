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
/** @file subscriptions.js
 *
 * @authors:
 *   Fabian Vogelsteller <fabian@ethdev.com>
 * @date 2015
 */

var Subscription = require('./subscription.js');


var Subscriptions = function (options) {
    this.name = options.name;
    this.subscribe = options.subscribe;
    this.unsubscribe = options.unsubscribe;
    this.subscriptions = options.subscriptions || {};
    this.requestManager = null;
};


Subscriptions.prototype.setRequestManager = function (rm) {
    this.requestManager = rm;
};


Subscriptions.prototype.attachToObject = function (obj) {
    var func = this.buildCall();
    func.call = this.call; // TODO!!! that's ugly. filter.js uses it
    var name = this.name.split('.');
    if (name.length > 1) {
        obj[name[0]] = obj[name[0]] || {};
        obj[name[0]][name[1]] = func;
    } else {
        obj[name[0]] = func; 
    }
};


Subscriptions.prototype.buildCall = function() {
    var _this = this;

    return function(){
        var subscription = new Subscription({
            subscription: _this.subscriptions[arguments[0]],
            subscribeMethod: _this.subscribe,
            unsubscribeMethod: _this.unsubscribe,
            requestManager: _this.requestManager
        });

        return subscription.subscribe.apply(subscription, arguments);
    };
};

module.exports = Subscriptions;

